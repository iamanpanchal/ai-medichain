import { COPY } from '../content';
import { I } from './ui';

const tabs = [
  { id: 'dashboard', label: COPY.navigation.home, icon: 'grid' },
  { id: 'records', label: COPY.navigation.records, icon: 'file' },
  { id: 'search', label: COPY.navigation.doctors, icon: 'search' },
  { id: 'settings', label: COPY.navigation.profile, icon: 'user' },
];

export function BottomTabBar({ page, onNavigate }: { page: string; onNavigate: (page: string) => void }) {
  return <nav aria-label={COPY.mobileNavigationLabel} className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-4 border-t border-linesoft bg-ink/95 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur md:hidden">
    {tabs.map((tab) => <button key={tab.id} onClick={() => onNavigate(tab.id)} className={`flex flex-col items-center gap-1 rounded-lg py-1 text-[10px] font-bold ${page === tab.id ? 'text-pulse2' : 'text-dim'}`} aria-current={page === tab.id ? 'page' : undefined}>
      <I n={tab.icon} className="h-4 w-4" />{tab.label}
    </button>)}
  </nav>;
}
