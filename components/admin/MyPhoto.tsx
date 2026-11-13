'use client';

import { useEffect, useState } from 'react';
import TeacherPhoto from './TeacherPhoto';

/** The signed-in instructor's own photo, shown in the teacher panel's top bar. */
export default function MyPhoto() {
  const [me, setMe] = useState<{ id: string; name: string; has: boolean; line: string } | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/auth/me', { cache: 'no-store' });
        const data = await res.json();
        const profile = data?.profile;
        if (!profile?.id || !(profile.roles || []).includes('Instructor')) return;
        const [photo, cardRes] = await Promise.all([
          fetch(`/api/instructor/photo?id=${encodeURIComponent(profile.id)}`, { cache: 'no-store' }),
          fetch('/api/instructor/card', { cache: 'no-store' }),
        ]);
        const cardData = await cardRes.json().catch(() => ({}));
        const card = cardData.card || {};
        const line = [card.degree, card.university].filter(Boolean).join(' · ');
        if (!cancelled) setMe({ id: profile.id, name: profile.name || profile.email, has: photo.ok, line });
      } catch { /* the photo is optional */ }
    })();
    return () => { cancelled = true; };
  }, []);

  if (!me) return null;
  return (
    <span className="flex items-center gap-2">
      <TeacherPhoto profileId={me.id} name={me.name} hasPhoto={me.has} size={36} />
      <span className="hidden min-w-0 sm:block">
        <span className="block max-w-[10rem] truncate text-xs font-bold text-slate-800">{me.name}</span>
        {me.line && <span className="block max-w-[10rem] truncate text-[10px] font-semibold text-slate-500">{me.line}</span>}
      </span>
    </span>
  );
}
