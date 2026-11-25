'use client';

import { useEffect, useState } from 'react';
import { ChevronDown, FileText, Search } from 'lucide-react';
import type { EnrollmentForm } from '@/lib/enrollment-forms';

const LABELS: [keyof EnrollmentForm, string][] = [
  ['fullName', 'Full name'], ['phone', 'Phone'], ['email', 'Email'], ['birthDate', 'Date of birth'],
  ['guardianName', 'Guardian'], ['relation', 'Relation'], ['guardianPhone', 'Guardian phone'], ['guardianEmail', 'Guardian email'], ['guardianAccess', 'Guardian access'],
  ['educationStatus', 'Educational status'], ['classYear', 'Class / year / batch'], ['institution', 'Institution'], ['studentRoll', 'Student ID / roll'], ['learningSituation', 'Learning situation'],
  ['facebook', 'Facebook'], ['instagram', 'Instagram'], ['linkedin', 'LinkedIn'], ['otherSocial', 'Other profile'],
  ['paymentMethod', 'Payment method'], ['paymentReference', 'Transaction ID'], ['accountEmail', 'Account email'],
];

const METHODS: Record<string, string> = { ssl: 'Online payment', arrange: 'To be arranged', bkash: 'bKash', nagad: 'Nagad', rocket: 'Rocket' };
const show = (value: unknown) => (typeof value === 'boolean' ? (value ? 'Yes' : 'No') : String(value || '—'));
const day = (value: string) => new Date(value).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' });

/** The Course Enrollment forms students sent. Admin only: others get nothing from the server. */
export default function AdminEnrollmentForms() {
  const [forms, setForms] = useState<EnrollmentForm[] | null>(null);
  const [query, setQuery] = useState('');
  const [limit, setLimit] = useState(10);

  useEffect(() => {
    fetch('/api/admin/enrollment-forms', { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setForms(data?.forms || null))
      .catch(() => setForms(null));
  }, []);

  if (!forms) return null;
  const needle = query.trim().toLowerCase();
  const found = needle ? forms.filter((form) => `${form.fullName} ${form.phone} ${form.email} ${form.courseTitle} ${form.guardianName} ${form.paymentReference}`.toLowerCase().includes(needle)) : forms;

  return (
    <section className="space-y-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div>
        <h2 className="font-display text-xl font-extrabold">Course enrollment forms</h2>
        <p className="text-sm text-slate-500">What students filled in before enrolling. Paid courses open after you approve the payment in Payments.</p>
      </div>
      {forms.length > 0 && (
        <label className="flex items-center gap-2 rounded-full bg-slate-100 px-3 py-2">
          <Search className="h-4 w-4 text-slate-400" />
          <input aria-label="Search enrollment forms" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search name, phone, course, guardian, Transaction ID…" className="w-full bg-transparent text-sm focus:outline-none" />
        </label>
      )}
      {found.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 py-10 text-center text-sm text-slate-500">
          <FileText className="mx-auto mb-2 h-6 w-6 text-slate-300" />
          {forms.length ? 'No form matches the search.' : 'No enrollment forms yet.'}
        </div>
      ) : (
        <ul className="space-y-2">
          {found.slice(0, limit).map((form) => (
            <li key={`${form.studentId}:${form.courseId}`}>
              <details className="group rounded-2xl border border-slate-200">
                <summary className="flex cursor-pointer list-none items-center gap-3 rounded-2xl p-4 hover:bg-slate-50">
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-bold">{form.fullName} · {form.phone}</span>
                    <span className="block truncate text-xs text-slate-500">{form.courseTitle} · {day(form.submittedAt)}</span>
                  </span>
                  <ChevronDown aria-hidden="true" className="h-4 w-4 shrink-0 text-slate-400 transition-transform group-open:rotate-180" />
                </summary>
                <dl className="grid gap-x-6 gap-y-3 border-t border-slate-100 p-4 sm:grid-cols-2 lg:grid-cols-3">
                  {LABELS.map(([key, label]) => (
                    <div key={key} className="min-w-0">
                      <dt className="text-[11px] font-bold uppercase tracking-wide text-slate-400">{label}</dt>
                      <dd className="whitespace-pre-wrap break-words text-sm text-slate-800">{key === 'paymentMethod' ? METHODS[form.paymentMethod] || show(form.paymentMethod) : show(form[key])}</dd>
                    </div>
                  ))}
                </dl>
              </details>
            </li>
          ))}
        </ul>
      )}
      {found.length > limit && <button type="button" onClick={() => setLimit(limit + 20)} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold hover:bg-slate-50">Show more</button>}
    </section>
  );
}
