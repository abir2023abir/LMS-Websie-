import { ChevronsRight, ClipboardCheck, LibraryBig, Target, TrendingUp, type LucideIcon } from 'lucide-react';
import { getAboutContent } from '@/lib/cms-db';

const cardIcons: Record<string, LucideIcon> = {
  learning: LibraryBig,
  practice: ClipboardCheck,
  progress: TrendingUp,
  goals: Target,
};

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
          <div className="inline-flex items-center gap-2 rounded-full bg-[#FACC15] px-4 py-2 text-[#111827] shadow-sm">
            <ChevronsRight className="h-5 w-5" />
            <span className="font-display text-sm font-extrabold tracking-[0.18em] sm:text-base">WHO WE ARE</span>
          </div>

          <h2 className="font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl text-[#111827] tracking-tight leading-tight">
            {aboutData.title}
          </h2>

          <p className="text-slate-600 text-sm sm:text-base leading-relaxed font-normal">
            {aboutData.description}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {aboutData.statCards.map(({ value, lead, detail, illustration, highlighted }) => {
            const Icon = cardIcons[illustration] || LibraryBig;
            return (
              <article
                key={value}
                className={`flex min-h-64 flex-col items-center rounded-3xl border px-5 py-7 text-center transition duration-200 hover:-translate-y-1 ${
                  highlighted
                    ? 'border-[#EAB308] bg-[#FACC15] shadow-[0_18px_40px_-22px_rgba(234,179,8,0.95)]'
                    : 'border-slate-200 bg-white shadow-[0_16px_36px_-24px_rgba(17,24,39,0.35)]'
                }`}
              >
                <span className={`text-[11px] font-extrabold tracking-[0.16em] ${highlighted ? 'text-[#111827]/60' : 'text-slate-400'}`}>{value}</span>
                <span className="mt-5 flex h-24 w-24 items-center justify-center rounded-3xl bg-[#111827] text-[#FACC15] shadow-md">
                  <Icon className="h-12 w-12" strokeWidth={2.25} aria-hidden="true" />
                </span>
                <h3 className="mt-5 font-display text-xl font-extrabold tracking-tight text-[#111827]">{lead}</h3>
                <span className={`mt-3 h-1 w-10 rounded-full ${highlighted ? 'bg-[#111827]' : 'bg-[#FACC15]'}`} />
                <p className="mt-3 text-sm font-medium leading-snug text-[#111827]/75">{detail}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
