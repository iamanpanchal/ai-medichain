import mongoose, { Schema } from 'mongoose';
import type { RecType, Region, VerificationStatus } from '../types/index.js';

export interface MedicalRecordDoc {
  recordId: string;
  patientId: string;
  doctorId?: string;
  hospitalId?: string;
  title: string;
  recordType: RecType;
  source: string;
  date: string;
  region: Region;
  description?: string;
  diagnosis?: string;
  prescription?: string;
  notes?: string;
  fileUrl?: string;
  fileHash: string;
  blockchainTxHash: string;
  blockchainRecordId?: string;
  verificationStatus: VerificationStatus;
}

const medicalRecordSchema = new Schema<MedicalRecordDoc>(
  {
    recordId: { type: String, required: true, unique: true, index: true },
    patientId: { type: String, required: true, index: true },
    doctorId: { type: String, index: true },
    hospitalId: { type: String, index: true },
    title: { type: String, required: true },
    recordType: { type: String, required: true, enum: ['lab', 'xray', 'mri', 'rx', 'ecg'] },
    source: { type: String, required: true },
    date: { type: String, required: true },
    region: { type: String, required: true, enum: ['heart', 'resp', 'digestive', 'musco'] },
    description: { type: String },
    diagnosis: { type: String },
    prescription: { type: String },
    notes: { type: String },
    fileUrl: { type: String },
    fileHash: { type: String, required: true },
    blockchainTxHash: { type: String, required: true },
    blockchainRecordId: { type: String },
    verificationStatus: { type: String, enum: ['pending', 'verified', 'failed'], default: 'pending' },
  },
  { timestamps: true },
);

export const MedicalRecord = mongoose.model<MedicalRecordDoc>('MedicalRecord', medicalRecordSchema);
