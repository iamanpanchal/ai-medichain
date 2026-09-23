import 'dotenv/config';
import express from 'express';
import cors from 'cors';

import authRouter    from './routes/auth';
import recordsRouter from './routes/records';
import accessRouter  from './routes/access';
import aiRouter      from './routes/ai';
import { errorHandler, notFound } from './middleware/error';

const app  = express();
const PORT = parseInt(process.env.PORT ?? '5000', 10);

// ── Global middleware ─────────────────────────────────────────────────────────
const allowedOrigins = (process.env.CORS_ORIGINS ?? 'http://localhost:5173,http://localhost:4173').split(',');

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (Postman, curl, server-to-server)
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── API routes ────────────────────────────────────────────────────────────────
app.use('/api/auth',    authRouter);
app.use('/api/records', recordsRouter);
app.use('/api/access',  accessRouter);
app.use('/api/ai',      aiRouter);

// ── 404 + global error handler ────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ── Start ─────────────────────────────────────────────────────────────────────
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`\n🏥 MediChain API running on http://localhost:${PORT}`);
    console.log(`   NODE_ENV : ${process.env.NODE_ENV ?? 'development'}`);
    console.log(`   Database : ${process.env.DATABASE_URL ? '✅ configured' : '⚠️  DATABASE_URL not set'}`);
    console.log(`   Anthropic: ${process.env.ANTHROPIC_API_KEY ? '✅ configured' : '⚠️  ANTHROPIC_API_KEY not set'}`);
    console.log(`   Blockchain: ${process.env.CONTRACT_ADDRESS ? '✅ configured' : '⚠️  CONTRACT_ADDRESS not set'}\n`);
  });
}

export default app;
