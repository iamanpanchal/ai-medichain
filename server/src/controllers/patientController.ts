import type { Request, Response } from 'express';
import { Patient } from '../models/Patient.js';
import { MedicalRecord } from '../models/MedicalRecord.js';
import { User } from '../models/User.js';
import { AccessRequest } from '../models/AccessRequest.js';
import { AppError } from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ok } from '../utils/respond.js';
import { recordToUi } from '../utils/mappers.js';
import { assertCanReadPatient, getPatientForUser } from '../services/profileService.js';
import type { AuthedRequest } from '../types/http.js';

export const getPatient = asyncHandler(async (req: Request, res: Response) => {
  const auth = (req as AuthedRequest).user;
  const { id } = req.params;
  await assertCanReadPatient(auth, id);
  const patient = await Patient.findOne({ patientId: id }).lean();
  if (!patient) throw AppError.notFound('Patient not found');
  const user = await User.findById(patient.userId).lean();
  ok(res, {
    patientId: patient.patientId,
    userId: patient.userId,
    name: patient.name,
    dateOfBirth: patient.dateOfBirth,
    dob: patient.dateOfBirth,
    gender: patient.gender,
    bloodGroup: patient.bloodGroup,
    allergies: patient.allergies,
    emergencyContact: patient.emergencyContact,
    walletAddress: patient.walletAddress,
    hospital: patient.hospitalName,
    img: patient.avatar,
    email: user?.email,
  });
});

export const updatePatient = asyncHandler(async (req: Request, res: Response) => {
  const auth = (req as AuthedRequest).user;
  const { id } = req.params;
  if (auth.role !== 'patient') throw AppError.forbidden();
  const mine = await getPatientForUser(auth.userId);
  if (mine.patientId !== id) throw AppError.forbidden();
  const allowed = ['name', 'dateOfBirth', 'gender', 'bloodGroup', 'allergies', 'emergencyContact', 'walletAddress', 'avatar'];
  for (const key of allowed) {
    if (key in req.body) (mine as unknown as Record<string, unknown>)[key] = req.body[key];
  }
  await mine.save();
  ok(res, mine);
});

export const getPatientRecords = asyncHandler(async (req: Request, res: Response) => {
  const auth = (req as AuthedRequest).user;
  const { id } = req.params;
  await assertCanReadPatient(auth, id);
  const records = await MedicalRecord.find({ patientId: id }).sort({ createdAt: -1 }).lean();
  const patient = await Patient.findOne({ patientId: id }).lean();
  ok(res, records.map((r) => recordToUi({ ...r, patientName: patient?.name })));
});

export const getPassport = asyncHandler(async (req: Request, res: Response) => {
  const auth = (req as AuthedRequest).user;
  const { id } = req.params;
  await assertCanReadPatient(auth, id);
  const patient = await Patient.findOne({ patientId: id }).lean();
  if (!patient) throw AppError.notFound('Patient not found');
  const records = await MedicalRecord.find({ patientId: id }).sort({ createdAt: -1 }).lean();
  const byRegion: Record<string, number> = {};
  for (const r of records) byRegion[r.region] = (byRegion[r.region] || 0) + 1;
  ok(res, {
    patient: {
      patientId: patient.patientId,
      name: patient.name,
      dateOfBirth: patient.dateOfBirth,
      hospital: patient.hospitalName,
    },
    records: records.map((r) => recordToUi({ ...r, patientName: patient.name })),
    regionCounts: byRegion,
    verifiedCount: records.filter((r) => r.verificationStatus === 'verified').length,
  });
});

export const getMyDashboard = asyncHandler(async (req: Request, res: Response) => {
  const auth = (req as AuthedRequest).user;
  if (auth.role !== 'patient') throw AppError.forbidden();
  const patient = await getPatientForUser(auth.userId);
  const records = await MedicalRecord.find({ patientId: patient.patientId }).sort({ createdAt: -1 }).lean();
  const pending = await AccessRequest.countDocuments({ patientId: patient.patientId, status: 'pending' });
  const approved = await AccessRequest.find({ patientId: patient.patientId, status: 'approved' }).lean();
  ok(res, {
    patientId: patient.patientId,
    name: patient.name,
    records: records.map((r) => recordToUi({ ...r, patientName: patient.name })),
    pending,
    hospitals: new Set(records.map((r) => r.source)).size,
    doctors: new Set(approved.map((a) => a.doctorName)).size,
  });
});
