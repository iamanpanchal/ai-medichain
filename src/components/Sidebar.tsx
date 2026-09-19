import type { ReactNode } from 'react';

/** Shared desktop navigation container; hidden below md by the application shell. */
export function Sidebar({ children }: { children: ReactNode }) {
  return <aside className="flex h-full w-[236px] flex-col border-r border-linesoft bg-deep/40" aria-label="Primary navigation">{children}</aside>;
}
