import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export interface AppError extends Error {
  statusCode?: number;
}

export function errorHandler(
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  // Schema validation failures are the caller's fault, not the server's.
  // Without this they fall through to 500 and look like server outages.
  if (err instanceof ZodError) {
    res.status(400).json({
      success: false,
      message: 'Invalid request.',
      details: err.flatten().fieldErrors,
    });
    return;
  }

  const status = err.statusCode ?? 500;
  const message = err.message ?? 'Internal server error';

  if (status >= 500) {
    console.error('[server error]', err);
  }

  res.status(status).json({ success: false, message });
}

export function notFound(_req: Request, res: Response): void {
  res.status(404).json({ success: false, message: 'Route not found.' });
}
