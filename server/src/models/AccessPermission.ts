import mongoose, { Schema } from 'mongoose';
import type { PermissionStatus, PermissionType } from '../types/index.js';

export interface AccessPermissionDoc {
  patientId: string;
  doctorId?: string;
  hospitalId?: string;
  recordIds: string[];
  permissionType: PermissionType;
  grantedAt: Date;
  expiresAt?: Date;
  revokedAt?: Date;
  status: PermissionStatus;
  doctorName: string;
  hospitalName: string;
  recordLabel: string;
}

const accessPermissionSchema = new Schema<AccessPermissionDoc>(
  {
    patientId: { type: String, required: true, index: true },
    doctorId: { type: String, index: true },
    hospitalId: { type: String },
    recordIds: { type: [String], default: [] },
    permissionType: { type: String, enum: ['full', 'temporary', 'record-specific'], default: 'full' },
    grantedAt: { type: Date, default: Date.now },
    expiresAt: { type: Date },
    revokedAt: { type: Date },
    status: { type: String, enum: ['active', 'expired', 'revoked'], default: 'active', index: true },
    doctorName: { type: String, required: true },
    hospitalName: { type: String, required: true },
    recordLabel: { type: String, required: true },
  },
  { timestamps: true },
);

export const AccessPermission = mongoose.model<AccessPermissionDoc>('AccessPermission', accessPermissionSchema);
