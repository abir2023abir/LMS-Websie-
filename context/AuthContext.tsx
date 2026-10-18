'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { audit, recordSession } from '@/lib/workspace';

export type UserRole = 'Student' | 'Instructor' | 'Guardian' | 'ServiceCustomer';

export interface AuthUser {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
}

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  roles?: UserRole[];
  linkedStudentEmail?: string;
  mentorLevel?: 'lead' | 'assistant';
  avatarUrl?: string;
  createdAt?: any;
}

interface AuthContextType {
  user: AuthUser | null;
  role: UserRole | null;
  userProfile: UserProfile | null;
  loading: boolean;
  isDemoMode: boolean;
  signUpWithEmail: (
    email: string,
    password: string,
    name: string,
    role: UserRole,
    extras?: { linkedStudentEmail?: string }
  ) => Promise<void>;
  linkGuardianToStudent: (studentEmail: string) => Promise<void>;
  addRole: (role: UserRole) => Promise<void>;
  switchRole: (role: UserRole) => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  fetchUserProfile: (uid?: string) => Promise<UserProfile | null>;
}

type ServerProfile = {
  id: string;
  name: string;
  email: string;
  roles: UserRole[];
  active_role: UserRole;
  mentor_level?: 'lead' | 'assistant';
  created_at: string;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_SESSION_KEY = 'learnverse_current_session';
const LOCAL_USERS_KEY = 'learnverse_registered_users';

function avatarFor(name: string) {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=7c3aed&color=fff`;
}

function toProfile(server: ServerProfile): UserProfile {
  return {
    uid: server.id,
    name: server.name,
    email: server.email,
    role: server.active_role,
    roles: server.roles,
    mentorLevel: server.mentor_level || 'lead',
    avatarUrl: avatarFor(server.name),
    createdAt: server.created_at,
  };
}

async function call(url: string, init?: RequestInit) {
  const res = await fetch(url, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.success === false) {
    const err: any = new Error(data.message || 'Request failed.');
    err.code = data.code;
    err.status = res.status;
    throw err;
  }
  return data;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const apply = (profile: UserProfile | null) => {
    setUserProfile(profile);
    setRole(profile?.role ?? null);
    setUser(
      profile
        ? { uid: profile.uid, email: profile.email, displayName: profile.name, photoURL: profile.avatarUrl || '' }
        : null
    );
    if (typeof window === 'undefined') return;
    if (!profile) {
      localStorage.removeItem(LOCAL_SESSION_KEY);
      return;
    }
    localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify({ userProfile: profile, role: profile.role }));
    // Local features (rankings, progress) still look people up in this list.
    const users = JSON.parse(localStorage.getItem(LOCAL_USERS_KEY) || '[]') as UserProfile[];
    const rest = users.filter((item) => item.email?.toLowerCase() !== profile.email);
    localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify([...rest, profile]));
  };

  const fetchUserProfile = async (): Promise<UserProfile | null> => {
    try {
      const data = await call('/api/auth/me');
      const profile = data.profile ? toProfile(data.profile) : null;
      apply(profile);
      return profile;
    } catch {
      return null;
    }
  };

  useEffect(() => {
    try {
      const cached = JSON.parse(localStorage.getItem(LOCAL_SESSION_KEY) || 'null');
      if (cached?.userProfile?.uid) apply(cached.userProfile);
    } catch {
      localStorage.removeItem(LOCAL_SESSION_KEY);
    }
    fetchUserProfile().finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const signUpWithEmail = async (
    email: string,
    password: string,
    name: string,
    selectedRole: UserRole,
    extras?: { linkedStudentEmail?: string }
  ) => {
    setLoading(true);
    try {
      const data = await call('/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify({ email, password, name, role: selectedRole, linkedStudentEmail: extras?.linkedStudentEmail }),
      });
      apply(toProfile(data.profile));
      recordSession(data.profile.email);
    } finally {
      setLoading(false);
    }
  };

  const loginWithEmail = async (email: string, password: string) => {
    setLoading(true);
    try {
      const data = await call('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
      apply(toProfile(data.profile));
      recordSession(data.profile.email);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await call('/api/auth/logout', { method: 'POST' });
    } catch (e) {
      console.warn('Sign out error:', e);
    } finally {
      apply(null);
      setLoading(false);
    }
  };

  const linkGuardianToStudent = async (studentEmail: string) => {
    const email = studentEmail.trim().toLowerCase();
    if (!email || !userProfile) return;
    await call('/api/guardian/links', { method: 'POST', body: JSON.stringify({ studentEmail: email }) });
  };

  const changeRole = async (nextRole: UserRole, action: 'add' | 'switch') => {
    if (!userProfile) return;
    const data = await call('/api/auth/me', { method: 'PATCH', body: JSON.stringify({ role: nextRole, action }) });
    apply(toProfile(data.profile));
    if (action === 'add') audit(`Role added: ${nextRole} for ${userProfile.email}`);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        userProfile,
        loading,
        isDemoMode: false,
        signUpWithEmail,
        loginWithEmail,
        logout,
        fetchUserProfile,
        linkGuardianToStudent,
        addRole: (next) => changeRole(next, 'add'),
        switchRole: (next) => changeRole(next, 'switch'),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
