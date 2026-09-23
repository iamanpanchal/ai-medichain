import type { NextFunction, Request, Response } from 'express';
import { AppError } from '../utils/AppError.js';

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof AppError) {
    return res.status(err.status).json({ success: false, message: err.message, errorCode: err.errorCode });
  }

  if (typeof err === 'object' && err && 'code' in err && (err as { code?: number }).code === 11000) {
    return res.status(409).json({ success: false, message: 'A record with that unique field already exists', errorCode: 'DUPLICATE' });
  }

  if (typeof err === 'object' && err && 'name' in err && (err as { name?: string }).name === 'ValidationError') {
    const message = (err as { message?: string }).message ?? 'Validation failed';
    return res.status(400).json({ success: false, message, errorCode: 'VALIDATION_ERROR' });
  }

  console.error(err);
  return res.status(500).json({ success: false, message: 'An unexpected server error occurred', errorCode: 'INTERNAL' });
}

export function notFoundHandler(_req: Request, res: Response) {
  res.status(404).json({ success: false, message: 'Endpoint not found', errorCode: 'NOT_FOUND' });
}
