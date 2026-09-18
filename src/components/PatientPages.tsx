import { useMemo, useRef, useState } from 'react';
import { cn } from '../utils/cn';
import { Avatar, I, QR, StatusPill, useToast } from './ui';
import { BodyMap } from './ui';
import {
  ACTIVITY, AI_SUMMARIES, AccessReq, MedRecord, REGION_META, SHARED_WITH, TYPE_META,
} from '../data';

const recColor = (r: MedRecord) => TYPE_META[r.type].color;
const recIcon = (r: MedRecord) => TYPE_META[r.type].icon;

/* ---------------- Dashboard ---------------- */
export function Dashboard({ records, pending, go, onOpen }: { records: MedRecord[]; pending: number; go: (p: string) => void; onOpen: (r: MedRecord) => void }) {
  const stats = [
    { icon: 'file', color: '#2e7cf6', n: records.length, l: 'Total Records' },
    { icon: 'hospital', color: '#10e5a5', n: 3, l: 'Hospitals' },
    { icon: 'steth', color: '#22d3ee', n: 2, l: 'Doctors' },
    { icon: 'users', color: '#ff5c6c', n: pending, l: 'Pending Requests' },
  ];
  return (
    <div className="space-y-5">
      <p className="text-sm text-mist">Here’s your health overview.</p>
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {stats.map((s, i) => (
          <div key={s.l} className="panel card-hover flex items-center gap-3.5 p-4" style={{ animationDelay: `${i * 60}ms` }}>
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl" style={{ background: `${s.color}16`, color: s.color, border: `1px solid ${s.color}35` }}>
              <I n={s.icon} className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <p className="font-display text-2xl font-bold leading-none text-snow">{s.n}</p>
              <p className="mt-1 truncate text-[11px] font-semibold uppercase tracking-wide text-dim">{s.l}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.7fr_1fr]">
        <div className="panel p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-base font-bold text-snow">Recent Records</h2>
            <button onClick={() => go('records')} className="flex items-center gap-1 text-xs font-bold text-pulse2 transition-colors hover:text-cy">
              View All <I n="chevright" className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="space-y-2.5">
            {records.slice(0, 3).map((r) => (
              <div key={r.id} className="group flex items-center gap-3.5 rounded-xl border border-linesoft bg-deep/50 p-3.5 transition-all hover:border-pulse/50 hover:bg-deep">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg" style={{ background: `${recColor(r)}16`, color: recColor(r) }}>
                  <I n={recIcon(r)} className="h-4.5 w-4.5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-snow">{r.title}</p>
                  <p className="truncate text-xs text-dim">{r.source} · {r.date}</p>
                </div>
                <button onClick={() => onOpen(r)} className="rounded-lg bg-pulse px-3.5 py-1.5 text-xs font-bold text-white opacity-90 transition-all hover:bg-pulse2 group-hover:opacity-100">
                  View
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-5">
          <div className="panel-hi relative overflow-hidden p-5">
            <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-mint/10 blur-2xl" aria-hidden />
            <h2 className="font-display text-base font-bold text-snow">Your Health Passport</h2>
            <div className="mt-4 flex items-center gap-4">
              <div className="rounded-xl bg-white p-2 shadow-[0_14px_30px_-12px_rgba(0,0,0,0.7)]">
                <QR seed="medichain-passport-aman-1024" cell={3.2} className="h-24 w-24" />
              </div>
              <div className="text-xs leading-relaxed text-mist">
                <p className="font-bold text-snow">{records.length} verified records</p>
                <p className="mt-1">One scan opens your full, tamper-proof clinical history at any hospital.</p>
              </div>
            </div>
            <button onClick={() => go('passport')} className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-mint/45 bg-mint/10 py-2.5 text-xs font-bold text-mint transition-all hover:bg-mint/20">
              <I n="qr" className="h-4 w-4" /> View Passport
            </button>
          </div>

          <div className="panel p-5">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-base font-bold text-snow">Latest AI Insight</h2>
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-cy/15 text-cy"><I n="sparkles" className="h-4 w-4" /></span>
            </div>
            <p className="mt-3 text-[13px] leading-relaxed text-mist">
              Vitamin D came back <span className="font-bold text-amber">low (20 ng/mL)</span> and cholesterol is marginally high in your latest blood test.
            </p>
            <button onClick={() => go('ai')} className="mt-3 flex items-center gap-1.5 text-xs font-bold text-cy transition-colors hover:text-snow">
              Open AI Summary <I n="arrow" className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      <div className="panel p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-base font-bold text-snow">Recent Activity</h2>
          <button onClick={() => go('activity')} className="flex items-center gap-1 text-xs font-bold text-pulse2 transition-colors hover:text-cy">
            Full log <I n="chevright" className="h-3.5 w-3.5" />
          </button>
        </div>
        <div className="grid gap-2.5 md:grid-cols-2">
          {ACTIVITY.slice(0, 4).map((a, i) => (
            <div key={i} className="flex items-center gap-3 rounded-lg border border-linesoft bg-deep/40 px-3.5 py-2.5">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg" style={{ background: `${a.color}16`, color: a.color }}>
                <I n={a.icon} className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-[13px] font-semibold text-snow">{a.title}</p>
                <p className="truncate text-[11px] text-dim">{a.meta}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------------- My Records ---------------- */
const FILTERS: { id: string; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'lab', label: 'Lab' },
  { id: 'xray', label: 'X-Ray' },
  { id: 'mri', label: 'MRI / Scan' },
  { id: 'rx', label: 'Prescription' },
  { id: 'ecg', label: 'Vitals' },
];

export function MyRecords({ records, onOpen, onAI }: { records: MedRecord[]; onOpen: (r: MedRecord) => void; onAI: (r: MedRecord) => void }) {
  const [q, setQ] = useState('');
  const [f, setF] = useState('all');
  const list = records.filter((r) => (f === 'all' || r.type === f) && (r.title + r.source + r.id).toLowerCase().includes(q.toLowerCase()));
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[220px] flex-1">
          <I n="search" className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-dim" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by title, hospital or record ID…" className="field pl-9" />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {FILTERS.map((x) => (
            <button key={x.id} onClick={() => setF(x.id)} className={cn('rounded-full px-3.5 py-1.5 text-xs font-bold transition-all', f === x.id ? 'bg-pulse text-white shadow-[0_8px_20px_-8px_rgba(46,124,246,0.9)]' : 'border border-line text-mist hover:border-pulse2/50 hover:text-snow')}>
              {x.label}
            </button>
          ))}
        </div>
      </div>
      <div className="panel divide-y divide-linesoft overflow-hidden">
        {list.map((r) => (
          <div key={r.id} className="flex flex-wrap items-center gap-3 px-4 py-3.5 transition-colors hover:bg-deep/60 md:flex-nowrap">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg" style={{ background: `${recColor(r)}16`, color: recColor(r) }}>
              <I n={recIcon(r)} className="h-4.5 w-4.5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-snow">{r.title} <span className="ml-1 font-mono text-[10px] font-medium text-dim">{r.id}</span></p>
              <p className="truncate text-xs text-dim">{r.source} · {r.date}</p>
            </div>
            <span className="hidden items-center gap-1 rounded-full border border-mint/35 bg-mint/10 px-2.5 py-1 text-[10px] font-bold text-mint sm:flex">
              <I n="shield-check" className="h-3 w-3" /> Verified
            </span>
            <div className="flex gap-2">
              <button onClick={() => onAI(r)} className="flex items-center gap-1.5 rounded-lg border border-cy/40 bg-cy/10 px-3 py-1.5 text-xs font-bold text-cy transition-colors hover:bg-cy/20">
                <I n="sparkles" className="h-3.5 w-3.5" /> AI
              </button>
              <button onClick={() => onOpen(r)} className="flex items-center gap-1.5 rounded-lg bg-pulse px-3 py-1.5 text-xs font-bold text-white transition-colors hover:bg-pulse2">
                View <I n="chevright" className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ))}
        {list.length === 0 && (
          <div className="px-4 py-14 text-center">
            <I n="search" className="mx-auto h-8 w-8 text-dim" />
            <p className="mt-3 text-sm font-bold text-snow">No records match</p>
            <p className="mt-1 text-xs text-dim">Try a different search or filter.</p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------------- Upload ---------------- */
export function Upload({ onAdd }: { onAdd: (r: MedRecord) => void }) {
  const toast = useToast();
  const [file, setFile] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [type, setType] = useState('lab');
  const [source, setSource] = useState('City Hospital');
  const [region, setRegion] = useState('heart');
  const [busy, setBusy] = useState(false);

  const submit = () => {
    if (!file) {
      toast('Choose a document to upload first.', 'warn');
      return;
    }
    setBusy(true);
    setTimeout(() => {
      const rec: MedRecord = {
        id: `MR-${1030 + Math.floor(Math.random() * 60)}`,
        title: title || file.replace(/\.[^.]+$/, ''),
        type: type as MedRecord['type'],
        source,
        date: '14 Sep 2024',
        region: region as MedRecord['region'],
        hash: 'C71B9E4D2F6A0835B0D2E8A6C4F1D95E7A3C0B5D9F2E6A4C',
        tx: `0x${Math.random().toString(16).slice(2, 18)}`,
      };
      onAdd(rec);
      setBusy(false);
      setFile(null);
      setTitle('');
      toast(`${rec.title} encrypted & anchored on-chain as ${rec.id}`, 'ok');
    }, 1200);
  };

  return (
    <div className="grid gap-5 xl:grid-cols-[1.5fr_1fr]">
      <div className="panel p-6">
        <button
          onClick={() => setFile('new-lab-report.pdf')}
          className="group flex w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-line bg-deep/40 px-6 py-12 transition-all hover:border-pulse/70 hover:bg-deep/70"
        >
          <span className="grid h-14 w-14 place-items-center rounded-2xl bg-pulse/15 text-pulse2 transition-transform group-hover:scale-110">
            <I n="upload" className="h-6 w-6" />
          </span>
          <p className="mt-4 text-sm font-bold text-snow">{file ? file : 'Click to choose a document'}</p>
          <p className="mt-1 text-xs text-dim">PDF, JPG or PNG · up to 25 MB · AES-256 encrypted before upload</p>
        </button>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-bold text-mist">Record title</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Thyroid Panel" className="field" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-bold text-mist">Type</label>
            <select value={type} onChange={(e) => setType(e.target.value)} className="field">
              <option value="lab">Lab Report</option>
              <option value="xray">X-Ray</option>
              <option value="mri">MRI / Scan</option>
              <option value="rx">Prescription</option>
              <option value="ecg">Vitals</option>
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-bold text-mist">Source</label>
            <select value={source} onChange={(e) => setSource(e.target.value)} className="field">
              {['City Hospital', 'Medicare Hospital', 'LifeCare Hospital', 'NeuroPlus Clinic', 'OrthoCare Centre'].map((h) => <option key={h}>{h}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-bold text-mist">Body system</label>
            <select value={region} onChange={(e) => setRegion(e.target.value)} className="field">
              {Object.entries(REGION_META).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
          </div>
        </div>
        <button onClick={submit} disabled={busy} className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-pulse py-3 text-sm font-bold text-white shadow-[0_14px_34px_-12px_rgba(46,124,246,0.9)] transition-all hover:bg-pulse2 disabled:opacity-60">
          {busy ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" /> Encrypting & anchoring…
            </>
          ) : (
            <>
              <I n="lock" className="h-4 w-4" /> Encrypt & Upload
            </>
          )}
        </button>
      </div>

      <div className="space-y-4">
        <div className="panel p-5">
          <h3 className="font-display text-sm font-bold text-snow">What happens on upload</h3>
          <ol className="mt-4 space-y-4">
            {[
              ['Your file is encrypted with a key only you hold', 'lock', '#5b9bff'],
              ['A SHA-256 fingerprint is anchored to the chain', 'shield', '#10e5a5'],
              ['The AI reads it and drafts your summary', 'sparkles', '#22d3ee'],
            ].map(([t, ic, c], i) => (
              <li key={i} className="flex gap-3">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg" style={{ background: `${c}16`, color: c as string }}>
                  <I n={ic as string} className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-[13px] font-semibold text-snow">{t}</p>
                  <div className="shimmer-line mt-2 h-1.5 w-3/4 rounded-full opacity-40" />
                </div>
              </li>
            ))}
          </ol>
        </div>
        <div className="rounded-xl border border-amber/35 bg-amber/10 p-4">
          <p className="flex items-center gap-2 text-xs font-bold text-amber"><I n="alert" className="h-4 w-4" /> Privacy note</p>
          <p className="mt-1.5 text-xs leading-relaxed text-mist">Original files never leave your device in plain text. Hospitals and doctors can only see what you explicitly share.</p>
        </div>
      </div>
    </div>
  );
}

/* ---------------- AI Summary ---------------- */
const AI_SECTIONS = [
  { id: 'summary', label: 'Summary', icon: 'sparkles' },
  { id: 'findings', label: 'Key Findings', icon: 'flask' },
  { id: 'recs', label: 'Recommendations', icon: 'check' },
  { id: 'conditions', label: 'Possible Conditions', icon: 'heart' },
];

export function AISummary({ records, selId, setSelId, onOpen }: { records: MedRecord[]; selId: string; setSelId: (id: string) => void; onOpen: (r: MedRecord) => void }) {
  const [open, setOpen] = useState(false);
  const [sec, setSec] = useState('summary');
  const rec = records.find((r) => r.id === selId) ?? records[0];
  const data = AI_SUMMARIES[rec.id];
  const refs = {
    summary: useRef<HTMLDivElement>(null),
    findings: useRef<HTMLDivElement>(null),
    recs: useRef<HTMLDivElement>(null),
    conditions: useRef<HTMLDivElement>(null),
  };

  const jump = (id: string) => {
    setSec(id);
    refs[id as keyof typeof refs].current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-2.5 rounded-xl border border-amber/40 bg-amber/10 px-4 py-3">
        <I n="alert" className="mt-0.5 h-4.5 w-4.5 shrink-0 text-amber" />
        <p className="text-[13px] leading-relaxed text-amber">This is an AI-generated summary and should not replace professional medical advice. Always consult a qualified doctor.</p>
      </div>

      <div className="relative">
        <button onClick={() => setOpen(!open)} className="field flex items-center justify-between text-left">
          <span className="flex items-center gap-2.5">
            <I n="file" className="h-4 w-4 text-pulse2" />
            <span className="text-sm font-bold text-snow">{rec.title} — {rec.date}</span>
            <span className="hidden font-mono text-[10px] text-dim sm:inline">{rec.id}</span>
          </span>
          <I n="chevdown" className={cn('h-4 w-4 text-dim transition-transform', open && 'rotate-180')} />
        </button>
        {open && (
          <div className="anim-pop panel-hi absolute z-20 mt-2 max-h-72 w-full overflow-y-auto">
            {records.map((r) => (
              <button key={r.id} onClick={() => { setSelId(r.id); setOpen(false); }} className={cn('flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-raise/50', r.id === rec.id && 'bg-raise/40')}>
                <span className="grid h-8 w-8 place-items-center rounded-lg" style={{ background: `${recColor(r)}16`, color: recColor(r) }}>
                  <I n={recIcon(r)} className="h-4 w-4" />
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-[13px] font-bold text-snow">{r.title}</span>
                  <span className="block truncate text-[11px] text-dim">{r.source} · {r.date}</span>
                </span>
                {r.id === rec.id && <I n="check" className="ml-auto h-4 w-4 text-mint" />}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="grid gap-5 xl:grid-cols-[170px_1fr_220px]">
        <div className="panel hidden h-fit p-2 xl:block">
          {AI_SECTIONS.map((s) => (
            <button key={s.id} onClick={() => jump(s.id)} className={cn('mb-0.5 flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-semibold transition-all', sec === s.id ? 'bg-pulse/15 text-snow' : 'text-mist hover:bg-raise/40 hover:text-snow')}>
              <I n={s.icon} className={cn('h-4 w-4', sec === s.id ? 'text-pulse2' : 'text-dim')} />
              {s.label}
            </button>
          ))}
        </div>

        <div className="min-w-0 space-y-5">
          <div key={rec.id} className="anim-pop space-y-5">
            <div ref={refs.summary} className="panel p-5">
              <h2 className="flex items-center gap-2 font-display text-base font-bold text-snow"><I n="sparkles" className="h-4.5 w-4.5 text-cy" /> AI Summary</h2>
              {data.blurb.map((p, i) => <p key={i} className="mt-3 text-sm leading-relaxed text-mist">{p}</p>)}
            </div>
            <div ref={refs.findings} className="panel p-5">
              <h2 className="flex items-center gap-2 font-display text-base font-bold text-snow"><I n="flask" className="h-4.5 w-4.5 text-coral" /> Key Findings</h2>
              <ul className="mt-4 space-y-2.5">
                {data.findings.map((f) => (
                  <li key={f.label} className="flex flex-wrap items-center gap-2.5 rounded-lg border border-linesoft bg-deep/50 px-3.5 py-2.5">
                    <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: f.status === 'normal' ? '#10e5a5' : f.status === 'low' ? '#ffb224' : '#ff5c6c' }} />
                    <span className="text-sm font-semibold text-snow">{f.label}:</span>
                    <span className="text-sm text-mist">{f.value}</span>
                    <span className="ml-auto"><StatusPill status={f.status} /></span>
                  </li>
                ))}
              </ul>
            </div>
            <div ref={refs.recs} className="panel p-5">
              <h2 className="flex items-center gap-2 font-display text-base font-bold text-snow"><I n="check" className="h-4.5 w-4.5 text-mint" /> Recommendations</h2>
              <ul className="mt-4 space-y-2.5">
                {data.recs.map((r, i) => (
                  <li key={i} className="flex items-center gap-2.5 text-sm text-mist">
                    <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-mint/15 text-mint"><I n="check" className="h-3 w-3" sw={3} /></span>
                    {r}
                  </li>
                ))}
              </ul>
            </div>
            <div ref={refs.conditions} className="panel p-5">
              <h2 className="flex items-center gap-2 font-display text-base font-bold text-snow"><I n="heart" className="h-4.5 w-4.5 text-grape" /> Possible Conditions</h2>
              <div className="mt-4 space-y-2.5">
                {data.conditions.map((c) => (
                  <div key={c.name} className="flex items-center justify-between rounded-lg border border-grape/30 bg-grape/10 px-3.5 py-2.5">
                    <span className="text-sm font-semibold text-snow">{c.name}</span>
                    <span className="rounded-full bg-grape/25 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-grape">{c.likelihood}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="panel p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-dim">Original Report</p>
            <div className="relative mt-3 overflow-hidden rounded-lg border border-line bg-[#f4f7fb] p-3">
              <div className="h-1.5 w-1/2 rounded bg-[#2e7cf6]" />
              <div className="mt-2 space-y-1.5">
                {[90, 100, 80, 95, 60, 100, 85, 40].map((w, i) => (
                  <div key={i} className="h-1.5 rounded bg-[#c3d0e2]" style={{ width: `${w}%` }} />
                ))}
              </div>
              <div className="absolute inset-x-0 top-1/2 flex justify-center">
                <span className="rounded bg-ink/80 px-2 py-0.5 font-mono text-[9px] font-bold text-cy">SHA-256 · verified</span>
              </div>
            </div>
            <button onClick={() => onOpen(rec)} className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg bg-pulse py-2.5 text-xs font-bold text-white transition-colors hover:bg-pulse2">
              View Full Report <I n="chevright" className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="rounded-xl border border-cy/30 bg-cy/10 p-4 text-xs leading-relaxed text-mist">
            <p className="flex items-center gap-1.5 font-bold text-cy"><I n="brain" className="h-4 w-4" /> Model: MedLM-2</p>
            <p className="mt-1.5">Generated in 1.4s on the encrypted index. You can regenerate anytime.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Record Detail ---------------- */
export function RecordDetail({ rec, onBack }: { rec: MedRecord; onBack: () => void }) {
  const toast = useToast();
  const [tab, setTab] = useState<'qr' | 'details'>('qr');
  const [copied, setCopied] = useState<string | null>(null);
  const [verify, setVerify] = useState<'idle' | 'scanning' | 'done'>('idle');

  const copy = (label: string, val: string) => {
    try {
      Promise.resolve(navigator.clipboard?.writeText(val)).catch(() => {});
    } catch {
      /* noop */
    }
    setCopied(label);
    setTimeout(() => setCopied(null), 1600);
  };
  const runVerify = () => {
    if (verify === 'scanning') return;
    setVerify('scanning');
    setTimeout(() => {
      setVerify('done');
      toast('Verification passed — hash matches on-chain record.', 'ok');
    }, 1500);
  };

  return (
    <div className="mx-auto max-w-5xl space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <button onClick={onBack} className="grid h-9 w-9 place-items-center rounded-lg border border-line text-mist transition-colors hover:border-pulse2/60 hover:text-snow" aria-label="Back">
          <I n="back" className="h-4 w-4" />
        </button>
        <span className="grid h-10 w-10 place-items-center rounded-xl" style={{ background: `${recColor(rec)}16`, color: recColor(rec) }}>
          <I n={recIcon(rec)} className="h-5 w-5" />
        </span>
        <h2 className="font-display text-xl font-bold text-snow">{rec.title}</h2>
        <span className="ml-auto flex items-center gap-1.5 rounded-full border border-mint/40 bg-mint/10 px-3 py-1.5 text-xs font-bold text-mint">
          <I n="shield-check" className="h-4 w-4" /> Verified on Blockchain
        </span>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="panel p-5">
          <div className="grid grid-cols-2 gap-x-4 gap-y-4">
            {[
              ['Record ID', rec.id, 'font-mono'],
              ['Patient', 'Aman Panchal', ''],
              ['Hospital', rec.source, ''],
              ['Uploaded', rec.date, ''],
            ].map(([l, v, extra]) => (
              <div key={l as string}>
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-dim">{l}</p>
                <p className={cn('mt-1 truncate text-sm font-bold text-snow', extra as string)}>{v}</p>
              </div>
            ))}
          </div>

          <div className="mt-5 flex gap-2 rounded-xl border border-line bg-ink/60 p-1.5">
            {([['qr', 'QR Code'], ['details', 'Verification Details']] as const).map(([id, l]) => (
              <button key={id} onClick={() => setTab(id)} className={cn('flex-1 rounded-lg py-2 text-xs font-bold transition-all', tab === id ? 'bg-pulse text-white' : 'text-mist hover:text-snow')}>
                {l}
              </button>
            ))}
          </div>

          <div className="mt-4 space-y-3.5">
            <div className="flex items-center gap-2">
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-dim">File Hash</p>
                <p className="mt-1 truncate font-mono text-xs text-snow/90">{rec.hash.slice(0, 24)}…</p>
              </div>
              <button onClick={() => copy('hash', rec.hash)} className={cn('flex shrink-0 items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[11px] font-bold transition-all', copied === 'hash' ? 'border-mint/50 bg-mint/15 text-mint' : 'border-line text-mist hover:border-pulse2/60 hover:text-snow')}>
                <I n={copied === 'hash' ? 'check' : 'copy'} className="h-3.5 w-3.5" /> {copied === 'hash' ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <div className="flex items-center gap-2">
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-dim">Blockchain Tx</p>
                <p className="mt-1 truncate font-mono text-xs text-snow/90">{rec.tx}</p>
              </div>
              <button onClick={() => copy('tx', rec.tx)} className={cn('flex shrink-0 items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[11px] font-bold transition-all', copied === 'tx' ? 'border-mint/50 bg-mint/15 text-mint' : 'border-line text-mist hover:border-pulse2/60 hover:text-snow')}>
                <I n={copied === 'tx' ? 'check' : 'copy'} className="h-3.5 w-3.5" /> {copied === 'tx' ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-dim">Status</p>
              <p className="mt-1 flex items-center gap-1.5 text-sm font-bold text-mint"><I n="shield-check" className="h-4 w-4" /> Verified</p>
            </div>
            {tab === 'details' && (
              <div className="anim-pop space-y-3 rounded-lg border border-linesoft bg-ink/50 p-3.5">
                {[
                  ['Block', '#19,204,551'],
                  ['Network', 'MediChain L2 · Polygon'],
                  ['Verifier', '0x7fA3…9E21 (City Hospital)'],
                  ['Anchored', `${rec.date}, 09:41 UTC`],
                ].map(([l, v]) => (
                  <div key={l} className="flex justify-between gap-3 text-xs">
                    <span className="font-semibold text-dim">{l}</span>
                    <span className="truncate font-mono text-snow/90">{v}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="panel-hi relative overflow-hidden p-5">
          {verify === 'scanning' && <div className="scanline scanline-fast z-10" />}
          <div className="flex flex-col items-center">
            <div className="rounded-2xl bg-white p-3 shadow-[0_18px_40px_-14px_rgba(0,0,0,0.75)]">
              <QR seed={`verify-${rec.id}`} cell={4.4} className="h-44 w-44" />
            </div>
            <p className="mt-3 text-xs text-mist">Scan to verify this record</p>
            <button
              onClick={runVerify}
              className={cn(
                'mt-4 flex w-full max-w-[280px] items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold transition-all',
                verify === 'done' ? 'bg-mint text-ink' : 'border border-cy/50 bg-cy/10 text-cy hover:bg-cy/20',
              )}
            >
              {verify === 'idle' && (<><I n="qr" className="h-4 w-4" /> Test Verification</>)}
              {verify === 'scanning' && (<><span className="h-4 w-4 animate-spin rounded-full border-2 border-cy/30 border-t-cy" /> Checking chain…</>)}
              {verify === 'done' && (<><I n="shield-check" className="h-4 w-4" /> Verification passed — hash matches</>)}
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <button onClick={() => toast(`${rec.title} downloaded to your encrypted vault.`, 'info')} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-pulse py-3 text-sm font-bold text-white transition-colors hover:bg-pulse2 sm:flex-none sm:px-6">
          <I n="download" className="h-4 w-4" /> Download Record
        </button>
        <button onClick={() => toast('Opening block explorer for this transaction…', 'info')} className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-line bg-deep/60 py-3 text-sm font-bold text-snow transition-colors hover:border-pulse2/60 sm:flex-none sm:px-6">
          <I n="external" className="h-4 w-4" /> View on Blockchain
        </button>
      </div>
    </div>
  );
}

/* ---------------- Access Requests ---------------- */
export interface AccessState {
  pending: AccessReq[];
  approved: AccessReq[];
  rejected: AccessReq[];
}

export function AccessRequests({ state, act }: { state: AccessState; act: (id: string, kind: 'approved' | 'rejected') => void }) {
  const toast = useToast();
  const [tab, setTab] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const list = state[tab];
  const TABS: [typeof tab, string, number][] = [
    ['pending', 'Pending', state.pending.length],
    ['approved', 'Approved', state.approved.length],
    ['rejected', 'Rejected', state.rejected.length],
  ];
  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div className="flex gap-2">
        {TABS.map(([id, l, n]) => (
          <button key={id} onClick={() => setTab(id)} className={cn('flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all', tab === id ? 'bg-pulse text-white shadow-[0_10px_24px_-10px_rgba(46,124,246,0.9)]' : 'border border-line text-mist hover:text-snow')}>
            {l} <span className={cn('rounded-full px-1.5 text-[10px]', tab === id ? 'bg-white/20' : 'bg-raise text-dim')}>{n}</span>
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <div className="panel flex flex-col items-center px-6 py-16 text-center">
          <span className={cn('grid h-14 w-14 place-items-center rounded-2xl', tab === 'pending' ? 'bg-pulse/15 text-pulse2' : tab === 'approved' ? 'bg-mint/15 text-mint' : 'bg-coral/15 text-coral')}>
            <I n={tab === 'rejected' ? 'x' : tab === 'approved' ? 'check' : 'clock'} className="h-6 w-6" />
          </span>
          <p className="mt-4 text-sm font-bold text-snow">{tab === 'pending' ? 'No more pending requests' : tab === 'approved' ? 'No approvals yet' : 'Nothing rejected'}</p>
          <p className="mt-1 text-xs text-dim">{tab === 'pending' ? "You're all caught up." : 'Requests you decide on will appear here.'}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {list.map((a, i) => (
            <div key={a.id} className="anim-pop panel flex flex-wrap items-center gap-4 p-4" style={{ animationDelay: `${i * 50}ms` }}>
              <Avatar name={a.doctor} img={a.img} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-snow">{a.doctor}</p>
                <p className="truncate text-xs text-dim">{a.hospital}</p>
                <p className="mt-1 text-xs text-mist">
                  {tab === 'pending' ? `Requested on ${a.date} · ${a.purpose}` : `${a.purpose} · ${a.date}`}
                </p>
              </div>
              {tab === 'pending' ? (
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      act(a.id, 'approved');
                      toast(`Access granted to ${a.doctor} — share logged on-chain.`, 'ok');
                    }}
                    className="flex items-center gap-1.5 rounded-lg bg-mint px-4 py-2 text-xs font-bold text-ink transition-all hover:brightness-110"
                  >
                    <I n="check" className="h-3.5 w-3.5" sw={3} /> Approve
                  </button>
                  <button
                    onClick={() => {
                      act(a.id, 'rejected');
                      toast(`Request from ${a.doctor} rejected.`, 'warn');
                    }}
                    className="flex items-center gap-1.5 rounded-lg bg-coral px-4 py-2 text-xs font-bold text-white transition-all hover:brightness-110"
                  >
                    <I n="x" className="h-3.5 w-3.5" sw={3} /> Reject
                  </button>
                </div>
              ) : (
                <span className={cn('flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-bold', tab === 'approved' ? 'bg-mint/15 text-mint' : 'bg-coral/15 text-coral')}>
                  <I n={tab === 'approved' ? 'check' : 'x'} className="h-3.5 w-3.5" sw={3} /> {tab === 'approved' ? 'Approved' : 'Rejected'}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------------- Shared With ---------------- */
export function SharedWith() {
  const toast = useToast();
  const [items, setItems] = useState(SHARED_WITH);
  return (
    <div className="panel divide-y divide-linesoft overflow-hidden">
      {items.map((s, i) => (
        <div key={i} className="flex flex-wrap items-center gap-3 px-4 py-3.5 transition-colors hover:bg-deep/50">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-grape/15 text-grape"><I n="share" className="h-4 w-4" /></span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-snow">{s.record}</p>
            <p className="truncate text-xs text-dim">with {s.with} · {s.hospital} · {s.date}</p>
          </div>
          <span className={cn('rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide', s.status === 'active' ? 'bg-mint/15 text-mint' : 'bg-raise text-dim')}>{s.status}</span>
          {s.status === 'active' && (
            <button
              onClick={() => {
                setItems((it) => it.filter((_, j) => j !== i));
                toast(`Access revoked for ${s.with} — logged on-chain.`, 'warn');
              }}
              className="rounded-lg border border-coral/40 bg-coral/10 px-3 py-1.5 text-xs font-bold text-coral transition-colors hover:bg-coral/20"
            >
              Revoke
            </button>
          )}
        </div>
      ))}
      {items.length === 0 && (
        <div className="px-4 py-14 text-center">
          <p className="text-sm font-bold text-snow">Nothing shared right now</p>
          <p className="mt-1 text-xs text-dim">Records you share with care providers will show up here.</p>
        </div>
      )}
    </div>
  );
}

/* ---------------- Health Passport ---------------- */
export function Passport({ records, go }: { records: MedRecord[]; go: (p: string) => void }) {
  const [sel, setSel] = useState<string>('heart');
  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    records.forEach((r) => (c[r.region] = (c[r.region] || 0) + 1));
    return c;
  }, [records]);
  const selRecords = records.filter((r) => r.region === sel);

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_1.2fr]">
      <div className="panel-hi relative overflow-hidden p-5">
        <div className="absolute inset-0 bg-grid opacity-50" aria-hidden />
        <div className="scanline" aria-hidden />
        <p className="relative text-xs font-bold uppercase tracking-[0.16em] text-cy">Interactive Body Map</p>
        <p className="relative mt-1 text-xs text-mist">Click a glowing point to view related medical records.</p>
        <div className="relative mx-auto mt-2 h-[380px]">
          <BodyMap selected={sel} onSelect={setSel} />
        </div>
      </div>

      <div className="space-y-3">
        {Object.entries(REGION_META).map(([k, v]) => {
          const open = sel === k;
          return (
            <div key={k} className={cn('panel overflow-hidden transition-all', open && 'border-transparent')} style={open ? { borderColor: `${v.color}55`, boxShadow: `0 0 34px -14px ${v.color}80` } : undefined}>
              <button onClick={() => setSel(k)} className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-deep/50">
                <span className="relative grid h-9 w-9 shrink-0 place-items-center rounded-lg" style={{ background: `${v.color}18`, color: v.color }}>
                  <I n={v.icon} className="h-4.5 w-4.5" />
                  <span className="dot-ring absolute inset-0 rounded-lg" style={{ color: v.color, opacity: open ? 0.5 : 0 }} />
                </span>
                <div className="flex-1">
                  <p className="text-sm font-bold text-snow">{v.label}</p>
                  <p className="text-[11px] text-dim">{counts[k] || 0} {counts[k] === 1 ? 'record' : 'records'}</p>
                </div>
                <I n="chevdown" className={cn('h-4 w-4 text-dim transition-transform', open && 'rotate-180')} />
              </button>
              {open && (
                <div className="anim-pop border-t border-linesoft px-4 pb-4 pt-3">
                  <div className="space-y-2">
                    {selRecords.map((r) => (
                      <div key={r.id} className="flex items-center gap-3 rounded-lg border border-linesoft bg-ink/50 px-3 py-2.5">
                        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg" style={{ background: `${recColor(r)}16`, color: recColor(r) }}>
                          <I n={recIcon(r)} className="h-4 w-4" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[13px] font-bold text-snow">{r.title}</p>
                          <p className="truncate text-[11px] text-dim">{r.date}</p>
                        </div>
                        <I n="chevright" className="h-4 w-4 shrink-0 text-dim" />
                      </div>
                    ))}
                    {selRecords.length === 0 && <p className="px-1 py-2 text-xs text-dim">No records in this system yet.</p>}
                  </div>
                  <button onClick={() => go('records')} className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-pulse py-2.5 text-xs font-bold text-white transition-colors hover:bg-pulse2">
                    View All {v.label.split(' ')[0]} Records <I n="arrow" className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ---------------- Activity Log ---------------- */
export function ActivityLog() {
  return (
    <div className="mx-auto max-w-2xl">
      <div className="relative space-y-1 pl-6 before:absolute before:bottom-3 before:left-[15px] before:top-3 before:w-px before:bg-line">
        {ACTIVITY.map((a, i) => (
          <div key={i} className="anim-pop relative py-3" style={{ animationDelay: `${i * 70}ms` }}>
            <span className="absolute -left-6 top-4 grid h-8 w-8 place-items-center rounded-full border-4 border-ink" style={{ background: `${a.color}22`, color: a.color }}>
              <I n={a.icon} className="h-3.5 w-3.5" />
            </span>
            <div className="panel flex items-center gap-3 px-4 py-3">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-snow">{a.title}</p>
                <p className="truncate text-xs text-dim">{a.meta}</p>
              </div>
              <span className="shrink-0 rounded-full bg-raise px-2.5 py-1 font-mono text-[10px] text-mist">on-chain</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------- Settings ---------------- */
function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!on)}
      className={cn('relative h-6 w-11 shrink-0 rounded-full transition-colors', on ? 'bg-mint' : 'bg-raise')}
      role="switch"
      aria-checked={on}
    >
      <span className={cn('absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all', on ? 'left-[22px]' : 'left-0.5')} />
    </button>
  );
}

export function Settings({ onLogout }: { onLogout: () => void }) {
  const toast = useToast();
  const [t2fa, setT2fa] = useState(true);
  const [notif, setNotif] = useState(true);
  const [aiAuto, setAiAuto] = useState(true);
  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div className="panel flex flex-wrap items-center gap-4 p-5">
        <Avatar name="Aman Panchal" className="h-14 w-14 text-base" />
        <div className="min-w-0 flex-1">
          <p className="text-base font-bold text-snow">Aman Panchal</p>
          <p className="text-xs text-dim">aman.panchal@example.com · Patient · P-10024</p>
        </div>
        <span className="flex items-center gap-1.5 rounded-full border border-mint/40 bg-mint/10 px-3 py-1.5 text-[11px] font-bold text-mint">
          <span className="h-1.5 w-1.5 rounded-full bg-mint" /> Wallet connected
        </span>
      </div>

      <div className="panel divide-y divide-linesoft">
        {([
          ['Two-factor authentication', 'Require a hardware key for sensitive actions', t2fa, setT2fa],
          ['Email notifications', 'Access requests, verifications and AI insights', notif, setNotif],
          ['Auto AI summaries', 'Generate a plain-language summary for every new record', aiAuto, setAiAuto],
        ] as const).map(([l, d, v, set]) => (
          <div key={l} className="flex items-center gap-4 px-5 py-4">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-snow">{l}</p>
              <p className="mt-0.5 text-xs text-dim">{d}</p>
            </div>
            <Toggle on={v} onChange={(nv) => { set(nv); toast(`${l} ${nv ? 'enabled' : 'disabled'}.`, 'info'); }} />
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-coral/35 bg-coral/10 p-5">
        <p className="text-sm font-bold text-coral">Sign out of this device</p>
        <p className="mt-1 text-xs text-mist">Your keys stay with your wallet. Signing out only locks this session.</p>
        <button onClick={onLogout} className="mt-3 flex items-center gap-2 rounded-lg bg-coral px-4 py-2 text-xs font-bold text-white transition-all hover:brightness-110">
          <I n="logout" className="h-4 w-4" /> Sign Out
        </button>
      </div>
    </div>
  );
}
