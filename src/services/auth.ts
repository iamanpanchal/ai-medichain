import { supabase } from './supabase';
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

export function getStoredSession(): AuthSession | null {
  return readStoredSession();
}

export function persistAuthSession(session: AuthSession): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

export function clearAuthSession(): void {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(STORAGE_KEY);
  // Trigger Supabase signOut in background
  void supabase.auth.signOut().catch(() => {});
}

export function getAuthToken(): string | null {
  return getStoredSession()?.token ?? null;
}

export function authHeaders(extra: Record<string, string> = {}): Record<string, string> {
  const token = getAuthToken();
  return {
    ...extra,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

/**
 * Format a Supabase User object into our application AuthUser shape
 */
function formatSupabaseUser(user: {
  id: string;
  email?: string;
  user_metadata?: Record<string, unknown>;
  app_metadata?: Record<string, unknown>;
}): AuthUser {
  const meta = user.user_metadata ?? {};
  const appMeta = user.app_metadata ?? {};

  const name =
    (typeof meta.name === 'string' && meta.name.trim()) ||
    (user.email ? user.email.split('@')[0] : 'User');

  const rawRole = (appMeta.role || meta.role) as string | undefined;
  const role: Role =
    rawRole === 'doctor' || rawRole === 'hospital' ? rawRole : 'patient';

  const initials =
    typeof meta.initials === 'string' && meta.initials
      ? meta.initials
      : name.charAt(0).toUpperCase();

  return {
    id: user.id,
    name,
    email: user.email ?? '',
    role,
    walletAddress: typeof meta.walletAddress === 'string' ? meta.walletAddress : undefined,
    avatar: typeof meta.avatar === 'string' ? meta.avatar : undefined,
    initials,
  };
}

/**
 * Sign in using Supabase Auth
 */
export async function loginWithEmail(email: string, password: string): Promise<AuthSession> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password,
  });

  if (error || !data.user) {
    throw new Error(error?.message ?? 'Invalid email or password');
  }

  const token = data.session?.access_token ?? '';
  const user = formatSupabaseUser(data.user);

  const session: AuthSession = {
    token,
    user,
  };

  persistAuthSession(session);
  return session;
}

/**
 * Sign up using Supabase Auth
 */
export async function registerWithEmail(
  email: string,
  password: string,
  name: string,
  role: Role
): Promise<AuthSession> {
  const { data, error } = await supabase.auth.signUp({
    email: email.trim(),
    password,
    options: {
      data: {
        name: name.trim(),
        role,
        initials: name.trim().charAt(0).toUpperCase(),
      },
    },
  });

  if (error) {
    throw new Error(error.message);
  }

  if (!data.user) {
    throw new Error('Registration failed. Please check your credentials.');
  }

  const token = data.session?.access_token ?? '';
  const user = formatSupabaseUser(data.user);

  const session: AuthSession = {
    token,
    user,
  };

  if (token) {
    persistAuthSession(session);
  }

  return session;
}

/**
 * Listen to Supabase auth state changes and keep localStorage in sync
 */
if (typeof window !== 'undefined') {
  supabase.auth.onAuthStateChange((event, sbSession) => {
    if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
      if (sbSession?.user) {
        const user = formatSupabaseUser(sbSession.user);
        persistAuthSession({
          token: sbSession.access_token,
          user,
        });
      }
    } else if (event === 'SIGNED_OUT') {
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    }
  });
}
