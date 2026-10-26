'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { CalendarDays, Pencil, Plus, RefreshCw, Trash2, X } from 'lucide-react';

type Programme = {
  id: string;
  title: string;
  description: string;
  event_date: string | null;
  event_time?: string | null;
  duration?: string | null;
  format?: string | null;
  status?: string | null;
  registration_url?: string | null;
  is_active: boolean;
};

type Draft = {
  id?: string;
  title: string;
  description: string;
  event_date: string;
  event_time: string;
  duration: string;
  format: string;
  status: string;
  registration_url: string;
  is_active: boolean;
};

const blankDraft: Draft = {
  title: '', description: '', event_date: '', event_time: '', duration: '', format: '',
  status: 'Registration Open', registration_url: '', is_active: true,
};

const fieldClass = 'w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100';

export default function OrientationProgrammesManager() {
  const [programmes, setProgrammes] = useState<Programme[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [draft, setDraft] = useState<Draft | null>(null);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/admin/orientation-programmes', { cache: 'no-store' });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.message || 'Could not load programmes.');
      setProgrammes(data.programmes || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load programmes.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, []);

  const save = async (event: FormEvent) => {
    event.preventDefault();
    if (!draft) return;
    setSaving(true);
    setError('');
    try {
      const response = await fetch('/api/admin/orientation-programmes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...draft,
          event_date: new Date(`${draft.event_date}T00:00:00+06:00`).toISOString(),
        }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.message || 'Could not save programme.');
      setProgrammes(data.programmes || []);
      setDraft(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save programme.');
    } finally {
      setSaving(false);
    }
  };

  const updateProgramme = async (programme: Programme, action: 'toggle' | 'delete') => {
    if (action === 'delete' && !window.confirm(`Delete “${programme.title}”?`)) return;
    setError('');
    try {
      const response = await fetch('/api/admin/orientation-programmes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(action === 'toggle'
          ? { action, id: programme.id, is_active: !programme.is_active }
          : { action, id: programme.id }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.message || 'Could not update programme.');
      setProgrammes(data.programmes || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not update programme.');
    }
  };

  const edit = (programme: Programme) => setDraft({
    id: programme.id,
    title: programme.title,
    description: programme.description,
    event_date: programme.event_date ? new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Dhaka', year: 'numeric', month: '2-digit', day: '2-digit',
    }).format(new Date(programme.event_date)) : '',
    event_time: programme.event_time || '',
    duration: programme.duration || '',
    format: programme.format || '',
    status: programme.status || 'Scheduled',
    registration_url: programme.registration_url || '',
    is_active: programme.is_active,
  });

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-bold text-slate-900">Scheduled orientation programmes</h3>
          <p className="mt-1 text-sm text-slate-500">Only active programmes with a future date appear on the public homepage.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => void load()} className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">
            <RefreshCw className="h-4 w-4" /> Refresh
          </button>
          <button onClick={() => setDraft({ ...blankDraft })} className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-[#111827] px-4 text-sm font-bold text-white hover:bg-slate-800">
            <Plus className="h-4 w-4" /> Add programme
          </button>
        </div>
      </div>

      {error && <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>}

      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">Loading programmes…</div>
      ) : programmes.length ? (
        <div className="space-y-3">
          {programmes.map((programme) => (
            <article key={programme.id} className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h4 className="font-bold text-slate-900">{programme.title}</h4>
                  <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${programme.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                    {programme.is_active ? 'Published' : 'Hidden'}
                  </span>
                </div>
                <p className="mt-1 line-clamp-2 text-sm text-slate-600">{programme.description}</p>
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                  <span className="inline-flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5" />{programme.event_date ? new Date(programme.event_date).toLocaleDateString('en-BD', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Dhaka' }) : 'No date'}</span>
                  {programme.event_time && <span>{programme.event_time}</span>}
                  {programme.status && <span>{programme.status}</span>}
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <button onClick={() => edit(programme)} aria-label={`Edit ${programme.title}`} className="inline-flex min-h-10 items-center gap-1.5 rounded-xl border border-slate-200 px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50"><Pencil className="h-3.5 w-3.5" /> Edit</button>
                <button onClick={() => void updateProgramme(programme, 'toggle')} className="min-h-10 rounded-xl border border-slate-200 px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50">{programme.is_active ? 'Hide' : 'Publish'}</button>
                <button onClick={() => void updateProgramme(programme, 'delete')} aria-label={`Delete ${programme.title}`} className="inline-flex min-h-10 min-w-10 items-center justify-center rounded-xl border border-rose-100 text-rose-600 hover:bg-rose-50"><Trash2 className="h-4 w-4" /></button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">No orientation programmes have been added yet.</div>
      )}

      {draft && (
        <div className="fixed inset-0 z-[90] flex items-start justify-center overflow-y-auto bg-slate-950/60 p-3 pt-[max(0.75rem,env(safe-area-inset-top))] sm:items-center sm:p-5" onMouseDown={(event) => { if (event.target === event.currentTarget) setDraft(null); }}>
          <form onSubmit={save} className="my-2 w-full max-w-2xl space-y-4 rounded-3xl bg-white p-5 shadow-2xl sm:my-8 sm:p-7">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900">{draft.id ? 'Edit programme' : 'Add orientation programme'}</h3>
                <p className="mt-1 text-sm text-slate-500">Provide the real schedule and registration details before publishing.</p>
              </div>
              <button type="button" onClick={() => setDraft(null)} aria-label="Close" className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl hover:bg-slate-100"><X className="h-5 w-5" /></button>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="space-y-1.5 text-xs font-semibold text-slate-600 sm:col-span-2">Programme title<input required value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} className={fieldClass} /></label>
              <label className="space-y-1.5 text-xs font-semibold text-slate-600 sm:col-span-2">Description<textarea required rows={3} value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} className={fieldClass} /></label>
              <label className="space-y-1.5 text-xs font-semibold text-slate-600">Event date<input required type="date" value={draft.event_date} onChange={(e) => setDraft({ ...draft, event_date: e.target.value })} className={fieldClass} /></label>
              <label className="space-y-1.5 text-xs font-semibold text-slate-600">Time<input value={draft.event_time} onChange={(e) => setDraft({ ...draft, event_time: e.target.value })} placeholder="e.g. 7:00 PM (Bangladesh time)" className={fieldClass} /></label>
              <label className="space-y-1.5 text-xs font-semibold text-slate-600">Duration<input value={draft.duration} onChange={(e) => setDraft({ ...draft, duration: e.target.value })} placeholder="e.g. 60 minutes" className={fieldClass} /></label>
              <label className="space-y-1.5 text-xs font-semibold text-slate-600">Format<input value={draft.format} onChange={(e) => setDraft({ ...draft, format: e.target.value })} placeholder="e.g. Live online session" className={fieldClass} /></label>
              <label className="space-y-1.5 text-xs font-semibold text-slate-600">Registration status<select value={draft.status} onChange={(e) => setDraft({ ...draft, status: e.target.value })} className={fieldClass}><option>Registration Open</option><option>Registration Closed</option><option>Full</option><option>Scheduled</option></select></label>
              <label className="space-y-1.5 text-xs font-semibold text-slate-600">Registration URL<input type="text" value={draft.registration_url} onChange={(e) => setDraft({ ...draft, registration_url: e.target.value })} placeholder="https://… or /signup" className={fieldClass} /></label>
              <label className="flex min-h-11 items-center gap-2 text-sm font-medium text-slate-700 sm:col-span-2"><input type="checkbox" checked={draft.is_active} onChange={(e) => setDraft({ ...draft, is_active: e.target.checked })} className="h-4 w-4 accent-amber-500" /> Publish on the homepage when the event is upcoming</label>
            </div>
            <div className="flex flex-col-reverse gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end">
              <button type="button" onClick={() => setDraft(null)} className="min-h-11 rounded-xl border border-slate-200 px-5 text-sm font-semibold text-slate-700">Cancel</button>
              <button disabled={saving} className="min-h-11 rounded-xl bg-emerald-700 px-5 text-sm font-bold text-white disabled:opacity-60">{saving ? 'Saving…' : 'Save programme'}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
