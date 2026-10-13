import { useEffect, useState, useCallback } from 'react';
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
  MedRecord,
  Role,
} from './data';

import {
  clearAuthSession,
  getStoredSession,
  type AuthSession,
} from './services/auth';

import {
  fetchRecords,
  fetchAccessRequests,
  fetchDoctorAccessRequests,
  createRecord,
  approveAccessRequest,
  rejectAccessRequest,
  withdrawAccessRequest,
  generateAISummary,
  fetchAISummary,
  searchPatients,
  verifyRecord,
  type RecordsResponse,
  type AccessRequestsResponse,
  type DoctorAccessRequestItem,
  type AISummaryResponse,
} from './services/api';

type Stage = 'landing' | 'auth' | 'role' | 'app';

interface PatientRecord extends MedRecord {
  createdAt: string;
  updatedAt: string;
  patientId: string;
  aiSummary?: AISummaryResponse | null;
  sharedAccess?: Array<{ doctorId: string; status: string }>;
}

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
  const [records, setRecords] = useState<PatientRecord[]>([]);
  const [selRecord, setSelRecord] = useState<PatientRecord | null>(null);
  const [aiId, setAiId] = useState<string>('');
  const [recordsLoading, setRecordsLoading] = useState(false);
  const [recordsError, setRecordsError] = useState<string | null>(null);

  // Access management
  const [access, setAccess] = useState<AccessState>({
    pending: [],
    approved: [],
    rejected: [],
  });
  const [accessLoading, setAccessLoading] = useState(false);
  const [doctorAccessRequests, setDoctorAccessRequests] = useState<DoctorAccessRequestItem[]>([]);
  const [doctorAccessLoading, setDoctorAccessLoading] = useState(false);

  // AI Summary
  const [aiSummary, setAiSummary] = useState<AISummaryResponse | null>(null);
  const [aiSummaryLoading, setAiSummaryLoading] = useState(false);
  const [aiSummaryError, setAiSummaryError] = useState<string | null>(null);

  // Chat state
  const [chatOpen, setChatOpen] = useState(false);
  const [landingChatOpen, setLandingChatOpen] = useState(false);

  // Search patients (doctor)
  const [searchResults, setSearchResults] = useState<Array<{
    id: string;
    name: string;
    dob: string;
    hospital: string;
    records: string[];
    recordDetails: Array<{ id: string; title: string; source: string; date: string; type: string; region: string }>;
  }>>([]);
  const [searchLoading, setSearchLoading] = useState(false);

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

  // Load patient data when authenticated as patient
  const loadPatientData = useCallback(async () => {
    if (role !== 'patient' || !authSession) return;

    setRecordsLoading(true);
    setAccessLoading(true);
    setRecordsError(null);

    try {
      const [recordsData, accessData] = await Promise.all([
        fetchRecords(),
        fetchAccessRequests(),
      ]);

      setRecords(recordsData);
      if (recordsData.length > 0 && !selRecord) {
        setSelRecord(recordsData[0]);
        setAiId(recordsData[0].id);
      }
      setAccess({
        pending: accessData.pending.map((a) => ({
          id: a.id,
          doctor: a.doctor,
          hospital: a.hospital,
          date: a.date,
          purpose: a.purpose,
          img: a.img,
        })),
        approved: accessData.approved.map((a) => ({
          id: a.id,
          doctor: a.doctor,
          hospital: a.hospital,
          date: a.date,
          purpose: a.purpose,
          img: a.img,
        })),
        rejected: accessData.rejected.map((a) => ({
          id: a.id,
          doctor: a.doctor,
          hospital: a.hospital,
          date: a.date,
          purpose: a.purpose,
          img: a.img,
        })),
      });
    } catch (err) {
      setRecordsError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setRecordsLoading(false);
      setAccessLoading(false);
    }
  }, [role, authSession, selRecord]);

  // Load doctor data when authenticated as doctor/hospital
  const loadDoctorData = useCallback(async () => {
    if (role === 'patient' || !authSession) return;

    setDoctorAccessLoading(true);
    try {
      const accessData = await fetchDoctorAccessRequests();
      setDoctorAccessRequests(accessData);
    } catch (err) {
      console.error('Failed to load doctor access requests:', err);
    } finally {
      setDoctorAccessLoading(false);
    }
  }, [role, authSession]);

  // Load data when auth changes
  useEffect(() => {
    if (authSession) {
      if (role === 'patient') {
        loadPatientData();
      } else {
        loadDoctorData();
      }
    } else {
      setRecords([]);
      setAccess({ pending: [], approved: [], rejected: [] });
      setDoctorAccessRequests([]);
    }
  }, [authSession, role, loadPatientData, loadDoctorData]);

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
  const openRecord = (record: PatientRecord) => {
    setSelRecord(record);
    go('record');
  };

  // Open AI summary
  const openAI = async (record: PatientRecord) => {
    setAiId(record.id);
    setAiSummaryLoading(true);
    setAiSummaryError(null);
    try {
      // Try to fetch existing summary first
      const summary = await fetchAISummary(record.id);
      setAiSummary(summary);
    } catch {
      // Generate new summary
      try {
        const summary = await generateAISummary(record.id);
        setAiSummary(summary);
      } catch (err) {
        setAiSummaryError(err instanceof Error ? err.message : 'Failed to generate AI summary');
      }
    } finally {
      setAiSummaryLoading(false);
    }
    go('ai');
  };

  // Approve / reject access request (patient)
  const act = async (
    id: string,
    kind: 'approved' | 'rejected'
  ) => {
    try {
      if (kind === 'approved') {
        await approveAccessRequest(id);
      } else {
        await rejectAccessRequest(id);
      }
      // Reload access requests
      const accessData = await fetchAccessRequests();
      setAccess({
        pending: accessData.pending.map((a) => ({
          id: a.id,
          doctor: a.doctor,
          hospital: a.hospital,
          date: a.date,
          purpose: a.purpose,
          img: a.img,
        })),
        approved: accessData.approved.map((a) => ({
          id: a.id,
          doctor: a.doctor,
          hospital: a.hospital,
          date: a.date,
          purpose: a.purpose,
          img: a.img,
        })),
        rejected: accessData.rejected.map((a) => ({
          id: a.id,
          doctor: a.doctor,
          hospital: a.hospital,
          date: a.date,
          purpose: a.purpose,
          img: a.img,
        })),
      });
    } catch (err) {
      console.error('Failed to update access request:', err);
    }
  };

  // Doctor: approve/reject access request (for sent page)
  const doctorAct = async (
    id: string,
    kind: 'approved' | 'rejected'
  ) => {
    try {
      if (kind === 'approved') {
        await approveAccessRequest(id);
      } else {
        await rejectAccessRequest(id);
      }
      // Reload doctor access requests
      const accessData = await fetchDoctorAccessRequests();
      setDoctorAccessRequests(accessData);
    } catch (err) {
      console.error('Failed to update access request:', err);
    }
  };

  // Doctor: withdraw access request
  const withdrawRequest = async (id: string) => {
    try {
      await withdrawAccessRequest(id);
      const accessData = await fetchDoctorAccessRequests();
      setDoctorAccessRequests(accessData);
    } catch (err) {
      console.error('Failed to withdraw access request:', err);
    }
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
    setRecords([]);
    setSelRecord(null);
    setAiId('');
    setAccess({ pending: [], approved: [], rejected: [] });
    setDoctorAccessRequests([]);
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

  // Doctor search patients
  const handleSearchPatients = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    setSearchLoading(true);
    try {
      const results = await searchPatients(query);
      setSearchResults(results);
    } catch (err) {
      console.error('Search failed:', err);
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

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
                        ? selRecord ?? undefined
                        : page === 'ai'
                          ? records.find((record) => record.id === aiId)
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
                  loading={recordsLoading}
                  error={recordsError}
                />
              )}

              {page === 'records' && (
                <MyRecords
                  records={records}
                  onOpen={openRecord}
                  onAI={openAI}
                  loading={recordsLoading}
                  error={recordsError}
                />
              )}

              {page === 'upload' && (
                <Upload
                  onAdd={async (record) => {
                    try {
                      const created = await createRecord(record);
                      setRecords((items) => [created, ...items]);
                      go('records');
                    } catch (err) {
                      console.error('Upload failed:', err);
                    }
                  }}
                  loading={false}
                />
              )}

              {page === 'ai' && (
                <AISummary
                  records={records}
                  selId={aiId}
                  setSelId={setAiId}
                  onOpen={openRecord}
                  aiSummary={aiSummary}
                  loading={aiSummaryLoading}
                  error={aiSummaryError}
                  onGenerate={openAI}
                />
              )}

              {page === 'record' && selRecord && (
                <RecordDetail
                  rec={selRecord}
                  onBack={() => go('records')}
                  onVerify={async () => {
                    try {
                      const _result = await verifyRecord(selRecord.id);
                      // The component handles the toast
                    } catch (err) {
                      console.error('Verification failed:', err);
                    }
                  }}
                />
              )}

              {page === 'access' && (
                <AccessRequests
                  state={access}
                  act={act}
                  loading={accessLoading}
                />
              )}

              {page === 'shared' && <SharedWith records={records} />}

              {page === 'passport' && (
                <Passport
                  records={records}
                  go={go}
                />
              )}

              {page === 'activity' && <ActivityLog records={records} />}

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
                <SearchPatients
                  onSearch={handleSearchPatients}
                  results={searchResults}
                  loading={searchLoading}
                />
              )}

              {page === 'sent' && (
                <AccessSent
                  requests={doctorAccessRequests}
                  onAct={doctorAct}
                  onWithdraw={withdrawRequest}
                  loading={doctorAccessLoading}
                />
              )}

              {page === 'activity' && (
                <ActivityLog records={records} />
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