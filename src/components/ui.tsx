import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { cn } from '../utils/cn';

/* ================= ICONS ================= */
const P: Record<string, React.ReactNode> = {
  pulse: <path d="M22 12h-4l-3 9L9 3l-3 9H2" />,
  users: (
    <>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </>
  ),
  user: (
    <>
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </>
  ),
  hospital: (
    <>
      <path d="M4 21V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v16" />
      <path d="M2 21h20M12 7v6M9 10h6" />
    </>
  ),
  shield: <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 .65-.94l7-2.6a1 1 0 0 1 .7 0l7 2.6A1 1 0 0 1 20 6Z" />,
  'shield-check': (
    <>
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 .65-.94l7-2.6a1 1 0 0 1 .7 0l7 2.6A1 1 0 0 1 20 6Z" />
      <path d="m9 12 2 2 4-4" />
    </>
  ),
  lock: (
    <>
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </>
  ),
  sparkles: (
    <>
      <path d="M9.9 3.6c.2-.8 1.3-.8 1.5 0l.9 3a4 4 0 0 0 2.6 2.6l3 .9c.8.2.8 1.3 0 1.5l-3 .9a4 4 0 0 0-2.6 2.6l-.9 3c-.2.8-1.3.8-1.5 0l-.9-3a4 4 0 0 0-2.6-2.6l-3-.9c-.8-.2-.8-1.3 0-1.5l3-.9a4 4 0 0 0 2.6-2.6Z" />
      <path d="M19 3v4M21 5h-4" />
    </>
  ),
  qr: (
    <>
      <rect x="3" y="3" width="6" height="6" rx="1" />
      <rect x="15" y="3" width="6" height="6" rx="1" />
      <rect x="3" y="15" width="6" height="6" rx="1" />
      <path d="M15 15h2v2h-2zM19 15h2M21 19h-2v2M15 21h2" />
    </>
  ),
  file: (
    <>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
      <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
    </>
  ),
  flask: (
    <>
      <path d="M10 2v7.3a2 2 0 0 1-.2.9L4.7 18.6A2 2 0 0 0 6.4 21.5h11.2a2 2 0 0 0 1.7-2.9L14.2 10.2a2 2 0 0 1-.2-.9V2" />
      <path d="M8.5 2h7M7 15h10" />
    </>
  ),
  image: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="9" cy="9" r="2" />
      <path d="m21 15-3.1-3.1a2 2 0 0 0-2.8 0L6 21" />
    </>
  ),
  scan: (
    <>
      <path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  activity: <path d="M22 12h-4l-3 9L9 3l-3 9H2" />,
  upload: (
    <>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <path d="m17 8-5-5-5 5M12 3v12" />
    </>
  ),
  bell: (
    <>
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </>
  ),
  logout: (
    <>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="m16 17 5-5-5-5M21 12H9" />
    </>
  ),
  sliders: (
    <>
      <path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3" />
      <path d="M2 14h4M10 8h4M18 16h4" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  share: (
    <>
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </>
  ),
  chevdown: <path d="m6 9 6 6 6-6" />,
  chevright: <path d="m9 18 6-6-6-6" />,
  back: <path d="M19 12H5m7 7-7-7 7-7" />,
  check: <path d="M20 6 9 17l-5-5" />,
  x: <path d="M18 6 6 18M6 6l12 12" />,
  copy: (
    <>
      <rect x="9" y="9" width="13" height="13" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </>
  ),
  download: (
    <>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <path d="m7 10 5 5 5-5M12 15V3" />
    </>
  ),
  external: (
    <>
      <path d="M15 3h6v6M10 14 21 3" />
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    </>
  ),
  eye: (
    <>
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  heart: <path d="M19 14c1.5-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />,
  wind: <path d="M12.8 19.6A2 2 0 1 0 14 16H2M17.5 8a2.5 2.5 0 1 1 2 4H2M9.8 4.4A2 2 0 1 1 11 8H2" />,
  droplet: <path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7Z" />,
  joint: (
    <>
      <circle cx="7" cy="7" r="3.2" />
      <circle cx="17" cy="17" r="3.2" />
      <path d="M9.4 9.4l5.2 5.2" />
    </>
  ),
  grid: (
    <>
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
    </>
  ),
  calendar: (
    <>
      <rect x="3" y="4" width="18" height="17" rx="2" />
      <path d="M16 2v4M8 2v4M3 9.5h18" />
    </>
  ),
  alert: (
    <>
      <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
      <path d="M12 9v4M12 17h.01" />
    </>
  ),
  play: <path d="M6 4.5 20 12 6 19.5Z" />,
  arrow: <path d="M5 12h14m-7-7 7 7-7 7" />,
  filter: <path d="M22 3H2l8 9.5V19l4 2v-8.5Z" />,
  plus: <path d="M12 5v14M5 12h14" />,
  home: (
    <>
      <path d="m3 10.5 9-7.5 9 7.5" />
      <path d="M5 9.5V20a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V9.5" />
    </>
  ),
  send: (
    <>
      <path d="M22 2 11 13" />
      <path d="M22 2 15 22l-4-9-9-4Z" />
    </>
  ),
  link: (
    <>
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </>
  ),
  steth: (
    <>
      <path d="M4.5 3v6a5 5 0 0 0 10 0V3" />
      <path d="M9.5 14v2a5 5 0 0 0 10 0v-1.5" />
      <circle cx="19.5" cy="12" r="2.5" />
    </>
  ),
  brain: (
    <>
      <path d="M12 5a3 3 0 1 0-5.9.8A3 3 0 0 0 4 8.5a3 3 0 0 0 .6 5.9A3 3 0 0 0 8 20a3 3 0 0 0 4-2.8V5Z" />
      <path d="M12 5a3 3 0 1 1 5.9.8A3 3 0 0 1 20 8.5a3 3 0 0 1-.6 5.9A3 3 0 0 1 16 20a3 3 0 0 1-4-2.8" />
    </>
  ),
  battery: (
    <>
      <rect x="2" y="8" width="16" height="8" rx="2" />
      <path d="M20 10.5v3" />
    </>
  ),
};

export function I({ n, className, sw = 2 }: { n: string; className?: string; sw?: number }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" className={cn('h-5 w-5', className)} aria-hidden>
      {P[n] ?? P.pulse}
    </svg>
  );
}

export function Logo({ className, text = true }: { className?: string; text?: boolean }) {
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-pulse to-cy shadow-[0_0_24px_-4px_rgba(46,124,246,0.7)]">
        <I n="pulse" sw={2.4} className="h-5 w-5 text-white" />
      </span>
      {text && (
        <span className="font-display text-lg font-bold tracking-tight text-snow">
          Medi<span className="text-pulse2">Chain</span>
        </span>
      )}
    </span>
  );
}

/* ================= AVATAR ================= */
const HUES = [212, 262, 158, 24, 340, 190];
export function Avatar({ name, img, className }: { name: string; img?: string; className?: string }) {
  if (img)
    return <img src={img} alt={name} className={cn('h-10 w-10 shrink-0 rounded-full object-cover ring-2 ring-line', className)} />;
  const h = HUES[(name.charCodeAt(0) + name.length) % HUES.length];
  return (
    <span
      className={cn('grid h-10 w-10 shrink-0 place-items-center rounded-full font-display text-sm font-bold text-white ring-2 ring-line', className)}
      style={{ background: `linear-gradient(135deg, hsl(${h} 80% 45%), hsl(${(h + 40) % 360} 85% 55%))` }}
    >
      {name
        .split(' ')
        .map((p) => p[0])
        .slice(0, 2)
        .join('')}
    </span>
  );
}

/* ================= QR ================= */
function xmur3(str: string) {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return () => {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return (h ^= h >>> 16) >>> 0;
  };
}
function mulberry32(a: number) {
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function QR({ seed, className, cell = 6, dark = '#071a33', light = '#ffffff' }: { seed: string; className?: string; cell?: number; dark?: string; light?: string }) {
  const n = 25;
  const rand = mulberry32(xmur3(seed)());
  const inFinder = (r: number, c: number) => (r < 8 && c < 8) || (r < 8 && c >= n - 8) || (r >= n - 8 && c < 8);
  const inAlign = (r: number, c: number) => r >= 16 && r <= 20 && c >= 16 && c <= 20;
  const cells: React.ReactNode[] = [];
  for (let r = 0; r < n; r++)
    for (let c = 0; c < n; c++) {
      if (inFinder(r, c) || inAlign(r, c)) continue;
      if (r === 6 || c === 6) {
        if ((r + c) % 2 === 0) cells.push(<rect key={`${r}-${c}`} x={c * cell} y={r * cell} width={cell} height={cell} fill={dark} />);
        continue;
      }
      if (rand() < 0.46) cells.push(<rect key={`${r}-${c}`} x={c * cell} y={r * cell} width={cell} height={cell} fill={dark} />);
    }
  const finder = (x: number, y: number) => (
    <g key={`${x}-${y}`}>
      <rect x={x * cell} y={y * cell} width={7 * cell} height={7 * cell} fill={dark} />
      <rect x={(x + 1) * cell} y={(y + 1) * cell} width={5 * cell} height={5 * cell} fill={light} />
      <rect x={(x + 2) * cell} y={(y + 2) * cell} width={3 * cell} height={3 * cell} fill={dark} />
    </g>
  );
  const size = n * cell;
  return (
    <svg viewBox={`0 0 ${size} ${size}`} className={className} shapeRendering="crispEdges" aria-label="QR code">
      <rect width={size} height={size} fill={light} />
      {cells}
      {finder(0, 0)}
      {finder(n - 7, 0)}
      {finder(0, n - 7)}
      <g>
        <rect x={16 * cell} y={16 * cell} width={5 * cell} height={5 * cell} fill={dark} />
        <rect x={17 * cell} y={17 * cell} width={3 * cell} height={3 * cell} fill={light} />
        <rect x={18 * cell} y={18 * cell} width={cell} height={cell} fill={dark} />
      </g>
    </svg>
  );
}

/* ================= BODY MAP ================= */
export const BODY_DOTS: { region: string; x: number; y: number; color: string }[] = [
  { region: 'heart', x: 128, y: 96, color: '#ff5c6c' },
  { region: 'resp', x: 106, y: 84, color: '#22d3ee' },
  { region: 'digestive', x: 120, y: 140, color: '#ffb224' },
  { region: 'musco', x: 113, y: 254, color: '#10e5a5' },
  { region: 'musco', x: 152, y: 204, color: '#a78bfa' },
];

export function BodyMap({ selected, onSelect, className, compact }: { selected?: string | null; onSelect?: (r: string) => void; className?: string; compact?: boolean }) {
  return (
    <svg viewBox="0 0 240 330" className={cn('h-full w-auto', className)} aria-label="Body map">
      <defs>
        <linearGradient id="bodyG" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.14" />
          <stop offset="100%" stopColor="#2e7cf6" stopOpacity="0.05" />
        </linearGradient>
      </defs>
      <g fill="url(#bodyG)" stroke="#2e7cf6" strokeOpacity="0.55" strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round">
        <circle cx="120" cy="30" r="18" />
        <path d="M113 47v9h14v-9" />
        <path d="M86 60h68l9 52-5 52-22 11h-32l-22-11-5-52z" />
        <path d="M97 174h46l-5 20h-36z" />
        <path d="M86 62 66 84 55 140c-1.5 8 8.5 11 11 3.5l9-36 7-24" />
        <path d="M154 62l20 22 11 56c1.5 8-8.5 11-11 3.5l-9-36-7-24" />
        <path d="M103 194l-6 82c-1 9 10 12 13.5 5l9-56 5-31" />
        <path d="M137 194l6 82c1 9-10 12-13.5 5l-9-56-5-31" />
      </g>
      {!compact && <line x1="0" y1="150" x2="240" y2="150" stroke="#22d3ee" strokeOpacity="0.12" strokeDasharray="4 6" />}
      {BODY_DOTS.map((d, i) => {
        const active = selected === d.region;
        return (
          <g key={i} className={onSelect ? 'cursor-pointer' : undefined} onClick={() => onSelect?.(d.region)}>
            <circle cx={d.x} cy={d.y} r={active ? 11 : 9} fill={d.color} opacity={0.22} className={active ? '' : 'anim-blink'} style={{ animationDelay: `${i * 0.4}s` }} />
            <circle cx={d.x} cy={d.y} r={active ? 5.5 : 4} fill={d.color} stroke="#04101f" strokeWidth="1.5" />
            {active && <circle cx={d.x} cy={d.y} r="14" fill="none" stroke={d.color} strokeWidth="1.5" strokeOpacity="0.8" />}
          </g>
        );
      })}
    </svg>
  );
}

/* ================= HOOKS ================= */
export function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const fn = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener('change', fn);
    return () => mq.removeEventListener('change', fn);
  }, []);
  return reduced;
}

export function useInView<T extends HTMLElement>(threshold = 0.2) {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { threshold },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);
  return { ref, inView };
}

export function Reveal({ children, className, delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const { ref, inView } = useInView<HTMLDivElement>(0.12);
  return (
    <div ref={ref} className={cn('reveal', inView && 'on', className)} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

export function useCountUp(target: number, start: boolean, dur = 1400, decimals = 0) {
  const [val, setVal] = useState(0);
  const reduced = useReducedMotion();
  useEffect(() => {
    if (!start) return;
    if (reduced) {
      setVal(target);
      return;
    }
    let raf = 0;
    const t0 = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(parseFloat((target * eased).toFixed(decimals)));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [start, target, dur, decimals, reduced]);
  return val;
}

export function useScramble(text: string, start: boolean) {
  const [out, setOut] = useState(text);
  const reduced = useReducedMotion();
  useEffect(() => {
    if (!start || reduced) {
      setOut(text);
      return;
    }
    const chars = '#<>[]{}—=+*^?/\\';
    let frame = 0;
    let raf = 0;
    const total = 42;
    const tick = () => {
      frame++;
      const reveal = Math.floor((frame / total) * text.length);
      let s = text.slice(0, reveal);
      for (let i = reveal; i < text.length; i++) s += text[i] === ' ' ? ' ' : chars[(Math.random() * chars.length) | 0];
      setOut(s);
      if (frame < total) raf = requestAnimationFrame(tick);
      else setOut(text);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [text, start, reduced]);
  return out;
}

/* ================= TOASTS ================= */
type ToastKind = 'ok' | 'info' | 'warn';
interface Toast {
  id: number;
  msg: string;
  kind: ToastKind;
}
const ToastCtx = createContext<(msg: string, kind?: ToastKind) => void>(() => {});
export const useToast = () => useContext(ToastCtx);

const KIND_META: Record<ToastKind, { icon: string; color: string }> = {
  ok: { icon: 'shield-check', color: '#10e5a5' },
  info: { icon: 'sparkles', color: '#22d3ee' },
  warn: { icon: 'alert', color: '#ffb224' },
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const push = (msg: string, kind: ToastKind = 'ok') => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t.slice(-3), { id, msg, kind }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3400);
  };
  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div className="pointer-events-none fixed bottom-5 right-5 z-[90] flex w-[320px] flex-col gap-2.5">
        {toasts.map((t) => (
          <div key={t.id} className="anim-toast panel-hi pointer-events-auto flex items-start gap-3 px-4 py-3">
            <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg" style={{ background: `${KIND_META[t.kind].color}1f`, color: KIND_META[t.kind].color }}>
              <I n={KIND_META[t.kind].icon} className="h-4 w-4" />
            </span>
            <p className="text-[13px] font-semibold leading-snug text-snow">{t.msg}</p>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

/* ================= SMALL PARTS ================= */
export function StatusPill({ status }: { status: 'normal' | 'low' | 'high' | 'warn' }) {
  const map = {
    normal: { c: '#10e5a5', l: 'Normal' },
    low: { c: '#ffb224', l: 'Low' },
    high: { c: '#ff5c6c', l: 'High' },
    warn: { c: '#ffb224', l: 'Watch' },
  }[status];
  return (
    <span className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide" style={{ color: map.c, background: `${map.c}1a`, border: `1px solid ${map.c}40` }}>
      {map.l}
    </span>
  );
}

export function SectionTag({ children, color = '#5b9bff' }: { children: React.ReactNode; color?: string }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border px-3 py-1 font-display text-[11px] font-semibold uppercase tracking-[0.14em]" style={{ color, borderColor: `${color}45`, background: `${color}12` }}>
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: color }} />
      {children}
    </span>
  );
}
