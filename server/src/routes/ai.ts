import { Router, Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import Anthropic from '@anthropic-ai/sdk';
import { z } from 'zod';
import prisma from '../db/client';
import { requireAuth, readAuthUser } from '../middleware/auth';
import { canAccessRecord, visibleRecordsWhere } from '../services/authorization';
import { buildPatientSystemPrompt, buildSummaryUserPrompt, PUBLIC_SYSTEM_PROMPT, SUMMARY_SYSTEM_PROMPT } from '../ai/prompts';

const router = Router();

const SUMMARY_MODEL = 'claude-sonnet-4-6';
const CHAT_MODEL = 'claude-sonnet-4-6';

// ── POST /api/ai/chat ─────────────────────────────────────────────────────────
// Streaming proxy to Anthropic — the API key never reaches the browser, and
// neither does the system prompt. The client cannot supply `system`.
const ChatSchema = z.object({
  messages: z.array(z.object({ role: z.enum(['user', 'assistant']), content: z.string() })).min(1),
  mode:     z.enum(['patient', 'public']).default('patient'),
  // Optional selector for which record the user is currently viewing. It is
  // only honoured if it matches a record the caller may read.
  focusedRecordId: z.string().max(64).optional(),
});

router.post('/chat', async (req: Request, res: Response, next: NextFunction) => {
  let streamed = false;

  try {
    const body = ChatSchema.parse(req.body);
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      res.status(503).json({ success: false, message: 'AI service not configured.' });
      return;
    }

    // Patient mode requires a signed-in caller; public mode serves anonymous
    // visitors and never touches patient data.
    const user = readAuthUser(req);
    if (body.mode === 'patient' && !user) {
      res.status(401).json({ success: false, message: 'Sign in to use the patient assistant.' });
      return;
    }

    let systemPrompt = PUBLIC_SYSTEM_PROMPT;
    if (body.mode === 'patient' && user) {
      const records = await prisma.medRecord.findMany({
        where: visibleRecordsWhere(user),
        orderBy: { createdAt: 'desc' },
      });
      systemPrompt = buildPatientSystemPrompt(records, body.focusedRecordId);
    }

    const client = new Anthropic({ apiKey });

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    streamed = true;

    const stream = await client.messages.stream({
      model:      CHAT_MODEL,
      max_tokens: 700,
      system:     systemPrompt,
      messages:   body.messages as Anthropic.MessageParam[],
    });

    for await (const event of stream) {
      res.write(`data: ${JSON.stringify(event)}\n\n`);
    }

    res.end();
  } catch (err) {
    // Once the SSE stream has started we can no longer send a JSON error
    // envelope, so just terminate the stream.
    if (streamed) {
      res.end();
      return;
    }
    next(err);
  }
});

// ── POST /api/ai/summarize/:recordId ─────────────────────────────────────────
// Generates or refreshes an AI summary for a medical record
router.post('/summarize/:recordId', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { recordId } = req.params;
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      res.status(503).json({ success: false, message: 'AI service not configured.' });
      return;
    }

    const record = await prisma.medRecord.findUnique({
      where: { id: recordId as string },
      include: { sharedAccess: { select: { doctorId: true, status: true } } },
    });
    if (!record) {
      res.status(404).json({ success: false, message: 'Record not found.' });
      return;
    }

    // Same rule as reading the record: patients need ownership, everyone else
    // needs an active SharedAccess grant.
    if (!canAccessRecord(req.user!, record)) {
      res.status(403).json({ success: false, message: 'Access denied.' });
      return;
    }

    // Optional: delegate to the Python FastAPI microservice. Unset or blank
    // means use the inline Anthropic path below.
    const aiServiceUrl = process.env.AI_SERVICE_URL?.trim();
    let summaryData: unknown;

    if (aiServiceUrl) {
      const aiRes = await fetch(`${aiServiceUrl}/summarize`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ record }),
      });
      if (!aiRes.ok) throw new Error('AI microservice returned an error.');
      summaryData = (await aiRes.json() as { data: unknown }).data;
    } else {
      const client = new Anthropic({ apiKey });
      const msg = await client.messages.create({
        model:      SUMMARY_MODEL,
        max_tokens: 800,
        system:     SUMMARY_SYSTEM_PROMPT,
        messages:   [{ role: 'user', content: buildSummaryUserPrompt(record) }],
      });

      const raw = msg.content[0]?.type === 'text' ? msg.content[0].text : '{}';
      // Models occasionally wrap JSON in a markdown fence despite instructions.
      const cleaned = raw.trim().replace(/^```(?:json)?\s*/i, '').replace(/```$/, '').trim();
      summaryData = JSON.parse(cleaned || '{}');
    }

    // Upsert the AI summary in the database
    const data = summaryData as Prisma.AiSummaryUncheckedCreateInput;
    const saved = await prisma.aiSummary.upsert({
      where:  { recordId: recordId as string },
      update: { ...data, model: SUMMARY_MODEL },
      create: { ...data, recordId: recordId as string, model: SUMMARY_MODEL },
    });

    // Log activity
    await prisma.activity.create({
      data: {
        userId: req.user!.sub,
        icon:   'sparkles',
        color:  '#22d3ee',
        title:  `AI summary generated for ${record.title}`,
        meta:   record.date,
      },
    });

    res.json({ success: true, data: saved });
  } catch (err) {
    next(err);
  }
});

// ── GET /api/ai/summary/:recordId ─────────────────────────────────────────────
// Fetch a previously generated summary
router.get('/summary/:recordId', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const record = await prisma.medRecord.findUnique({
      where: { id: req.params.recordId as string },
      include: { sharedAccess: { select: { doctorId: true, status: true } }, aiSummary: true },
    });

    if (!record?.aiSummary) {
      res.status(404).json({ success: false, message: 'No summary found. Generate one first.' });
      return;
    }

    if (!canAccessRecord(req.user!, record)) {
      res.status(403).json({ success: false, message: 'Access denied.' });
      return;
    }

    res.json({ success: true, data: record.aiSummary });
  } catch (err) {
    next(err);
  }
});

// ── GET /api/ai/activity ──────────────────────────────────────────────────────
// Returns activity log for the authenticated user
router.get('/activity', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const activities = await prisma.activity.findMany({
      where: { userId: req.user!.sub },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    res.json({ success: true, data: activities });
  } catch (err) {
    next(err);
  }
});

export default router;
