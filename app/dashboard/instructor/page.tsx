'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AuthGuard from '@/components/auth/AuthGuard';
import { Loader2 } from 'lucide-react';

export default function InstructorDashboardRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/teacher');
  }, [router]);

  return (
    <AuthGuard allowedRole="Instructor">
      <div className="min-h-screen bg-slate-50 text-[#111827] flex flex-col items-center justify-center p-4">
        <div className="flex items-center gap-3 bg-white border border-slate-200 px-6 py-4 rounded-2xl shadow-sm">
          <Loader2 className="w-5 h-5 text-amber-500 animate-spin" />
          <span className="text-xs font-semibold">Redirecting to Teacher Panel...</span>
        </div>
      </div>
    </AuthGuard>
  );
}
