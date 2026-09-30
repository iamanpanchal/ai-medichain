import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { Theme, ToastProvider } from './components/ui';
import { Landing } from './components/Landing';
import { Login, RoleSelect } from './components/Auth';
import { ChatWidget } from './components/ChatWidget';
import { ChatPanel } from './components/ChatPanel';
import { Shell } from './components/Shell';

import {
  ActivityLog,
  AccessRequests,
  AccessState,
  AISummary,
  Dashboard,
  MyRecords,
  Passport,
  RecordDetail,
  Settings,
  SharedWith,
  Upload,
} from './components/PatientPages';

import {
  AccessSent,
  DoctorDashboard,
  SearchPatients,
} from './components/DoctorPages';

import {
  ACCESS_APPROVED,
  ACCESS_PENDING,
  ACCESS_REJECTED,
  MedRecord,
  RECORDS,
  Role,
} from './data';

import {
  clearAuthSession,
  getStoredSession,
  type AuthSession,
} from './services/auth';

type Stage = 'landing' | 'auth' | 'role' | 'app';

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();

  // Theme
  const [theme, setTheme] = useState<Theme>(() =>
    localStorage.getItem('medichain-theme') === 'light'
      ? 'light'
      : 'dark'
  );

  // Authentication
  const [authSession, setAuthSession] = useState<AuthSession | null>(() =>
    getStoredSession()
  );

  const [role, setRole] = useState<Role>(() =>
    getStoredSession()?.user.role ?? 'patient'
  );

  // Navigation
  const [page, setPage] = useState(() =>
    location.pathname.startsWith('/app/')
      ? location.pathname.split('/')[2] || 'dashboard'
      : 'dashboard'
  );

  // Medical records
  const [records, setRecords] = useState<MedRecord[]>(RECORDS);
  const [selRecord, setSelRecord] = useState<MedRecord>(RECORDS[0]);
  const [aiId, setAiId] = useState('MR-1024');

  // Chat state
  const [chatOpen, setChatOpen] = useState(false);
  const [landingChatOpen, setLandingChatOpen] = useState(false);

  // Access management
  const [access, setAccess] = useState<AccessState>({
    pending: ACCESS_PENDING,
    approved: ACCESS_APPROVED,
    rejected: ACCESS_REJECTED,
  });

  // Apply theme
  useEffect(() => {
    document.documentElement.classList.toggle(
      'light',
      theme === 'light'
    );

    localStorage.setItem('medichain-theme', theme);
  }, [theme]);

  // Update page from URL
  useEffect(() => {
    if (location.pathname.startsWith('/app/')) {
      setPage(location.pathname.split('/')[2] || 'dashboard');
    }
  }, [location.pathname]);

  // Restore authentication session
  useEffect(() => {
    const stored = getStoredSession();

    if (stored) {
      setAuthSession(stored);
      setRole(stored.user.role);
    }
  }, []);

  // Protect application routes
  useEffect(() => {
    if (location.pathname.startsWith('/app/') && !authSession) {
      enter('auth');
    }
  }, [authSession, location.pathname]);

  // Navigate inside application
  const go = (p: string) => {
    setPage(p);
    navigate(`/app/${p}`);
    window.scrollTo({ top: 0 });
  };

  // Open medical record
  const openRecord = (record: MedRecord) => {
    setSelRecord(record);
    go('record');
  };

  // Open AI summary
  const openAI = (record: MedRecord) => {
    setAiId(record.id);
    go('ai');
  };

  // Approve / reject access request
  const act = (
    id: string,
    kind: 'approved' | 'rejected'
  ) => {
    setAccess((state) => {
      const item = state.pending.find((x) => x.id === id);

      if (!item) {
        return state;
      }

      return {
        pending: state.pending.filter((x) => x.id !== id),

        approved:
          kind === 'approved'
            ? [item, ...state.approved]
            : state.approved,

        rejected:
          kind === 'rejected'
            ? [item, ...state.rejected]
            : state.rejected,
      };
    });
  };

  // Change application stage
  const enter = (stage: Stage) => {
    navigate(
      stage === 'landing'
        ? '/'
        : stage === 'auth'
          ? '/login'
          : stage === 'role'
            ? '/select-role'
            : '/app/dashboard'
    );

    window.scrollTo({ top: 0 });
  };

  // Logout
  const logout = () => {
    clearAuthSession();

    setAuthSession(null);
    setRole('patient');
    setSelRecord(RECORDS[0]);
    setAiId('MR-1024');
    setChatOpen(false);

    enter('landing');
  };

  // Login
  const handleLogin = (
    nextRole: Role,
    session: AuthSession
  ) => {
    setAuthSession(session);
    setRole(nextRole);

    enter(nextRole === 'patient' ? 'app' : 'role');
  };

  // Determine current application stage
  const stage: Stage =
    location.pathname === '/login'
      ? 'auth'
      : location.pathname === '/select-role'
        ? 'role'
        : location.pathname.startsWith('/app/')
          ? 'app'
          : 'landing';

  return (
    <ToastProvider>
      {/* Background noise */}
      <div
        className="noise pointer-events-none fixed inset-0 z-[80]"
        aria-hidden
      />

      {/* Landing Page */}
      {stage === 'landing' && (
        <>
          <Landing
            onGetStarted={() => enter('auth')}
            theme={theme}
            onToggleTheme={() =>
              setTheme((value) =>
                value === 'dark' ? 'light' : 'dark'
              )
            }
          />

          {landingChatOpen && (
            <ChatPanel
              publicMode
              onClose={() => setLandingChatOpen(false)}
            />
          )}

          <ChatWidget
            onOpen={() => setLandingChatOpen(true)}
          />
        </>
      )}

      {/* Login */}
      {stage === 'auth' && (
        <Login
          onLogin={(r, session) =>
            handleLogin(r, session)
          }
          onBack={() => enter('landing')}
        />
      )}

      {/* Role Selection */}
      {stage === 'role' && (
        <RoleSelect
          onPick={(selectedRole) => {
            setRole(selectedRole);
            setPage('dashboard');
            enter('app');
          }}
          onBack={() => enter('auth')}
        />
      )}

      {/* Application */}
      {stage === 'app' && (
        <Shell
          role={role}
          page={page}
          go={go}
          onLogout={logout}
          pending={access.pending.length}
          theme={theme}
          onToggleTheme={() =>
            setTheme((value) =>
              value === 'dark' ? 'light' : 'dark'
            )
          }
          assistant={
            role === 'patient' ? (
              <>
                {chatOpen && (
                  <ChatPanel
                    focusedRecord={
                      page === 'record'
                        ? selRecord
                        : page === 'ai'
                          ? records.find(
                              (record) =>
                                record.id === aiId
                            )
                          : undefined
                    }
                    onClose={() => setChatOpen(false)}
                  />
                )}

                <ChatWidget
                  onOpen={() => setChatOpen(true)}
                />
              </>
            ) : undefined
          }
        >
          {/* Patient Pages */}
          {role === 'patient' ? (
            <>
              {page === 'dashboard' && (
                <Dashboard
                  records={records}
                  pending={access.pending.length}
                  go={go}
                  onOpen={openRecord}
                />
              )}

              {page === 'records' && (
                <MyRecords
                  records={records}
                  onOpen={openRecord}
                  onAI={openAI}
                />
              )}

              {page === 'upload' && (
                <Upload
                  onAdd={(record) => {
                    setRecords((items) => [
                      record,
                      ...items,
                    ]);

                    go('records');
                  }}
                />
              )}

              {page === 'ai' && (
                <AISummary
                  records={records}
                  selId={aiId}
                  setSelId={setAiId}
                  onOpen={openRecord}
                />
              )}

              {page === 'record' && (
                <RecordDetail
                  rec={selRecord}
                  onBack={() => go('records')}
                />
              )}

              {page === 'access' && (
                <AccessRequests
                  state={access}
                  act={act}
                />
              )}

              {page === 'shared' && <SharedWith />}

              {page === 'passport' && (
                <Passport
                  records={records}
                  go={go}
                />
              )}

              {page === 'activity' && <ActivityLog />}

              {page === 'settings' && (
                <Settings onLogout={logout} />
              )}
            </>
          ) : (
            /* Doctor Pages */
            <>
              {page === 'dashboard' && (
                <DoctorDashboard
                  role={role}
                  go={go}
                />
              )}

              {page === 'search' && (
                <SearchPatients />
              )}

              {page === 'sent' && <AccessSent />}

              {page === 'activity' && (
                <ActivityLog />
              )}

              {page === 'settings' && (
                <Settings onLogout={logout} />
              )}
            </>
          )}
        </Shell>
      )}
    </ToastProvider>
  );
}


