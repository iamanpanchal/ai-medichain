// Standalone serverless AI chat (for example Vercel's /api convention).
//
// ANTHROPIC_API_KEY is read only by the server runtime — never expose it as
// VITE_*. The system prompt is owned here rather than taken from the request
// body, so a caller cannot strip the assistant's safety rules.
const PUBLIC_SYSTEM_PROMPT = `You are MediChain's public website assistant. Help visitors understand MediChain and find login, sign in, and sign up options. Do not ask for, receive, or discuss personal health information. Do not provide medical guidance. Be concise and direct visitors to a healthcare provider or emergency services if they raise a medical concern.`;

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== 'POST') return new Response(null, { status: 405 });
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return new Response('ANTHROPIC_API_KEY is not configured.', { status: 503 });

  const payload = await request.json();

  if (!Array.isArray(payload?.messages) || payload.messages.length === 0) {
    return new Response('messages are required.', { status: 400 });
  }

  const upstream = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 700,
      stream: true,
      system: PUBLIC_SYSTEM_PROMPT,
      messages: payload.messages,
    }),
  });

  return new Response(upstream.body, {
    status: upstream.status,
    headers: { 'content-type': upstream.headers.get('content-type') ?? 'text/event-stream', 'cache-control': 'no-cache' },
  });
}
