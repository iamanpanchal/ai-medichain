import { I } from './ui';

export function ChatWidget({ onOpen }: { onOpen: () => void }) {
  return <button type="button" onClick={onOpen} className="assistant-fab fixed bottom-20 right-5 z-[60] grid h-13 w-13 place-items-center rounded-2xl bg-pulse text-white shadow-[0_16px_42px_-12px_rgba(46,124,246,0.95)] transition-transform hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-cy md:bottom-6 md:right-6" aria-label="Open MediChain AI Assistant" title="MediChain AI Assistant"><I n="sparkles" className="h-5.5 w-5.5" /></button>;
}
