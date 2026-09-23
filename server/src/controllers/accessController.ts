import type { Request, Response } from 'express';
import { AccessRequest } from '../models/AccessRequest.js';
import { AccessPermission } from '../models/AccessPermission.js';
import { MedicalRecord } from '../models/MedicalRecord.js';
import { Patient } from '../models/Patient.js';
import { Doctor } from '../models/Doctor.js';
import { Hospital } from '../models/Hospital.js';
import { AppError } from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ok } from '../utils/respond.js';
import { accessToUi, permissionToUi } from '../utils/mappers.js';
import { actorContext, getPatientForUser } from '../services/profileService.js';
import { logActivity } from '../services/activityService.js';
import { createNotification } from '../services/notificationService.js';
import { grantAccessOnChain, revokeAccessOnChain } from '../services/blockchainService.js';
import { newRequestId } from '../utils/ids.js';
import type { AuthedRequest } from '../types/http.js';

export const createAccessRequest = asyncHandler(async (req: Request, res: Response) => {
  const auth = (req as AuthedRequest).user;
  if (auth.role === 'patient') throw AppError.forbidden();
  const ctx = await actorContext(auth);
  const { patientId, purpose } = req.body as { patientId?: string; purpose?: string };
  if (!patientId) throw AppError.badRequest('patientId is required', 'VALIDATION_ERROR');
  const patient = await Patient.findOne({ patientId });
  if (!patient) throw AppError.notFound('Patient not found');

  const existing = await AccessRequest.findOne({ patientId, doctorId: ctx.doctorId, hospitalId: ctx.hospitalId, status: 'pending' });
  if (existing) throw AppError.conflict('A pending request already exists for this patient', 'REQUEST_EXISTS');

  const hospital = ctx.hospitalId ? await Hospital.findOne({ hospitalId: ctx.hospitalId }).lean() : null;
  const created = await AccessRequest.create({
    requestId: newRequestId(),
    patientId,
    doctorId: ctx.doctorId,
    hospitalId: ctx.hospitalId,
    purpose: purpose || 'Clinical review',
    status: 'pending',
    requestedAt: new Date(),
    doctorName: ctx.name,
    hospitalName: hospital?.name ?? ctx.name,
  });

  await logActivity({
    userId: auth.userId,
    patientId,
    action: 'ACCESS_REQUESTED',
    description: `${ctx.name} requested access`,
  });
  await createNotification({
    userId: patient.userId,
    type: 'ACCESS_REQUEST',
    title: 'New access request',
    message: `${ctx.name} · ${created.hospitalName}`,
    relatedRequestId: created.requestId,
    icon: 'users',
    color: '#8b5cf6',
  });

  ok(res, accessToUi(created.toObject()), 201);
});

export const listAccessRequests = asyncHandler(async (req: Request, res: Response) => {
  const auth = (req as AuthedRequest).user;
  const ctx = await actorContext(auth);
  const status = typeof req.query.status === 'string' ? req.query.status : undefined;
  const filter: Record<string, unknown> = {};
  if (status) filter.status = status;
  if (auth.role === 'patient') filter.patientId = ctx.patientId;
  else if (ctx.doctorId) filter.doctorId = ctx.doctorId;
  else if (ctx.hospitalId) filter.hospitalId = ctx.hospitalId;
  const items = await AccessRequest.find(filter).sort({ requestedAt: -1 }).lean();
  ok(res, {
    pending: items.filter((i) => i.status === 'pending').map(accessToUi),
    approved: items.filter((i) => i.status === 'approved').map(accessToUi),
    rejected: items.filter((i) => i.status === 'rejected').map(accessToUi),
    revoked: items.filter((i) => i.status === 'revoked').map(accessToUi),
    all: items.map(accessToUi),
  });
});

export const pendingCount = asyncHandler(async (req: Request, res: Response) => {
  const auth = (req as AuthedRequest).user;
  const ctx = await actorContext(auth);
  let count = 0;
  if (auth.role === 'patient') count = await AccessRequest.countDocuments({ patientId: ctx.patientId, status: 'pending' });
  else if (ctx.doctorId) count = await AccessRequest.countDocuments({ doctorId: ctx.doctorId, status: 'pending' });
  else if (ctx.hospitalId) count = await AccessRequest.countDocuments({ hospitalId: ctx.hospitalId, status: 'pending' });
  ok(res, { count });
});

async function loadOwnedRequest(req: Request) {
  const auth = (req as AuthedRequest).user;
  const item = await AccessRequest.findOne({ requestId: req.params.id });
  if (!item) throw AppError.notFound('Access request not found');
  if (auth.role === 'patient') {
    const patient = await getPatientForUser(auth.userId);
    if (item.patientId !== patient.patientId) throw AppError.forbidden();
  }
  return { auth, item };
}

export const approveRequest = asyncHandler(async (req: Request, res: Response) => {
  const { auth, item } = await loadOwnedRequest(req);
  if (auth.role !== 'patient') throw AppError.forbidden();
  if (item.status !== 'pending') throw AppError.badRequest('Only pending requests can be approved');
  item.status = 'approved';
  item.approvedAt = new Date();
  await item.save();

  const records = await MedicalRecord.find({ patientId: item.patientId }).lean();
  await AccessPermission.create({
    patientId: item.patientId,
    doctorId: item.doctorId,
    hospitalId: item.hospitalId,
    recordIds: records.map((r) => r.recordId),
    permissionType: 'full',
    grantedAt: new Date(),
    status: 'active',
    doctorName: item.doctorName,
    hospitalName: item.hospitalName,
    recordLabel: `Full record set (${records.length})`,
  });

  await grantAccessOnChain({ requestId: item.requestId, patientId: item.patientId, doctorId: item.doctorId });
  await logActivity({
    userId: auth.userId,
    patientId: item.patientId,
    action: 'ACCESS_APPROVED',
    description: `Access granted to ${item.doctorName}`,
  });

  if (item.doctorId) {
    const doctor = await Doctor.findOne({ doctorId: item.doctorId });
    if (doctor) {
      await createNotification({
        userId: doctor.userId,
        type: 'ACCESS_DECISION',
        title: 'Access approved',
        message: 'Your request was approved',
        relatedRequestId: item.requestId,
        icon: 'check',
        color: '#10e5a5',
      });
    }
  }
  ok(res, accessToUi(item.toObject()));
});

export const rejectRequest = asyncHandler(async (req: Request, res: Response) => {
  const { auth, item } = await loadOwnedRequest(req);
  if (auth.role !== 'patient') throw AppError.forbidden();
  if (item.status !== 'pending') throw AppError.badRequest('Only pending requests can be rejected');
  item.status = 'rejected';
  item.rejectedAt = new Date();
  await item.save();
  await logActivity({
    userId: auth.userId,
    patientId: item.patientId,
    action: 'ACCESS_REJECTED',
    description: `Request from ${item.doctorName} rejected`,
  });
  ok(res, accessToUi(item.toObject()));
});

export const revokeRequest = asyncHandler(async (req: Request, res: Response) => {
  const auth = (req as AuthedRequest).user;
  const ctx = await actorContext(auth);
  const item = await AccessRequest.findOne({ requestId: req.params.id });
  if (!item) throw AppError.notFound('Access request not found');
  const patientOwns = auth.role === 'patient' && item.patientId === ctx.patientId;
  const requesterOwns = Boolean((ctx.doctorId && item.doctorId === ctx.doctorId) || (!ctx.doctorId && ctx.hospitalId && item.hospitalId === ctx.hospitalId));
  if (!patientOwns && !requesterOwns) throw AppError.forbidden();
  if (item.status === 'pending' && requesterOwns) {
    await item.deleteOne();
    ok(res, { withdrawn: true });
    return;
  }
  item.status = 'revoked';
  await item.save();
  await AccessPermission.updateMany(
    { patientId: item.patientId, doctorId: item.doctorId, status: 'active' },
    { status: 'revoked', revokedAt: new Date() },
  );
  await revokeAccessOnChain({ requestId: item.requestId, patientId: item.patientId });
  await logActivity({
    userId: auth.userId,
    patientId: item.patientId,
    action: 'ACCESS_REVOKED',
    description: `Access revoked for ${item.doctorName}`,
  });
  ok(res, accessToUi(item.toObject()));
});

export const listPermissions = asyncHandler(async (req: Request, res: Response) => {
  const auth = (req as AuthedRequest).user;
  const ctx = await actorContext(auth);
  const filter: Record<string, unknown> = {};
  if (auth.role === 'patient') filter.patientId = ctx.patientId;
  else if (ctx.doctorId) filter.doctorId = ctx.doctorId;
  else if (ctx.hospitalId) filter.hospitalId = ctx.hospitalId;
  const items = await AccessPermission.find(filter).sort({ grantedAt: -1 }).lean();
  ok(res, items.map(permissionToUi));
});

export const revokePermission = asyncHandler(async (req: Request, res: Response) => {
  const auth = (req as AuthedRequest).user;
  if (auth.role !== 'patient') throw AppError.forbidden();
  const ctx = await actorContext(auth);
  const perm = await AccessPermission.findById(req.params.id);
  if (!perm) throw AppError.notFound('Permission not found');
  if (perm.patientId !== ctx.patientId) throw AppError.forbidden();
  perm.status = 'revoked';
  perm.revokedAt = new Date();
  await perm.save();
  await logActivity({
    userId: auth.userId,
    patientId: perm.patientId,
    action: 'ACCESS_REVOKED',
    description: `Access revoked for ${perm.doctorName}`,
  });
  ok(res, permissionToUi(perm.toObject()));
});
