import { useState } from 'react';
import { cn } from '../utils/cn';
import { I, Logo, Reveal, useToast } from './ui';
import { IMG_LOGIN, Role } from '../data';
import { COPY } from '../content';
import { loginWithEmail, registerWithEmail, type AuthSession } from '../services/auth';

const ROLE_TABS: { id: Role; label: string; color: string; icon: string }[] = [
  { id: 'patient', label: 'Patient', color: '#2e7cf6', icon: 'user' },
  { id: 'doctor', label: 'Doctor', color: '#10e5a5', icon: 'steth' },
  { id: 'hospital', label: 'Hospital', color: '#8b5cf6', icon: 'hospital' },
];

export function Login({ onLogin, onBack }: { onLogin: (r: Role, session: AuthSession) => void; onBack: () => void }) {
  const toast = useToast();
  const [isRegistering, setIsRegistering] = useState(false);
  const [name, setName] = useState('');
  const [role, setRole] = useState<Role>('patient');
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [remember, setRemember] = useState(true);
  const [busy, setBusy] = useState(false);

  const submit = async (_via: string) => {
    if (!email.trim() || pw.length < 6 || (isRegistering && !name.trim())) {
      toast('Please fill in all fields (password min 6 chars).', 'warn');
      return;
    }

    setBusy(true);
    try {
      let session;
      if (isRegistering) {
        session = await registerWithEmail(email.trim(), pw, name.trim(), role);
      } else {
        session = await loginWithEmail(email.trim(), pw);
      }
      const nextRole = session.user.role ?? role;
      toast(`Welcome ${session.user.name || session.user.email}!`, 'ok');
      onLogin(nextRole, session);
    } catch (error) {
      toast(error instanceof Error ? error.message : 'Authentication failed.', 'warn');
    } finally {
      setBusy(false);
    }
  };

  const active = ROLE_TABS.find((t) => t.id === role)!;

  return (
    <div className="bg-grid relative flex min-h-screen flex-col">
      <div className="pointer-events-none absolute -top-32 left-1/4 h-80 w-80 rounded-full bg-pulse/20 blur-[110px]" aria-hidden />
      <header className="flex items-center justify-between px-5 py-4 md:px-10">
        <button onClick={onBack} className="group"><Logo /></button>
        <button onClick={onBack} className="flex items-center gap-1.5 text-xs font-bold text-dim transition-colors hover:text-snow">
          <I n="back" className="h-3.5 w-3.5" /> Back to home
        </button>
      </header>

      <main className="grid flex-1 items-center gap-8 px-5 py-8 lg:grid-cols-2 lg:gap-14 lg:px-10">
        <Reveal>
          <div className="mx-auto w-full max-w-md">
            <h1 className="font-display text-3xl font-bold tracking-tight text-snow md:text-4xl">{isRegistering ? 'Create Account' : 'Welcome Back'}</h1>
            <p className="mt-2 text-sm text-mist">{isRegistering ? 'Join MediChain today.' : 'Access your health records securely.'}</p>

            <div className="mt-6 grid grid-cols-3 gap-2 rounded-xl border border-line bg-deep/50 p-1.5">
              {ROLE_TABS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setRole(t.id)}
                  className={cn('flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-bold transition-all', role === t.id ? 'text-white shadow-lg' : 'text-mist hover:text-snow')}
                  style={role === t.id ? { background: t.color, boxShadow: `0 8px 22px -8px ${t.color}cc` } : undefined}
                >
                  <I n={t.icon} className="h-3.5 w-3.5" /> {t.label}
                </button>
              ))}
            </div>

            <form
              className="mt-5 space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                void submit('verified');
              }}
            >
              {isRegistering && (
                <div>
                  <label className="mb-1.5 block text-xs font-bold text-mist">Full Name</label>
                  <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Doe" type="text" className="field" />
                </div>
              )}
              <div>
                <label className="mb-1.5 block text-xs font-bold text-mist">{COPY.auth.email}</label>
                <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" type="email" className="field" />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-bold text-mist">{COPY.auth.password}</label>
                <div className="relative">
                  <input value={pw} onChange={(e) => setPw(e.target.value)} placeholder="••••••••" type={showPw ? 'text' : 'password'} className="field pr-10" />
                  <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-dim transition-colors hover:text-snow" aria-label="Toggle password">
                    <I n={showPw ? 'x' : 'eye'} className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs">
                {isRegistering ? (
                  <label className="flex cursor-pointer items-center gap-2 font-semibold text-mist">
                    By signing up, you agree to our Terms.
                  </label>
                ) : (
                  <>
                    <label className="flex cursor-pointer items-center gap-2 font-semibold text-mist">
                      <span onClick={() => setRemember(!remember)} className={cn('grid h-4.5 w-4.5 place-items-center rounded border transition-colors', remember ? 'border-pulse bg-pulse text-white' : 'border-line bg-ink text-transparent')}>
                        <I n="check" className="h-3 w-3" sw={3} />
                      </span>
                      Remember me
                    </label>
                    <button type="button" onClick={() => toast('Reset link sent to your email (demo).', 'info')} className="font-bold text-pulse2 transition-colors hover:text-cy">
                      Forgot password?
                    </button>
                  </>
                )}
              </div>
              <button
                type="submit"
                disabled={busy}
                className="group flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold text-white transition-all disabled:opacity-60"
                style={{ background: active.color, boxShadow: `0 14px 34px -12px ${active.color}cc` }}
              >
                {busy ? (isRegistering ? 'Creating Account…' : 'Signing in…') : (isRegistering ? 'Create Account' : 'Sign In')}
                {!busy && <I n="arrow" className="h-4 w-4 transition-transform group-hover:translate-x-1" />}
              </button>
            </form>

            <div className="my-4 flex items-center gap-3 text-[11px] font-bold text-dim">
              <span className="h-px flex-1 bg-line" /> or <span className="h-px flex-1 bg-line" />
            </div>
            <button
              onClick={() => { void submit('connected via MetaMask'); }}
              className="flex w-full items-center justify-center gap-2.5 rounded-xl border border-line bg-deep/60 py-3 text-sm font-bold text-snow transition-all hover:border-amber/50 hover:bg-deep"
            >
              <span className="grid h-5 w-5 place-items-center rounded bg-gradient-to-br from-[#f6851b] to-[#e2761d]">
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-white"><path d="M4 5l8 4 8-4-8 9L4 5zm0 10l8-2 8 2-8 5-8-5z" opacity="0.9" /></svg>
              </span>
              {COPY.auth.metamask}
            </button>
            <p className="mt-5 text-center text-xs font-semibold text-mist">
              {isRegistering ? 'Already have an account? ' : "Don't have an account? "}
              <button onClick={() => setIsRegistering(!isRegistering)} className="font-bold text-pulse2 hover:text-cy">
                {isRegistering ? 'Sign In' : COPY.auth.signup}
              </button>
            </p>
          </div>
        </Reveal>

        <Reveal delay={120} className="hidden lg:block">
          <div className="relative h-[560px] overflow-hidden rounded-2xl border border-line">
            <img src={IMG_LOGIN} alt="Family reviewing health records on a tablet" className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-ink/10" />
            <div className="absolute bottom-0 left-0 right-0 p-8">
              <h2 className="font-display text-2xl font-bold leading-snug text-snow">Secure Healthcare<br />For Everyone.</h2>
              <ul className="mt-4 space-y-2">
                {['Patients', 'Doctors', 'Hospitals'].map((x) => (
                  <li key={x} className="flex items-center gap-2.5 text-sm font-semibold text-snow/90">
                    <span className="grid h-5 w-5 place-items-center rounded-full bg-mint/20 text-mint"><I n="check" className="h-3 w-3" sw={3} /></span>
                    {x}
                  </li>
                ))}
                <li className="flex items-center gap-2.5 text-sm font-semibold text-cy">
                  <span className="relative flex h-2.5 w-2.5"><span className="dot-ring absolute inline-flex h-full w-full rounded-full text-cy" /><span className="relative h-2.5 w-2.5 rounded-full bg-cy" /></span>
                  One Connected Ecosystem
                </li>
              </ul>
            </div>
          </div>
        </Reveal>
      </main>
    </div>
  );
}

const ROLES: { id: Role; title: string; icon: string; color: string; bullets: string[] }[] = [
  { id: 'patient', title: 'Patient', icon: 'users', color: '#2e7cf6', bullets: ['Manage your records', 'Control access', 'View health insights'] },
  { id: 'doctor', title: 'Doctor', icon: 'steth', color: '#10e5a5', bullets: ['Access patient records', 'Add diagnoses', 'Provide better care'] },
  { id: 'hospital', title: 'Hospital', icon: 'hospital', color: '#8b5cf6', bullets: ['Manage records', 'Collaborate with doctors', 'Ensure secure sharing'] },
];

export function RoleSelect({ onPick, onBack }: { onPick: (r: Role) => void; onBack: () => void }) {
  return (
    <div className="bg-grid bg-grid-fade relative flex min-h-screen flex-col">
      <div className="pointer-events-none absolute left-1/2 top-1/3 h-96 w-96 -translate-x-1/2 rounded-full bg-pulse/15 blur-[120px]" aria-hidden />
      <header className="flex items-center justify-between px-5 py-4 md:px-10">
        <Logo />
        <button onClick={onBack} className="flex items-center gap-1.5 text-xs font-bold text-dim transition-colors hover:text-snow">
          <I n="back" className="h-3.5 w-3.5" /> Back
        </button>
      </header>
      <main className="flex flex-1 flex-col items-center justify-center px-5 py-10">
        <Reveal className="text-center">
          <h1 className="font-display text-3xl font-bold tracking-tight text-snow md:text-4xl">Choose Your Role</h1>
          <p className="mt-2 text-sm text-mist">Different roles. A healthier tomorrow together.</p>
        </Reveal>
        <div className="mt-10 grid w-full max-w-4xl gap-5 md:grid-cols-3">
          {ROLES.map((r, i) => (
            <Reveal key={r.id} delay={i * 100}>
              <button
                onClick={() => onPick(r.id)}
                className="panel card-hover group relative flex h-full w-full flex-col items-center p-8 text-center"
                style={{ borderColor: `${r.color}40` }}
              >
                <span
                  className="grid h-16 w-16 place-items-center rounded-2xl transition-transform duration-300 group-hover:scale-110"
                  style={{ background: `${r.color}1a`, color: r.color, border: `1px solid ${r.color}45`, boxShadow: `0 14px 34px -14px ${r.color}90` }}
                >
                  <I n={r.icon} className="h-7 w-7" />
                </span>
                <h2 className="mt-5 font-display text-xl font-bold text-snow">{r.title}</h2>
                <ul className="mt-4 space-y-2 text-[13px] font-semibold text-mist">
                  {r.bullets.map((b) => (
                    <li key={b} className="flex items-center justify-center gap-2">
                      <span className="text-[10px]" style={{ color: r.color }}>+</span> {b}
                    </li>
                  ))}
                </ul>
                <span
                  className="absolute bottom-6 grid h-10 w-10 place-items-center rounded-full text-white transition-all duration-300 group-hover:translate-x-1"
                  style={{ background: r.color, boxShadow: `0 10px 24px -8px ${r.color}cc` }}
                >
                  <I n="arrow" className="h-4 w-4" />
                </span>
              </button>
            </Reveal>
          ))}
        </div>
        <Reveal delay={300}>
          <p className="mt-10 font-display text-sm italic text-dim">“Technology that unites care.”</p>
        </Reveal>
      </main>
    </div>
  );
}
