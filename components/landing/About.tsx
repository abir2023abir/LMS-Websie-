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
    <section id="about" className="bg-white py-10 sm:py-24 text-[#111827]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-12">
        <div className="mx-auto max-w-4xl space-y-3 text-center sm:space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#FACC15] px-4 py-2 text-[#111827] shadow-sm">
            <ChevronsRight className="h-5 w-5" />
            <span className="font-display text-sm font-extrabold tracking-[0.18em] sm:text-base">WHO WE ARE</span>
          </div>

          <h2 className="font-display font-extrabold text-2xl sm:text-4xl lg:text-5xl text-[#111827] tracking-tight leading-tight">
            {aboutData.title}
          </h2>

          <p className="text-slate-600 text-[13px] sm:text-base leading-relaxed font-normal">
            {aboutData.description}
          </p>
        </div>

        {/* Phones: all four cards fit one screen, two beside two. */}
        <div className="grid grid-cols-2 gap-2.5 sm:gap-4 lg:grid-cols-4">
          {aboutData.statCards.map(({ value, lead, detail, illustration, highlighted }) => {
            const Icon = cardIcons[illustration] || LibraryBig;
            return (
              <article
                key={value}
                className={`flex flex-col items-center rounded-2xl border px-2 py-3 text-center sm:min-h-64 sm:rounded-3xl sm:px-5 sm:py-7 transition duration-200 hover:-translate-y-1 ${
                  highlighted
                    ? 'border-[#EAB308] bg-[#FACC15] shadow-[0_18px_40px_-22px_rgba(234,179,8,0.95)]'
                    : 'border-slate-200 bg-white shadow-[0_16px_36px_-24px_rgba(17,24,39,0.35)]'
                }`}
              >
                <span className={`text-[11px] font-extrabold tracking-[0.16em] ${highlighted ? 'text-[#111827]/60' : 'text-slate-400'}`}>{value}</span>
                <span className="mt-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#111827] text-[#FACC15] shadow-md sm:mt-5 sm:h-24 sm:w-24 sm:rounded-3xl">
                  <Icon className="h-6 w-6 sm:h-12 sm:w-12" strokeWidth={2.25} aria-hidden="true" />
                </span>
                <h3 className="mt-2 font-display text-sm font-extrabold sm:mt-5 sm:text-xl tracking-tight text-[#111827]">{lead}</h3>
                <span className={`mt-1.5 h-1 w-8 rounded-full sm:mt-3 sm:w-10 ${highlighted ? 'bg-[#111827]' : 'bg-[#FACC15]'}`} />
                <p className="mt-1.5 text-xs font-medium leading-snug text-[#111827]/75 sm:mt-3 sm:text-sm">{detail}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
