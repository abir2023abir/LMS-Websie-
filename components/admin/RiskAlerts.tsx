'use client';

import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { AlertTriangle, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';

type Attempt = { n: number; percent: number; passed: boolean; at: string };
type Action = { id: string; action: string; note: string; extra: number; byName: string; at: string };
type Alert = {
  key: string; kind: 'quiz' | 'exam'; assessmentTitle: string; courseTitle: string; lessonTitle: string;
  studentName: string; studentEmail: string; failed: number; passMark: number; attempts: Attempt[];
  status: 'open' | 'resolved'; resolvedAt: string; limit: number; extra: number; restricted: boolean; actions: Action[];
};
type ActionDef = { key: string; label: string; hint: string };
const when = (iso: string) => new Date(iso).toLocaleString('en-BD', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' });

/** Admin → Progress: students who keep failing a quiz or exam, and what was done about it. */
export default function RiskAlerts() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [defs, setDefs] = useState<ActionDef[]>([]);
  const [threshold, setThreshold] = useState(3);
  const [loaded, setLoaded] = useState(false);
  const [show, setShow] = useState<'open' | 'resolved'>('open');
  const [openKey, setOpenKey] = useState('');
  const [type, setType] = useState('review');
  const [note, setNote] = useState('');
  const [extra, setExtra] = useState(1);
  const [busy, setBusy] = useState(false);

  const apply = (data: { alerts?: Alert[]; actions?: ActionDef[]; threshold?: number }) => {
    setAlerts(data.alerts || []); setDefs(data.actions || []); setThreshold(data.threshold || 3); setLoaded(true);
  };
  const load = useCallback(async () => {
    const res = await fetch('/api/admin/risk-alerts', { cache: 'no-store' });
    if (res.ok) apply(await res.json());
  }, []);
  useEffect(() => { void load(); }, [load]);

  const send = async (payload: Record<string, unknown>, done: string) => {
    setBusy(true);
    const res = await fetch('/api/admin/risk-alerts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok || !data.success) { toast.error(data.message || 'Could not save'); return false; }
    apply(data); toast.success(done); return true;
  };

  const shown = alerts.filter((item) => item.status === show);
  const openCount = alerts.filter((item) => item.status === 'open').length;

  return (
    <section className="space-y-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 font-display text-lg font-extrabold text-[#111827]"><AlertTriangle className="h-5 w-5 text-amber-600" />Risk alerts</h2>
          <p className="text-sm text-slate-500">Students who failed the same quiz or exam {threshold} or more times. A failed student is never removed automatically. You decide what to do.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-slate-600">
          <label className="flex items-center gap-1.5">Alert after
            <input type="number" min={1} max={20} value={threshold} onChange={(e) => setThreshold(Math.max(1, Number(e.target.value) || 1))} className="w-14 rounded-lg border border-slate-200 px-2 py-1.5" /> failed attempts
          </label>
          <button type="button" disabled={busy} onClick={() => send({ action: 'threshold', threshold }, 'Threshold saved')} className="rounded-full bg-slate-100 px-3 py-1.5 hover:bg-slate-200">Save</button>
        </div>
      </div>

      <div className="flex gap-2">
        {(['open', 'resolved'] as const).map((key) => (
          <button key={key} type="button" onClick={() => setShow(key)} className={`rounded-full px-4 py-1.5 text-xs font-bold ${show === key ? 'bg-[#111827] text-white' : 'bg-slate-100 text-slate-600'}`}>
            {key === 'open' ? `Open (${openCount})` : `Resolved (${alerts.length - openCount})`}
          </button>
        ))}
      </div>

      {!loaded ? <div className="h-16 animate-pulse rounded-2xl bg-slate-50" /> : shown.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-slate-200 py-8 text-center text-sm text-slate-500">{show === 'open' ? 'No student is at risk right now.' : 'Nothing resolved yet.'}</p>
      ) : shown.map((alert) => {
        const expanded = openKey === alert.key;
        return (
          <div key={alert.key} className={`rounded-2xl border ${alert.status === 'open' ? 'border-amber-200' : 'border-emerald-200'}`}>
            <button type="button" onClick={() => setOpenKey(expanded ? '' : alert.key)} className="flex w-full flex-wrap items-center justify-between gap-2 p-4 text-left">
              <span className="min-w-0">
                <span className="block font-bold text-[#111827]">{alert.studentName || alert.studentEmail}</span>
                <span className="block text-xs text-slate-500">{alert.kind === 'quiz' ? 'Quiz' : 'Exam'}: {alert.assessmentTitle} · {alert.courseTitle}{alert.lessonTitle ? ` · ${alert.lessonTitle}` : ''}</span>
              </span>
              <span className="flex items-center gap-2 text-xs font-bold">
                <span className={`rounded-full px-2.5 py-0.5 ${alert.status === 'open' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>{alert.status === 'open' ? `${alert.failed} failed` : 'Resolved'}</span>
                {alert.restricted && <span className="rounded-full bg-rose-100 px-2.5 py-0.5 text-rose-800">Exams paused</span>}
                {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </span>
            </button>

            {expanded && (
              <div className="space-y-4 border-t border-slate-100 p-4 text-sm">
                <div>
                  <p className="mb-1 text-xs font-bold uppercase tracking-wide text-slate-500">Attempt history (pass mark {alert.passMark}%)</p>
                  <div className="flex flex-wrap gap-2">
                    {alert.attempts.map((attempt) => (
                      <span key={attempt.n} title={when(attempt.at)} className={`rounded-lg border px-2.5 py-1 text-xs font-bold ${attempt.passed ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-rose-200 bg-rose-50 text-rose-800'}`}>#{attempt.n} · {attempt.percent}% · {attempt.passed ? 'Passed' : 'Failed'}</span>
                    ))}
                  </div>
                  <p className="mt-1 text-xs text-slate-500">{alert.limit ? `Attempt limit ${alert.limit}${alert.extra ? ` (including ${alert.extra} extra)` : ''}` : 'No attempt limit'}{alert.status === 'resolved' && alert.resolvedAt ? ` · passed on ${when(alert.resolvedAt)}` : ''}</p>
                </div>

                {alert.status === 'open' && (
                  <div className="space-y-2 rounded-xl bg-slate-50 p-3">
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Take action</p>
                    <div className="flex flex-wrap gap-2">
                      <select value={type} onChange={(e) => setType(e.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm">
                        {defs.filter((item) => item.key !== 'lift-restriction' || alert.restricted).map((item) => <option key={item.key} value={item.key}>{item.label}</option>)}
                      </select>
                      {type === 'extra-attempts' && <input type="number" min={1} max={10} value={extra} onChange={(e) => setExtra(Math.max(1, Number(e.target.value) || 1))} className="w-20 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm" aria-label="Extra attempts" />}
                      <input value={note} onChange={(e) => setNote(e.target.value)} placeholder={defs.find((item) => item.key === type)?.hint || 'Note'} className="min-w-[200px] flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm" />
                      <button type="button" disabled={busy} onClick={async () => { if (await send({ action: 'act', alertKey: alert.key, type, note, extra }, 'Action saved')) setNote(''); }} className="rounded-xl bg-[#111827] px-4 py-2 text-sm font-extrabold text-white disabled:opacity-50">Save action</button>
                    </div>
                  </div>
                )}

                <div>
                  <p className="mb-1 text-xs font-bold uppercase tracking-wide text-slate-500">Action history</p>
                  {alert.actions.length === 0 ? <p className="text-xs text-slate-500">No action taken yet.</p> : (
                    <ul className="space-y-1.5">
                      {alert.actions.map((item) => (
                        <li key={item.id} className="flex items-start gap-2 text-xs text-slate-700"><CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" /><span><b>{defs.find((d) => d.key === item.action)?.label || item.action}{item.extra ? ` (+${item.extra})` : ''}</b> by {item.byName} · {when(item.at)}{item.note ? ` — ${item.note}` : ''}</span></li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </section>
  );
}
