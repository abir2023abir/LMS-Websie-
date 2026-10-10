'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, type UserRole } from '@/context/AuthContext';
import { Loader2 } from 'lucide-react';

interface AuthGuardProps {
  children: React.ReactNode;
  allowedRole?: UserRole;
}

export default function AuthGuard({ children, allowedRole }: AuthGuardProps) {
  const { user, role, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        // Unauthenticated -> Redirect to Login
        router.replace('/login');
      } else if (allowedRole && role && role !== allowedRole) {
        // Authenticated but wrong role -> Redirect to correct role dashboard
        if (role === 'Student') {
          router.replace('/student');
        } else if (role === 'Instructor') {
          router.replace('/teacher');
        }
      }
    }
  }, [user, role, loading, allowedRole, router]);

  if (loading || !user || (allowedRole && role !== allowedRole)) {
    return (
      <div className="min-h-screen bg-dark-900 flex flex-col items-center justify-center p-4">
        <div className="glass rounded-3xl border border-white/10 p-8 flex flex-col items-center gap-4 text-center max-w-sm">
          <Loader2 className="w-10 h-10 text-primary-400 animate-spin" />
          <div>
            <h3 className="font-display font-semibold text-lg text-white">Verifying Session</h3>
            <p className="text-xs text-slate-400 mt-1">Authenticating and loading your dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
