import type { Request, Response } from 'express';
import { MedicalRecord } from '../models/MedicalRecord.js';
import { Patient } from '../models/Patient.js';
import { AppError } from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ok } from '../utils/respond.js';
import { recordToUi } from '../utils/mappers.js';
import { actorContext, assertCanReadPatient, getPatientForUser } from '../services/profileService.js';
import { logActivity } from '../services/activityService.js';
import { createNotification } from '../services/notificationService.js';
import { createRecordOnChain, verifyRecordOnChain } from '../services/blockchainService.js';
import { sha256 } from '../utils/hash.js';
import { formatDisplayDate } from '../utils/dates.js';
import { newRecordId } from '../utils/ids.js';
import type { AuthedRequest } from '../types/http.js';
import type { RecType, Region } from '../types/index.js';

async function withPatientName(record: ReturnType<typeof recordToUi> extends infer T ? T : never, patientId: string) {
  const patient = await Patient.findOne({ patientId }).lean();
  return { ...record, patientName: patient?.name };
}

export const createRecord = asyncHandler(async (req: Request, res: Response) => {
  const auth = (req as AuthedRequest).user;
  const ctx = await actorContext(auth);
  const body = req.body as Record<string, string>;
  const patientId = body.patientId || ctx.patientId;
  if (!patientId) throw AppError.badRequest('patientId is required', 'VALIDATION_ERROR');
  if (auth.role === 'patient' && ctx.patientId !== patientId) throw AppError.forbidden();

  const patient = await Patient.findOne({ patientId });
  if (!patient) throw AppError.notFound('Patient not found');

  const title = body.title?.trim();
  if (!title) throw AppError.badRequest('title is required', 'VALIDATION_ERROR');
  const recordType = (body.recordType || body.type || 'lab') as RecType;
  const region = (body.region || 'heart') as Region;
  const source = body.source?.trim() || ctx.name;
  const file = (req as Request & { file?: Express.Multer.File }).file;
  const raw = file?.buffer ?? Buffer.from(`${title}:${patientId}:${Date.now()}`);
  const fileHash = sha256(raw);
  const recordId = body.recordId || newRecordId();

  const chain = await createRecordOnChain({ recordId, fileHash, patientId });
  const record = await MedicalRecord.create({
    recordId,
    patientId,
    doctorId: ctx.doctorId,
    hospitalId: ctx.hospitalId || body.hospitalId,
    title,
    recordType,
    source,
    date: body.date || formatDisplayDate(),
    region,
    description: body.description,
    diagnosis: body.diagnosis,
    prescription: body.prescription,
    notes: body.notes,
    fileUrl: file ? `/uploads/${file.filename}` : undefined,
    fileHash,
    blockchainTxHash: chain.txHash,
    blockchainRecordId: chain.blockchainRecordId,
    verificationStatus: 'verified',
  });

  await logActivity({
    userId: auth.userId,
    patientId,
    action: 'RECORD_UPLOADED',
    recordId,
    description: `${title} uploaded`,
  });
  await createNotification({
    userId: patient.userId,
    type: 'RECORD_UPLOADED',
    title: 'New medical record',
    message: `${title} was encrypted and anchored on-chain`,
    relatedRecordId: recordId,
    icon: 'upload',
    color: '#2e7cf6',
  });

  ok(res, await withPatientName(recordToUi({ ...record.toObject(), patientName: patient.name }), patientId), 201);
});

export const getRecord = asyncHandler(async (req: Request, res: Response) => {
  const auth = (req as AuthedRequest).user;
  const record = await MedicalRecord.findOne({ recordId: req.params.id }).lean();
  if (!record) throw AppError.notFound('Record not found');
  await assertCanReadPatient(auth, record.patientId);
  await logActivity({
    userId: auth.userId,
    patientId: record.patientId,
    action: 'RECORD_VIEWED',
    recordId: record.recordId,
    description: `${record.title} viewed`,
  });
  ok(res, await withPatientName(recordToUi(record), record.patientId));
});

export const getRecordsForPatient = asyncHandler(async (req: Request, res: Response) => {
  const auth = (req as AuthedRequest).user;
  await assertCanReadPatient(auth, req.params.patientId);
  const records = await MedicalRecord.find({ patientId: req.params.patientId }).sort({ createdAt: -1 }).lean();
  const patient = await Patient.findOne({ patientId: req.params.patientId }).lean();
  ok(res, records.map((r) => recordToUi({ ...r, patientName: patient?.name })));
});

export const updateRecord = asyncHandler(async (req: Request, res: Response) => {
  const auth = (req as AuthedRequest).user;
  const record = await MedicalRecord.findOne({ recordId: req.params.id });
  if (!record) throw AppError.notFound('Record not found');
  if (auth.role === 'patient') {
    const patient = await getPatientForUser(auth.userId);
    if (patient.patientId !== record.patientId) throw AppError.forbidden();
  }
  const fields = ['title', 'description', 'diagnosis', 'prescription', 'notes', 'source'] as const;
  for (const key of fields) {
    if (key in req.body) (record as unknown as Record<string, unknown>)[key] = req.body[key];
  }
  if (req.body.recordType) record.recordType = req.body.recordType;
  if (req.body.region) record.region = req.body.region;
  await record.save();
  await logActivity({
    userId: auth.userId,
    patientId: record.patientId,
    action: 'RECORD_UPDATED',
    recordId: record.recordId,
    description: `${record.title} updated`,
  });
  ok(res, recordToUi(record.toObject()));
});

export const deleteRecord = asyncHandler(async (req: Request, res: Response) => {
  const auth = (req as AuthedRequest).user;
  const record = await MedicalRecord.findOne({ recordId: req.params.id });
  if (!record) throw AppError.notFound('Record not found');
  if (auth.role === 'patient') {
    const patient = await getPatientForUser(auth.userId);
    if (patient.patientId !== record.patientId) throw AppError.forbidden();
  } else if (auth.role === 'doctor') {
    throw AppError.forbidden();
  }
  await record.deleteOne();
  ok(res, { deleted: true, recordId: req.params.id });
});

export const verifyRecord = asyncHandler(async (req: Request, res: Response) => {
  const auth = (req as AuthedRequest).user;
  const record = await MedicalRecord.findOne({ recordId: req.params.id });
  if (!record) throw AppError.notFound('Record not found');
  await assertCanReadPatient(auth, record.patientId);
  const result = await verifyRecordOnChain({
    recordId: record.recordId,
    fileHash: record.fileHash,
    txHash: record.blockchainTxHash,
  });
  record.verificationStatus = result.valid ? 'verified' : 'failed';
  await record.save();
  if (result.valid) {
    await logActivity({
      userId: auth.userId,
      patientId: record.patientId,
      action: 'RECORD_VERIFIED',
      recordId: record.recordId,
      description: `Record ${record.recordId} verified on-chain`,
    });
  }
  ok(res, { ...recordToUi(record.toObject()), chain: result });
});
