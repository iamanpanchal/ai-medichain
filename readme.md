<<<<<<< HEAD
<<<<<<< HEAD
** ai-medichain
If you choose PostgreSQL:

React.js
    ↓
Node.js + Express
    ↓
Prisma ORM
    ↓
PostgreSQL

Blockchain remains separate:

Node.js
    ↓
Ethers.js
    ↓
Solidity Smart Contract
    ↓
Ethereum / Hardhat

And your medical-file flow:

Medical File
     ↓
Secure File Storage
     ↓
PostgreSQL → metadata + file reference
     ↓
Hash
     ↓
Blockchain → verification
=======
** ai-medichain
>>>>>>> 2e33143 (add chatbot)
=======
# MediChain — Developer Guide

## Architecture

```
ai-medichain/
├── src/          React frontend (Vite + TypeScript)
├── server/       Node.js / Express backend
├── ai/           Python FastAPI AI microservice
└── .env.example  Root environment template
```

## Quick Start

### 1. Prerequisites
- Node.js ≥ 20
- PostgreSQL ≥ 15
- Python ≥ 3.11 (for AI service)
- (Optional) Hardhat or Ganache for local Ethereum

### 2. Environment Setup

```bash
# Root .env (for the Vite frontend)
cp .env.example .env

# Backend .env
cp .env.example server/.env
# Then edit server/.env and fill in DATABASE_URL, JWT_SECRET, ANTHROPIC_API_KEY
```

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

### 5. Python AI Microservice (optional — backend has inline fallback)

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

### Auth
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login → returns `{ token, user }` |
| GET  | `/api/auth/me` | Get current user (Bearer token) |

### Records
| Method | Path | Description |
|--------|------|-------------|
| GET  | `/api/records` | List patient's records |
| POST | `/api/records` | Upload a new record (anchors on-chain) |
| GET  | `/api/records/:id` | Get record + AI summary |
| GET  | `/api/records/:id/verify` | Verify hash against blockchain |

### Access Requests
| Method | Path | Description |
|--------|------|-------------|
| GET  | `/api/access` | List requests (by role) |
| POST | `/api/access/request` | Doctor sends request |
| PATCH | `/api/access/:id` | Patient approves/rejects |
| DELETE | `/api/access/:id` | Doctor withdraws |

### AI
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/ai/chat` | Secure streaming chat proxy |
| POST | `/api/ai/summarize/:id` | Generate/refresh AI summary |
| GET  | `/api/ai/summary/:id` | Fetch stored summary |
| GET  | `/api/ai/activity` | Get activity log |

---

## Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Patient | `aman@medichain.io` | `patient123` |
| Doctor | `sarah@medichain.io` | `doctor123` |
| Hospital | `cityhospital@medichain.io` | `hospital123` |

---

## Blockchain (Local Hardhat)

```bash
# Install Hardhat globally or per-project
npx hardhat node          # starts local JSON-RPC on :8545
npx hardhat compile       # compile MediChain.sol
npx hardhat run scripts/deploy.js --network localhost
# Copy the printed contract address into server/.env → CONTRACT_ADDRESS
```
>>>>>>> cf90090 (Add root and ai files)
