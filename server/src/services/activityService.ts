import type { Types } from 'mongoose';
import { ActivityLog } from '../models/ActivityLog.js';
import type { ActivityAction } from '../types/index.js';

export async function logActivity(input: {
  userId?: Types.ObjectId | string;
  patientId?: string;
  action: ActivityAction;
  recordId?: string;
  targetUserId?: Types.ObjectId | string;
  description: string;
  timestamp?: Date;
}) {
  await ActivityLog.create({
    userId: input.userId,
    patientId: input.patientId,
    action: input.action,
    recordId: input.recordId,
    targetUserId: input.targetUserId,
    description: input.description,
    timestamp: input.timestamp ?? new Date(),
  });
}

const ACTION_UI: Record<ActivityAction, { icon: string; color: string }> = {
  RECORD_CREATED: { icon: 'upload', color: '#2e7cf6' },
  RECORD_UPLOADED: { icon: 'upload', color: '#2e7cf6' },
  RECORD_UPDATED: { icon: 'file', color: '#2e7cf6' },
  RECORD_VIEWED: { icon: 'download', color: '#ffb224' },
  RECORD_VERIFIED: { icon: 'shield-check', color: '#10e5a5' },
  ACCESS_REQUESTED: { icon: 'users', color: '#8b5cf6' },
  ACCESS_APPROVED: { icon: 'share', color: '#ff5c6c' },
  ACCESS_REJECTED: { icon: 'x', color: '#ff5c6c' },
  ACCESS_REVOKED: { icon: 'share', color: '#ff5c6c' },
  AI_SUMMARY_GENERATED: { icon: 'sparkles', color: '#22d3ee' },
};

export function activityToUi(doc: { action: ActivityAction; description: string; timestamp: Date; recordId?: string }) {
  const meta = ACTION_UI[doc.action] ?? { icon: 'clock', color: '#2e7cf6' };
  const when = doc.timestamp.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  return {
    icon: meta.icon,
    color: meta.color,
    title: doc.description,
    meta: doc.recordId ? `${doc.recordId} · ${when}` : when,
  };
}
