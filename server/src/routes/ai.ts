import { Router, Request, Response, NextFunction } from 'express';
import Anthropic from '@anthropic-ai/sdk';
import { z } from 'zod';
import prisma from '../db/client';
import { requireAuth } from '../middleware/auth';

const router = Router();

const SYSTEM_PATIENT = `You are MediChain AI Assistant. Help a patient understand only the MediChain platform and the medical-record context supplied to you.

Safety rules:
- Never diagnose a condition, prescribe treatment, recommend medication changes, or give medication dosage advice.
- Never invent a medical fact, test result, record, clinician, or record detail. Say when the supplied records do not contain the answer.
- If the user describes symptoms that may be an emergency (for example trouble breathing, chest pain, stroke symptoms, severe bleeding, loss of consciousness, or immediate danger), immediately tell them to contact local emergency services or go to the nearest emergency department. Do not continue with routine guidance.
- For any health interpretation, end with this exact reminder: "Please consult a healthcare provider for medical advice."
- Be concise, calm, and non-diagnostic. Explain technical words in plain language.`;

const SYSTEM_PUBLIC = `You are MediChain's public website assistant. Help visitors understand MediChain and find login, sign in, and sign up options. Do not ask for, receive, or discuss personal health information. Do not provide medical guidance. Be concise and direct visitors to a healthcare provider or emergency services if they raise a medical concern.`;

// ── POST /api/ai/chat ─────────────────────────────────────────────────────────
// Secure proxy to Anthropic — API key never reaches the browser
const ChatSchema = z.object({
  messages: z.array(z.object({ role: z.enum(['user', 'assistant']), content: z.string() })),
  system:   z.string().optional(),
  mode:     z.enum(['patient', 'public']).default('patient'),
});

router.post('/chat', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = ChatSchema.parse(req.body);
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      res.status(503).json({ success: false, message: 'AI service not configured.' });
      return;
    }

    const client = new Anthropic({ apiKey });

    // Use the system the frontend sends (it already embeds the record context)
    // or fall back to the mode-appropriate system prompt
    const systemPrompt = body.system ?? (body.mode === 'public' ? SYSTEM_PUBLIC : SYSTEM_PATIENT);

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const stream = await client.messages.stream({
      model:      'claude-sonnet-4-6',
      max_tokens: 700,
      system:     systemPrompt,
      messages:   body.messages as Anthropic.MessageParam[],
    });

    for await (const event of stream) {
      res.write(`data: ${JSON.stringify(event)}\n\n`);
    }

    res.end();
  } catch (err) {
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

    const record = await prisma.medRecord.findUnique({ where: { id: recordId as string } });
    if (!record) {
      res.status(404).json({ success: false, message: 'Record not found.' });
      return;
    }

    // Only the patient who owns the record can generate a summary
    if (req.user!.role === 'patient' && record.patientId !== req.user!.sub) {
      res.status(403).json({ success: false, message: 'Access denied.' });
      return;
    }

    const aiServiceUrl = process.env.AI_SERVICE_URL;
    let summaryData: unknown;

    if (aiServiceUrl) {
      // Delegate to the Python FastAPI microservice
      const aiRes = await fetch(`${aiServiceUrl}/summarize`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ record }),
      });
      if (!aiRes.ok) throw new Error('AI microservice returned an error.');
      summaryData = (await aiRes.json() as { data: unknown }).data;
    } else {
      // Inline fallback via Anthropic SDK directly
      const client = new Anthropic({ apiKey });
      const prompt = `You are a medical AI summarising a record for a patient in plain language.

Record details:
- ID: ${record.id}
- Title: ${record.title}
- Type: ${record.type}
- Source: ${record.source}
- Date: ${record.date}

Return a JSON object with this exact shape:
{
  "blurb": ["short 1–2 sentence plain-language summary"],
  "findings": [{ "label": "...", "value": "...", "status": "normal|low|high|warn" }],
  "recs": ["recommendation 1", "recommendation 2"],
  "conditions": [{ "name": "...", "likelihood": "Likely|Possible|Confirmed|Active" }]
}

Only return valid JSON. Do not wrap in markdown.`;

      const msg = await client.messages.create({
        model:      'claude-sonnet-4-6',
        max_tokens: 800,
        messages:   [{ role: 'user', content: prompt }],
      });

      const raw = msg.content[0].type === 'text' ? msg.content[0].text : '{}';
      summaryData = JSON.parse(raw);
    }

    // Upsert the AI summary in the database
    const data = summaryData as any;
    const saved = await prisma.aiSummary.upsert({
      where:  { recordId: recordId as string },
      update: { ...data, model: 'claude-sonnet-4-6' },
      create: { recordId: recordId as string, ...data, model: 'claude-sonnet-4-6' },
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
    const summary = await prisma.aiSummary.findUnique({
      where: { recordId: req.params.recordId as string },
    });
    if (!summary) {
      res.status(404).json({ success: false, message: 'No summary found. Generate one first.' });
      return;
    }
    res.json({ success: true, data: summary });
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
