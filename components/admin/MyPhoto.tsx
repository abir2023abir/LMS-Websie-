'use client';

import { useEffect, useState } from 'react';
import TeacherPhoto from './TeacherPhoto';

/** The signed-in instructor's own photo, shown in the teacher panel's top bar. */
export default function MyPhoto() {
  const [me, setMe] = useState<{ id: string; name: string; has: boolean } | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/auth/me', { cache: 'no-store' });
        const data = await res.json();
        const profile = data?.profile;
        if (!profile?.id || !(profile.roles || []).includes('Instructor')) return;
        const photo = await fetch(`/api/instructor/photo?id=${encodeURIComponent(profile.id)}`, { cache: 'no-store' });
        if (!cancelled) setMe({ id: profile.id, name: profile.name || profile.email, has: photo.ok });
      } catch { /* the photo is optional */ }
    })();
    return () => { cancelled = true; };
  }, []);

  if (!me) return null;
  return <TeacherPhoto profileId={me.id} name={me.name} hasPhoto={me.has} size={36} />;
}
