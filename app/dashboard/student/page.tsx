'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AuthGuard from '@/components/auth/AuthGuard';
import { Loader2 } from 'lucide-react';

export default function StudentDashboardRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/student');
  }, [router]);

  return (
    <AuthGuard allowedRole="Student">
      <div className="min-h-screen bg-[#0d131f] text-white flex flex-col items-center justify-center p-4">
        <div className="flex items-center gap-3 bg-[#111827] border border-white/10 px-6 py-4 rounded-2xl">
          <Loader2 className="w-5 h-5 text-[#FACC15] animate-spin" />
          <span className="text-xs font-semibold">Redirecting to Student Panel...</span>
        </div>
      </div>
    </AuthGuard>
  );
}
