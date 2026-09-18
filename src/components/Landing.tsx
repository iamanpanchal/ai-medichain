import { useState } from 'react';
import { cn } from '../utils/cn';
import { I, Logo, QR, Reveal, SectionTag, useCountUp, useInView, useScramble, useToast } from './ui';
import { HOSPITALS, TESTIMONIALS } from '../data';
import { MobilePreview } from './MobilePreview';

const STATS = [
  { v: 10, suffix: 'K+', label: 'Patients' },
  { v: 200, suffix: '+', label: 'Hospitals' },
  { v: 500, suffix: '+', label: 'Doctors' },
  { v: 99.9, suffix: '%', label: 'Data Security', dec: 1 },
];

function Stat({ v, suffix, label, dec = 0, start, delay }: { v: number; suffix: string; label: string; dec?: number; start: boolean; delay: number }) {
  const n = useCountUp(v, start, 1500 + delay, dec);
  return (
    <div className="text-center sm:text-left">
      <p className="font-display text-3xl font-bold text-snow md:text-4xl">
        {dec ? n.toFixed(dec) : n}
        <span className="text-cy">{suffix}</span>
      </p>
      <p className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-dim">{label}</p>
    </div>
  );
}

function MiniRow({ color, icon, title, sub }: { color: string; icon: string; title: string; sub: string }) {
  return (
    <div className="flex items-center gap-2.5 rounded-lg border border-linesoft bg-ink/60 px-2.5 py-2">
      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-md" style={{ background: `${color}1c`, color }}>
        <I n={icon} className="h-3.5 w-3.5" />
      </span>
      <div className="min-w-0">
        <p className="truncate text-[11px] font-bold text-snow">{title}</p>
        <p className="truncate text-[9px] text-dim">{sub}</p>
      </div>
      <I n="chevright" className="ml-auto h-3 w-3 shrink-0 text-dim" />
    </div>
  );
}

function Device() {
  return (
    <div className="relative mx-auto w-full max-w-[520px]">
      <div className="absolute -inset-8 rounded-full bg-pulse/20 blur-3xl" aria-hidden />
      <div className="relative -rotate-2 rounded-[1.9rem] border border-[#27508c] bg-deep2/90 p-3 shadow-[0_40px_90px_-30px_rgba(2,10,26,0.95)] transition-transform duration-500 hover:rotate-0">
        <div className="overflow-hidden rounded-[1.35rem] border border-linesoft bg-ink">
          <div className="flex items-center justify-between border-b border-linesoft bg-deep/70 px-4 py-2.5">
            <span className="flex items-center gap-2">
              <span className="grid h-6 w-6 place-items-center rounded-md bg-pulse">
                <I n="pulse" sw={2.5} className="h-3.5 w-3.5 text-white" />
              </span>
              <span className="font-display text-[11px] font-bold text-snow">Your Health, Your Control</span>
            </span>
            <span className="grid h-6 w-6 place-items-center rounded-full bg-grape text-[9px] font-bold text-white">A</span>
          </div>
          <div className="space-y-2.5 p-4">
            <div className="grid grid-cols-3 gap-2.5">
              {[
                { c: '#2e7cf6', n: '12', l: 'Records' },
                { c: '#10e5a5', n: '3', l: 'Hospitals' },
                { c: '#ff5c6c', n: '2', l: 'Pending' },
              ].map((s) => (
                <div key={s.l} className="rounded-lg border border-linesoft bg-deep/60 p-2.5 text-center">
                  <p className="font-display text-lg font-bold" style={{ color: s.c }}>{s.n}</p>
                  <p className="text-[9px] font-semibold uppercase tracking-wide text-dim">{s.l}</p>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between px-1 pt-1">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-dim">Recent Records</p>
              <span className="text-[9px] font-semibold text-pulse2">View all</span>
            </div>
            <MiniRow color="#ff5c6c" icon="flask" title="Blood Test Report" sub="City Hospital · 12 Sep 2024" />
            <MiniRow color="#2e7cf6" icon="image" title="X-Ray Chest" sub="Medicare Hospital · 5 Aug 2024" />
            <MiniRow color="#10e5a5" icon="file" title="Prescription" sub="Dr. Emily Carter · 20 Jul 2024" />
            <div className="flex items-center gap-3 rounded-lg border border-mint/30 bg-mint/10 px-3 py-2.5">
              <QR seed="device-passport" cell={2.6} className="h-11 w-11 rounded" />
              <div>
                <p className="text-[10px] font-bold text-mint">Health Passport</p>
                <p className="text-[9px] text-mist">Scan to verify · 12 records</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="anim-floaty absolute -right-4 -top-6 hidden rounded-xl border border-mint/35 bg-deep2/95 px-3.5 py-2.5 shadow-[0_18px_40px_-14px_rgba(2,10,26,0.9)] backdrop-blur sm:block">
        <p className="flex items-center gap-1.5 text-[11px] font-bold text-mint"><I n="shield-check" className="h-3.5 w-3.5" /> Verified on-chain</p>
        <p className="mt-0.5 font-mono text-[9px] text-dim">Block #19,204,551</p>
      </div>
      <div className="anim-floaty2 absolute -left-6 top-24 hidden rounded-xl border border-cy/35 bg-deep2/95 px-3.5 py-2.5 shadow-[0_18px_40px_-14px_rgba(2,10,26,0.9)] backdrop-blur sm:block">
        <p className="flex items-center gap-1.5 text-[11px] font-bold text-cy"><I n="sparkles" className="h-3.5 w-3.5" /> AI Summary Ready</p>
        <p className="mt-0.5 text-[9px] text-dim">3 findings in Blood Test Report</p>
      </div>
      <div className="anim-floaty absolute -bottom-5 right-10 hidden rounded-xl border border-grape/35 bg-deep2/95 px-3.5 py-2.5 shadow-[0_18px_40px_-14px_rgba(2,10,26,0.9)] backdrop-blur sm:block" style={{ animationDelay: '1.2s' }}>
        <p className="flex items-center gap-1.5 text-[11px] font-bold text-grape"><I n="users" className="h-3.5 w-3.5" /> Dr. Sarah Wilson</p>
        <p className="mt-0.5 text-[9px] text-dim">Access approved · 10 Sep</p>
      </div>
    </div>
  );
}

const FEATURES = [
  { icon: 'shield', color: '#ff5c6c', t: 'Tamper-Proof Records', d: 'Every document is hashed and anchored on-chain. If a single bit changes, verification fails instantly.' },
  { icon: 'sparkles', color: '#22d3ee', t: 'AI-Powered Insights', d: 'Plain-language summaries of labs, scans and prescriptions — with out-of-range values flagged for you.' },
  { icon: 'clock', color: '#ffb224', t: 'Access Anywhere', d: 'One verified link, any hospital. Your medical history travels with you across cities and countries.' },
  { icon: 'qr', color: '#10e5a5', t: 'Verified QR Passport', d: 'Each record carries a scannable QR with its on-chain fingerprint — proof of authenticity in seconds.' },
  { icon: 'users', color: '#8b5cf6', t: 'Cross-Hospital Sharing', d: 'Request, grant and revoke access with granular, time-boxed permissions. Every share is logged on-chain.' },
  { icon: 'lock', color: '#5b9bff', t: 'You Own the Keys', d: 'Non-custodial encryption means only you hold the keys to your data. Not us, not the hospital.' },
];

const STEPS = [
  { n: '01', icon: 'lock', t: 'Create your wallet', d: 'Connect MetaMask or generate a fresh keypair. Your identity is yours from the first block.' },
  { n: '02', icon: 'upload', t: 'Upload & encrypt', d: 'Add reports, scans and prescriptions. Files are encrypted and their hashes anchored on-chain.' },
  { n: '03', icon: 'sparkles', t: 'Get AI insights', d: 'Every record receives a plain-language summary with findings, risks and next steps.' },
  { n: '04', icon: 'share', t: 'Share with your care team', d: 'Grant doctors time-boxed access, revoke anytime, and verify any record with a QR scan.' },
];

export function Landing({ onGetStarted }: { onGetStarted: () => void }) {
  const toast = useToast();
  const [menu, setMenu] = useState(false);
  const [sub, setSub] = useState('');
  const heroIn = useInView<HTMLDivElement>(0.25);
  const statsIn = useInView<HTMLDivElement>(0.4);
  const scrambled = useScramble('boundaries', heroIn.inView);

  const links = [
    ['Home', '#top'],
    ['Features', '#features'],
    ['How It Works', '#how'],
    ['Testimonials', '#testimonials'],
    ['Contact', '#contact'],
  ];

  return (
    <div id="top" className="relative overflow-x-clip">
      {/* NAV */}
      <header className="fixed inset-x-0 top-0 z-50 border-b border-linesoft/70 bg-ink/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5">
          <Logo />
          <nav className="hidden items-center gap-7 lg:flex">
            {links.map(([l, h]) => (
              <a key={l} href={h} className={cn('nav-link text-[13px] font-semibold text-mist transition-colors hover:text-snow', l === 'Home' && 'active text-snow')}>
                {l}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <button onClick={onGetStarted} className="hidden rounded-lg bg-pulse px-4 py-2 text-[13px] font-bold text-white shadow-[0_10px_26px_-10px_rgba(46,124,246,0.9)] transition-all hover:-translate-y-0.5 hover:bg-pulse2 sm:block">
              Get Started
            </button>
            <button onClick={() => setMenu(!menu)} className="grid h-9 w-9 place-items-center rounded-lg border border-line text-mist lg:hidden" aria-label="Menu">
              <I n={menu ? 'x' : 'grid'} className="h-4.5 w-4.5" />
            </button>
          </div>
        </div>
        {menu && (
          <nav className="border-t border-linesoft bg-ink/95 px-5 py-4 lg:hidden">
            {links.map(([l, h]) => (
              <a key={l} href={h} onClick={() => setMenu(false)} className="block py-2.5 text-sm font-semibold text-mist">
                {l}
              </a>
            ))}
            <button onClick={onGetStarted} className="mt-2 w-full rounded-lg bg-pulse py-2.5 text-sm font-bold text-white">Get Started</button>
          </nav>
        )}
      </header>

      {/* HERO */}
      <section className="bg-grid bg-grid-fade relative pt-32 pb-20 md:pt-40 md:pb-28">
        <div className="absolute left-1/2 top-24 h-px w-[min(100%,900px)] -translate-x-1/2 overflow-visible" aria-hidden>
          <svg viewBox="0 0 1000 80" className="h-20 w-full opacity-60" fill="none" preserveAspectRatio="none">
            <path d="M0 40h320l20-26 24 52 20-38 14 12h240l18-28 22 46 16-20h306" stroke="#16345c" strokeWidth="1.5" />
            <path d="M0 40h320l20-26 24 52 20-38 14 12h240l18-28 22 46 16-20h306" stroke="#2e7cf6" strokeWidth="2" className="ecg-path" />
          </svg>
        </div>
        <div ref={heroIn.ref} className="relative mx-auto grid max-w-7xl items-center gap-14 px-5 lg:grid-cols-2">
          <div>
            <Reveal>
              <span className="inline-flex items-center gap-2 rounded-full border border-mint/35 bg-mint/10 px-3.5 py-1.5 text-xs font-bold text-mint">
                <span className="relative flex h-2 w-2">
                  <span className="dot-ring absolute inline-flex h-full w-full rounded-full text-mint" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-mint" />
                </span>
                Trusted by 200+ Hospitals
              </span>
            </Reveal>
            <Reveal delay={80}>
              <h1 className="mt-5 font-display text-4xl font-bold leading-[1.08] tracking-tight text-snow sm:text-5xl lg:text-[3.6rem]">
                Health Records
                <br />
                Without <span className="bg-gradient-to-r from-cy to-pulse2 bg-clip-text text-transparent">{scrambled || '\u00A0'}</span>
              </h1>
            </Reveal>
            <Reveal delay={160}>
              <p className="mt-5 max-w-md text-[15px] leading-relaxed text-mist">
                A secure, AI-powered, blockchain-based platform for a healthier, more connected world. Your records, encrypted and verified — wherever care happens.
              </p>
            </Reveal>
            <Reveal delay={240}>
              <ul className="mt-6 grid max-w-md grid-cols-1 gap-2.5 sm:grid-cols-2">
                {['Secure & Tamper-Proof', 'AI-Powered Insights', 'Access Anywhere', 'Built for a Better Tomorrow'].map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-sm font-semibold text-snow">
                    <span className="grid h-5 w-5 shrink-0 place-items-center rounded-md bg-mint/15 text-mint"><I n="check" className="h-3 w-3" sw={3} /></span>
                    {f}
                  </li>
                ))}
              </ul>
            </Reveal>
            <Reveal delay={320}>
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <button onClick={onGetStarted} className="group inline-flex items-center gap-2.5 rounded-xl bg-pulse px-6 py-3.5 text-sm font-bold text-white shadow-[0_16px_40px_-12px_rgba(46,124,246,0.9)] transition-all hover:-translate-y-0.5 hover:bg-pulse2">
                  Get Started
                  <I n="arrow" className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </button>
                <button onClick={() => toast('Product film coming soon — stay tuned!', 'info')} className="inline-flex items-center gap-2.5 rounded-xl border border-line bg-deep/60 px-6 py-3.5 text-sm font-bold text-snow transition-colors hover:border-pulse2/50 hover:bg-deep">
                  <span className="grid h-6 w-6 place-items-center rounded-full bg-snow/10"><I n="play" className="h-3 w-3 fill-snow" /></span>
                  Watch Video
                </button>
              </div>
            </Reveal>
          </div>
          <Reveal delay={200} className="min-h-[460px]">
            <Device />
          </Reveal>
        </div>

        {/* STATS */}
        <div ref={statsIn.ref} className="mx-auto mt-20 max-w-7xl px-5">
          <div className="panel grid grid-cols-2 gap-8 px-8 py-8 md:grid-cols-4">
            {STATS.map((s, i) => (
              <Stat key={s.label} {...s} start={statsIn.inView} delay={i * 150} />
            ))}
          </div>
        </div>
      </section>

      {/* HOSPITAL MARQUEE */}
      <section className="border-y border-linesoft/60 bg-deep/30 py-5">
        <div className="mx-auto flex max-w-7xl items-center gap-6 overflow-hidden px-5">
          <span className="hidden shrink-0 text-[11px] font-bold uppercase tracking-[0.18em] text-dim sm:block">Connected networks</span>
          <div className="relative flex-1 overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_8%,black_92%,transparent)]">
            <div className="anim-marquee flex w-max gap-12">
              {[...HOSPITALS, ...HOSPITALS].map((h, i) => (
                <span key={i} className="flex items-center gap-2 whitespace-nowrap font-display text-sm font-semibold text-dim">
                  <I n="hospital" className="h-4 w-4 text-pulse2/60" /> {h}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="relative py-24">
        <div className="mx-auto max-w-7xl px-5">
          <Reveal className="max-w-xl">
            <SectionTag color="#22d3ee">Platform Features</SectionTag>
            <h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-snow md:text-4xl">One record. Every layer of trust, built in.</h2>
            <p className="mt-3 text-[15px] text-mist">MediChain fuses blockchain immutability with clinical AI so your data is verifiable, understandable and portable.</p>
          </Reveal>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f, i) => (
              <Reveal key={f.t} delay={i * 70}>
                <div className="panel card-hover group h-full p-6">
                  <span className="grid h-11 w-11 place-items-center rounded-xl transition-transform duration-300 group-hover:scale-110" style={{ background: `${f.color}18`, color: f.color, border: `1px solid ${f.color}35` }}>
                    <I n={f.icon} className="h-5.5 w-5.5" />
                  </span>
                  <h3 className="mt-4 font-display text-lg font-bold text-snow">{f.t}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-mist">{f.d}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="relative border-t border-linesoft/50 bg-deep/25 py-24">
        <div className="mx-auto max-w-7xl px-5">
          <Reveal className="max-w-xl">
            <SectionTag color="#10e5a5">How It Works</SectionTag>
            <h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-snow md:text-4xl">From upload to insight in four moves</h2>
          </Reveal>
          <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s, i) => (
              <Reveal key={s.n} delay={i * 90}>
                <div className="panel card-hover relative h-full overflow-hidden p-6">
                  <span className="absolute -right-3 -top-5 font-display text-[64px] font-bold text-snow/[0.045]">{s.n}</span>
                  <span className="grid h-11 w-11 place-items-center rounded-xl border border-pulse/40 bg-pulse/15 text-pulse2">
                    <I n={s.icon} className="h-5 w-5" />
                  </span>
                  <h3 className="mt-4 font-display text-base font-bold text-snow">{s.t}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-mist">{s.d}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section id="testimonials" className="relative py-24">
        <div className="mx-auto max-w-7xl px-5">
          <Reveal className="max-w-xl">
            <SectionTag color="#8b5cf6">Testimonials</SectionTag>
            <h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-snow md:text-4xl">Trusted at the bedside and the boardroom</h2>
          </Reveal>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {TESTIMONIALS.map((t, i) => (
              <Reveal key={t.name} delay={i * 90}>
                <figure className="panel card-hover flex h-full flex-col p-6">
                  <I n="sparkles" className="h-5 w-5 text-grape" />
                  <blockquote className="mt-4 flex-1 text-[15px] leading-relaxed text-snow/90">“{t.quote}”</blockquote>
                  <figcaption className="mt-5 flex items-center gap-3 border-t border-linesoft pt-4">
                    <span className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-pulse to-grape font-display text-xs font-bold text-white">{t.initials}</span>
                    <div>
                      <p className="text-sm font-bold text-snow">{t.name}</p>
                      <p className="text-xs text-dim">{t.role}</p>
                    </div>
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* MOBILE */}
      <section className="border-t border-linesoft/50 bg-deep/25 py-24">
        <MobilePreview />
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden py-24">
        <div className="absolute inset-0 bg-grid opacity-40" aria-hidden />
        <div className="absolute left-1/2 top-1/2 h-72 w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-pulse/25 blur-[100px]" aria-hidden />
        <Reveal className="relative mx-auto max-w-3xl px-5 text-center">
          <h2 className="font-display text-3xl font-bold tracking-tight text-snow md:text-5xl">
            One record. <span className="bg-gradient-to-r from-cy to-pulse2 bg-clip-text text-transparent">A healthier tomorrow.</span>
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-[15px] text-mist">Join 10,000+ patients and 500+ doctors already keeping their medical history on the chain.</p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <button onClick={onGetStarted} className="group inline-flex items-center gap-2.5 rounded-xl bg-pulse px-7 py-3.5 text-sm font-bold text-white shadow-[0_16px_40px_-12px_rgba(46,124,246,0.9)] transition-all hover:-translate-y-0.5 hover:bg-pulse2">
              Create your record <I n="arrow" className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
            <span className="text-xs font-semibold text-dim">Free for patients · No credit card</span>
          </div>
        </Reveal>
      </section>

      {/* FOOTER */}
      <footer id="contact" className="border-t border-linesoft/60 bg-deep/40">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 md:grid-cols-[1.4fr_1fr_1fr_1.4fr]">
          <div>
            <Logo />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-mist">Technology that unites care. Secure, portable, AI-augmented medical records for everyone.</p>
            <p className="mt-4 font-mono text-[11px] text-dim">0x8A72…C7B · verified</p>
          </div>
          <div>
            <p className="font-display text-xs font-bold uppercase tracking-[0.16em] text-dim">Platform</p>
            <ul className="mt-4 space-y-2.5 text-sm font-semibold text-mist">
              {['Features', 'How It Works', 'Health Passport', 'Mobile App'].map((l) => (
                <li key={l}><a href={`#${l.split(' ')[0].toLowerCase() === 'features' ? 'features' : l === 'How It Works' ? 'how' : l === 'Mobile App' ? 'testimonials' : 'features'}`} className="transition-colors hover:text-snow">{l}</a></li>
              ))}
            </ul>
          </div>
          <div>
            <p className="font-display text-xs font-bold uppercase tracking-[0.16em] text-dim">Contact</p>
            <ul className="mt-4 space-y-2.5 text-sm font-semibold text-mist">
              <li>hello@medichain.io</li>
              <li>+1 (415) 555-0134</li>
              <li>548 Market St, San Francisco</li>
            </ul>
          </div>
          <div>
            <p className="font-display text-xs font-bold uppercase tracking-[0.16em] text-dim">Stay in the loop</p>
            <p className="mt-4 text-sm text-mist">Product updates and on-chain milestones, monthly.</p>
            <form
              className="mt-3 flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                if (sub.trim()) {
                  toast('Subscribed! First digest lands next month.', 'ok');
                  setSub('');
                }
              }}
            >
              <input value={sub} onChange={(e) => setSub(e.target.value)} placeholder="you@example.com" className="field" type="email" required />
              <button type="submit" className="shrink-0 rounded-lg bg-pulse px-4 text-sm font-bold text-white transition-colors hover:bg-pulse2">Join</button>
            </form>
          </div>
        </div>
        <div className="border-t border-linesoft/60">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-5 py-5 text-xs text-dim">
            <p>© 2024 MediChain Labs. All records on-chain.</p>
            <p className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-mint" /> All systems operational</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
