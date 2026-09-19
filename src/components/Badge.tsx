import type { ReactNode } from 'react';
import { cn } from '../utils/cn';

export function Badge({ children, tone = 'blue' }: { children: ReactNode; tone?: 'blue' | 'green' | 'purple' | 'neutral' }) {
  const tones = { blue: 'border-pulse/40 bg-pulse/15 text-pulse2', green: 'border-mint/40 bg-mint/15 text-mint', purple: 'border-grape/40 bg-grape/15 text-grape', neutral: 'border-line bg-deep text-mist' };
  return <span className={cn('inline-flex rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide', tones[tone])}>{children}</span>;
}
