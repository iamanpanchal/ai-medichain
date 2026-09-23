import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from '../utils/AppError.js';
import type { JwtPayload, Role } from '../types/index.js';
import type { AuthUser } from '../types/http.js';

function readToken(req: Request) {
  const header = req.headers.authorization;
  if (header?.startsWith('Bearer ')) return header.slice(7);
  return undefined;
}

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const token = readToken(req);
  if (!token) return next(AppError.unauthorized());
  const secret = process.env.JWT_SECRET;
  if (!secret) return next(AppError.unauthorized('Server auth is not configured', 'AUTH_MISCONFIGURED'));
  try {
    const payload = jwt.verify(token, secret) as JwtPayload;
    (req as Request & { user: AuthUser }).user = { userId: payload.userId, role: payload.role };
    next();
  } catch {
    next(AppError.unauthorized('Invalid or expired session', 'TOKEN_INVALID'));
  }
}

export function requireRole(...roles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const user = (req as Request & { user?: AuthUser }).user;
    if (!user) return next(AppError.unauthorized());
    if (!roles.includes(user.role)) return next(AppError.forbidden());
    next();
  };
}

export function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  const token = readToken(req);
  const secret = process.env.JWT_SECRET;
  if (!token || !secret) return next();
  try {
    const payload = jwt.verify(token, secret) as JwtPayload;
    (req as Request & { user: AuthUser }).user = { userId: payload.userId, role: payload.role };
  } catch {
    /* ignore optional failures */
  }
  next();
}
