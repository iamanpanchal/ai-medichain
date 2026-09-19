import { useEffect, useRef, useState } from 'react';
import { type AccessReq, type MedRecord, type Role } from '../data';
import { type AssistantAction, processAssistantMessage } from '../utils/aiAssistant';
import { cn } from '../utils/cn';
import { I, useReducedMotion } from './ui';

type Message = {
  id: number;
  sender: 'user' | 'assistant';
  text: string;
  time: Date;
  actions?: AssistantAction[];
};

const patientQuickActions = {
  dashboard: ['Summarize my latest report', 'Show my recent records'],
  records: ['Explain this record', 'Summarize my latest report'],
  ai: ['Explain my latest AI summary', 'Show key findings'],
  access: ['Explain pending requests', 'Who has access to my records?'],
  passport: ['Explain my health passport', 'What records do I have?'],
};

const defaultQuickActions = ['Summarize my latest report', 'Show my recent records', 'Explain my latest AI summary', 'Open Health Passport', 'Show access requests', 'What records do I have?'];

function formatTime(time: Date) {
  return time.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

export function AIAssistant({ role, page, records, pendingAccess, approvedAccess, onNavigate, onOpenRecord, onOpenSummary }: {
  role: Role;
  page: string;
  records: MedRecord[];
  pendingAccess: AccessReq[];
  approvedAccess: AccessReq[];
  onNavigate: (page: string) => void;
  onOpenRecord: (record: MedRecord) => void;
  onOpenSummary: (record: MedRecord) => void;
}) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [thinking, setThinking] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const timerRef = useRef<number | null>(null);
  const reducedMotion = useReducedMotion();
  const isPatient = role === 'patient';
  const quickActions = isPatient ? patientQuickActions[page as keyof typeof patientQuickActions] ?? defaultQuickActions : ['Search patient records', 'Show activity', 'Open settings'];
  const visibleQuickActions = messages.length === 0 && isPatient ? defaultQuickActions : quickActions;

  useEffect(() => {
    if (open) window.setTimeout(() => inputRef.current?.focus(), 120);
  }, [open]);
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'end' });
  }, [messages, thinking, reducedMotion]);
  useEffect(() => () => { if (timerRef.current) window.clearTimeout(timerRef.current); }, []);
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape' && open) setOpen(false); };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open]);

  const executeAction = (action: AssistantAction) => {
    if (action.type === 'navigate') onNavigate(action.page);
    if (action.type === 'record') {
      const record = records.find((item) => item.id === action.recordId);
      if (record) onOpenRecord(record);
    }
    if (action.type === 'summary') {
      const record = records.find((item) => item.id === action.recordId);
      if (record) onOpenSummary(record);
    }
  };

  const send = (value = input) => {
    const text = value.trim();
    if (!text || thinking) return;
    setMessages((current) => [...current, { id: Date.now(), sender: 'user', text, time: new Date() }]);
    setInput('');
    setThinking(true);
    const context = { role, page, records, pendingAccess, approvedAccess };
    timerRef.current = window.setTimeout(() => {
      const response = processAssistantMessage(text, context);
      setMessages((current) => [...current, { id: Date.now() + 1, sender: 'assistant', text: response.text, time: new Date(), actions: response.actions }]);
      setThinking(false);
      timerRef.current = null;
    }, reducedMotion ? 0 : 480);
  };

  const clear = () => {
    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = null;
    setThinking(false);
    setMessages([]);
  };

  return (
    <>
      {open && (
        <section className="anim-pop fixed inset-x-3 bottom-3 top-16 z-[70] flex max-h-[calc(100dvh-4.75rem)] flex-col overflow-hidden rounded-2xl border border-pulse/35 bg-deep shadow-[0_28px_90px_-28px_rgba(0,0,0,0.85)] sm:inset-x-auto sm:bottom-24 sm:right-6 sm:top-auto sm:h-[min(620px,calc(100dvh-7rem))] sm:w-[min(410px,calc(100vw-2rem))]">
          <header className="flex shrink-0 items-center gap-3 border-b border-linesoft bg-deep2/90 px-4 py-3.5">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-pulse/15 text-cy shadow-[0_0_22px_-6px_rgba(34,211,238,0.9)]"><I n="sparkles" className="h-4.5 w-4.5" /></span>
            <div className="min-w-0">
              <h2 className="font-display text-sm font-bold text-snow">MediChain AI</h2>
              <p className="truncate text-[11px] text-mist">Your intelligent health record assistant</p>
            </div>
            <div className="ml-auto flex items-center gap-1">
              <button type="button" onClick={clear} className="rounded-md px-2 py-1.5 text-[11px] font-bold text-mist transition-colors hover:bg-raise hover:text-snow" aria-label="Clear chat">Clear</button>
              <button type="button" onClick={() => setOpen(false)} className="grid h-8 w-8 place-items-center rounded-lg text-mist transition-colors hover:bg-raise hover:text-snow" aria-label="Close MediChain AI"><I n="x" className="h-4 w-4" /></button>
            </div>
          </header>

          <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4" aria-live="polite">
            {messages.length === 0 && (
              <div className="anim-pop rounded-xl border border-cy/20 bg-cy/5 p-3.5">
                <p className="font-display text-sm font-bold text-snow">Hi Aman <span aria-hidden>👋</span></p>
                <p className="mt-1.5 text-[13px] leading-relaxed text-mist">I’m MediChain AI. I can help you understand and navigate your health records.</p>
              </div>
            )}
            {messages.map((message) => (
              <div key={message.id} className={cn('anim-pop flex gap-2.5', message.sender === 'user' ? 'justify-end' : 'justify-start')}>
                {message.sender === 'assistant' && <span className="mt-1 grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-cy/10 text-cy"><I n="sparkles" className="h-3.5 w-3.5" /></span>}
                <div className={cn('max-w-[84%] rounded-2xl px-3.5 py-2.5', message.sender === 'user' ? 'rounded-br-md bg-pulse text-white' : 'rounded-bl-md border border-linesoft bg-ink/75 text-snow')}>
                  <p className="whitespace-pre-line text-[13px] leading-relaxed">{message.text}</p>
                  <p className={cn('mt-1.5 text-[10px]', message.sender === 'user' ? 'text-white/65' : 'text-dim')}>{formatTime(message.time)}</p>
                  {message.actions && <div className="mt-3 flex flex-wrap gap-2">{message.actions.map((action) => <button key={`${action.type}-${action.label}`} type="button" onClick={() => executeAction(action)} className="rounded-lg border border-pulse/35 bg-pulse/10 px-2.5 py-1.5 text-[11px] font-bold text-pulse2 transition-colors hover:bg-pulse/20">{action.label}</button>)}</div>}
                </div>
              </div>
            ))}
            {thinking && <div className="flex items-center gap-2.5"><span className="grid h-7 w-7 place-items-center rounded-lg bg-cy/10 text-cy"><I n="sparkles" className="h-3.5 w-3.5" /></span><div className="rounded-2xl rounded-bl-md border border-linesoft bg-ink/75 px-3.5 py-2.5 text-xs text-mist">AI is thinking<span className="anim-blink">...</span></div></div>}
            <div ref={endRef} />
          </div>

          <div className="shrink-0 border-t border-linesoft bg-deep2/65 p-3">
            <div className="mb-2 flex gap-2 overflow-x-auto pb-1">{visibleQuickActions.map((action) => <button key={action} type="button" onClick={() => send(action)} disabled={thinking} className="shrink-0 rounded-full border border-line bg-ink/55 px-2.5 py-1.5 text-[10px] font-bold text-mist transition-colors hover:border-pulse/50 hover:text-snow disabled:opacity-50">{action}</button>)}</div>
            <div className="flex items-end gap-2">
              <label className="sr-only" htmlFor="medichain-ai-input">Ask MediChain AI</label>
              <textarea id="medichain-ai-input" ref={inputRef} value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); send(); } }} rows={1} placeholder="Ask about your records..." className="field min-h-10 max-h-24 resize-none py-2.5 text-[13px]" />
              <button type="button" onClick={() => send()} disabled={!input.trim() || thinking} className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-pulse text-white transition-colors hover:bg-pulse2 disabled:cursor-not-allowed disabled:opacity-45" aria-label="Send message"><I n="send" className="h-4 w-4" /></button>
            </div>
            <p className="mt-2 text-center text-[9px] leading-snug text-dim">AI-generated information is for educational purposes and does not replace professional medical advice.</p>
          </div>
        </section>
      )}
      {!open && <button type="button" onClick={() => setOpen(true)} className="assistant-fab fixed bottom-5 right-5 z-[60] grid h-13 w-13 place-items-center rounded-2xl bg-pulse text-white shadow-[0_16px_42px_-12px_rgba(46,124,246,0.95)] transition-transform hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-cy sm:bottom-6 sm:right-6" aria-label="Ask MediChain AI" title="Ask MediChain AI"><I n="sparkles" className="h-5.5 w-5.5" /></button>}
    </>
  );
}
