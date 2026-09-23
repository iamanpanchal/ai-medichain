import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import prisma from '../db/client';
import { requireAuth } from '../middleware/auth';

const router = Router();
router.use(requireAuth);

// ── GET /api/access ───────────────────────────────────────────────────────────
// Patient: lists their incoming requests (pending / approved / rejected)
// Doctor/hospital: lists requests they have sent
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { role, sub } = req.user!;

    if (role === 'patient') {
      const [pending, approved, rejected] = await Promise.all([
        prisma.accessRequest.findMany({ where: { patientId: sub, status: 'pending' }, include: { doctor: true } }),
        prisma.accessRequest.findMany({ where: { patientId: sub, status: 'approved' }, include: { doctor: true } }),
        prisma.accessRequest.findMany({ where: { patientId: sub, status: 'rejected' }, include: { doctor: true } }),
      ]);

      const format = (ar: typeof pending) =>
        ar.map((r) => ({
          id:       r.id,
          doctor:   r.doctor.name,
          hospital: r.doctor.name, // would be hospital name in production
          date:     r.createdAt.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
          purpose:  r.purpose,
        }));

      res.json({ success: true, data: { pending: format(pending), approved: format(approved), rejected: format(rejected) } });
    } else {
      // doctor/hospital sees their own sent requests
      const sent = await prisma.accessRequest.findMany({
        where: { doctorId: sub },
        include: { patient: true },
        orderBy: { createdAt: 'desc' },
      });

      res.json({
        success: true,
        data: sent.map((r) => ({
          id:        r.id,
          patient:   r.patient.name,
          patientId: r.patientId,
          hospital:  'MediChain Network',
          scope:     r.purpose,
          date:      r.createdAt.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
          status:    r.status.charAt(0).toUpperCase() + r.status.slice(1),
        })),
      });
    }
  } catch (err) {
    next(err);
  }
});

// ── POST /api/access/request ──────────────────────────────────────────────────
// Doctor sends access request to a patient
const RequestSchema = z.object({
  patientId: z.string().uuid(),
  purpose:   z.string().min(1),
});

router.post('/request', async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (req.user!.role === 'patient') {
      res.status(403).json({ success: false, message: 'Patients cannot send access requests.' });
      return;
    }

    const body = RequestSchema.parse(req.body);

    const patient = await prisma.user.findUnique({ where: { id: body.patientId } });
    if (!patient || patient.role !== 'patient') {
      res.status(404).json({ success: false, message: 'Patient not found.' });
      return;
    }

    const existing = await prisma.accessRequest.findFirst({
      where: { patientId: body.patientId, doctorId: req.user!.sub, status: 'pending' },
    });
    if (existing) {
      res.status(409).json({ success: false, message: 'A pending request already exists for this patient.' });
      return;
    }

    const request = await prisma.accessRequest.create({
      data: {
        patientId: body.patientId,
        doctorId:  req.user!.sub,
        purpose:   body.purpose,
      },
    });

    res.status(201).json({ success: true, data: request });
  } catch (err) {
    next(err);
  }
});

// ── PATCH /api/access/:id ─────────────────────────────────────────────────────
// Patient approves or rejects a pending request
const ActionSchema = z.object({
  action: z.enum(['approved', 'rejected']),
});

router.patch('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (req.user!.role !== 'patient') {
      res.status(403).json({ success: false, message: 'Only patients can respond to access requests.' });
      return;
    }

    const body = ActionSchema.parse(req.body);

    const ar = await prisma.accessRequest.findUnique({ where: { id: req.params.id as string }, include: { doctor: true } });
    if (!ar) {
      res.status(404).json({ success: false, message: 'Access request not found.' });
      return;
    }
    if (ar.patientId !== req.user!.sub) {
      res.status(403).json({ success: false, message: 'Access denied.' });
      return;
    }
    if (ar.status !== 'pending') {
      res.status(409).json({ success: false, message: 'This request has already been actioned.' });
      return;
    }

    const updated = await prisma.accessRequest.update({
      where: { id: req.params.id as string },
      data:  { status: body.action },
    });

    // Log activity
    await prisma.activity.create({
      data: {
        userId: req.user!.sub,
        icon:   body.action === 'approved' ? 'check' : 'x',
        color:  body.action === 'approved' ? '#10e5a5' : '#ff5c6c',
        title:  `Access ${body.action} for ${ar.doctor.name}`,
        meta:   `${ar.purpose} · ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`,
      },
    });

    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
});

// ── DELETE /api/access/:id ────────────────────────────────────────────────────
// Doctor withdraws a pending request
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const ar = await prisma.accessRequest.findUnique({ where: { id: req.params.id as string } });
    if (!ar) {
      res.status(404).json({ success: false, message: 'Access request not found.' });
      return;
    }
    if (ar.doctorId !== req.user!.sub) {
      res.status(403).json({ success: false, message: 'Only the requesting doctor can withdraw this request.' });
      return;
    }
    if (ar.status !== 'pending') {
      res.status(409).json({ success: false, message: 'Only pending requests can be withdrawn.' });
      return;
    }

    await prisma.accessRequest.delete({ where: { id: req.params.id as string } });
    res.json({ success: true, message: 'Request withdrawn.' });
  } catch (err) {
    next(err);
  }
});

export default router;
