import type { ButtonHTMLAttributes } from 'react';
import { cn } from '../utils/cn';

type Variant = 'primary' | 'secondary' | 'destructive';
export function Button({ variant = 'primary', className, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  const styles: Record<Variant, string> = {
    primary: 'bg-pulse text-white hover:bg-pulse2',
    secondary: 'border border-line bg-deep/60 text-snow hover:border-pulse2/70',
    destructive: 'bg-coral text-white hover:bg-coral/85',
  };
  return <button className={cn('inline-flex min-h-10 items-center justify-center rounded-lg px-4 text-sm font-bold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pulse2 disabled:pointer-events-none disabled:opacity-50', styles[variant], className)} {...props} />;
}
