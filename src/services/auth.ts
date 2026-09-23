import type { Role } from '../data';

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
  walletAddress?: string;
  avatar?: string;
  initials?: string;
};

export type AuthSession = {
  token: string;
  user: AuthUser;
  profile?: unknown;
};

const STORAGE_KEY = 'medichain-auth';
const API_BASE = (import.meta.env.VITE_API_URL as string | undefined) ?? 'http://localhost:5000';

function readStoredSession(): AuthSession | null {
  if (typeof window === 'undefined') return null;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as Partial<AuthSession>;
    if (!parsed?.token || !parsed?.user) return null;
    return parsed as AuthSession;
  } catch {
    return null;
  }
}

export function getStoredSession() {
  return readStoredSession();
}

export function persistAuthSession(session: AuthSession) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

export function clearAuthSession() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(STORAGE_KEY);
}

export function getAuthToken() {
  return getStoredSession()?.token ?? null;
}

export function authHeaders(extra: Record<string, string> = {}) {
  const token = getAuthToken();
  return {
    ...extra,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(init.headers ?? {}),
    },
    ...init,
  });

  const payload = await response.json().catch(() => null);
  if (!response.ok || payload?.success === false) {
    throw new Error(payload?.message ?? 'Authentication request failed');
  }

  return (payload?.data ?? payload) as T;
}

export async function loginWithEmail(email: string, password: string) {
  const session = await apiRequest<AuthSession>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

  persistAuthSession(session);
  return session;
}
