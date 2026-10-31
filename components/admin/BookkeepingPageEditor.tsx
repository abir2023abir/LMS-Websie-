'use client';

import { useEffect, useState } from 'react';
import { Plus, Save, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { defaultBookkeepingContent, type BookkeepingPageContent, type BookkeepingPlan } from '@/lib/bookkeeping-types';

const fieldClass = 'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FACC15]';
const labelClass = 'mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500';

export default function BookkeepingPageEditor() {
  const [content, setContent] = useState<BookkeepingPageContent>(defaultBookkeepingContent);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/admin/cms/bookkeeping').then(async (response) => {
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Could not load content');
      if (result.content) setContent(result.content);
    }).catch((error: Error) => toast.error(error.message)).finally(() => setLoading(false));
  }, []);

  const updateField = <K extends keyof BookkeepingPageContent>(key: K, value: BookkeepingPageContent[K]) => setContent((current) => ({ ...current, [key]: value }));
  const updatePlan = (index: number, patch: Partial<BookkeepingPlan>) => setContent((current) => ({ ...current, plans: current.plans.map((plan, i) => i === index ? { ...plan, ...patch } : plan) }));
  const updateTab = (index: number, value: string) => {
    const oldName = content.tabs[index];
    setContent((current) => ({ ...current, tabs: current.tabs.map((tab, i) => i === index ? value : tab), plans: current.plans.map((plan) => ({ ...plan, categories: plan.categories.map((category) => category === oldName ? value : category) })) }));
  };
  const addPlan = () => updateField('plans', [...content.plans, { id: `plan-${Date.now()}`, name: 'New service', description: '', price: 0, note: '', features: [], categories: [], popular: false }]);
  const save = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/admin/cms/bookkeeping', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(content) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Could not save content');
      setContent(result.content);
      toast.success('Bookkeeping page saved.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not save content');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="py-12 text-center text-slate-500">Loading Bookkeeping page content…</div>;

  return <div className="space-y-8">
    <section className="grid gap-4 sm:grid-cols-2">
      <label><span className={labelClass}>Eyebrow</span><input className={fieldClass} value={content.eyebrow} onChange={(e) => updateField('eyebrow', e.target.value)} /></label>
      <label><span className={labelClass}>Headline</span><input className={fieldClass} value={content.headline} onChange={(e) => updateField('headline', e.target.value)} /></label>
      <label className="sm:col-span-2"><span className={labelClass}>Description</span><textarea className={fieldClass} rows={3} value={content.description} onChange={(e) => updateField('description', e.target.value)} /></label>
      <label className="sm:col-span-2"><span className={labelClass}>Service selector hint</span><input className={fieldClass} value={content.selectorHint} onChange={(e) => updateField('selectorHint', e.target.value)} /></label>
    </section>

    <section className="space-y-3 rounded-xl border border-slate-200 p-4">
      <div className="flex items-center justify-between"><h4 className="font-semibold text-slate-900">Service tabs</h4><button type="button" onClick={() => updateField('tabs', [...content.tabs, 'New service'])} className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-3 py-2 text-sm font-semibold"><Plus size={16} /> Add tab</button></div>
      {content.tabs.map((tab, index) => <div key={`${index}-${tab}`} className="flex gap-2"><input aria-label={`Service tab ${index + 1}`} className={fieldClass} value={tab} onChange={(e) => updateTab(index, e.target.value)} /><button type="button" aria-label={`Remove ${tab} tab`} onClick={() => updateField('tabs', content.tabs.filter((_, i) => i !== index))} className="rounded-lg border border-slate-200 px-3 text-red-600"><Trash2 size={16} /></button></div>)}
      <p className="text-xs text-slate-500">Assign plans to these tabs in each plan’s Categories field.</p>
    </section>

    <section className="grid gap-4 sm:grid-cols-2">
      <label><span className={labelClass}>Monthly button label</span><input className={fieldClass} value={content.monthlyCta} onChange={(e) => updateField('monthlyCta', e.target.value)} /></label>
      <label><span className={labelClass}>Annual button label</span><input className={fieldClass} value={content.annualCta} onChange={(e) => updateField('annualCta', e.target.value)} /></label>
      <label><span className={labelClass}>Annual pricing heading</span><input className={fieldClass} value={content.annualHeading} onChange={(e) => updateField('annualHeading', e.target.value)} /></label>
      <label><span className={labelClass}>Annual discount (%)</span><input type="number" min="0" max="100" className={fieldClass} value={content.annualDiscount} onChange={(e) => updateField('annualDiscount', Number(e.target.value))} /></label>
      <label><span className={labelClass}>Included features heading</span><input className={fieldClass} value={content.includedHeading} onChange={(e) => updateField('includedHeading', e.target.value)} /></label>
      <label><span className={labelClass}>Popular badge text</span><input className={fieldClass} value={content.popularBadge} onChange={(e) => updateField('popularBadge', e.target.value)} /></label>
      <label><span className={labelClass}>Monthly price suffix</span><input className={fieldClass} value={content.monthlySuffix} onChange={(e) => updateField('monthlySuffix', e.target.value)} /></label>
      <label><span className={labelClass}>Annual price suffix</span><input className={fieldClass} value={content.annualSuffix} onChange={(e) => updateField('annualSuffix', e.target.value)} /></label>
      <label><span className={labelClass}>Annual discount caption</span><input className={fieldClass} value={content.annualDiscountCaption} onChange={(e) => updateField('annualDiscountCaption', e.target.value)} /></label>
      <label><span className={labelClass}>Quote request button</span><input className={fieldClass} value={content.quoteCta} onChange={(e) => updateField('quoteCta', e.target.value)} /></label>
    </section>

    <section className="space-y-4">
      <div className="flex items-center justify-between"><h4 className="text-lg font-bold text-slate-900">Plans and prices</h4><button type="button" onClick={addPlan} className="inline-flex items-center gap-1 rounded-lg bg-[#111827] px-3 py-2 text-sm font-semibold text-white"><Plus size={16} /> Add plan</button></div>
      {content.plans.map((plan, index) => <article key={plan.id} className="space-y-4 rounded-xl border border-slate-200 p-4 sm:p-5">
        <div className="flex items-center justify-between"><h5 className="font-semibold text-slate-800">Plan {index + 1}</h5><button type="button" onClick={() => updateField('plans', content.plans.filter((_, i) => i !== index))} className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-sm text-red-600"><Trash2 size={15} /> Remove</button></div>
        <div className="grid gap-4 sm:grid-cols-2"><label><span className={labelClass}>Plan name</span><input className={fieldClass} value={plan.name} onChange={(e) => updatePlan(index, { name: e.target.value })} /></label><label><span className={labelClass}>Monthly price (৳ BDT, 0 = show “Request pricing”)</span><input type="number" min="0" className={fieldClass} value={plan.price} onChange={(e) => updatePlan(index, { price: Number(e.target.value) })} /></label><label className="sm:col-span-2"><span className={labelClass}>Description</span><textarea className={fieldClass} rows={2} value={plan.description} onChange={(e) => updatePlan(index, { description: e.target.value })} /></label><label className="sm:col-span-2"><span className={labelClass}>Additional note</span><input className={fieldClass} value={plan.note} onChange={(e) => updatePlan(index, { note: e.target.value })} /></label><label><span className={labelClass}>Included features (one per line)</span><textarea className={fieldClass} rows={4} value={plan.features.join('\n')} onChange={(e) => updatePlan(index, { features: e.target.value.split('\n').map((line) => line.trim()).filter(Boolean) })} /></label><label><span className={labelClass}>Categories (one per line; must match tabs)</span><textarea className={fieldClass} rows={4} value={plan.categories.join('\n')} onChange={(e) => updatePlan(index, { categories: e.target.value.split('\n').map((line) => line.trim()).filter(Boolean) })} /></label></div>
        <label className="inline-flex items-center gap-2 text-sm font-medium text-slate-700"><input type="checkbox" checked={plan.popular} onChange={(e) => updatePlan(index, { popular: e.target.checked })} className="h-4 w-4 accent-emerald-600" /> Mark as most popular</label>
      </article>)}
    </section>

    <div className="sticky bottom-3 flex justify-end"><button type="button" onClick={save} disabled={saving} className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-[#111827] px-5 py-2.5 text-sm font-semibold text-white shadow-lg disabled:opacity-60"><Save size={16} /> {saving ? 'Saving…' : 'Save Bookkeeping Page'}</button></div>
  </div>;
}
