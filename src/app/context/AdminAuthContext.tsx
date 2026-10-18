import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { createClient, type Session } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from '/utils/supabase/info';

const BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-cf64f9a2`;
const supabase = createClient(`https://${projectId}.supabase.co`, publicAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
});

type AdminRole = 'superadmin' | 'editor';

export interface AdminUser {
  id: string;
  email: string;
  role: AdminRole;
  displayName: string;
}

interface AdminAuthContextType {
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  currentUser: AdminUser | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  adminFetch: (path: string, options?: RequestInit) => Promise<Response>;
}

const AdminAuthContext = createContext<AdminAuthContextType>({
  token: null,
  isAuthenticated: false,
  loading: true,
  currentUser: null,
  login: async () => ({ success: false }),
  logout: async () => {},
  adminFetch: async () => new Response(),
});

async function fetchAdminUser(session: Session | null): Promise<AdminUser | null> {
  if (!session?.access_token) return null;

  const response = await fetch(`${BASE_URL}/admin/me`, {
    headers: { Authorization: `Bearer ${session.access_token}` },
  });
  if (!response.ok) return null;

  const { user } = await response.json();
  if ((user?.role !== 'superadmin' && user?.role !== 'editor') || !user?.id) return null;
  return {
    id: user.id,
    email: user.email || '',
    role: user.role,
    displayName: session.user.user_metadata?.display_name || user.email || 'Admin',
  };
}

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  const syncSession = useCallback(async (nextSession: Session | null) => {
    setSession(nextSession);
    setCurrentUser(await fetchAdminUser(nextSession));
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session: restoredSession } }) => {
      await syncSession(restoredSession);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      void syncSession(nextSession);
    });

    return () => subscription.unsubscribe();
  }, [syncSession]);

  const login = useCallback(async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data.session) {
      return { success: false, error: error?.message || 'Login failed' };
    }

    const adminUser = await fetchAdminUser(data.session);
    if (!adminUser) {
      await supabase.auth.signOut({ scope: 'local' });
      return { success: false, error: 'This account is not authorized for the admin panel.' };
    }

    setSession(data.session);
    setCurrentUser(adminUser);
    return { success: true };
  }, []);

  const logout = useCallback(async () => {
    await supabase.auth.signOut({ scope: 'local' });
    setSession(null);
    setCurrentUser(null);
  }, []);

  const adminFetch = useCallback(async (path: string, options: RequestInit = {}) => {
    if (!session?.access_token) throw new Error('Unauthorized');
    const extraHeaders = options.headers || {};
    return fetch(`${BASE_URL}${path}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        ...(typeof extraHeaders === 'object' && !Array.isArray(extraHeaders) ? extraHeaders : {}),
      },
    });
  }, [session?.access_token]);

  return (
    <AdminAuthContext.Provider value={{
      token: session?.access_token || null,
      isAuthenticated: !!currentUser,
      loading,
      currentUser,
      login,
      logout,
      adminFetch,
    }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  return useContext(AdminAuthContext);
}
