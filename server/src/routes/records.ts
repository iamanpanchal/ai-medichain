import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import prisma from '../db/client';
import { requireAuth } from '../middleware/auth';
import { anchorRecord, verifyRecord } from '../blockchain/contract';

const router = Router();

// All record routes require authentication
router.use(requireAuth);

// ── GET /api/records ──────────────────────────────────────────────────────────
// Returns all records for the authenticated patient
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const records = await prisma.medRecord.findMany({
      where: { patientId: req.user!.sub },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: records });
  } catch (err) {
    next(err);
  }
});

// ── GET /api/records/:id ──────────────────────────────────────────────────────
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const record = await prisma.medRecord.findUnique({
      where: { id: req.params.id as string },
      include: { aiSummary: true },
    });

    if (!record) {
      res.status(404).json({ success: false, message: 'Record not found.' });
      return;
    }

    // Only the owning patient can view their own record
    if (record.patientId !== req.user!.sub && req.user!.role === 'patient') {
      res.status(403).json({ success: false, message: 'Access denied.' });
      return;
    }

    res.json({ success: true, data: record });
  } catch (err) {
    next(err);
  }
});

// ── POST /api/records ─────────────────────────────────────────────────────────
const CreateRecordSchema = z.object({
  id:     z.string().regex(/^MR-\d+$/),
  title:  z.string().min(1),
  type:   z.enum(['lab', 'xray', 'mri', 'rx', 'ecg']),
  source: z.string().min(1),
  date:   z.string().min(1),
  region: z.enum(['heart', 'resp', 'digestive', 'musco']),
  hash:   z.string().min(1),
  tx:     z.string().min(1),
});

router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (req.user!.role !== 'patient') {
      res.status(403).json({ success: false, message: 'Only patients can upload records.' });
      return;
    }

    const body = CreateRecordSchema.parse(req.body);

    // Anchor on blockchain (non-blocking — we don't fail the upload if chain is unavailable)
    let txHash = body.tx;
    try {
      txHash = await anchorRecord(body.id, body.hash);
    } catch (chainErr) {
      console.warn('[blockchain] Anchor failed, using provided tx:', chainErr);
    }

    const record = await prisma.medRecord.create({
      data: {
        ...body,
        tx: txHash,
        patientId: req.user!.sub,
      },
    });

    // Log activity
    await prisma.activity.create({
      data: {
        userId: req.user!.sub,
        icon:   'upload',
        color:  '#2e7cf6',
        title:  `${record.title} uploaded`,
        meta:   `${record.source} · ${record.date}`,
      },
    });

    res.status(201).json({ success: true, data: record });
  } catch (err) {
    next(err);
  }
});

// ── GET /api/records/:id/verify ───────────────────────────────────────────────
// Verify a record against the blockchain
router.get('/:id/verify', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const record = await prisma.medRecord.findUnique({ where: { id: req.params.id as string } });
    if (!record) {
      res.status(404).json({ success: false, message: 'Record not found.' });
      return;
    }

    let onChain: { hash: string; anchor: string; timestamp: number } | null = null;
    try {
      onChain = await verifyRecord(record.id);
    } catch (chainErr) {
      console.warn('[blockchain] Verify failed:', chainErr);
    }

    const verified = onChain?.hash?.toLowerCase() === record.hash.toLowerCase();
    res.json({ success: true, data: { verified, onChain, record } });
  } catch (err) {
    next(err);
  }
});

export default router;
