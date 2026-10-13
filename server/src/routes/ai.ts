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
  focusedrecord_id: z.string().max(64).optional(),
});

router.post('/chat', async (req: Request, res: Response, next: NextFunction) => {
  let streamed = false;

  try {
    const body = ChatSchema.parse(req.body);
    const apiKey = process.env.ANTHROPIC_API_KEY;
    const isDemoMode = !apiKey || apiKey.startsWith('sk-ant-...');

    // Patient mode requires a signed-in caller; public mode serves anonymous
    // visitors and never touches patient data.
    const user = readAuthUser(req);
    if (body.mode === 'patient' && !user) {
      res.status(401).json({ success: false, message: 'Sign in to use the patient assistant.' });
      return;
    }

    let systemPrompt = PUBLIC_SYSTEM_PROMPT;
    if (body.mode === 'patient' && user) {
      const records = await prisma.records.findMany({
        where: visibleRecordsWhere(user),
        orderBy: { created_at: 'desc' },
      });
      systemPrompt = buildPatientSystemPrompt(records, body.focusedrecord_id);
    }

    if (isDemoMode) {
      // Demo fallback: return a canned streaming response
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      const demoResponse = body.mode === 'public'
        ? 'Welcome to MediChain! I can help you with signing up, logging in, or learning about how MediChain secures your health records on the blockchain. How can I assist you today?'
        : 'I can see your medical records. Your latest blood test (MR-1024) shows low Vitamin D and marginally high cholesterol. Would you like me to explain any specific result or help you understand your health passport?';

      // Simulate streaming by sending chunks
      const chunks = demoResponse.match(/.{1,20}/g) ?? [demoResponse];
      for (const chunk of chunks) {
        const event = {
          type: 'content_block_delta',
          delta: { type: 'text_delta', text: chunk },
        };
        res.write(`data: ${JSON.stringify(event)}\n\n`);
        await new Promise((resolve) => setTimeout(resolve, 50));
      }
      res.end();
      return;
    }

    const client = new Anthropic({ apiKey });

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const stream = await client.messages.stream({
      model:      CHAT_MODEL,
      max_tokens: 700,
      system:     systemPrompt,
      messages:   body.messages as Anthropic.MessageParam[],
    });

    for await (const event of stream) {
      // Mark as committed on the first write only — until then the error
      // handler can still send a proper JSON error response.
      res.write(`data: ${JSON.stringify(event)}\n\n`);
      streamed = true;
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

// ── POST /api/ai/summarize/:record_id ─────────────────────────────────────────
// Generates or refreshes an AI summary for a medical record
router.post('/summarize/:record_id', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { record_id } = req.params;
    const apiKey = process.env.ANTHROPIC_API_KEY;
    const isDemoMode = !apiKey || apiKey.startsWith('sk-ant-...');

    const record = await prisma.records.findUnique({
      where: { id: record_id as string },
      include: { shared_access: { select: { doctor_id: true, status: true } } },
    });
    if (!record) {
      res.status(404).json({ success: false, message: 'Record not found.' });
      return;
    }

    // Same rule as reading the record: patients need ownership, everyone else
    // needs an active shared_access grant.
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
    } else if (isDemoMode) {
      // Demo fallback: return a pre-seeded summary or generate a basic one
      const existing = await prisma.ai_summaries.findUnique({ where: { record_id: record_id as string } });
      if (existing) {
        summaryData = {
          blurb: existing.blurb,
          findings: existing.findings,
          recs: existing.recs,
          conditions: existing.conditions,
        };
      } else {
        // Generate a basic demo summary based on record type
        const typeDemos: Record<string, { blurb: string[]; findings: any[]; recs: string[]; conditions: any[] }> = {
          lab: {
            blurb: ['Your lab results show values within expected ranges. Some markers may need follow-up.'],
            findings: [
              { label: 'Key Marker 1', value: 'Normal', status: 'normal' },
              { label: 'Key Marker 2', value: 'Slightly elevated', status: 'warn' },
            ],
            recs: ['Follow up with your provider', 'Repeat test in 3 months'],
            conditions: [{ name: 'No significant findings', likelihood: 'Confirmed' }],
          },
          xray: {
            blurb: ['The X-ray shows no acute abnormalities. Structures appear normal.'],
            findings: [
              { label: 'Lung fields', value: 'Clear', status: 'normal' },
              { label: 'Bone structure', value: 'Normal', status: 'normal' },
            ],
            recs: ['No follow-up required unless symptoms develop'],
            conditions: [{ name: 'No significant findings', likelihood: 'Confirmed' }],
          },
          mri: {
            blurb: ['MRI imaging reveals normal anatomy with no concerning findings.'],
            findings: [
              { label: 'Soft tissue', value: 'Normal', status: 'normal' },
              { label: 'No lesions', value: 'Confirmed', status: 'normal' },
            ],
            recs: ['Routine follow-up as advised'],
            conditions: [{ name: 'No significant findings', likelihood: 'Confirmed' }],
          },
          rx: {
            blurb: ['Your prescription has been reviewed. Continue medications as directed.'],
            findings: [
              { label: 'Medication 1', value: 'Current dose appropriate', status: 'normal' },
              { label: 'Medication 2', value: 'No interactions detected', status: 'normal' },
            ],
            recs: ['Take as prescribed', 'Contact provider with any side effects'],
            conditions: [{ name: 'Medication management', likelihood: 'Active' }],
          },
          ecg: {
            blurb: ['ECG shows normal sinus rhythm. No acute cardiac changes detected.'],
            findings: [
              { label: 'Rhythm', value: 'Normal sinus', status: 'normal' },
              { label: 'ST segments', value: 'No elevation/depression', status: 'normal' },
            ],
            recs: ['Continue current activity level', 'Annual cardiac check-up recommended'],
            conditions: [{ name: 'Normal cardiac function', likelihood: 'Confirmed' }],
          },
        };
        summaryData = typeDemos[record.type] ?? typeDemos.lab;
      }
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
    const data = summaryData as Prisma.ai_summariesUncheckedCreateInput;
    const saved = await prisma.ai_summaries.upsert({
      where:  { record_id: record_id as string },
      update: { ...data, model: isDemoMode ? 'demo-fallback' : SUMMARY_MODEL },
      create: { ...data, record_id: record_id as string, model: isDemoMode ? 'demo-fallback' : SUMMARY_MODEL },
    });

    // Log activity
    await prisma.activities.create({
      data: {
        user_id: req.user!.sub,
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

// ── GET /api/ai/summary/:record_id ─────────────────────────────────────────────
// Fetch a previously generated summary
router.get('/summary/:record_id', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const record = await prisma.records.findUnique({
      where: { id: req.params.record_id as string },
      include: { shared_access: { select: { doctor_id: true, status: true } }, ai_summaries: true },
    });

    if (!record?.ai_summaries) {
      res.status(404).json({ success: false, message: 'No summary found. Generate one first.' });
      return;
    }

    if (!canAccessRecord(req.user!, record)) {
      res.status(403).json({ success: false, message: 'Access denied.' });
      return;
    }

    res.json({ success: true, data: record.ai_summaries });
  } catch (err) {
    next(err);
  }
});

// ── GET /api/ai/activity ──────────────────────────────────────────────────────
// Returns activity log for the authenticated user
router.get('/activity', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const activities = await prisma.activities.findMany({
      where: { user_id: req.user!.sub },
      orderBy: { created_at: 'desc' },
      take: 50,
    });
    res.json({ success: true, data: activities });
  } catch (err) {
    next(err);
  }
});

export default router;
