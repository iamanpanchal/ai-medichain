import { useState, type ReactNode } from 'react';
import { cn } from '../utils/cn';
import { I, Logo, Avatar, Theme, ThemeToggle } from './ui';
import { NOTIFS, Role, USERS } from '../data';
import { BottomTabBar } from './BottomTabBar';
import { Sidebar as SharedSidebar } from './Sidebar';
import { TopNav } from './TopNav';

export interface NavItem {
  id: string;
  label: string;
  icon: string;
  section?: string;
  badge?: number;
}

export const NAV_BY_ROLE: Record<Role, NavItem[]> = {
  patient: [
    { id: 'dashboard', label: 'Dashboard', icon: 'grid' },
    { id: 'records', label: 'My Records', icon: 'file', section: 'Records' },
    { id: 'upload', label: 'Upload Record', icon: 'upload' },
    { id: 'ai', label: 'AI Summary', icon: 'sparkles' },
    { id: 'access', label: 'Access Requests', icon: 'users', section: 'Access', badge: 2 },
    { id: 'shared', label: 'Shared With', icon: 'share' },
    { id: 'passport', label: 'Health Passport', icon: 'qr' },
    { id: 'activity', label: 'Activity Log', icon: 'clock', section: 'Account' },
    { id: 'settings', label: 'Settings', icon: 'sliders' },
  ],
  doctor: [
    { id: 'dashboard', label: 'Dashboard', icon: 'grid' },
    { id: 'search', label: 'Patient Records', icon: 'search', section: 'Records' },
    { id: 'sent', label: 'Access Sent', icon: 'send', badge: 2 },
    { id: 'activity', label: 'Activity Log', icon: 'clock', section: 'Account' },
    { id: 'settings', label: 'Settings', icon: 'sliders' },
  ],
  hospital: [
    { id: 'dashboard', label: 'Dashboard', icon: 'grid' },
    { id: 'search', label: 'Patient Records', icon: 'search', section: 'Records' },
    { id: 'sent', label: 'Requests Out', icon: 'send', badge: 2 },
    { id: 'activity', label: 'Activity Log', icon: 'clock', section: 'Account' },
    { id: 'settings', label: 'Settings', icon: 'sliders' },
  ],
};

const TITLES: Record<string, [string, string]> = {
  dashboard: ['Dashboard', 'Here’s your health overview.'],
  records: ['My Records', 'Every document, encrypted and on-chain.'],
  upload: ['Upload Record', 'Encrypt a new document and anchor it on-chain.'],
  ai: ['AI Medical Record Summary', 'Get instant, easy-to-understand insights from your medical reports.'],
  access: ['Access Requests', 'Decide who can view your health data.'],
  shared: ['Shared With', 'Everyone you’ve granted access to, in one place.'],
  passport: ['Health Passport', 'Your complete clinical picture, mapped and portable.'],
  activity: ['Activity Log', 'A tamper-proof trail of everything that touches your data.'],
  settings: ['Settings', 'Manage your profile, security and preferences.'],
  search: ['Search Patient Records', 'Find and request access to patient records from any connected hospital.'],
  sent: ['Access Sent', 'Requests you’ve made and their on-chain status.'],
  record: ['Record Details', 'Verify this record against the chain.'],
};

export function Shell({ role, page, go, onLogout, pending, theme, onToggleTheme, children, assistant }: { role: Role; page: string; go: (p: string) => void; onLogout: () => void; pending: number; theme: Theme; onToggleTheme: () => void; children: ReactNode; assistant?: ReactNode }) {
  const user = USERS[role];
  const [drawer, setDrawer] = useState(false);
  const [bell, setBell] = useState(false);
  const nav = NAV_BY_ROLE[role].map((n) => (n.id === 'access' ? { ...n, badge: pending } : n));
  const [title, sub] = TITLES[page] ?? ['MediChain', ''];
  const h = new Date().getHours();
  const greet = h < 12 ? 'Good Morning' : h < 17 ? 'Good Afternoon' : 'Good Evening';

  const Sidebar = (
    <SharedSidebar>
      <div className="px-5 pb-4 pt-5">
        <Logo />
      </div>
      <nav className="flex-1 overflow-y-auto px-3 pb-4">
        {nav.map((n) => (
          <div key={n.id}>
            {n.section && <p className="mb-1.5 mt-4 px-2.5 font-display text-[10px] font-bold uppercase tracking-[0.16em] text-dim">{n.section}</p>}
            <button
              onClick={() => {
                go(n.id);
                setDrawer(false);
              }}
              className={cn(
                'group relative mb-0.5 flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-semibold transition-all',
                page === n.id ? 'bg-pulse/15 text-snow' : 'text-mist hover:bg-raise/40 hover:text-snow',
              )}
            >
              {page === n.id && <span className="absolute left-0 top-1/2 h-4 w-[3px] -translate-y-1/2 rounded-r bg-pulse2" />}
              <I n={n.icon} className="h-[17px] w-[17px]" />
              {n.label}
              {n.badge ? (
                <span className="ml-auto grid h-4.5 min-w-4.5 place-items-center rounded-full bg-coral px-1 text-[10px] font-bold text-white">{n.badge}</span>
              ) : null}
            </button>
          </div>
        ))}
      </nav>
      <div className="border-t border-linesoft p-3">
        <button onClick={onLogout} className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-semibold text-mist transition-colors hover:bg-coral/10 hover:text-coral">
          <I n="logout" className="h-4 w-4" /> Logout
        </button>
      </div>
    </SharedSidebar>
  );

  return (
    <div className="flex min-h-screen">
      <div className="fixed inset-y-0 left-0 z-40 hidden md:block">{Sidebar}</div>
      {drawer && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-ink/70 backdrop-blur-sm" onClick={() => setDrawer(false)} />
          <div className="anim-pop absolute inset-y-0 left-0">{Sidebar}</div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col md:pl-[236px]">
        <TopNav>
          <div className="flex items-center gap-3 px-4 py-3 md:px-6">
            <button onClick={() => setDrawer(true)} className="grid h-9 w-9 place-items-center rounded-lg border border-line text-mist md:hidden" aria-label="Open menu">
              <I n="grid" className="h-4.5 w-4.5" />
            </button>
            <div className="min-w-0">
              <h1 className="truncate font-display text-base font-bold text-snow md:text-lg">{page === 'dashboard' ? `${greet}, ${user.name.split(' ')[0] === 'Dr.' ? user.name : user.name.split(' ')[0]}` : title}</h1>
              <p className="hidden truncate text-xs text-dim sm:block">{sub}</p>
            </div>
            <div className="ml-auto flex items-center gap-2.5">
              <ThemeToggle theme={theme} onToggle={onToggleTheme} />
              <div className="relative">
                <button onClick={() => setBell(!bell)} className="relative grid h-9 w-9 place-items-center rounded-lg border border-line text-mist transition-colors hover:border-pulse2/60 hover:text-snow" aria-label="Notifications">
                  <I n="bell" className="h-4.5 w-4.5" />
                  <span className="absolute -right-1 -top-1 grid h-4.5 min-w-4.5 place-items-center rounded-full bg-coral px-1 text-[10px] font-bold text-white">3</span>
                </button>
                {bell && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setBell(false)} />
                    <div className="anim-pop panel-hi absolute right-0 top-11 z-20 w-[300px] overflow-hidden">
                      <p className="border-b border-linesoft px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-dim">Notifications</p>
                      {NOTIFS.map((n, i) => (
                        <div key={i} className="flex items-start gap-3 px-4 py-3 transition-colors hover:bg-raise/40">
                          <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg" style={{ background: `${n.color}1a`, color: n.color }}>
                            <I n={n.icon} className="h-3.5 w-3.5" />
                          </span>
                          <div className="min-w-0">
                            <p className="text-[13px] font-bold text-snow">{n.title}</p>
                            <p className="truncate text-[11px] text-mist">{n.meta}</p>
                          </div>
                          <span className="ml-auto shrink-0 text-[10px] font-semibold text-dim">{n.time}</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
              <div className="h-7 w-px bg-line" />
              <button onClick={() => go('settings')} className="flex items-center gap-2.5 rounded-lg py-1 pl-1 pr-2 transition-colors hover:bg-raise/40">
                <span className="relative">
                  <Avatar name={user.name} className="h-9 w-9 text-xs" />
                  <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-ink bg-mint" />
                </span>
                <span className="hidden text-left sm:block">
                  <span className="block text-[13px] font-bold leading-tight text-snow">{user.name}</span>
                  <span className="block text-[11px] text-dim">{user.sub}</span>
                </span>
              </button>
            </div>
          </div>
        </TopNav>
        <main className="flex-1 px-4 py-6 pb-22 md:px-6 md:pb-6">{children}</main>
        {assistant}
        <BottomTabBar page={page} onNavigate={go} />
      </div>
    </div>
  );
}
