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
        prisma.access_requests.findMany({ where: { patient_id: sub, status: 'pending' }, include: { users_access_requests_doctor_idTousers: true } }),
        prisma.access_requests.findMany({ where: { patient_id: sub, status: 'approved' }, include: { users_access_requests_doctor_idTousers: true } }),
        prisma.access_requests.findMany({ where: { patient_id: sub, status: 'rejected' }, include: { users_access_requests_doctor_idTousers: true } }),
      ]);

      const format = (ar: typeof pending) =>
        ar.map((r) => ({
          id:       r.id,
          doctor:   r.users_access_requests_doctor_idTousers.name,
          hospital: r.users_access_requests_doctor_idTousers.name, // would be hospital name in production
          date:     r.created_at.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
          purpose:  r.purpose,
        }));

      res.json({ success: true, data: { pending: format(pending), approved: format(approved), rejected: format(rejected) } });
    } else {
      // doctor/hospital sees their own sent requests
      const sent = await prisma.access_requests.findMany({
        where: { doctor_id: sub },
        include: { users_access_requests_patient_idTousers: true },
        orderBy: { created_at: 'desc' },
      });

      res.json({
        success: true,
        data: sent.map((r) => ({
          id:        r.id,
          patient:   r.users_access_requests_patient_idTousers.name,
          patient_id: r.patient_id,
          hospital:  'MediChain Network',
          scope:     r.purpose,
          date:      r.created_at.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
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
  patient_id: z.string().uuid(),
  purpose:   z.string().min(1),
});

router.post('/request', async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (req.user!.role === 'patient') {
      res.status(403).json({ success: false, message: 'Patients cannot send access requests.' });
      return;
    }

    const body = RequestSchema.parse(req.body);

    const patient = await prisma.users.findUnique({ where: { id: body.patient_id } });
    if (!patient || patient.role !== 'patient') {
      res.status(404).json({ success: false, message: 'Patient not found.' });
      return;
    }

    const existing = await prisma.access_requests.findFirst({
      where: { patient_id: body.patient_id, doctor_id: req.user!.sub, status: 'pending' },
    });
    if (existing) {
      res.status(409).json({ success: false, message: 'A pending request already exists for this patient.' });
      return;
    }

    const request = await prisma.access_requests.create({
      data: {
        patient_id: body.patient_id,
        doctor_id:  req.user!.sub,
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

    const ar = await prisma.access_requests.findUnique({ where: { id: req.params.id as string }, include: { users_access_requests_doctor_idTousers: true } });
    if (!ar) {
      res.status(404).json({ success: false, message: 'Access request not found.' });
      return;
    }
    if (ar.patient_id !== req.user!.sub) {
      res.status(403).json({ success: false, message: 'Access denied.' });
      return;
    }
    if (ar.status !== 'pending') {
      res.status(409).json({ success: false, message: 'This request has already been actioned.' });
      return;
    }

    const updated = await prisma.access_requests.update({
      where: { id: req.params.id as string },
      data:  { status: body.action },
    });

    // Approving must actually grant read access, otherwise the doctor stays
    // locked out. Rejecting must take it away again, so a later re-approval is
    // the only way back in.
    if (body.action === 'approved') {
      const records = await prisma.records.findMany({
        where: { patient_id: ar.patient_id },
        select: { id: true },
      });

      // Delete-then-create keeps the operation idempotent if a grant already
      // exists (e.g. re-approval after a revocation).
      await prisma.shared_access.deleteMany({
        where: { patient_id: ar.patient_id, doctor_id: ar.doctor_id },
      });

      if (records.length > 0) {
        await prisma.shared_access.createMany({
          data: records.map((record) => ({
            patient_id: ar.patient_id,
            doctor_id:  ar.doctor_id,
            record_id:  record.id,
            status:    'active' as const,
          })),
        });
      }
    } else {
      await prisma.shared_access.deleteMany({
        where: { patient_id: ar.patient_id, doctor_id: ar.doctor_id },
      });
    }

    // Log activity
    await prisma.activities.create({
      data: {
        user_id: req.user!.sub,
        icon:   body.action === 'approved' ? 'check' : 'x',
        color:  body.action === 'approved' ? '#10e5a5' : '#ff5c6c',
        title:  `Access ${body.action} for ${ar.users_access_requests_doctor_idTousers.name}`,
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
    const ar = await prisma.access_requests.findUnique({ where: { id: req.params.id as string } });
    if (!ar) {
      res.status(404).json({ success: false, message: 'Access request not found.' });
      return;
    }
    if (ar.doctor_id !== req.user!.sub) {
      res.status(403).json({ success: false, message: 'Only the requesting doctor can withdraw this request.' });
      return;
    }
    if (ar.status !== 'pending') {
      res.status(409).json({ success: false, message: 'Only pending requests can be withdrawn.' });
      return;
    }

    await prisma.access_requests.delete({ where: { id: req.params.id as string } });

    // Withdrawing a pending request revokes anything a prior approval granted.
    await prisma.shared_access.deleteMany({
      where: { patient_id: ar.patient_id, doctor_id: ar.doctor_id },
    });

    res.json({ success: true, message: 'Request withdrawn.' });
  } catch (err) {
    next(err);
  }
});

export default router;
