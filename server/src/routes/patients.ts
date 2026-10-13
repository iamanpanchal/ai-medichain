import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import prisma from '../db/client';
import { requireAuth, requireRole } from '../middleware/auth';

const router = Router();

// All patient routes require authentication
router.use(requireAuth);

// ── GET /api/patients/search ───────────────────────────────────────────────────
// Doctor/hospital searches for patients by name, ID, or email
const SearchSchema = z.object({
  q: z.string().min(1),
  hospital: z.string().optional(),
});

router.get('/search', requireRole('doctor', 'hospital'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = SearchSchema.parse(req.query);
    const searchTerm = query.q.toLowerCase();

    const where: any = {
      role: 'patient',
      OR: [
        { name: { contains: query.q, mode: 'insensitive' } },
        { email: { contains: query.q, mode: 'insensitive' } },
        { id: { contains: query.q, mode: 'insensitive' } },
      ],
    };

    if (query.hospital && query.hospital !== 'All Hospitals') {
      // If we had a hospital field on User, we'd filter by it
      // For now, we'll just search by name/email/id
    }

    const patients = await prisma.users.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        initials: true,
        created_at: true,
        records: {
          select: { id: true },
        },
      },
      take: 50,
    });

    // Get record details for each patient
    const patientsWithrecords = await Promise.all(
      patients.map(async (p) => {
        const recordIds = p.records.map((r:any) => r.id);
        const records = await prisma.records.findMany({
          where: { id: { in: recordIds } },
          select: { id: true, title: true, source: true, date: true, type: true, region: true },
        });
        return {
          id: p.id,
          name: p.name,
          dob: 'Unknown', // Would come from a Patient profile table
          hospital: 'MediChain Network', // Would come from hospital affiliation
          img: undefined,
          records: recordIds,
          recordDetails: records,
        };
      })
    );

    res.json({ success: true, data: patientsWithrecords });
  } catch (err) {
    next(err);
  }
});

export default router;
