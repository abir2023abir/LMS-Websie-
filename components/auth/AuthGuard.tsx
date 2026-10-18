'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, type UserRole } from '@/context/AuthContext';
import { homeForRole } from '@/lib/roles';
import { Loader2 } from 'lucide-react';

interface AuthGuardProps {
  children: React.ReactNode;
  allowedRole?: UserRole;
  /** Allow access when /admin is signed in (admin_session cookie), without a user account. */
  allowAdmin?: boolean;
  loginNext?: string;
}

export default function AuthGuard({ children, allowedRole, allowAdmin, loginNext }: AuthGuardProps) {
  const { user, role, loading } = useAuth();
  const router = useRouter();
  const [adminOk, setAdminOk] = useState<boolean | null>(allowAdmin ? null : false);

  useEffect(() => {
    if (!allowAdmin) return;
    let cancelled = false;
    fetch('/api/auth/staff', { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) setAdminOk(Boolean(data.success && data.admin));
      })
      .catch(() => {
        if (!cancelled) setAdminOk(false);
      });
    return () => {
      cancelled = true;
    };
  }, [allowAdmin]);

  const roleOk = Boolean(user && (!allowedRole || role === allowedRole));
  const canAccess = roleOk || Boolean(allowAdmin && adminOk);
  const staffCheckPending = allowAdmin && adminOk === null;

  useEffect(() => {
    if (loading || staffCheckPending) return;
    if (canAccess) return;
    if (!user) {
      const next = loginNext ? `?next=${encodeURIComponent(loginNext)}` : '';
      router.replace(`/login${next}`);
      return;
    }
    if (allowedRole && role && role !== allowedRole) {
      router.replace(homeForRole(role));
    }
  }, [user, role, loading, allowedRole, router, canAccess, staffCheckPending, loginNext]);

  if (loading || staffCheckPending || !canAccess) {
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
