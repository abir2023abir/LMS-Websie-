'use client';

import { useState } from 'react';
import FloatingNavbar from '@/components/english/FloatingNavbar';
import EnglishFooter from '@/components/english/EnglishFooter';
import WorkspaceLinks from '@/components/workspace/WorkspaceLinks';
import { useAuth } from '@/context/AuthContext';
import { featuredCourses } from '@/lib/data';
import {
  assignMentor,
  courseApproval,
  courseDiscount,
  courseVisibility,
  deactivateEmail,
  mentorFor,
  mentorLevel,
  setApproval,
  setCourseVisibility,
  setDiscount,
  setMentorLevel,
  type CourseVisibility,
} from '@/lib/workspace';

export default function PublishPage() {
  const { user } = useAuth();
  const [tick, setTick] = useState(0);
  const [email, setEmail] = useState('');
  const [assistant, setAssistant] = useState('');
  const [note, setNote] = useState('');
  const [mentor, setMentor] = useState('');
  const [discount, setDiscountValue] = useState(10);
  const level = mentorLevel(user?.email || '');
  void tick;

  return (
    <div className="min-h-screen bg-slate-50 text-[#111827] flex flex-col">
      <FloatingNavbar />
      <main className="max-w-5xl mx-auto px-4 pt-32 pb-16 w-full space-y-6">
        <h1 className="font-display font-extrabold text-3xl">Publish, archive, and accounts</h1>
        <WorkspaceLinks />
        <section className="space-y-3">
          {featuredCourses.map((course) => {
            const id = String(course.id);
            const status = courseVisibility(id);
            const approval = courseApproval(id);
            const assigned = mentorFor(id);
            return (
              <article key={course.id} className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm space-y-3">
                <div>
                  <p className="font-bold">{course.title}</p>
                  <p className="text-xs text-slate-500">Now: {status} · approval {approval} · discount {courseDiscount(id)}% · mentor {assigned.email || 'none'}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button type="button" className="text-xs font-bold px-3 py-2 rounded-full bg-slate-100" onClick={() => { setApproval(id, 'pending'); setTick((n) => n + 1); }}>Send for approval</button>
                  <button type="button" className="text-xs font-bold px-3 py-2 rounded-full bg-[#FACC15]" disabled={level === 'assistant'} onClick={() => { setApproval(id, 'approved'); setTick((n) => n + 1); }}>Approve</button>
                  {(['published', 'hidden', 'archived'] as CourseVisibility[]).map((value) => (
                    <button
                      key={value}
                      type="button"
                      className="text-xs font-bold px-3 py-2 rounded-full bg-slate-100 disabled:opacity-40"
                      disabled={value === 'published' && (level === 'assistant' || approval === 'pending')}
                      onClick={() => {
                        setCourseVisibility(id, value);
                        setTick((n) => n + 1);
                      }}
                    >
                      {value}
                    </button>
                  ))}
                </div>
                <form className="flex flex-wrap gap-2" onSubmit={(e) => { e.preventDefault(); assignMentor(id, mentor); setDiscount(id, discount); setMentor(''); setTick((n) => n + 1); }}>
                  <input value={mentor} onChange={(e) => setMentor(e.target.value)} placeholder="Mentor email" className="border border-slate-200 rounded-xl px-3 py-2 text-xs" />
                  <input type="number" value={discount} onChange={(e) => setDiscountValue(Number(e.target.value))} className="w-20 border border-slate-200 rounded-xl px-3 py-2 text-xs" />
                  <button className="text-xs font-bold px-3 py-2 rounded-full bg-slate-100">Save mentor and discount</button>
                </form>
                {assigned.history.length > 0 && <p className="text-xs text-slate-500">Mentor history: {assigned.history.map((row) => row.email).join(', ')}</p>}
              </article>
            );
          })}
        </section>
        <form
          className="bg-white rounded-3xl border border-slate-200 p-6 space-y-3 shadow-sm"
          onSubmit={(e) => {
            e.preventDefault();
            deactivateEmail(email);
            setNote(`${email} can no longer sign in.`);
            setEmail('');
          }}
        >
          <h2 className="font-bold">Turn an account off</h2>
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="Email" className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm" />
          <button className="bg-[#111827] text-white font-bold text-sm px-4 py-2 rounded-xl">Deactivate</button>
          {note && <p className="text-sm">{note}</p>}
        </form>
        <form
          className="bg-white rounded-3xl border border-slate-200 p-6 space-y-3 shadow-sm"
          onSubmit={(e) => {
            e.preventDefault();
            setMentorLevel(assistant, 'assistant');
            setNote(`${assistant} is now an assistant mentor and cannot publish.`);
            setAssistant('');
          }}
        >
          <h2 className="font-bold">Make a mentor an assistant</h2>
          <p className="text-sm text-slate-600">Your level is {level}. Assistants cannot approve or publish.</p>
          <input value={assistant} onChange={(e) => setAssistant(e.target.value)} type="email" placeholder="Mentor email" className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm" />
          <button className="bg-slate-100 font-bold text-sm px-4 py-2 rounded-xl">Set assistant</button>
        </form>
      </main>
      <EnglishFooter />
    </div>
  );
}
