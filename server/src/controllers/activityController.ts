import type { Request, Response } from 'express';
import { ActivityLog } from '../models/ActivityLog.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ok } from '../utils/respond.js';
import { activityToUi } from '../services/activityService.js';
import { actorContext } from '../services/profileService.js';
import type { AuthedRequest } from '../types/http.js';

export const listActivity = asyncHandler(async (req: Request, res: Response) => {
  const auth = (req as AuthedRequest).user;
  const ctx = await actorContext(auth);
  const filter = auth.role === 'patient' ? { patientId: ctx.patientId } : { userId: auth.userId };
  const items = await ActivityLog.find(filter).sort({ timestamp: -1 }).limit(100).lean();
  ok(res, items.map((i) => activityToUi({ ...i, action: i.action, description: i.description, timestamp: i.timestamp, recordId: i.recordId })));
});
