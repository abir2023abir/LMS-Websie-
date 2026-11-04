'use client';

import { useRef, useState } from 'react';
import { Camera, Trash2 } from 'lucide-react';
import { shrinkImage } from '@/lib/course-edits-client';

/**
 * An instructor's round photo with upload / remove buttons.
 * Admins pass the instructor's id; instructors editing their own photo omit it.
 */
export default function TeacherPhoto({
  profileId, name, hasPhoto, onChanged, size = 44, editable = true,
}: {
  profileId: string;
  name: string;
  hasPhoto: boolean;
  onChanged?: () => void;
  size?: number;
  editable?: boolean;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [version, setVersion] = useState(0);
  const [shown, setShown] = useState(hasPhoto);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [failed, setFailed] = useState(false);

  const send = async (method: 'POST' | 'DELETE', photo?: string) => {
    const res = await fetch('/api/instructor/photo', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profileId, photo }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || data.success === false) throw new Error(data.message || 'Could not save the picture.');
  };

  const pick = async (file?: File) => {
    if (!file) return;
    setBusy(true);
    setError('');
    try {
      await send('POST', await shrinkImage(file, 320));
      setShown(true);
      setFailed(false);
      setVersion((v) => v + 1);
      onChanged?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save the picture.');
    } finally {
      setBusy(false);
      if (input.current) input.current.value = '';
    }
  };

  const remove = async () => {
    setBusy(true);
    setError('');
    try {
      await send('DELETE');
      setShown(false);
      onChanged?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not remove the picture.');
    } finally {
      setBusy(false);
    }
  };

  const showPicture = shown && !failed;
  return (
    <div className="flex items-center gap-2">
      <span
        className="flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#FACC15] font-extrabold text-[#111827]"
        style={{ width: size, height: size }}
      >
        {showPicture ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={`/api/instructor/photo?id=${encodeURIComponent(profileId)}&v=${version}`} alt={name} className="h-full w-full object-cover" onError={() => setFailed(true)} />
        ) : (
          (name.trim().charAt(0) || '?').toUpperCase()
        )}
      </span>
      {editable && (
        <span className="flex flex-col items-start gap-1">
          <input ref={input} type="file" accept="image/*" className="hidden" onChange={(e) => pick(e.target.files?.[0])} />
          <span className="flex gap-1">
            <button type="button" disabled={busy} onClick={() => input.current?.click()} className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-700 hover:bg-slate-200 disabled:opacity-50">
              <Camera className="h-3 w-3" />{busy ? 'Saving…' : showPicture ? 'Change' : 'Upload photo'}
            </button>
            {showPicture && (
              <button type="button" disabled={busy} onClick={remove} aria-label="Remove photo" className="rounded-full bg-slate-100 p-1.5 text-slate-500 hover:bg-rose-100 hover:text-rose-700 disabled:opacity-50">
                <Trash2 className="h-3 w-3" />
              </button>
            )}
          </span>
          {error && <span className="text-[11px] font-semibold text-rose-600">{error}</span>}
        </span>
      )}
    </div>
  );
}
