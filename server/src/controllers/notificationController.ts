import type { Request, Response } from 'express';
import { Notification } from '../models/Notification.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ok } from '../utils/respond.js';
import { notificationToUi } from '../utils/mappers.js';
import { AppError } from '../utils/AppError.js';
import type { AuthedRequest } from '../types/http.js';

export const listNotifications = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = (req as AuthedRequest).user;
  const items = await Notification.find({ userId }).sort({ createdAt: -1 }).limit(50).lean();
  ok(res, items.map(notificationToUi));
});

export const unreadCount = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = (req as AuthedRequest).user;
  const count = await Notification.countDocuments({ userId, isRead: false });
  ok(res, { count });
});

export const markRead = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = (req as AuthedRequest).user;
  const item = await Notification.findOne({ _id: req.params.id, userId });
  if (!item) throw AppError.notFound('Notification not found');
  item.isRead = true;
  await item.save();
  ok(res, notificationToUi(item.toObject()));
});
