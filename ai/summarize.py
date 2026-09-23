"""
Summarisation logic for MediChain AI service.

Uses the Anthropic SDK to generate structured AISummaryData matching
the TypeScript interface used by the React frontend.
"""
from __future__ import annotations

import json
from typing import Literal
import anthropic
from pydantic import BaseModel


# ── Input / Output models (match frontend TypeScript types exactly) ─────────────

class RecordInput(BaseModel):
    id:     str
    title:  str
    type:   Literal["lab", "xray", "mri", "rx", "ecg"]
    source: str
    date:   str
    region: str | None = None
    hash:   str | None = None


class Finding(BaseModel):
    label:  str
    value:  str
    status: Literal["normal", "low", "high", "warn"]


class Condition(BaseModel):
    name:       str
    likelihood: str  # "Likely" | "Possible" | "Confirmed" | "Active"


class AISummaryData(BaseModel):
    blurb:      list[str]
    findings:   list[Finding]
    recs:       list[str]
    conditions: list[Condition]


# ── Prompt builder ────────────────────────────────────────────────────────────

TYPE_LABELS = {
    "lab":  "laboratory blood/urine test report",
    "xray": "X-Ray or CT scan imaging report",
    "mri":  "MRI scan report",
    "rx":   "prescription or medication list",
    "ecg":  "ECG / vitals / blood pressure log",
}

SYSTEM_PROMPT = """\
You are a medical AI assistant integrated into MediChain, a patient-facing health record platform.
Your job is to translate a medical record into plain, jargon-free language that a non-medical adult can understand.

Rules:
- Never diagnose, prescribe, or recommend medication changes.
- Always recommend consulting a healthcare provider for decisions.
- Be concise, accurate, and empathetic.
- Respond ONLY with a JSON object — no markdown, no commentary.
"""

def build_prompt(record: RecordInput) -> str:
    record_type_label = TYPE_LABELS.get(record.type, record.type)
    return f"""\
Summarise the following medical record for a patient in plain language.

Record:
  ID:     {record.id}
  Title:  {record.title}
  Type:   {record_type_label}
  Source: {record.source}
  Date:   {record.date}

Return ONLY a JSON object with this exact structure (no markdown, no extra keys):
{{
  "blurb": ["<1–2 sentence plain-language summary>"],
  "findings": [
    {{ "label": "<test/measurement name>", "value": "<result with unit>", "status": "<normal|low|high|warn>" }}
  ],
  "recs": ["<recommendation 1>", "<recommendation 2>"],
  "conditions": [
    {{ "name": "<condition name>", "likelihood": "<Likely|Possible|Confirmed|Active>" }}
  ]
}}

If the record type does not contain specific numeric findings (e.g. a prescription), adapt the findings array to list medications or observations instead.
"""


# ── Main function ────────────────────────────────────────────────────────────

async def summarize_record(record: RecordInput, api_key: str) -> AISummaryData:
    """
    Calls the Anthropic API and returns a structured AISummaryData.
    Raises on API or parsing errors.
    """
    client = anthropic.Anthropic(api_key=api_key)

    message = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=900,
        system=SYSTEM_PROMPT,
        messages=[{"role": "user", "content": build_prompt(record)}],
    )

    raw = message.content[0].text if message.content and message.content[0].type == "text" else "{}"

    # Strip accidental markdown fences if the model wraps output
    raw = raw.strip()
    if raw.startswith("```"):
        raw = raw.split("\n", 1)[1].rsplit("```", 1)[0].strip()

    parsed = json.loads(raw)
    return AISummaryData(**parsed)
