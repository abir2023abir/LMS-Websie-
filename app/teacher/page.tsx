'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminDashboard from '@/components/admin/AdminDashboard';

export default function InstructorPanelPage() {
  const router = useRouter();
  const [tabs, setTabs] = useState<string[] | null>(null);

  useEffect(() => {
    fetch('/api/instructor/access', { cache: 'no-store' })
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data.success) {
          router.replace('/instructor');
          return;
        }
        setTabs(data.tabs || []);
      })
      .catch(() => router.replace('/instructor'));
  }, [router]);

  if (!tabs) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#111827] border-t-transparent" />
      </div>
    );
  }

  return <AdminDashboard variant="instructor" allowedTabs={tabs} />;
}
