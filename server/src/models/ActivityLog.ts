import mongoose, { Schema, Types } from 'mongoose';
import type { ActivityAction } from '../types/index.js';

export interface ActivityLogDoc {
  userId?: Types.ObjectId;
  patientId?: string;
  action: ActivityAction;
  recordId?: string;
  targetUserId?: Types.ObjectId;
  description: string;
  timestamp: Date;
}

const activityLogSchema = new Schema<ActivityLogDoc>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    patientId: { type: String, index: true },
    action: { type: String, required: true },
    recordId: { type: String },
    targetUserId: { type: Schema.Types.ObjectId, ref: 'User' },
    description: { type: String, required: true },
    timestamp: { type: Date, default: Date.now, index: true },
  },
  { timestamps: true },
);

export const ActivityLog = mongoose.model<ActivityLogDoc>('ActivityLog', activityLogSchema);
