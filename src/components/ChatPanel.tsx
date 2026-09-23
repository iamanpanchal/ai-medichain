import { useEffect, useRef, useState } from 'react';
import type { MedRecord } from '../data';
import { COPY } from '../content';
import { streamChat, type ChatMessage } from '../services/aiChat';
import { cn } from '../utils/cn';
import { I, useReducedMotion } from './ui';

type DisplayMessage = ChatMessage & { id: string };
const HISTORY_KEY = 'medichain-ai-chat-v1';
const prompts = ['Explain my last blood test', 'What does Vitamin D deficiency mean?', 'What records do I have?'];

function loadHistory(key: string): DisplayMessage[] {
  try { return JSON.parse(sessionStorage.getItem(key) ?? '[]'); } catch { return []; }
}

export function ChatPanel({ records, focusedRecord, onClose, publicMode = false }: { records: MedRecord[]; focusedRecord?: MedRecord; onClose: () => void; publicMode?: boolean }) {
  const historyKey = publicMode ? `${HISTORY_KEY}-public` : HISTORY_KEY;
  const [messages, setMessages] = useState<DisplayMessage[]>(() => loadHistory(historyKey));
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => { sessionStorage.setItem(historyKey, JSON.stringify(messages)); }, [historyKey, messages]);
  useEffect(() => { window.setTimeout(() => inputRef.current?.focus(), 100); }, []);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'end' }); }, [messages, thinking, reducedMotion]);
  useEffect(() => { const closeOnEscape = (event: KeyboardEvent) => event.key === 'Escape' && onClose(); window.addEventListener('keydown', closeOnEscape); return () => window.removeEventListener('keydown', closeOnEscape); }, [onClose]);

  const send = async (value = input) => {
    const content = value.trim();
    if (!content || thinking) return;
    const user: DisplayMessage = { id: crypto.randomUUID(), role: 'user', content };
    const assistantId = crypto.randomUUID();
    setMessages(current => [...current, user, { id: assistantId, role: 'assistant', content: '' }]);
    setInput(''); setThinking(true);
    try {
      await streamChat([...messages, user].map(({ role, content: message }) => ({ role, content: message })), records, focusedRecord, (token) => {
        setMessages(current => current.map(message => message.id === assistantId ? { ...message, content: message.content + token } : message));
      }, publicMode ? 'public' : 'patient');
    } catch {
      setMessages(current => current.map(message => message.id === assistantId ? { ...message, content: 'I’m unable to connect right now. Please try again.' } : message));
    } finally { setThinking(false); }
  };
  const clear = () => { setMessages([]); sessionStorage.removeItem(historyKey); };

  return <section role="dialog" aria-modal="true" aria-label="MediChain AI Assistant" className="anim-pop fixed inset-0 z-[70] flex flex-col overflow-hidden bg-deep sm:inset-x-auto sm:bottom-24 sm:right-6 sm:top-auto sm:h-[min(620px,calc(100dvh-7rem))] sm:w-[min(410px,calc(100vw-2rem))] sm:rounded-2xl sm:border sm:border-pulse/35 sm:shadow-[0_28px_90px_-28px_rgba(0,0,0,0.85)]">
    <header className="flex shrink-0 items-center gap-3 border-b border-linesoft bg-deep2/90 px-4 py-3.5"><span className="grid h-9 w-9 place-items-center rounded-xl bg-pulse/15 text-cy"><I n="sparkles" className="h-4.5 w-4.5" /></span><div><h2 className="font-display text-sm font-bold text-snow">MediChain AI Assistant</h2><p className="text-[11px] text-mist">Health record guidance</p></div><div className="ml-auto flex gap-1"><button onClick={clear} className="rounded-md px-2 py-1.5 text-[11px] font-bold text-mist hover:bg-raise hover:text-snow">New Chat</button><button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-lg text-mist hover:bg-raise hover:text-snow" aria-label="Close MediChain AI Assistant"><I n="x" className="h-4 w-4" /></button></div></header>
    <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4" aria-live="polite">
      {messages.length === 0 && <div className="rounded-xl border border-cy/20 bg-cy/5 p-3.5"><p className="font-display text-sm font-bold text-snow">{publicMode ? 'Welcome to MediChain' : 'Hi Aman'}</p><p className="mt-1.5 text-[13px] leading-relaxed text-mist">{publicMode ? 'I can help with login, sign in, and sign up. How can I help?' : 'I can help you understand your health records. What would you like to know?'}</p>{focusedRecord && <p className="mt-2 text-[11px] font-bold text-pulse2">Record context: {focusedRecord.title}</p>}</div>}
      {messages.map(message => <div key={message.id} className={cn('flex gap-2.5', message.role === 'user' ? 'justify-end' : 'justify-start')}><div className={cn('max-w-[84%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed', message.role === 'user' ? 'rounded-br-md bg-pulse text-white' : 'rounded-bl-md border border-linesoft bg-ink/75 text-snow')}>{message.content || (thinking && <span className="text-mist">AI is thinking<span className="anim-blink">...</span></span>)}</div></div>)}
      <div ref={endRef} />
    </div>
    <div className="shrink-0 border-t border-linesoft bg-deep2/65 p-3"><div className="mb-2 flex gap-2 overflow-x-auto pb-1">{messages.length === 0 && (publicMode ? ['How do I sign in?', 'How do I create an account?'] : prompts).map(prompt => <button key={prompt} onClick={() => send(prompt)} className="shrink-0 rounded-full border border-line bg-ink/55 px-2.5 py-1.5 text-[10px] font-bold text-mist hover:border-pulse/50 hover:text-snow">{prompt}</button>)}</div><div className="flex items-end gap-2"><label className="sr-only" htmlFor="medichain-chat-input">Ask MediChain AI Assistant</label><textarea id="medichain-chat-input" ref={inputRef} value={input} onChange={event => setInput(event.target.value)} onKeyDown={event => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); void send(); } }} rows={1} placeholder={publicMode ? 'Ask about signing in...' : 'Ask about your records...'} className="field min-h-10 max-h-24 resize-none py-2.5 text-[13px]" /><button onClick={() => void send()} disabled={!input.trim() || thinking} className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-pulse text-white disabled:opacity-45" aria-label="Send message"><I n="send" className="h-4 w-4" /></button></div>{!publicMode && <p className="mt-2 text-center text-[9px] leading-snug text-amber">{COPY.aiDisclaimer}</p>}</div>
  </section>;
}
