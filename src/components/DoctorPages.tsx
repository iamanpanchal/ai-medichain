import { useMemo, useState } from 'react';
import { cn } from '../utils/cn';
import { Avatar, I, useToast } from './ui';
import { HOSPITALS, PATIENTS, RECORDS, Role } from '../data';

/* ---------------- Doctor Dashboard ---------------- */
export function DoctorDashboard({ role, go }: { role: Role; go: (p: string) => void }) {
  const isHospital = role === 'hospital';
  const stats = [
    { icon: 'users', color: '#2e7cf6', n: '48', l: isHospital ? 'Doctors on staff' : 'Patients Followed' },
    { icon: 'clock', color: '#ffb224', n: '3', l: 'Awaiting Review' },
    { icon: 'hospital', color: '#10e5a5', n: isHospital ? '12' : '6', l: 'Hospitals Linked' },
    { icon: 'file', color: '#8b5cf6', n: '320', l: 'Records Accessed' },
  ];
  return (
    <div className="space-y-5">
      <p className="text-sm text-mist">
        {isHospital ? 'Cross-department overview for City Hospital.' : 'Your practice at a glance, across every connected hospital.'}
      </p>
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {stats.map((s) => (
          <div key={s.l} className="panel card-hover flex items-center gap-3.5 p-4">
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

      <div className="grid gap-5 xl:grid-cols-[1.6fr_1fr]">
        <div className="panel-hi relative overflow-hidden p-6">
          <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-grape/15 blur-3xl" aria-hidden />
          <span className="inline-flex items-center gap-2 rounded-full border border-grape/40 bg-grape/15 px-3 py-1 text-[11px] font-bold text-grape">
            <I n="search" className="h-3.5 w-3.5" /> Cross-Hospital Search
          </span>
          <h2 className="mt-4 font-display text-2xl font-bold text-snow">Find any patient, any hospital.</h2>
          <p className="mt-2 max-w-md text-sm leading-relaxed text-mist">
            Search the connected network, verify records on-chain, and request time-boxed access — all from one console.
          </p>
          <button onClick={() => go('search')} className="group mt-5 inline-flex items-center gap-2 rounded-xl bg-pulse px-5 py-3 text-sm font-bold text-white shadow-[0_14px_34px_-12px_rgba(46,124,246,0.9)] transition-all hover:bg-pulse2">
            Search Patient Records <I n="arrow" className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>

        <div className="panel p-5">
          <h2 className="font-display text-base font-bold text-snow">Connected Hospitals</h2>
          <div className="mt-3 space-y-2">
            {HOSPITALS.slice(0, 5).map((h, i) => (
              <div key={h} className="flex items-center gap-3 rounded-lg border border-linesoft bg-deep/40 px-3 py-2.5">
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-mint/15 text-mint"><I n="hospital" className="h-4 w-4" /></span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-bold text-snow">{h}</p>
                  <p className="text-[11px] text-dim">{240 - i * 37} records indexed</p>
                </div>
                <span className="flex items-center gap-1 text-[10px] font-bold text-mint"><span className="h-1.5 w-1.5 rounded-full bg-mint" /> Synced</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Search Patients ---------------- */
export function SearchPatients() {
  const toast = useToast();
  const [q, setQ] = useState('');
  const [hospital, setHospital] = useState('All Hospitals');
  const [sort, setSort] = useState('Relevance');
  const [open, setOpen] = useState<string | null>(null);
  const [requested, setRequested] = useState<Record<string, boolean>>({});

  const list = useMemo(
    () =>
      PATIENTS.filter(
        (p) =>
          (hospital === 'All Hospitals' || p.hospital === hospital) &&
          (p.name + p.id + p.hospital).toLowerCase().includes(q.toLowerCase()),
      ),
    [q, hospital],
  );
  const detail = PATIENTS.find((p) => p.id === open);
  const detailRecords = detail ? RECORDS.filter((r) => detail.records.includes(r.id)) : [];

  const request = (name: string) => {
    setRequested((s) => ({ ...s, [name]: true }));
    toast(`Access request to ${name} sent — awaiting approval.`, 'ok');
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[240px] flex-1">
          <I n="search" className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-dim" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Enter patient name, ID or email…" className="field pl-9" />
          <button
            onClick={() => toast(`${list.length} patient${list.length === 1 ? '' : 's'} found across connected hospitals.`, 'info')}
            className="absolute right-1.5 top-1/2 flex -translate-y-1/2 items-center gap-1.5 rounded-lg bg-pulse px-3.5 py-1.5 text-xs font-bold text-white transition-colors hover:bg-pulse2"
          >
            Search <I n="arrow" className="h-3.5 w-3.5" />
          </button>
        </div>
        <select value={hospital} onChange={(e) => setHospital(e.target.value)} className="field w-auto">
          <option>All Hospitals</option>
          {HOSPITALS.map((h) => <option key={h}>{h}</option>)}
        </select>
        <select value={sort} onChange={(e) => setSort(e.target.value)} className="field w-auto">
          <option>Name</option>
          <option>Date</option>
          <option>Relevance</option>
        </select>
      </div>

      <div className="space-y-3">
        {list.map((p, i) => (
          <div key={p.id} className="anim-pop panel flex flex-wrap items-center gap-4 p-4" style={{ animationDelay: `${i * 60}ms` }}>
            <Avatar name={p.name} img={p.img} className="h-11 w-11" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-snow">{p.name}</p>
              <p className="truncate font-mono text-[11px] text-dim">ID: {p.id} | {p.dob}</p>
              <p className="truncate text-xs text-mist">{p.hospital} · {p.records.length} records</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setOpen(p.id)} className="rounded-lg border border-line bg-deep/60 px-4 py-2 text-xs font-bold text-snow transition-colors hover:border-pulse2/60">
                View Profile
              </button>
              <button
                onClick={() => request(p.name)}
                disabled={requested[p.name]}
                className={cn(
                  'flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-bold transition-all',
                  requested[p.name] ? 'bg-mint/15 text-mint' : 'bg-pulse text-white hover:bg-pulse2',
                )}
              >
                {requested[p.name] ? (<><I n="check" className="h-3.5 w-3.5" sw={3} /> Requested</>) : (<><I n="send" className="h-3.5 w-3.5" /> Request Access</>)}
              </button>
            </div>
          </div>
        ))}
        {list.length === 0 && (
          <div className="panel px-4 py-14 text-center">
            <I n="search" className="mx-auto h-8 w-8 text-dim" />
            <p className="mt-3 text-sm font-bold text-snow">No patients found</p>
            <p className="mt-1 text-xs text-dim">Check the spelling or try another hospital.</p>
          </div>
        )}
      </div>

      {/* profile slide-over */}
      {detail && (
        <div className="fixed inset-0 z-[70]">
          <div className="absolute inset-0 bg-ink/70 backdrop-blur-sm" onClick={() => setOpen(null)} />
          <div className="anim-pop absolute inset-y-0 right-0 flex w-full max-w-md flex-col border-l border-line bg-deep shadow-2xl">
            <div className="flex items-center gap-2 border-b border-linesoft px-5 py-4">
              <I n="back" className="h-4 w-4 rotate-180 text-dim" />
              <h3 className="font-display text-base font-bold text-snow">Patient Profile</h3>
              <button onClick={() => setOpen(null)} className="ml-auto grid h-8 w-8 place-items-center rounded-lg border border-line text-mist hover:text-snow" aria-label="Close">
                <I n="x" className="h-4 w-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5">
              <div className="flex items-center gap-4">
                <Avatar name={detail.name} img={detail.img} className="h-14 w-14 text-base" />
                <div>
                  <p className="font-display text-lg font-bold text-snow">{detail.name}</p>
                  <p className="font-mono text-xs text-dim">{detail.id} · {detail.dob}</p>
                  <p className="mt-0.5 text-xs font-semibold text-mist">{detail.hospital}</p>
                </div>
              </div>
              <div className="mt-5 flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-wider text-dim">Records ({detailRecords.length})</p>
                <span className="rounded-full bg-mint/15 px-2.5 py-0.5 text-[10px] font-bold text-mint">All verified</span>
              </div>
              <div className="mt-3 space-y-2">
                {detailRecords.map((r) => (
                  <div key={r.id} className="flex items-center gap-3 rounded-lg border border-linesoft bg-ink/50 px-3.5 py-3">
                    <span className="grid h-9 w-9 place-items-center rounded-lg bg-pulse/15 text-pulse2"><I n="file" className="h-4 w-4" /></span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-bold text-snow">{r.title}</p>
                      <p className="truncate text-[11px] text-dim">{r.source} · {r.date}</p>
                    </div>
                    <I n="shield-check" className="h-4 w-4 shrink-0 text-mint" />
                  </div>
                ))}
                {detailRecords.length === 0 && (
                  <p className="rounded-lg border border-linesoft bg-ink/50 px-4 py-6 text-center text-xs text-dim">
                    No records shared with your network yet.
                  </p>
                )}
              </div>
            </div>
            <div className="border-t border-linesoft p-4">
              <button
                onClick={() => request(detail.name)}
                disabled={requested[detail.name]}
                className={cn(
                  'flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold transition-all',
                  requested[detail.name] ? 'bg-mint/15 text-mint' : 'bg-pulse text-white hover:bg-pulse2',
                )}
              >
                {requested[detail.name] ? (<><I n="check" className="h-4 w-4" sw={3} /> Request sent</>) : (<><I n="send" className="h-4 w-4" /> Request Full Record Access</>)}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------------- Access Sent ---------------- */
export function AccessSent() {
  const toast = useToast();
  const [items, setItems] = useState([
    { id: 1, patient: 'Aman Panchal', pid: 'P-10024', hospital: 'City Hospital', scope: 'Cardiology follow-up', date: '10 Sep 2024', status: 'Pending' },
    { id: 2, patient: 'Priya Nair', pid: 'P-10188', hospital: 'City Hospital', scope: 'Lab review', date: '8 Sep 2024', status: 'Pending' },
    { id: 3, patient: 'Rohit Mehta', pid: 'P-10111', hospital: 'Medicare Hospital', scope: 'Follow-up consultation', date: '28 Aug 2024', status: 'Approved' },
    { id: 4, patient: 'Neha Sharma', pid: 'P-10045', hospital: 'LifeCare Hospital', scope: 'Annual health check', date: '19 Aug 2024', status: 'Approved' },
    { id: 5, patient: 'Arjun Rao', pid: 'P-10203', hospital: 'LifeCare Hospital', scope: 'General inquiry', date: '2 Jul 2024', status: 'Rejected' },
  ]);
  const badge: Record<string, string> = {
    Pending: 'bg-amber/15 text-amber border-amber/40',
    Approved: 'bg-mint/15 text-mint border-mint/40',
    Rejected: 'bg-coral/15 text-coral border-coral/40',
  };
  return (
    <div className="panel divide-y divide-linesoft overflow-hidden">
      {items.map((it) => (
        <div key={it.id} className="flex flex-wrap items-center gap-3 px-4 py-3.5 transition-colors hover:bg-deep/50">
          <Avatar name={it.patient} className="h-10 w-10" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-snow">{it.patient} <span className="font-mono text-[10px] font-medium text-dim">{it.pid}</span></p>
            <p className="truncate text-xs text-dim">{it.hospital} · {it.scope} · {it.date}</p>
          </div>
          <span className={cn('rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide', badge[it.status])}>{it.status}</span>
          {it.status === 'Pending' && (
            <button
              onClick={() => {
                setItems((xs) => xs.filter((x) => x.id !== it.id));
                toast(`Request to ${it.patient} withdrawn.`, 'warn');
              }}
              className="rounded-lg border border-line px-3 py-1.5 text-xs font-bold text-mist transition-colors hover:border-coral/50 hover:text-coral"
            >
              Withdraw
            </button>
          )}
        </div>
      ))}
      {items.length === 0 && (
        <div className="px-4 py-14 text-center">
          <p className="text-sm font-bold text-snow">No outstanding requests</p>
          <p className="mt-1 text-xs text-dim">Requests you send to patients will appear here.</p>
        </div>
      )}
    </div>
  );
}
