import { useEffect, useState, type ReactNode } from 'react';
import { cn } from '../utils/cn';
import { I, BodyMap, QR, Reveal, SectionTag, useReducedMotion } from './ui';
import { ACCESS_PENDING, RECORDS, REGION_META } from '../data';

const SCREENS = [
  { id: 'home', label: 'Dashboard', icon: 'home' },
  { id: 'records', label: 'My Records', icon: 'file' },
  { id: 'ai', label: 'AI Summary', icon: 'sparkles' },
  { id: 'access', label: 'Access Requests', icon: 'users' },
  { id: 'passport', label: 'Health Passport', icon: 'qr' },
  { id: 'qr', label: 'QR Verification', icon: 'shield-check' },
];

function StatusBar() {
  return (
    <div className="flex items-center justify-between px-5 pt-3 text-[9px] font-bold text-snow">
      <span>9:41</span>
      <span className="h-4 w-20 rounded-full bg-deep" />
      <span className="flex items-center gap-1 text-mist">
        <svg viewBox="0 0 14 10" className="h-2.5 w-3.5 fill-current"><rect x="0" y="6" width="2.5" height="4" rx="0.5" /><rect x="4" y="4" width="2.5" height="6" rx="0.5" /><rect x="8" y="2" width="2.5" height="8" rx="0.5" /><rect x="12" y="0" width="2.5" height="10" rx="0.5" opacity="0.4" /></svg>
        <I n="battery" className="h-2.5 w-4" />
      </span>
    </div>
  );
}

function BottomNav({ active }: { active: string }) {
  const items = [
    { id: 'home', icon: 'home', l: 'Home' },
    { id: 'records', icon: 'file', l: 'Records' },
    { id: 'access', icon: 'users', l: 'Doctors' },
    { id: 'passport', icon: 'user', l: 'Profile' },
  ];
  return (
    <div className="mt-auto grid grid-cols-4 border-t border-linesoft bg-deep/90 px-2 pb-4 pt-2">
      {items.map((it) => (
        <span key={it.id} className={cn('flex flex-col items-center gap-0.5 text-[8px] font-bold', active === it.id ? 'text-pulse2' : 'text-dim')}>
          <I n={it.icon} className="h-4 w-4" />
          {it.l}
        </span>
      ))}
    </div>
  );
}

function Chip({ active, children }: { active?: boolean; children: ReactNode }) {
  return (
    <span className={cn('rounded-full px-2.5 py-1 text-[8.5px] font-bold', active ? 'bg-pulse text-white' : 'bg-deep text-mist border border-line')}>{children}</span>
  );
}

function RecRow({ color, icon, title, date, big }: { color: string; icon: string; title: string; date: string; big?: boolean }) {
  return (
    <div className={cn('flex items-center gap-2.5 rounded-lg border border-linesoft bg-deep/70 px-3', big ? 'py-2.5' : 'py-2')}>
      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-md" style={{ background: `${color}1c`, color }}>
        <I n={icon} className="h-3.5 w-3.5" />
      </span>
      <div className="min-w-0">
        <p className={cn('truncate font-bold text-snow', big ? 'text-[11px]' : 'text-[10px]')}>{title}</p>
        <p className="truncate text-[8.5px] text-dim">{date}</p>
      </div>
      <I n="chevright" className="ml-auto h-3 w-3 shrink-0 text-dim" />
    </div>
  );
}

function ScreenHome() {
  return (
    <div className="flex flex-1 flex-col gap-2.5 overflow-hidden p-4 pt-2">
      <div>
        <p className="text-[8px] font-bold uppercase tracking-[0.14em] text-dim">Good Morning</p>
        <p className="font-display text-[15px] font-bold text-snow">Aman</p>
      </div>
      <div className="grid grid-cols-4 gap-1.5">
        {[
          { n: '12', l: 'Records', c: '#2e7cf6' },
          { n: '3', l: 'Hospitals', c: '#10e5a5' },
          { n: '2', l: 'Doctors', c: '#22d3ee' },
          { n: '2', l: 'Requests', c: '#ff5c6c' },
        ].map((s) => (
          <div key={s.l} className="rounded-lg border border-linesoft bg-deep/70 py-2 text-center">
            <p className="font-display text-[13px] font-bold" style={{ color: s.c }}>{s.n}</p>
            <p className="text-[7px] font-semibold uppercase text-dim">{s.l}</p>
          </div>
        ))}
      </div>
      <p className="mt-1 text-[8px] font-bold uppercase tracking-[0.14em] text-dim">Recent Records</p>
      <RecRow big color="#ff5c6c" icon="flask" title="Blood Test Report" date="12 Sep 2024" />
      <RecRow big color="#2e7cf6" icon="image" title="X-Ray Chest" date="5 Aug 2024" />
      <RecRow big color="#8b5cf6" icon="file" title="Prescription" date="20 Jul 2024" />
    </div>
  );
}

function ScreenRecords() {
  return (
    <div className="flex flex-1 flex-col gap-2 p-4 pt-2">
      <p className="font-display text-[14px] font-bold text-snow">My Records</p>
      <div className="flex gap-1.5">
        <Chip active>All</Chip>
        <Chip>Reports</Chip>
        <Chip>Prescriptions</Chip>
      </div>
      <div className="mt-1 space-y-1.5">
        {RECORDS.slice(0, 6).map((r) => (
          <RecRow
            key={r.id}
            color={r.type === 'lab' ? '#ff5c6c' : r.type === 'xray' ? '#2e7cf6' : r.type === 'rx' ? '#10e5a5' : r.type === 'ecg' ? '#ffb224' : '#8b5cf6'}
            icon={r.type === 'lab' ? 'flask' : r.type === 'xray' ? 'image' : r.type === 'rx' ? 'file' : r.type === 'ecg' ? 'activity' : 'scan'}
            title={r.title}
            date={r.date}
          />
        ))}
      </div>
    </div>
  );
}

function ScreenAI() {
  const s = { findings: [{ label: 'Hemoglobin', value: 'Normal', c: '#10e5a5' }, { label: 'Vitamin D', value: 'Low', c: '#ffb224' }, { label: 'Cholesterol', value: 'High', c: '#ff5c6c' }] };
  return (
    <div className="flex flex-1 flex-col gap-2 p-4 pt-2">
      <p className="font-display text-[14px] font-bold text-snow">AI Summary</p>
      <div className="flex items-start gap-1.5 rounded-lg border border-amber/40 bg-amber/10 px-2.5 py-2">
        <I n="alert" className="h-3 w-3 shrink-0 text-amber" />
        <p className="text-[8.5px] leading-snug text-amber">This is an AI-generated summary and should not replace professional medical advice.</p>
      </div>
      <div className="flex items-center justify-between rounded-lg border border-line bg-deep/80 px-2.5 py-2">
        <span className="text-[9px] font-bold text-snow">Blood Test Report</span>
        <span className="text-[8px] text-dim">12 Sep 2024</span>
        <I n="chevdown" className="h-3 w-3 text-dim" />
      </div>
      <p className="mt-1 text-[8px] font-bold uppercase tracking-[0.14em] text-dim">Key Findings</p>
      <div className="space-y-1.5">
        {s.findings.map((f) => (
          <div key={f.label} className="flex items-center justify-between rounded-lg border border-linesoft bg-deep/70 px-2.5 py-2">
            <span className="flex items-center gap-1.5 text-[9px] font-semibold text-snow"><span className="h-1.5 w-1.5 rounded-full" style={{ background: f.c }} />{f.label}</span>
            <span className="text-[8.5px] font-bold" style={{ color: f.c }}>{f.value}</span>
          </div>
        ))}
      </div>
      <button className="mt-auto rounded-lg bg-pulse py-2 text-[9px] font-bold text-white">View Full Report</button>
    </div>
  );
}

function ScreenAccess() {
  return (
    <div className="flex flex-1 flex-col gap-2 p-4 pt-2">
      <p className="font-display text-[14px] font-bold text-snow">Access Requests</p>
      <div className="flex gap-1.5">
        <Chip active>Pending (2)</Chip>
        <Chip>Approved</Chip>
        <Chip>Rejected</Chip>
      </div>
      <div className="mt-1 space-y-2">
        {ACCESS_PENDING.map((a) => (
          <div key={a.id} className="rounded-xl border border-linesoft bg-deep/70 p-2.5">
            <div className="flex items-center gap-2">
              <span className="grid h-7 w-7 place-items-center rounded-full bg-gradient-to-br from-pulse to-grape text-[8px] font-bold text-white">
                {a.doctor.split(' ').slice(1, 3).map((p) => p[0]).join('')}
              </span>
              <div className="min-w-0">
                <p className="truncate text-[10px] font-bold text-snow">{a.doctor}</p>
                <p className="truncate text-[8px] text-dim">{a.hospital}</p>
              </div>
            </div>
            <p className="mt-1.5 text-[8px] text-mist">Requested on {a.date}</p>
            <div className="mt-2 grid grid-cols-2 gap-1.5">
              <span className="rounded-md bg-mint/90 py-1.5 text-center text-[9px] font-bold text-ink">Approve</span>
              <span className="rounded-md bg-coral/90 py-1.5 text-center text-[9px] font-bold text-white">Reject</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ScreenPassport() {
  const counts: Record<string, number> = {};
  RECORDS.forEach((r) => (counts[r.region] = (counts[r.region] || 0) + 1));
  return (
    <div className="flex flex-1 flex-col gap-2 p-4 pt-2">
      <div className="flex items-center gap-1.5">
        <I n="back" className="h-3.5 w-3.5 text-dim" />
        <p className="font-display text-[14px] font-bold text-snow">Health Passport</p>
      </div>
      <div className="relative mx-auto h-28 w-20 overflow-hidden rounded-xl border border-line bg-deep/60">
        <div className="absolute inset-0 bg-grid opacity-60" />
        <BodyMap compact className="h-full" />
        <div className="scanline" />
      </div>
      <div className="mt-1 space-y-1.5">
        {Object.entries(REGION_META).map(([k, v]) => (
          <div key={k} className="flex items-center gap-2 rounded-lg border border-linesoft bg-deep/70 px-2.5 py-2">
            <span className="h-2 w-2 rounded-full" style={{ background: v.color }} />
            <span className="text-[9px] font-bold text-snow">{v.label}</span>
            <span className="ml-auto text-[8px] font-semibold text-dim">{counts[k] || 0} rec</span>
            <I n="chevright" className="h-3 w-3 text-dim" />
          </div>
        ))}
      </div>
    </div>
  );
}

function ScreenQR() {
  const [state, setState] = useState<'idle' | 'scanning' | 'done'>('idle');
  return (
    <div className="flex flex-1 flex-col gap-2.5 p-4 pt-2">
      <div className="flex items-center gap-1.5">
        <I n="back" className="h-3.5 w-3.5 text-dim" />
        <p className="font-display text-[14px] font-bold text-snow">Verify Record</p>
      </div>
      <div className="relative mx-auto mt-1 w-fit rounded-xl bg-white p-2.5 shadow-[0_14px_30px_-12px_rgba(0,0,0,0.7)]">
        <QR seed="mobile-verify-mr-1024" cell={3.4} className="h-36 w-36" />
        {state === 'scanning' && <div className="scanline scanline-fast" />}
      </div>
      <p className="text-center text-[8.5px] leading-snug text-mist">Scan the QR code to verify a medical record</p>
      <button
        onClick={() => {
          if (state === 'scanning') return;
          setState('scanning');
          setTimeout(() => setState('done'), 1300);
        }}
        className={cn('flex items-center justify-center gap-1.5 rounded-lg py-2.5 text-[10px] font-bold transition-all', state === 'done' ? 'bg-mint text-ink' : 'bg-cy text-ink')}
      >
        {state === 'idle' && (<><I n="qr" className="h-3.5 w-3.5" /> Scan QR Code</>)}
        {state === 'scanning' && (<><span className="h-3 w-3 animate-spin rounded-full border-2 border-ink/30 border-t-ink" /> Checking chain…</>)}
        {state === 'done' && (<><I n="shield-check" className="h-3.5 w-3.5" /> Verified · hash matches</>)}
      </button>
      <div className="mt-auto">
        <p className="mb-1 text-[8px] font-bold uppercase tracking-wider text-dim">Or enter record ID</p>
        <div className="flex items-center gap-1.5 rounded-lg border border-line bg-deep/70 px-2.5 py-2">
          <I n="search" className="h-3 w-3 text-dim" />
          <span className="text-[9px] text-dim">e.g. MR-1024</span>
        </div>
      </div>
    </div>
  );
}

export function MobilePreview() {
  const [idx, setIdx] = useState(0);
  const [hover, setHover] = useState(false);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced || hover) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % SCREENS.length), 4500);
    return () => clearInterval(t);
  }, [reduced, hover]);

  return (
    <div className="mx-auto max-w-7xl px-5">
      <Reveal className="mx-auto max-w-xl text-center">
        <SectionTag color="#22d3ee">Mobile App</SectionTag>
        <h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-snow md:text-4xl">Your health, in your pocket</h2>
        <p className="mt-3 text-[15px] text-mist">The full MediChain experience — records, AI insights, access control and QR verification — on iOS and Android.</p>
      </Reveal>

      <div className="mt-10 flex justify-center">
        <div
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
          className="relative"
        >
          <div className="absolute -inset-10 rounded-full bg-pulse/15 blur-3xl" aria-hidden />
          <div className="relative flex h-[600px] w-[280px] flex-col overflow-hidden rounded-[2.4rem] border-[6px] border-[#12294a] bg-ink shadow-[0_50px_100px_-30px_rgba(2,8,20,1)]">
            <StatusBar />
            <div key={idx} className="anim-pop flex min-h-0 flex-1 flex-col">
              {SCREENS[idx].id === 'home' && <ScreenHome />}
              {SCREENS[idx].id === 'records' && <ScreenRecords />}
              {SCREENS[idx].id === 'ai' && <ScreenAI />}
              {SCREENS[idx].id === 'access' && <ScreenAccess />}
              {SCREENS[idx].id === 'passport' && <ScreenPassport />}
              {SCREENS[idx].id === 'qr' && <ScreenQR />}
              <BottomNav active={SCREENS[idx].id === 'qr' ? 'passport' : SCREENS[idx].id} />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
        {SCREENS.map((s, i) => (
          <button
            key={s.id}
            onClick={() => setIdx(i)}
            className={cn(
              'flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-bold transition-all',
              i === idx ? 'border-pulse bg-pulse/20 text-snow shadow-[0_0_24px_-8px_rgba(46,124,246,0.8)]' : 'border-line text-mist hover:border-pulse2/50 hover:text-snow',
            )}
          >
            <I n={s.icon} className="h-3.5 w-3.5" />
            {s.label}
          </button>
        ))}
      </div>
    </div>
  );
}
