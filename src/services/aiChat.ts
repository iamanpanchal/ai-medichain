import { authHeaders } from './auth';

export type ChatMessage = { role: 'user' | 'assistant'; content: string };

/**
 * Streams an assistant reply.
 *
 * The server owns the system prompt — it loads the caller's authorised records
 * and injects them as untrusted data. Sending a system prompt from here would
 * let any client strip the assistant's safety rules, so this only sends message
 * history, the mode, and an optional record selector.
 */
export async function streamChat(
  messages: ChatMessage[],
  onToken: (token: string) => void,
  mode: 'patient' | 'public' = 'patient',
  focusedRecordId?: string
) {
  const apiBase = (import.meta.env.VITE_API_URL as string | undefined) ?? 'http://localhost:5000';

  const response = await fetch(`${apiBase}/api/ai/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(mode === 'patient' ? authHeaders() : {}),
    },
    body: JSON.stringify({
      messages,
      mode,
      ...(focusedRecordId ? { focusedRecordId } : {}),
    }),
  });

  if (response.status === 401) {
    throw new Error('Sign in to use the MediChain AI assistant.');
  }

  if (!response.ok || !response.body) {
    throw new Error('Unable to reach the MediChain AI service.');
  }

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
        if (data.type === 'content_block_delta' && typeof data.delta?.text === 'string') {
          onToken(data.delta.text);
        }
      } catch { /* Ignore incomplete provider events. */ }
    }
  }
}
