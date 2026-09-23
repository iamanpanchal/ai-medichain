import mongoose, { Schema, Types } from 'mongoose';

export interface NotificationDoc {
  userId: Types.ObjectId;
  type: string;
  title: string;
  message: string;
  relatedRecordId?: string;
  relatedRequestId?: string;
  isRead: boolean;
  icon?: string;
  color?: string;
}

const notificationSchema = new Schema<NotificationDoc>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: { type: String, required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    relatedRecordId: { type: String },
    relatedRequestId: { type: String },
    isRead: { type: Boolean, default: false, index: true },
    icon: { type: String },
    color: { type: String },
  },
  { timestamps: true },
);

export const Notification = mongoose.model<NotificationDoc>('Notification', notificationSchema);
