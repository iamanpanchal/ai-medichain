import type { Types } from 'mongoose';
import { Notification } from '../models/Notification.js';

export async function createNotification(input: {
  userId: Types.ObjectId | string;
  type: string;
  title: string;
  message: string;
  relatedRecordId?: string;
  relatedRequestId?: string;
  icon?: string;
  color?: string;
}) {
  return Notification.create({ ...input, isRead: false });
}
