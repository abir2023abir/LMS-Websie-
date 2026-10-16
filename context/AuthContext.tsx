'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User } from 'firebase/auth';
import { audit, isDeactivated, recordSession } from '@/lib/workspace';
import { isFirebaseDemo } from '@/lib/utils';

async function firebase() {
  const [base, fbAuth, fbStore] = await Promise.all([
    import('@/lib/firebase'),
    import('firebase/auth'),
    import('firebase/firestore'),
  ]);
  return { ...fbStore, ...fbAuth, ...base };
}

export type UserRole = 'Student' | 'Instructor' | 'Guardian' | 'ServiceCustomer';

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  roles?: UserRole[];
  linkedStudentEmail?: string;
  avatarUrl?: string;
  createdAt?: any;
}

interface AuthContextType {
  user: User | null;
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
  addRole: (role: UserRole) => void;
  switchRole: (role: UserRole) => void;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  loginWithGoogle: (preferredRole?: UserRole) => Promise<void>;
  logout: () => Promise<void>;
  fetchUserProfile: (uid: string) => Promise<UserProfile | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_SESSION_KEY = 'learnverse_current_session';
const LOCAL_USERS_KEY = 'learnverse_registered_users';

const checkIsDemoKey = isFirebaseDemo;

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);

  // Helper to save local demo session
  const saveLocalSession = (userData: any, profileData: UserProfile, userRole: UserRole) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(
        LOCAL_SESSION_KEY,
        JSON.stringify({ user: userData, userProfile: profileData, role: userRole })
      );
    }
  };

  // Helper to clear local demo session
  const clearLocalSession = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(LOCAL_SESSION_KEY);
    }
  };

  // Fetch or create user Firestore profile
  const fetchUserProfile = async (uid: string): Promise<UserProfile | null> => {
    try {
      const fb = await firebase();
      const docSnap = await fb.getDoc(fb.doc(fb.db, 'users', uid));
      if (docSnap.exists()) {
        const data = docSnap.data() as UserProfile;
        setUserProfile(data);
        setRole(data.role || 'Student');
        return data;
      }
    } catch (err) {
      console.warn('Error fetching Firestore user document (using local state if available):', err);
    }
    return null;
  };

  useEffect(() => {
    const demo = checkIsDemoKey();
    setIsDemoMode(demo);

    // 1. Check if we have an active local storage session
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(LOCAL_SESSION_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed.user && parsed.role) {
            setUser(parsed.user);
            setRole(parsed.role);
            setUserProfile(parsed.userProfile || null);
            setLoading(false);
            return;
          }
        } catch (err) {
          console.warn('Could not restore local session:', err);
        }
      }
    }

    // 2. If not demo key, attempt Firebase Auth listener
    if (!demo) {
      let unsubscribe: (() => void) | undefined;
      let cancelled = false;
      firebase()
        .then((fb) => {
          if (cancelled) return;
          unsubscribe = fb.onAuthStateChanged(fb.auth, async (currentUser) => {
            setUser(currentUser);
            if (currentUser) {
              const profile = await fetchUserProfile(currentUser.uid);
              if (!profile) {
                const fallbackRole: UserRole = 'Student';
                setRole(fallbackRole);
              }
            } else {
              setRole(null);
              setUserProfile(null);
            }
            setLoading(false);
          });
        })
        .catch((err) => {
          console.warn('Firebase onAuthStateChanged failed, falling back to offline mode:', err);
          setLoading(false);
        });

      return () => {
        cancelled = true;
        unsubscribe?.();
      };
    } else {
      setLoading(false);
    }
  }, []);

  // Mock Email & Password Sign Up (Local storage mode)
  const mockSignUp = async (
    email: string,
    password: string,
    name: string,
    selectedRole: UserRole,
    extras?: { linkedStudentEmail?: string }
  ) => {
    const existingUsers = JSON.parse(localStorage.getItem(LOCAL_USERS_KEY) || '[]');
    const alreadyExists = existingUsers.some(
      (u: any) => u.email.toLowerCase() === email.toLowerCase()
    );

    if (alreadyExists) {
      const err: any = new Error('An account with this email already exists.');
      err.code = 'auth/email-already-in-use';
      throw err;
    }

    const newUid = `local_user_${Date.now()}`;
    const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(
      name
    )}&background=7c3aed&color=fff`;

    const profileData: UserProfile = {
      uid: newUid,
      name,
      email,
      role: selectedRole,
      roles: [selectedRole],
      linkedStudentEmail: extras?.linkedStudentEmail?.trim().toLowerCase() || undefined,
      avatarUrl,
      createdAt: new Date().toISOString(),
    };

    const mockUserObj = {
      uid: newUid,
      email,
      displayName: name,
      photoURL: avatarUrl,
    } as unknown as User;

    existingUsers.push({
      ...profileData,
      password,
    });

    localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(existingUsers));
    saveLocalSession(mockUserObj, profileData, selectedRole);

    setUser(mockUserObj);
    setUserProfile(profileData);
    setRole(selectedRole);
    setIsDemoMode(true);
  };

  // Email & Password Sign Up
  const signUpWithEmail = async (
    email: string,
    password: string,
    name: string,
    selectedRole: UserRole,
    extras?: { linkedStudentEmail?: string }
  ) => {
    setLoading(true);

    // If demo key is detected, use local mock sign up directly
    if (checkIsDemoKey()) {
      try {
        await mockSignUp(email, password, name, selectedRole, extras);
        return;
      } finally {
        setLoading(false);
      }
    }

    try {
      const fb = await firebase();
      const userCredential = await fb.createUserWithEmailAndPassword(fb.auth, email, password);
      const newUser = userCredential.user;

      await fb.updateProfile(newUser, { displayName: name });

      const profileData: UserProfile = {
        uid: newUser.uid,
        name: name,
        email: email,
        role: selectedRole,
        roles: [selectedRole],
        linkedStudentEmail: extras?.linkedStudentEmail?.trim().toLowerCase() || undefined,
        avatarUrl:
          newUser.photoURL ||
          `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=7c3aed&color=fff`,
        createdAt: fb.serverTimestamp(),
      };

      try {
        await fb.setDoc(fb.doc(fb.db, 'users', newUser.uid), profileData);
      } catch (dbErr) {
        console.warn('Firestore setDoc failed, proceeding with local profile:', dbErr);
      }

      setUserProfile(profileData);
      setRole(selectedRole);
    } catch (err: any) {
      // If Firebase key is invalid, automatically fallback to local mock mode so the user is never blocked
      if (
        err.code === 'auth/api-key-not-valid' ||
        err.code === 'auth/invalid-api-key' ||
        err.message?.includes('api-key-not-valid')
      ) {
        console.info('Firebase API key not valid. Switching to local mock signup.');
        await mockSignUp(email, password, name, selectedRole, extras);
        return;
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Mock Login
  const mockLogin = async (email: string, password: string) => {
    if (isDeactivated(email)) {
      const err: any = new Error('This account is turned off.');
      err.code = 'auth/user-disabled';
      throw err;
    }
    const existingUsers = JSON.parse(localStorage.getItem(LOCAL_USERS_KEY) || '[]');
    const foundUser = existingUsers.find(
      (u: any) => u.email.toLowerCase() === email.toLowerCase()
    );

    if (foundUser) {
      if (foundUser.password && foundUser.password !== password) {
        const err: any = new Error('Invalid email or password.');
        err.code = 'auth/wrong-password';
        throw err;
      }

      const mockUserObj = {
        uid: foundUser.uid,
        email: foundUser.email,
        displayName: foundUser.name,
        photoURL: foundUser.avatarUrl,
      } as unknown as User;

      const profileData: UserProfile = {
        uid: foundUser.uid,
        name: foundUser.name,
        email: foundUser.email,
        role: foundUser.role || 'Student',
        roles: foundUser.roles || [foundUser.role || 'Student'],
        linkedStudentEmail: foundUser.linkedStudentEmail,
        avatarUrl: foundUser.avatarUrl,
        createdAt: foundUser.createdAt,
      };

      saveLocalSession(mockUserObj, profileData, foundUser.role || 'Student');
      setUser(mockUserObj);
      setUserProfile(profileData);
      setRole(foundUser.role || 'Student');
      setIsDemoMode(true);
      recordSession(foundUser.email);
      return;
    }

    // Auto-create local user on demand if not found in demo mode
    const fallbackName = email.split('@')[0] || 'Learner';
    const newUid = `local_user_${Date.now()}`;
    const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(
      fallbackName
    )}&background=7c3aed&color=fff`;

    const profileData: UserProfile = {
      uid: newUid,
      name: fallbackName,
      email,
      role: 'Student',
      avatarUrl,
      createdAt: new Date().toISOString(),
    };

    const mockUserObj = {
      uid: newUid,
      email,
      displayName: fallbackName,
      photoURL: avatarUrl,
    } as unknown as User;

    existingUsers.push({ ...profileData, password });
    localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(existingUsers));
    saveLocalSession(mockUserObj, profileData, 'Student');

    setUser(mockUserObj);
    setUserProfile(profileData);
    setRole('Student');
    setIsDemoMode(true);
    recordSession(email);
  };

  // Email & Password Login
  const loginWithEmail = async (email: string, password: string) => {
    setLoading(true);

    if (checkIsDemoKey()) {
      try {
        await mockLogin(email, password);
        return;
      } finally {
        setLoading(false);
      }
    }

    try {
      const fb = await firebase();
      const userCredential = await fb.signInWithEmailAndPassword(fb.auth, email, password);
      await fetchUserProfile(userCredential.user.uid);
    } catch (err: any) {
      if (
        err.code === 'auth/api-key-not-valid' ||
        err.code === 'auth/invalid-api-key' ||
        err.message?.includes('api-key-not-valid')
      ) {
        console.info('Firebase API key not valid. Switching to local mock login.');
        await mockLogin(email, password);
        return;
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Mock Google Login
  const mockGoogleLogin = async (preferredRole: UserRole = 'Student') => {
    const mockGoogleUid = `google_demo_${Date.now()}`;
    const profileData: UserProfile = {
      uid: mockGoogleUid,
      name: 'Alex Learner',
      email: 'alex.learner@example.com',
      role: preferredRole,
      avatarUrl: 'https://ui-avatars.com/api/?name=Alex+Learner&background=4285F4&color=fff',
      createdAt: new Date().toISOString(),
    };

    const mockUserObj = {
      uid: mockGoogleUid,
      email: 'alex.learner@example.com',
      displayName: 'Alex Learner',
      photoURL: profileData.avatarUrl,
    } as unknown as User;

    saveLocalSession(mockUserObj, profileData, preferredRole);
    setUser(mockUserObj);
    setUserProfile(profileData);
    setRole(preferredRole);
    setIsDemoMode(true);
  };

  // Google Sign-in Option
  const loginWithGoogle = async (preferredRole: UserRole = 'Student') => {
    setLoading(true);

    if (checkIsDemoKey()) {
      try {
        await mockGoogleLogin(preferredRole);
        return;
      } finally {
        setLoading(false);
      }
    }

    try {
      const fb = await firebase();
      const result = await fb.signInWithPopup(fb.auth, fb.googleProvider);
      const gUser = result.user;

      const userDocRef = fb.doc(fb.db, 'users', gUser.uid);
      const userDocSnap = await fb.getDoc(userDocRef);

      if (!userDocSnap.exists()) {
        const profileData: UserProfile = {
          uid: gUser.uid,
          name: gUser.displayName || 'Learner',
          email: gUser.email || '',
          role: preferredRole,
          avatarUrl:
            gUser.photoURL ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(
              gUser.displayName || 'Learner'
            )}`,
          createdAt: fb.serverTimestamp(),
        };
        await fb.setDoc(userDocRef, profileData);
        setUserProfile(profileData);
        setRole(preferredRole);
      } else {
        const existingData = userDocSnap.data() as UserProfile;
        setUserProfile(existingData);
        setRole(existingData.role || 'Student');
      }
    } catch (err: any) {
      if (
        err.code === 'auth/api-key-not-valid' ||
        err.code === 'auth/invalid-api-key' ||
        err.message?.includes('api-key-not-valid')
      ) {
        console.info('Firebase API key not valid. Switching to local mock Google login.');
        await mockGoogleLogin(preferredRole);
        return;
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const logout = async () => {
    setLoading(true);
    clearLocalSession();
    try {
      if (!checkIsDemoKey()) {
        const fb = await firebase();
        await fb.signOut(fb.auth);
      }
    } catch (e) {
      console.warn('Sign out error:', e);
    } finally {
      setUser(null);
      setRole(null);
      setUserProfile(null);
      setLoading(false);
    }
  };

  const linkGuardianToStudent = async (studentEmail: string) => {
    const email = studentEmail.trim().toLowerCase();
    if (!email || !userProfile) return;
    const nextProfile: UserProfile = { ...userProfile, linkedStudentEmail: email };
    setUserProfile(nextProfile);
    if (user && role) saveLocalSession(user, nextProfile, role);
    if (typeof window !== 'undefined') {
      const existingUsers = JSON.parse(localStorage.getItem(LOCAL_USERS_KEY) || '[]');
      const updated = existingUsers.map((u: any) =>
        u.uid === nextProfile.uid ? { ...u, linkedStudentEmail: email } : u
      );
      localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(updated));
    }
    if (!checkIsDemoKey()) {
      try {
        const fb = await firebase();
        await fb.setDoc(fb.doc(fb.db, 'users', nextProfile.uid), { linkedStudentEmail: email }, { merge: true });
      } catch (err) {
        console.warn('Could not save guardian link:', err);
      }
    }
  };

  const addRole = (nextRole: UserRole) => {
    if (!userProfile || !user) return;
    const roles = Array.from(new Set([...(userProfile.roles || [userProfile.role]), nextRole]));
    const nextProfile: UserProfile = { ...userProfile, roles, role: nextRole };
    setUserProfile(nextProfile);
    setRole(nextRole);
    saveLocalSession(user, nextProfile, nextRole);
    audit(`Role added: ${nextRole} for ${userProfile.email}`);
  };

  const switchRole = (nextRole: UserRole) => {
    if (!userProfile || !user) return;
    const roles = userProfile.roles || [userProfile.role];
    if (!roles.includes(nextRole)) return;
    const nextProfile: UserProfile = { ...userProfile, role: nextRole };
    setUserProfile(nextProfile);
    setRole(nextRole);
    saveLocalSession(user, nextProfile, nextRole);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        userProfile,
        loading,
        isDemoMode,
        signUpWithEmail,
        loginWithEmail,
        loginWithGoogle,
        logout,
        fetchUserProfile,
        linkGuardianToStudent,
        addRole,
        switchRole,
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

