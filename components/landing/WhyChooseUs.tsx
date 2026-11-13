import { ChevronsRight, Award, Users, ShieldCheck, Banknote, BookOpen, Clock, CheckCircle, Star } from 'lucide-react';
import { getFeatures } from '@/lib/cms-db';

const iconMap: Record<string, any> = {
  ShieldCheck,
  Award,
  Banknote,
  Users,
  BookOpen,
  Clock,
  CheckCircle,
  Star,
};

export default async function WhyChooseUs() {
  const features = await getFeatures();

  // Fallback features if API fails or no content exists
  const featuresData = features.length > 0 ? features : [
    { icon: 'ShieldCheck', title: 'Structured Learning Path', description: 'Know what to study next and follow the course structure.' },
    { icon: 'Award', title: 'Measurable Progress', description: 'Review your learning activity and assessment performance.' },
    { icon: 'Banknote', title: 'Guided Support', description: 'Use available mentor, student, and programme support features.' },
    { icon: 'Users', title: 'Goal-Oriented Practice', description: 'Connect course activities with the skills you want to develop.' },
  ];

  return (
    <section id="why-us" className="bg-white py-16 sm:py-24 text-[#111827]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 sm:space-y-12">
        {/* Header */}
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-[#FEF9C3] border border-[#FACC15]/40 text-[#111827] rounded-full px-3.5 py-1">
            <div className="bg-[#FACC15] text-[#111827] p-1 rounded-full flex items-center justify-center">
              <ChevronsRight className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-bold tracking-wide">WHY US</span>
          </div>

          <h2 className="font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl text-[#111827] tracking-tight">
            A Smarter Way to Learn and Grow
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
            Build a consistent learning routine with organised courses, useful feedback, and clear progress information.
          </p>
        </div>

        {/* Two Column Layout: Left Image, Right 4 Grid Feature Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {featuresData.map((feat) => {
            const Icon = iconMap[feat.icon] || ShieldCheck;
            return (
              <article key={feat.title} className="flex min-h-44 flex-col items-center rounded-3xl border border-slate-200 bg-white px-6 py-8 text-center shadow-[0_16px_36px_-24px_rgba(17,24,39,0.35)]">
                <span className="flex h-20 w-20 items-center justify-center rounded-3xl bg-[#111827] text-[#FACC15]">
                  <Icon className="h-10 w-10" strokeWidth={2.25} />
                </span>
                <h3 className="mt-5 font-display text-xl font-extrabold text-[#111827]">{feat.title}</h3>
                <span className="mt-3 h-1 w-10 rounded-full bg-[#FACC15]" />
                <p className="mt-3 max-w-sm text-sm leading-relaxed text-slate-600">{feat.description}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
