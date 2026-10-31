'use client';

import { useEffect, useState } from 'react';
import { Save } from 'lucide-react';
import { toast } from 'sonner';
import { BkashMark, CardMark, NagadMark, RocketMark, SslMark } from '@/components/checkout/PayMarks';

type ManualId = 'bkash' | 'nagad' | 'rocket';
type ManualMethod = { enabled: boolean; number: string; accountType: 'Personal' | 'Agent' | 'Merchant' };
type Settings = {
  ssl: { enabled: boolean; storeId: string; storePassword: string; live: boolean };
  manual: Record<ManualId, ManualMethod>;
  manualInstructions: string;
};

const manualRows: { id: ManualId; label: string; mark: JSX.Element }[] = [
  { id: 'bkash', label: 'bKash', mark: <BkashMark /> },
  { id: 'nagad', label: 'Nagad', mark: <NagadMark /> },
  { id: 'rocket', label: 'Rocket', mark: <RocketMark /> },
];

const fieldClass = 'w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FACC15]';
const labelClass = 'mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500';

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (value: boolean) => void; label: string }) {
  return (
    <button type="button" role="switch" aria-checked={checked} aria-label={label} onClick={() => onChange(!checked)} className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${checked ? 'bg-emerald-500' : 'bg-slate-300'}`}>
      <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-5' : 'translate-x-0.5'}`} />
    </button>
  );
}

export default function AdminPaymentSetup() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [hasStorePassword, setHasStorePassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    fetch('/api/admin/payment-settings', { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => {
        if (!data.success) throw new Error(data.message || 'Could not load payment settings.');
        setSettings(data.settings);
        setHasStorePassword(Boolean(data.hasStorePassword));
      })
      .catch((error) => setLoadError(error instanceof Error ? error.message : 'Could not load payment settings.'));
  }, []);

  if (loadError) return <section className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-800">{loadError}</section>;
  if (!settings) return <section className="rounded-3xl border border-slate-200 bg-white p-6 text-sm text-slate-500">Loading payment settings…</section>;

  const setSsl = (patch: Partial<Settings['ssl']>) => setSettings({ ...settings, ssl: { ...settings.ssl, ...patch } });
  const setManual = (id: ManualId, patch: Partial<ManualMethod>) => setSettings({ ...settings, manual: { ...settings.manual, [id]: { ...settings.manual[id], ...patch } } });

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/payment-settings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(settings) });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Save failed.');
      setSettings(data.settings);
      setHasStorePassword(Boolean(data.hasStorePassword));
      toast.success('Payment settings saved');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Save failed.');
    } finally {
      setSaving(false);
    }
  };

  const activeCount = (settings.ssl.enabled ? 1 : 0) + manualRows.filter((row) => settings.manual[row.id].enabled).length;

  return (
    <section className="space-y-5 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-extrabold">Payment methods</h2>
          <p className="mt-1 text-sm text-slate-600">Choose how students pay for courses. Only methods you switch on appear at checkout.</p>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-bold ${activeCount ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-800'}`}>
          {activeCount ? `${activeCount} method${activeCount === 1 ? '' : 's'} on` : 'No method on — students cannot pay yet'}
        </span>
      </div>

      {/* ── SSLCommerz ── */}
      <div className="space-y-4 rounded-2xl border border-slate-200 p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <SslMark /><CardMark />
            <span className="text-sm font-bold">Online payment (SSLCommerz)</span>
          </div>
          <Toggle checked={settings.ssl.enabled} onChange={(enabled) => setSsl({ enabled })} label="Turn SSLCommerz on or off" />
        </div>
        <p className="text-xs text-slate-500">Cards, bKash, Nagad and Rocket through your SSLCommerz merchant account. Payment is verified automatically and the course opens straight away.</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <label><span className={labelClass}>Store ID</span><input className={fieldClass} value={settings.ssl.storeId} onChange={(e) => setSsl({ storeId: e.target.value })} placeholder="your_store_id" /></label>
          <label>
            <span className={labelClass}>Store password</span>
            <input className={fieldClass} type="password" autoComplete="new-password" value={settings.ssl.storePassword} onChange={(e) => setSsl({ storePassword: e.target.value })} placeholder={hasStorePassword ? 'Saved — leave blank to keep it' : 'Store password'} />
          </label>
        </div>
        <label className="flex items-center gap-3 text-sm">
          <Toggle checked={settings.ssl.live} onChange={(live) => setSsl({ live })} label="Use the live SSLCommerz account" />
          <span>{settings.ssl.live ? 'Live mode — real payments' : 'Sandbox mode — test payments only'}</span>
        </label>
      </div>

      {/* ── Personal / agent numbers ── */}
      <div className="space-y-3 rounded-2xl border border-slate-200 p-4">
        <div>
          <p className="text-sm font-bold">Send Money to your number (manual approval)</p>
          <p className="text-xs text-slate-500">Students send money to your number and enter the Transaction ID. You check it below in Payment records and approve it to open the course.</p>
        </div>
        {manualRows.map((row) => {
          const method = settings.manual[row.id];
          return (
            <div key={row.id} className="grid items-center gap-3 rounded-xl bg-slate-50 p-3 sm:grid-cols-[110px_1fr_140px_auto]">
              <div className="flex items-center gap-2">{row.mark}</div>
              <input className={fieldClass} inputMode="tel" value={method.number} onChange={(e) => setManual(row.id, { number: e.target.value })} placeholder={`${row.label} number (01XXXXXXXXX)`} />
              <select className={fieldClass} value={method.accountType} onChange={(e) => setManual(row.id, { accountType: e.target.value as ManualMethod['accountType'] })}>
                <option>Personal</option>
                <option>Agent</option>
                <option>Merchant</option>
              </select>
              <Toggle checked={method.enabled} onChange={(enabled) => setManual(row.id, { enabled })} label={`Turn ${row.label} on or off`} />
            </div>
          );
        })}
        <label className="block">
          <span className={labelClass}>Instructions shown to students</span>
          <textarea className={fieldClass} rows={3} value={settings.manualInstructions} onChange={(e) => setSettings({ ...settings, manualInstructions: e.target.value })} />
        </label>
      </div>

      <div className="flex justify-end">
        <button type="button" onClick={save} disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-[#111827] px-5 py-2.5 text-sm font-bold text-white hover:bg-slate-800 disabled:opacity-50">
          <Save className="h-4 w-4" />{saving ? 'Saving…' : 'Save payment settings'}
        </button>
      </div>
    </section>
  );
}
