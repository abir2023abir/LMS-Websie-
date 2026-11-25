'use client';

import type { ReactNode } from 'react';
import { EDUCATION_STATUSES, RELATIONS, type EnrollmentDetails } from '@/lib/enrollment-form-fields';

export const inputClass = 'w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:border-[#FACC15] focus:outline-none [&>option]:bg-slate-900';

export function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <fieldset className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4">
      <legend className="px-1 text-sm font-bold text-[#FACC15]">{title}</legend>
      <div className="grid gap-3 sm:grid-cols-2">{children}</div>
    </fieldset>
  );
}

export function Field({ label, required, wide, children }: { label: string; required?: boolean; wide?: boolean; children: ReactNode }) {
  return (
    <label className={`block space-y-1 text-xs font-semibold text-slate-300 ${wide ? 'sm:col-span-2' : ''}`}>
      <span>{label}{required && <span aria-hidden="true" className="text-rose-400"> *</span>}</span>
      {children}
    </label>
  );
}

type Props = { value: EnrollmentDetails; onChange: (patch: Partial<EnrollmentDetails>) => void };

/** Student, guardian, education and social parts of the Course Enrollment form. */
export default function EnrollmentFields({ value, onChange }: Props) {
  const text = (key: keyof EnrollmentDetails, extra: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <input {...extra} value={String(value[key])} onChange={(e) => onChange({ [key]: e.target.value })} className={inputClass} />
  );
  return (
    <>
      <Section title="👤 Student Information">
        <Field label="Full Name" required>{text('fullName', { required: true, minLength: 2, maxLength: 120, autoComplete: 'name' })}</Field>
        <Field label="Phone Number" required>{text('phone', { required: true, type: 'tel', maxLength: 20, autoComplete: 'tel', placeholder: '01XXXXXXXXX' })}</Field>
        <Field label="Email" required>{text('email', { required: true, type: 'email', maxLength: 160, autoComplete: 'email' })}</Field>
        <Field label="Date of Birth">{text('birthDate', { type: 'date', autoComplete: 'bday' })}</Field>
      </Section>

      <Section title="👨‍👩‍👧 Guardian Information">
        <Field label="Guardian Name" required>{text('guardianName', { required: true, minLength: 2, maxLength: 120 })}</Field>
        <Field label="Relation" required>
          <select required value={value.relation} onChange={(e) => onChange({ relation: e.target.value })} className={inputClass}>
            <option value="">Select relation</option>
            {RELATIONS.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </Field>
        <Field label="Guardian Phone" required>{text('guardianPhone', { required: true, type: 'tel', maxLength: 20, placeholder: '01XXXXXXXXX' })}</Field>
        <Field label="Guardian Email">{text('guardianEmail', { type: 'email', maxLength: 160 })}</Field>
        <label className="flex items-start gap-3 text-xs leading-relaxed text-slate-300 sm:col-span-2">
          <input type="checkbox" checked={value.guardianAccess} onChange={(e) => onChange({ guardianAccess: e.target.checked })} className="mt-0.5 h-4 w-4 shrink-0 accent-[#FACC15]" />
          <span>Guardian Access চালু থাকবে, যাতে guardian student-এর প্রয়োজনীয় learning/progress information দেখতে পারবে।</span>
        </label>
      </Section>

      <Section title="🎓 Educational Information">
        <Field label="Educational Status" required>
          <select required value={value.educationStatus} onChange={(e) => onChange({ educationStatus: e.target.value })} className={inputClass}>
            <option value="">Select status</option>
            {EDUCATION_STATUSES.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </Field>
        <Field label="Class / Year / Batch">{text('classYear', { maxLength: 80, placeholder: 'e.g. Class 10 / Honours 1st' })}</Field>
        <Field label="Institution">{text('institution', { maxLength: 160 })}</Field>
        <Field label="Student ID / Roll">{text('studentRoll', { maxLength: 60 })}</Field>
        <Field label="আপনার বর্তমান শিক্ষা/learning situation সম্পর্কে লিখুন" wide>
          <textarea rows={3} maxLength={2000} value={value.learningSituation} onChange={(e) => onChange({ learningSituation: e.target.value })} className={inputClass} />
        </Field>
      </Section>

      <Section title="🌐 Social Network">
        <Field label="Facebook">{text('facebook', { maxLength: 200 })}</Field>
        <Field label="Instagram">{text('instagram', { maxLength: 200 })}</Field>
        <Field label="LinkedIn">{text('linkedin', { maxLength: 200 })}</Field>
        <Field label="Other Social Profile">{text('otherSocial', { maxLength: 200 })}</Field>
      </Section>
    </>
  );
}
