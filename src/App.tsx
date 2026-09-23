import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Theme, ToastProvider } from './components/ui';
import { Landing } from './components/Landing';
import { Login, RoleSelect } from './components/Auth';
<<<<<<< HEAD
import { AIAssistant } from './components/AIAssistant';
=======
import { ChatWidget } from './components/ChatWidget';
import { ChatPanel } from './components/ChatPanel';
>>>>>>> 2e33143 (add chatbot)
import { Shell } from './components/Shell';
import {
  ActivityLog, AccessRequests, AccessState, AISummary, Dashboard, MyRecords, Passport, RecordDetail, Settings, SharedWith, Upload,
} from './components/PatientPages';
import { AccessSent, DoctorDashboard, SearchPatients } from './components/DoctorPages';
import { ACCESS_APPROVED, ACCESS_PENDING, ACCESS_REJECTED, MedRecord, RECORDS, Role } from './data';

type Stage = 'landing' | 'auth' | 'role' | 'app';

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const [theme, setTheme] = useState<Theme>(() => localStorage.getItem('medichain-theme') === 'light' ? 'light' : 'dark');
  const [role, setRole] = useState<Role>('patient');
  const [page, setPage] = useState(() => location.pathname.startsWith('/app/') ? location.pathname.split('/')[2] || 'dashboard' : 'dashboard');
  const [records, setRecords] = useState<MedRecord[]>(RECORDS);
  const [selRecord, setSelRecord] = useState<MedRecord>(RECORDS[0]);
  const [aiId, setAiId] = useState('MR-1024');
<<<<<<< HEAD
=======
  const [chatOpen, setChatOpen] = useState(false);
  const [landingChatOpen, setLandingChatOpen] = useState(false);
>>>>>>> 2e33143 (add chatbot)
  const [access, setAccess] = useState<AccessState>({
    pending: ACCESS_PENDING,
    approved: ACCESS_APPROVED,
    rejected: ACCESS_REJECTED,
  });

  useEffect(() => {
    document.documentElement.classList.toggle('light', theme === 'light');
    localStorage.setItem('medichain-theme', theme);
  }, [theme]);

  useEffect(() => {
    if (location.pathname.startsWith('/app/')) setPage(location.pathname.split('/')[2] || 'dashboard');
  }, [location.pathname]);

  const go = (p: string) => {
    setPage(p);
    navigate(`/app/${p}`);
    window.scrollTo({ top: 0 });
  };
  const openRecord = (r: MedRecord) => {
    setSelRecord(r);
    go('record');
  };
  const openAI = (r: MedRecord) => {
    setAiId(r.id);
    go('ai');
  };
  const act = (id: string, kind: 'approved' | 'rejected') => {
    setAccess((s) => {
      const item = s.pending.find((x) => x.id === id);
      if (!item) return s;
      return {
        pending: s.pending.filter((x) => x.id !== id),
        approved: kind === 'approved' ? [item, ...s.approved] : s.approved,
        rejected: kind === 'rejected' ? [item, ...s.rejected] : s.rejected,
      };
    });
  };
  const enter = (s: Stage) => {
    navigate(s === 'landing' ? '/' : s === 'auth' ? '/login' : s === 'role' ? '/select-role' : '/app/dashboard');
    window.scrollTo({ top: 0 });
  };
  const logout = () => {
    setSelRecord(RECORDS[0]);
    setAiId('MR-1024');
    enter('landing');
  };
  const stage: Stage = location.pathname === '/login' ? 'auth' : location.pathname === '/select-role' ? 'role' : location.pathname.startsWith('/app/') ? 'app' : 'landing';

  return (
    <ToastProvider>
      <div className="noise pointer-events-none fixed inset-0 z-[80]" aria-hidden />
<<<<<<< HEAD
      {stage === 'landing' && <Landing onGetStarted={() => enter('auth')} theme={theme} onToggleTheme={() => setTheme((value) => value === 'dark' ? 'light' : 'dark')} />}
=======
      {stage === 'landing' && <><Landing onGetStarted={() => enter('auth')} theme={theme} onToggleTheme={() => setTheme((value) => value === 'dark' ? 'light' : 'dark')} />{landingChatOpen && <ChatPanel records={[]} publicMode onClose={() => setLandingChatOpen(false)} />}<ChatWidget onOpen={() => setLandingChatOpen(true)} /></>}
>>>>>>> 2e33143 (add chatbot)
      {stage === 'auth' && <Login onLogin={(r) => { setRole(r); enter('role'); }} onBack={() => enter('landing')} />}
      {stage === 'role' && (
        <RoleSelect
          onPick={(r) => {
            setRole(r);
            setPage('dashboard');
            enter('app');
          }}
          onBack={() => enter('auth')}
        />
      )}
      {stage === 'app' && (
        <Shell
          role={role}
          page={page}
          go={go}
          onLogout={logout}
          pending={access.pending.length}
          theme={theme}
          onToggleTheme={() => setTheme((value) => value === 'dark' ? 'light' : 'dark')}
<<<<<<< HEAD
          assistant={
            <AIAssistant
              role={role}
              page={page}
              records={records}
              pendingAccess={access.pending}
              approvedAccess={access.approved}
              onNavigate={go}
              onOpenRecord={openRecord}
              onOpenSummary={openAI}
            />
          }
=======
          assistant={role === 'patient' ? <>{chatOpen && <ChatPanel records={records} focusedRecord={page === 'record' ? selRecord : page === 'ai' ? records.find(record => record.id === aiId) : undefined} onClose={() => setChatOpen(false)} />}<ChatWidget onOpen={() => setChatOpen(true)} /></> : undefined}
>>>>>>> 2e33143 (add chatbot)
        >
          {role === 'patient' ? (
            <>
              {page === 'dashboard' && <Dashboard records={records} pending={access.pending.length} go={go} onOpen={openRecord} />}
              {page === 'records' && <MyRecords records={records} onOpen={openRecord} onAI={openAI} />}
              {page === 'upload' && (
                <Upload
                  onAdd={(r) => {
                    setRecords((xs) => [r, ...xs]);
                    go('records');
                  }}
                />
              )}
              {page === 'ai' && <AISummary records={records} selId={aiId} setSelId={setAiId} onOpen={openRecord} />}
              {page === 'record' && <RecordDetail rec={selRecord} onBack={() => go('records')} />}
              {page === 'access' && <AccessRequests state={access} act={act} />}
              {page === 'shared' && <SharedWith />}
              {page === 'passport' && <Passport records={records} go={go} />}
              {page === 'activity' && <ActivityLog />}
              {page === 'settings' && <Settings onLogout={logout} />}
            </>
          ) : (
            <>
              {page === 'dashboard' && <DoctorDashboard role={role} go={go} />}
              {page === 'search' && <SearchPatients />}
              {page === 'sent' && <AccessSent />}
              {page === 'activity' && <ActivityLog />}
              {page === 'settings' && <Settings onLogout={logout} />}
            </>
          )}
        </Shell>
      )}
    </ToastProvider>
  );
}
