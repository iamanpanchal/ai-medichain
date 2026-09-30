import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface JwtPayload {
  sub: string;  // user id
  email: string;
  role: string;
  name: string;
}

// Augment Express request type
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    res.status(401).json({ success: false, message: 'No token provided.' });
    return;
  }

  const token = header.slice(7);
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    res.status(500).json({ success: false, message: 'JWT secret not configured.' });
    return;
  }

  try {
    const payload = jwt.verify(token, secret) as JwtPayload;
    req.user = payload;
    next();
  } catch {
    res.status(401).json({ success: false, message: 'Invalid or expired token.' });
  }
}
export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({ success: false, message: 'Insufficient permissions.' });
      return;
    }
    next();
  };
}

/**
 * Verifies a Bearer token if one is present, without rejecting the request.
 * Used by endpoints that are public but personalise themselves for a signed-in
 * caller (for example the AI chat proxy, which serves anonymous visitors in
 * public mode and record-aware patients in patient mode).
 */
export function readAuthUser(req: Request): JwtPayload | null {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return null;

  const secret = process.env.JWT_SECRET;
  if (!secret) return null;

  try {
    return jwt.verify(header.slice(7), secret) as JwtPayload;
  } catch {
    return null;
  }
}
