'use client';

import { useState } from 'react';
import { Eye, Loader2, RotateCcw, Shield } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { isDemoEmail } from '@/lib/demo-shared';

/**
 * Shown on every page while the admin is looking at the site as the demo student, so the
 * preview is never mistaken for a real account. "Start over" gives a fresh demo at Day 1.
 */
export default function DemoPreviewBar() {
  const { userProfile } = useAuth();
  const [busy, setBusy] = useState(false);
  if (!isDemoEmail(userProfile?.email)) return null;

  const startOver = async () => {
    if (!confirm('Start the demo student over? Its progress, answers and timeline go back to Day 1.')) return;
    setBusy(true);
    try {
      await fetch('/api/admin/demo-student', { method: 'DELETE' });
    } finally {
      window.location.href = '/api/admin/demo-student';
    }
  };

  return (
    <div role="status" className="fixed bottom-3 left-1/2 z-[60] flex w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 flex-wrap items-center gap-2 rounded-2xl bg-[#111827] px-4 py-2.5 text-xs text-white shadow-2xl shadow-black/30">
      <Eye className="h-4 w-4 shrink-0 text-[#FACC15]" />
      <p className="min-w-0 flex-1 leading-snug">
        <span className="font-bold text-[#FACC15]">Demo student preview.</span> Every course is open. Nothing here counts as a real student.
      </p>
      <button type="button" disabled={busy} onClick={startOver} className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1.5 font-bold hover:bg-white/20 disabled:opacity-60">
        {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RotateCcw className="h-3.5 w-3.5" />}Start over
      </button>
      <a href="/admin" className="inline-flex items-center gap-1 rounded-full bg-[#FACC15] px-3 py-1.5 font-bold text-[#111827] hover:bg-[#EAB308]">
        <Shield className="h-3.5 w-3.5" />Admin panel
      </a>
    </div>
  );
}
