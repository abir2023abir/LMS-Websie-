import { Users, BookOpen, GraduationCap, Star } from 'lucide-react';
import { stats } from '@/lib/data';
import { formatCount } from '@/lib/utils';

const iconMap = { Users, BookOpen, GraduationCap, Star } as const;
type IconKey = keyof typeof iconMap;

export default function StatsSection() {
  return (
    <section
      id="stats"
      className="relative py-20 overflow-hidden"
      aria-label="Platform statistics"
    >
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-r from-dark-800 via-dark-700 to-dark-800" />
      <div className="absolute inset-0 hero-grid opacity-30" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <div className="text-center mb-14">
          <p className="text-xs font-bold tracking-[0.2em] uppercase text-primary-400 mb-3">
            Trusted Worldwide
          </p>
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-white">
            Numbers that speak for themselves
          </h2>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {stats.map((stat, i) => {
            const Icon = iconMap[stat.icon as IconKey] ?? Star;
            return (
              <div
                key={stat.label}
                className="relative group glass rounded-2xl border border-white/8 hover:border-primary-500/30 p-6 sm:p-8 text-center transition-all duration-300 hover:shadow-xl hover:shadow-primary-600/10 hover:-translate-y-1"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                {/* Icon */}
                <div className="w-12 h-12 rounded-2xl bg-primary-500/15 border border-primary-500/20 flex items-center justify-center mx-auto mb-4 group-hover:bg-primary-500/25 transition-colors duration-200">
                  <Icon className="w-6 h-6 text-primary-400" />
                </div>

                {/* Value */}
                <div className="font-display font-extrabold text-3xl sm:text-4xl text-white mb-1">
                  <span className="gradient-text-primary">
                    {formatCount(stat.value)}
                  </span>
                  <span className="text-primary-400">{stat.suffix}</span>
                </div>

                {/* Label */}
                <p className="text-sm text-slate-400 font-medium">{stat.label}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
