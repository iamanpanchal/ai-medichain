import type { ReactNode } from 'react';

/** Shared sticky top navigation surface. Content is supplied by each role shell. */
export function TopNav({ children }: { children: ReactNode }) {
  return <header className="sticky top-0 z-30 border-b border-linesoft bg-ink/85 backdrop-blur-xl">{children}</header>;
}
