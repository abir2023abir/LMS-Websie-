import { ChevronsRight } from 'lucide-react';
import { getAboutContent } from '@/lib/cms-db';

function CardIllustration({ kind }: { kind: string }) {
  if (kind === 'practice') {
    return (
      <svg viewBox="0 0 64 64" role="img" aria-label="Practical learning checklist illustration" className="h-16 w-16">
        <rect x="8" y="8" width="48" height="48" rx="16" fill="#FEF3C7" />
        <rect x="18" y="17" width="28" height="34" rx="5" fill="white" stroke="#111827" strokeWidth="2.5" />
        <path d="m23 27 2.5 2.5 4-5M33 28h8M23 37l2.5 2.5 4-5M33 38h8" fill="none" stroke="#D97706" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="m36 14 4 4-9 9-5 1 1-5 9-9Z" fill="#FACC15" stroke="#111827" strokeWidth="2" strokeLinejoin="round" />
      </svg>
    );
  }

  if (kind === 'progress') {
    return (
      <svg viewBox="0 0 64 64" role="img" aria-label="Learning progress chart illustration" className="h-16 w-16">
        <rect x="8" y="8" width="48" height="48" rx="16" fill="#DCFCE7" />
        <path d="M18 46V36h7v10M29 46V29h7v17M40 46V20h7v26" fill="#86EFAC" stroke="#166534" strokeWidth="2.5" strokeLinejoin="round" />
        <path d="m18 30 10-7 8 2 11-9" fill="none" stroke="#111827" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M41 16h6v6" fill="none" stroke="#111827" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  if (kind === 'goals') {
    return (
      <svg viewBox="0 0 64 64" role="img" aria-label="Goal-focused learning target illustration" className="h-16 w-16">
        <rect x="8" y="8" width="48" height="48" rx="16" fill="#FEF08A" />
        <circle cx="31" cy="34" r="16" fill="white" stroke="#111827" strokeWidth="2.5" />
        <circle cx="31" cy="34" r="9" fill="#FDE68A" stroke="#D97706" strokeWidth="2.5" />
        <circle cx="31" cy="34" r="3" fill="#111827" />
        <path d="m31 34 16-17M40 17h7v7" fill="none" stroke="#111827" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 64 64" role="img" aria-label="Structured learning book illustration" className="h-16 w-16">
      <rect x="8" y="8" width="48" height="48" rx="16" fill="#FEF08A" />
      <path d="M14 28c7-3 13-2 19 2v19c-6-4-12-5-19-2V28ZM33 30c6-4 12-5 19-2v19c-7-3-13-2-19 2V30Z" fill="white" stroke="#111827" strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M33 30v19M19 34c3-.5 6 0 9 1.5M38 34c3-1.5 6-2 9-1.5" fill="none" stroke="#D97706" strokeWidth="2.5" strokeLinecap="round" />
      <path d="m32 13 1.6 3.5 3.9.6-2.8 2.7.7 3.9-3.4-1.9-3.4 1.9.7-3.9-2.8-2.7 3.9-.6L32 13Z" fill="#EAB308" />
    </svg>
  );
}

export default async function About() {
  const content = await getAboutContent();

  // Fallback content if API fails or no content exists
  const aboutData = content || {
    title: 'A Better Learning Journey, Built Around Your Goals',
    description: 'Career Bridge.Studio helps learners develop knowledge, strengthen practical skills, and follow a structured path toward personal and professional growth. Learn through organised lessons, practise your skills, and track your progress as you move forward.',
    statCards: [
      { value: '01', lead: 'Structured', detail: 'Learning Programmes', illustration: 'learning', highlighted: false },
      { value: '02', lead: 'Practical', detail: 'Lessons & Activities', illustration: 'practice', highlighted: false },
      { value: '03', lead: 'Trackable', detail: 'Learning Progress', illustration: 'progress', highlighted: false },
      { value: '04', lead: 'Goal-Focused', detail: 'Skill Development', illustration: 'goals', highlighted: true },
    ],
  };

  return (
    <section id="about" className="bg-white py-16 sm:py-24 text-[#111827]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 sm:space-y-12">
        <div className="mx-auto max-w-4xl space-y-4 text-center">
          <div className="inline-flex items-center gap-2 bg-[#FEF9C3] border border-[#FACC15]/40 text-[#111827] rounded-full px-3.5 py-1.5">
            <div className="bg-[#FACC15] text-[#111827] p-1 rounded-full flex items-center justify-center">
              <ChevronsRight className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-bold tracking-wide">WHO WE ARE</span>
          </div>

          <h2 className="font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl text-[#111827] tracking-tight leading-tight">
            {aboutData.title}
          </h2>

          <p className="text-slate-600 text-sm sm:text-base leading-relaxed font-normal">
            {aboutData.description}
          </p>
        </div>

        <div className="grid grid-cols-1 min-[480px]:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {aboutData.statCards.map(({ value, lead, detail, illustration, highlighted }, index) => (
            <div
              key={value}
              className={`min-h-52 rounded-3xl p-5 sm:p-7 flex flex-col items-center justify-between text-center border transition-all hover:-translate-y-1 ${
                highlighted
                  ? 'bg-[#FEF08A] border-[#FACC15] shadow-lg shadow-[#FACC15]/20'
                  : 'bg-[#FEFCE8]/60 border-[#FEF9C3] hover:border-[#FACC15]/50'
              }`}
            >
              <div className="flex w-full items-center justify-between">
                <span className="inline-flex h-8 min-w-8 items-center justify-center rounded-full bg-white/80 px-2 text-xs font-extrabold tracking-wide text-[#854D0E]">{value}</span>
                <CardIllustration kind={illustration} />
              </div>
              <div className="mt-5 w-full">
                <h3 className="font-bold text-sm sm:text-base text-[#111827]">{lead}</h3>
                <p className="mt-1 text-sm text-slate-600 leading-snug">{detail}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
