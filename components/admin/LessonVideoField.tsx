'use client';

import { useRef, useState } from 'react';
import { CheckCircle2, Film, Link2, Upload, X } from 'lucide-react';

type Props = {
  courseId: string;
  lessonId: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
};

/**
 * A lesson's video: upload a recorded class straight to video storage (R2), or paste a
 * YouTube / video link. Uploaded files are saved as "r2:<key>" and only enrolled students can play them.
 */
export default function LessonVideoField({ courseId, lessonId, value, onChange, className = '' }: Props) {
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [mode, setMode] = useState<'upload' | 'link'>(value && !value.startsWith('r2:') ? 'link' : 'upload');
  const request = useRef<XMLHttpRequest | null>(null);
  const uploaded = value.startsWith('r2:');

  const upload = async (file: File) => {
    setError('');
    try {
      const res = await fetch('/api/videos/upload-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId, lessonId, fileName: file.name, contentType: file.type, size: file.size }),
      });
      const data = await res.json();
      if (!res.ok || !data.uploadUrl) throw new Error(data.message || 'Could not start the upload.');

      setProgress(0);
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        request.current = xhr;
        xhr.open('PUT', data.uploadUrl);
        xhr.setRequestHeader('Content-Type', file.type);
        xhr.upload.onprogress = (event) => { if (event.lengthComputable) setProgress(Math.round((event.loaded / event.total) * 100)); };
        xhr.onload = () => (xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error(`Upload failed (status ${xhr.status}). Check the storage CORS settings.`)));
        xhr.onerror = () => reject(new Error('Upload failed. Check your connection and the storage CORS settings.'));
        xhr.onabort = () => reject(new Error('Upload cancelled.'));
        xhr.send(file);
      });
      onChange(data.videoRef);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed.');
    } finally {
      setProgress(null);
      request.current = null;
    }
  };

  return (
    <div className={`space-y-2 rounded-xl border border-slate-200 bg-white p-3 ${className}`}>
      <div className="flex items-center gap-1 text-[11px] font-bold">
        <button type="button" onClick={() => setMode('upload')} className={`flex items-center gap-1 rounded-full px-2.5 py-1 ${mode === 'upload' ? 'bg-[#111827] text-white' : 'text-slate-500 hover:bg-slate-100'}`}><Upload className="h-3 w-3" />Upload video</button>
        <button type="button" onClick={() => setMode('link')} className={`flex items-center gap-1 rounded-full px-2.5 py-1 ${mode === 'link' ? 'bg-[#111827] text-white' : 'text-slate-500 hover:bg-slate-100'}`}><Link2 className="h-3 w-3" />Paste link</button>
      </div>

      {mode === 'upload' ? (
        progress !== null ? (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
              <span>Uploading… {progress}%</span>
              <button type="button" onClick={() => request.current?.abort()} className="flex items-center gap-1 text-rose-600"><X className="h-3 w-3" />Cancel</button>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-[#FACC15] transition-all" style={{ width: `${progress}%` }} /></div>
            <p className="text-[11px] text-slate-400">Keep this window open until the upload finishes.</p>
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-2">
            {uploaded ? (
              <span className="flex min-w-0 items-center gap-1.5 text-xs font-semibold text-emerald-700"><CheckCircle2 className="h-4 w-4 shrink-0" /><span className="truncate">Video uploaded — {value.split('/').pop()?.replace(/^\d+-/, '')}</span></span>
            ) : (
              <span className="flex items-center gap-1.5 text-xs text-slate-500"><Film className="h-4 w-4" />No video yet</span>
            )}
            <label className="ml-auto cursor-pointer rounded-full bg-[#FACC15] px-3 py-1.5 text-xs font-bold text-[#111827] hover:bg-[#EAB308]">
              {uploaded ? 'Replace video' : 'Choose video file'}
              <input type="file" accept="video/mp4,video/webm,video/quicktime,video/x-matroska" className="hidden" onChange={(e) => { const file = e.target.files?.[0]; e.target.value = ''; if (file) void upload(file); }} />
            </label>
          </div>
        )
      ) : (
        <input value={uploaded ? '' : value} onChange={(e) => onChange(e.target.value)} placeholder="https://youtube.com/watch?v=… or a .mp4 link" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#FACC15]" />
      )}

      {error && <p className="text-xs text-rose-600">{error}</p>}
      {mode === 'upload' && progress === null && <p className="text-[11px] text-slate-400">MP4 recommended · up to 5 GB · {uploaded ? 'Press Save to keep changes.' : 'After upload, press Save.'}</p>}
    </div>
  );
}

