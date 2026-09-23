import { Router, Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import prisma from '../db/client';
import { requireAuth } from '../middleware/auth';

const router = Router();

// ── Helpers ──────────────────────────────────────────────────────────────────
function signToken(payload: object): string {
  const secret = process.env.JWT_SECRET!;
  const expiresIn = (process.env.JWT_EXPIRES_IN ?? '7d') as jwt.SignOptions['expiresIn'];
  return jwt.sign(payload, secret, { expiresIn });
}

function formatUser(user: { id: string; email: string; name: string; role: string; walletAddress: string | null; avatar: string | null; initials: string | null }) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    walletAddress: user.walletAddress ?? undefined,
    avatar: user.avatar ?? undefined,
    initials: user.initials ?? user.name.charAt(0).toUpperCase(),
  };
}

// ── POST /api/auth/register ───────────────────────────────────────────────────
const RegisterSchema = z.object({
  email:    z.string().email(),
  password: z.string().min(6),
  name:     z.string().min(1),
  role:     z.enum(['patient', 'doctor', 'hospital']),
});

router.post('/register', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = RegisterSchema.parse(req.body);

    const existing = await prisma.user.findUnique({ where: { email: body.email } });
    if (existing) {
      res.status(409).json({ success: false, message: 'Email already registered.' });
      return;
    }

    const hashedPassword = await bcrypt.hash(body.password, 10);
    const user = await prisma.user.create({
      data: {
        email:    body.email,
        password: hashedPassword,
        name:     body.name,
        role:     body.role,
        initials: body.name.charAt(0).toUpperCase(),
      },
    });

    const formatted = formatUser(user);
    const token = signToken({ sub: user.id, email: user.email, role: user.role, name: user.name });

    res.status(201).json({ success: true, data: { token, user: formatted } });
  } catch (err) {
    next(err);
  }
});

// ── POST /api/auth/login ──────────────────────────────────────────────────────
const LoginSchema = z.object({
  email:    z.string().email(),
  password: z.string().min(1),
});

router.post('/login', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = LoginSchema.parse(req.body);

    const user = await prisma.user.findUnique({ where: { email: body.email } });
    if (!user) {
      res.status(401).json({ success: false, message: 'Invalid email or password.' });
      return;
    }

    const valid = await bcrypt.compare(body.password, user.password);
    if (!valid) {
      res.status(401).json({ success: false, message: 'Invalid email or password.' });
      return;
    }

    const formatted = formatUser(user);
    const token = signToken({ sub: user.id, email: user.email, role: user.role, name: user.name });

    // Return shape the frontend already expects: { token, user }
    res.json({ success: true, data: { token, user: formatted } });
  } catch (err) {
    next(err);
  }
});

// ── GET /api/auth/me ──────────────────────────────────────────────────────────
router.get('/me', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user!.sub } });
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }
    res.json({ success: true, data: formatUser(user) });
  } catch (err) {
    next(err);
  }
});

export default router;
