import mongoose, { Schema } from 'mongoose';
import type { AccessStatus } from '../types/index.js';

export interface AccessRequestDoc {
  requestId: string;
  patientId: string;
  doctorId?: string;
  hospitalId?: string;
  purpose: string;
  status: AccessStatus;
  requestedAt: Date;
  approvedAt?: Date;
  rejectedAt?: Date;
  expiresAt?: Date;
  doctorName: string;
  hospitalName: string;
  doctorAvatar?: string;
}

const accessRequestSchema = new Schema<AccessRequestDoc>(
  {
    requestId: { type: String, required: true, unique: true },
    patientId: { type: String, required: true, index: true },
    doctorId: { type: String, index: true },
    hospitalId: { type: String },
    purpose: { type: String, required: true },
    status: { type: String, required: true, enum: ['pending', 'approved', 'rejected', 'revoked'], default: 'pending', index: true },
    requestedAt: { type: Date, required: true, default: Date.now },
    approvedAt: { type: Date },
    rejectedAt: { type: Date },
    expiresAt: { type: Date },
    doctorName: { type: String, required: true },
    hospitalName: { type: String, required: true },
    doctorAvatar: { type: String },
  },
  { timestamps: true },
);

export const AccessRequest = mongoose.model<AccessRequestDoc>('AccessRequest', accessRequestSchema);
