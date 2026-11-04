'use client';

import { useState } from 'react';

/** The instructor's photo on the course page; falls back to their first letter when there is none. */
export default function InstructorAvatar({ instructorId, name }: { instructorId?: string; name?: string }) {
  const [failed, setFailed] = useState(false);
  return (
    <div className="w-12 h-12 rounded-2xl bg-[#FACC15] text-[#111827] font-extrabold flex items-center justify-center text-lg shadow-md flex-shrink-0 overflow-hidden">
      {instructorId && !failed ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={`/api/instructor/photo?id=${encodeURIComponent(instructorId)}`} alt={name || 'Instructor'} className="h-full w-full object-cover" onError={() => setFailed(true)} />
      ) : (
        name ? name.charAt(0) : 'S'
      )}
    </div>
  );
}
