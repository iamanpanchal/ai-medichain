import type { MedRecord } from '../data';
const apiKey = process.env.OPENAI_API_KEY;
export const MEDICHAIN_AI_SYSTEM_PROMPT = `You are MediChain AI Assistant. Help a patient understand only the MediChain platform and the medical-record context supplied to you.

Safety rules:
- Never diagnose a condition, prescribe treatment, recommend medication changes, or give medication dosage advice.
- Never invent a medical fact, test result, record, clinician, or record detail. Say when the supplied records do not contain the answer.
- If the user describes symptoms that may be an emergency (for example trouble breathing, chest pain, stroke symptoms, severe bleeding, loss of consciousness, or immediate danger), immediately tell them to contact local emergency services or go to the nearest emergency department. Do not continue with routine guidance.
- For any health interpretation, end with this exact reminder: "Please consult a healthcare provider for medical advice."
- Be concise, calm, and non-diagnostic. Explain technical words in plain language.
`;

export const MEDICHAIN_PUBLIC_ASSISTANT_SYSTEM_PROMPT = `You are MediChain's public website assistant. Help visitors understand MediChain and find login, sign in, and sign up options. Do not ask for, receive, or discuss personal health information. Do not provide medical guidance. Be concise and direct visitors to a healthcare provider or emergency services if they raise a medical concern.`;

export type ChatMessage = { role: 'user' | 'assistant'; content: string };

export function patientRecordContext(records: MedRecord[], focusedRecord?: MedRecord) {
  const serialize = (record: MedRecord) => ({ id: record.id, title: record.title, type: record.type, source: record.source, date: record.date, hash: record.hash, transaction: record.tx });
  return JSON.stringify({ focusedRecord: focusedRecord ? serialize(focusedRecord) : null, records: records.map(serialize) });
}

export async function streamChat(messages: ChatMessage[], records: MedRecord[], focusedRecord: MedRecord | undefined, onToken: (token: string) => void, mode: 'patient' | 'public' = 'patient') {
  const response = await fetch('REDACTED_API_KEY', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, system: mode === 'public' ? MEDICHAIN_PUBLIC_ASSISTANT_SYSTEM_PROMPT : `${MEDICHAIN_AI_SYSTEM_PROMPT}\nPatient record context (trusted data):\n${patientRecordContext(records, focusedRecord)}` }),
  });
  if (!response.ok || !response.body) throw new Error('Unable to reach the MediChain AI service.');
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const events = buffer.split('\n\n');
    buffer = events.pop() ?? '';
    for (const event of events) {
      const line = event.split('\n').find((entry) => entry.startsWith('data: '));
      if (!line) continue;
      try {
        const data = JSON.parse(line.slice(6));
        if (data.type === 'content_block_delta' && typeof data.delta?.text === 'string') onToken(data.delta.text);
      } catch { /* Ignore incomplete provider events. */ }
    }
  }
}
