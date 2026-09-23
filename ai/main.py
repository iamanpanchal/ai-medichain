"""
MediChain AI Summarisation Microservice

Receives a medical record JSON object from the Node.js backend and returns
a structured AISummaryData object matching the frontend's TypeScript type.

Start with:
    uvicorn main:app --port 8000 --reload
"""
import os
import json
import logging
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from summarize import summarize_record, RecordInput, AISummaryData

load_dotenv()

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)

app = FastAPI(
    title="MediChain AI Service",
    version="1.0.0",
    description="Medical record summarisation powered by Claude.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5000", "http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health():
    return {"status": "ok", "service": "medichain-ai"}


@app.post("/summarize", response_model=dict)
async def summarize(record: RecordInput):
    """
    Accepts a medical record and returns a plain-language AI summary.

    Expected body:
    {
      "record": {
        "id": "MR-1024",
        "title": "Blood Test Report",
        "type": "lab",
        "source": "City Hospital",
        "date": "12 Sep 2024"
      }
    }
    """
    api_key = os.getenv("ANTHROPIC_API_KEY")
    if not api_key:
        raise HTTPException(status_code=503, detail="ANTHROPIC_API_KEY not configured.")

    try:
        logger.info(f"Summarising record {record.id} ({record.title})")
        summary: AISummaryData = await summarize_record(record, api_key)
        logger.info(f"Summary generated for {record.id}")
        return {"success": True, "data": summary.model_dump()}
    except Exception as exc:
        logger.error(f"Summarisation failed for {record.id}: {exc}")
        raise HTTPException(status_code=500, detail=str(exc))
