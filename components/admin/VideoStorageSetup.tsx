'use client';

import { useState } from 'react';
import { CheckCircle2, ExternalLink, Loader2 } from 'lucide-react';
import AdminModal, { fieldClass } from './AdminModal';

const SITE = typeof window !== 'undefined' ? window.location.origin : 'https://lms-websie-app.vercel.app';

/**
 * Admin: connect Cloudflare R2 once, from the panel. The values are checked by writing a tiny
 * test file before they are saved, so a wrong key never silently breaks uploads.
 */
export default function VideoStorageSetup({ onClose, onConnected }: { onClose: () => void; onConnected: () => void }) {
  const [form, setForm] = useState({ accountId: '', accessKeyId: '', secretAccessKey: '', bucket: 'career-bridge-videos' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const cors = JSON.stringify([{ AllowedOrigins: [SITE], AllowedMethods: ['PUT', 'GET', 'HEAD'], AllowedHeaders: ['*'], ExposeHeaders: ['ETag'], MaxAgeSeconds: 3600 }], null, 2);

  const save = async () => {
    setBusy(true);
    setError('');
    try {
      const res = await fetch('/api/admin/video-storage', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) throw new Error(data.message || 'Could not connect.');
      setDone(true);
      onConnected();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not connect.');
    } finally {
      setBusy(false);
    }
  };

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [key]: e.target.value });

  return (
    <AdminModal wide title="Connect video storage (Cloudflare R2)" onClose={onClose}>
      {done ? (
        <div className="space-y-3 py-6 text-center">
          <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-600" />
          <p className="font-display text-lg font-bold">Video storage is connected</p>
          <p className="text-sm text-slate-600">You can now upload lesson videos from the course builder. This is needed only once.</p>
          <button type="button" onClick={onClose} className="rounded-full bg-[#111827] px-5 py-2.5 text-sm font-bold text-white">Done</button>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <ol className="space-y-3 text-sm text-slate-700">
            <li><span className="font-bold">1.</span> Open <a href="https://dash.cloudflare.com/sign-up" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-semibold text-sky-700 hover:underline">Cloudflare <ExternalLink className="h-3 w-3" /></a>, sign in, then <b>R2 Object Storage</b> and turn on the free plan (10 GB free).</li>
            <li><span className="font-bold">2.</span> <b>Create bucket</b> named <code className="rounded bg-slate-100 px-1">career-bridge-videos</code>. Keep it private.</li>
            <li><span className="font-bold">3.</span> In the bucket: <b>Settings → CORS policy → Edit</b>, paste this and save:
              <pre className="mt-2 max-h-40 overflow-auto rounded-xl bg-slate-900 p-3 text-[11px] leading-relaxed text-slate-100">{cors}</pre>
            </li>
            <li><span className="font-bold">4.</span> R2 page: <b>Manage R2 API Tokens → Create API token</b>, permission <b>Object Read &amp; Write</b> for this bucket. Copy the Access Key ID and the Secret.</li>
            <li><span className="font-bold">5.</span> The token page shows three values. Use <b>Access Key ID</b> (32 characters) and <b>Secret Access Key</b> (64 characters). Do <b>not</b> use &ldquo;Token value&rdquo;. The <b>Account ID</b> is on the right of the R2 page.</li>
          </ol>
          <div className="space-y-3">
            <label className="block text-xs font-bold text-slate-500">Account ID<input className={`${fieldClass} mt-1`} value={form.accountId} onChange={set('accountId')} autoComplete="off" /></label>
            <label className="block text-xs font-bold text-slate-500">Access Key ID<input className={`${fieldClass} mt-1`} value={form.accessKeyId} onChange={set('accessKeyId')} autoComplete="off" /></label>
            <label className="block text-xs font-bold text-slate-500">Secret Access Key<input type="password" className={`${fieldClass} mt-1`} value={form.secretAccessKey} onChange={set('secretAccessKey')} autoComplete="new-password" /></label>
            <label className="block text-xs font-bold text-slate-500">Bucket name<input className={`${fieldClass} mt-1`} value={form.bucket} onChange={set('bucket')} autoComplete="off" /></label>
            {error && <p className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm font-semibold text-rose-700">{error}</p>}
            <button type="button" disabled={busy} onClick={save} className="inline-flex items-center gap-2 rounded-full bg-[#111827] px-5 py-2.5 text-sm font-bold text-white disabled:opacity-60">
              {busy && <Loader2 className="h-4 w-4 animate-spin" />}{busy ? 'Checking the connection…' : 'Connect'}
            </button>
            <p className="text-[11px] leading-relaxed text-slate-500">The connection is tested with a tiny file before it is saved. The secret is stored on the server and never shown again.</p>
          </div>
        </div>
      )}
    </AdminModal>
  );
}
