# MediChain — Developer Guide

Secure healthcare record management with on-chain integrity verification and
AI-assisted plain-language summaries.

## Architecture

```
ai-medichain/
├── src/          React frontend (Vite + TypeScript + Tailwind)
├── server/       Node.js / Express backend (Prisma + PostgreSQL)
├── ai/           Python FastAPI AI microservice
├── api/          Standalone serverless AI proxy (optional)
└── .env.example  Root environment template
```

### Request flow

```
React (Vite :5173)
   │  Bearer JWT
   ▼
Express API (:5000) ────► PostgreSQL (Prisma)
   │                              metadata only
   ├───► Ethereum / Hardhat   record SHA-256 hash anchoring
   ├───► Anthropic API        chat streaming + summaries
   └───► Python FastAPI (:8000)  optional summarisation
```

Only the **hash** of a medical record is written on-chain. Record contents never
leave PostgreSQL, so integrity is provable without exposing PHI.

## Quick Start

### 1. Prerequisites

- Node.js ≥ 20
- PostgreSQL ≥ 15
- Python ≥ 3.11 (for the optional AI service)
- (Optional) Hardhat or Ganache for a local Ethereum node

### 2. Environment Setup

```bash
# Root .env (for the Vite frontend)
cp .env.example .env

# Backend .env
cp .env.example server/.env
# Then edit server/.env and fill in DATABASE_URL, JWT_SECRET, ANTHROPIC_API_KEY
```

`ANTHROPIC_API_KEY` is server-side only — never expose it as a `VITE_*` variable.

### 3. Backend Setup

```bash
cd server
npm install

# Generate Prisma client
npx prisma generate

# Create database tables
npx prisma db push      # development (no migration files)
# or
npx prisma migrate dev  # generates migration files

# Seed with demo data
npm run db:seed
```

### 4. Start the Backend

```bash
cd server
npm run dev
# → http://localhost:5000
```

### 5. Python AI Microservice (optional)

The backend falls back to calling Anthropic inline when `AI_SERVICE_URL` is unset
or empty. Leave it blank to skip this step entirely.

```bash
cd ai
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS/Linux

pip install -r requirements.txt
cp ../.env.example .env      # then set ANTHROPIC_API_KEY

uvicorn main:app --port 8000 --reload
# → http://localhost:8000
```

### 6. Start the Frontend

```bash
# From project root
npm run dev
# → http://localhost:5173
```

---

## API Reference

All protected endpoints require an `Authorization: Bearer <token>` header.
Responses use a uniform envelope: `{ success: true, data }` or
`{ success: false, message }`.

### Auth

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login → returns `{ token, user }` |
| GET  | `/api/auth/me` | Get current user (Bearer token) |

### Records

| Method | Path | Description |
|--------|------|-------------|
| GET  | `/api/records` | List records visible to the caller |
| POST | `/api/records` | Upload a new record (anchors on-chain) |
| GET  | `/api/records/:id` | Get record + AI summary |
| GET  | `/api/records/:id/verify` | Verify hash against blockchain |

Patients see only their own records. Doctors and hospitals see only records that
have been explicitly shared with them via an approved access request.

### Access Requests

| Method | Path | Description |
|--------|------|-------------|
| GET  | `/api/access` | List requests (by role) |
| POST | `/api/access/request` | Doctor sends request |
| PATCH | `/api/access/:id` | Patient approves/rejects |
| DELETE | `/api/access/:id` | Doctor withdraws |

Approving a request creates a `SharedAccess` grant; rejecting or withdrawing one
removes any grant it created. Grants are what authorise record reads.

### AI

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/ai/chat` | Secure streaming chat proxy |
| POST | `/api/ai/summarize/:id` | Generate/refresh AI summary |
| GET  | `/api/ai/summary/:id` | Fetch stored summary |
| GET  | `/api/ai/activity` | Get activity log |

The system prompt is owned by the server. Clients send only message history and
a mode selector; record context is loaded server-side and delimited as
untrusted data, so a client cannot override the assistant's safety rules.

---

## Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Patient | `aman@medichain.io` | `patient123` |
| Doctor | `sarah@medichain.io` | `doctor123` |
| Hospital | `cityhospital@medichain.io` | `hospital123` |

---

## Blockchain (Local Hardhat)

The contract lives at `server/src/blockchain/MediChain.sol`.

```bash
npx hardhat node          # starts local JSON-RPC on :8545
npx hardhat compile       # compile MediChain.sol
npx hardhat run scripts/deploy.js --network localhost
# Copy the printed contract address into server/.env → CONTRACT_ADDRESS
# Set WALLET_PRIVATE_KEY to the deployer's private key (it must be the
# contract owner, since anchorRecord/updateRecord are onlyOwner).
```

If the chain is unreachable, uploads still succeed and `/verify` reports
`verified: false` rather than failing the request.

---

## Scripts

| Location | Command | Purpose |
|----------|---------|---------|
| root | `npm run dev` | Vite dev server |
| root | `npm run typecheck` | `tsc --noEmit` |
| server | `npm run dev` | Nodemon + ts-node API |
| server | `npm test` | Jest + Supertest |
| server | `npm run typecheck` | `tsc --noEmit` |
| server | `npm run db:seed` | Seed demo data |
