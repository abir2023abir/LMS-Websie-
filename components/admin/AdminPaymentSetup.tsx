'use client';

import { useEffect, useState } from 'react';

export default function AdminPaymentSetup() {
  const [storeId, setStoreId] = useState('');
  const [storePassword, setStorePassword] = useState('');
  const [live, setLive] = useState(false);
  const [note, setNote] = useState('');

  useEffect(() => {
    fetch('/api/admin/payment-settings')
      .then((res) => res.json())
      .then((data) => {
        if (!data.success) return;
        setStoreId(data.storeId || '');
        setLive(Boolean(data.live));
      })
      .catch(() => setNote('Could not load the saved payment setup.'));
  }, []);

  return (
    <section className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-4 max-w-2xl">
      <div>
        <h2 className="font-display font-extrabold text-xl">Payment setup</h2>
        <p className="text-sm text-slate-600 mt-1">
          bKash, Nagad, and debit or credit card all connect through one SSLCommerz store. Paste the Store ID and Store Password from your SSLCommerz account. Leave the password blank to keep the one already saved.
        </p>
      </div>
      <label className="block text-xs font-bold text-slate-500">SSLCommerz Store ID</label>
      <input value={storeId} onChange={(e) => setStoreId(e.target.value)} placeholder="your store id" className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm" />
      <label className="block text-xs font-bold text-slate-500">SSLCommerz Store Password</label>
      <input value={storePassword} onChange={(e) => setStorePassword(e.target.value)} type="password" placeholder="store password" className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm" />
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={live} onChange={(e) => setLive(e.target.checked)} />
        Use the live SSLCommerz account. Leave this off for the sandbox.
      </label>
      <button
        type="button"
        className="bg-[#111827] text-white font-bold text-sm px-4 py-2 rounded-xl"
        onClick={async () => {
          const res = await fetch('/api/admin/payment-settings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ storeId, storePassword, live }),
          });
          setNote(res.ok ? 'Payment account connected.' : 'Save failed. Sign in to the admin panel again.');
          setStorePassword('');
        }}
      >
        Save and connect
      </button>
      {note && <p className="text-sm font-semibold">{note}</p>}
    </section>
  );
}
