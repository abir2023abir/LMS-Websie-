import Link from 'next/link';
import {
  Zap,
  Twitter,
  Youtube,
  Linkedin,
  Github,
  Heart,
} from 'lucide-react';
import { footerLinks } from '@/lib/data';

const socialLinks = [
  { icon: Twitter,  href: 'https://twitter.com',  label: 'Twitter'  },
  { icon: Youtube,  href: 'https://youtube.com',  label: 'YouTube'  },
  { icon: Linkedin, href: 'https://linkedin.com', label: 'LinkedIn' },
  { icon: Github,   href: 'https://github.com',   label: 'GitHub'   },
];

const footerColumns = [
  { title: 'Courses',  links: footerLinks.courses  },
  { title: 'Company',  links: footerLinks.company  },
  { title: 'Support',  links: footerLinks.support  },
  { title: 'Legal',    links: footerLinks.legal    },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-dark-800 border-t border-white/8 mt-24">
      {/* ── CTA Banner ── */}
      <div className="border-b border-white/8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-700 via-primary-600 to-accent-600 p-8 md:p-12">
            {/* Decorative orbs */}
            <div className="absolute -top-10 -right-10 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-accent-500/20 rounded-full blur-3xl pointer-events-none" />

            <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <h2 className="font-display font-bold text-2xl md:text-3xl text-white mb-2">
                  Ready to start learning?
                </h2>
                <p className="text-primary-100 text-base md:text-lg">
                  Join 500,000+ students and unlock your full potential today.
                </p>
              </div>
              <div className="flex gap-3 flex-shrink-0">
                <Link
                  href="/signup"
                  id="footer-signup-btn"
                  className="inline-flex items-center gap-2 bg-white text-primary-700 hover:bg-primary-50 font-bold px-6 py-3 rounded-xl text-sm transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105"
                >
                  Get Started Free
                </Link>
                <Link
                  href="/courses"
                  className="inline-flex items-center gap-2 bg-white/15 hover:bg-white/25 border border-white/30 text-white font-semibold px-6 py-3 rounded-xl text-sm transition-all duration-200"
                >
                  Browse Courses
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Footer Grid ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand column */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 mb-5 group w-fit">
              <div className="w-9 h-9 rounded-xl bg-primary-gradient flex items-center justify-center shadow-md shadow-primary-600/40">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="font-display font-bold text-xl text-white">
                Learn<span className="gradient-text">Verse</span>
              </span>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed mb-6 max-w-xs">
              The modern platform for ambitious learners. Expert-led courses, real-world projects, and a community that grows together.
            </p>
            {/* Social links */}
            <div className="flex items-center gap-2">
              {socialLinks.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/5 hover:bg-primary-500/20 border border-white/8 hover:border-primary-500/30 text-slate-400 hover:text-primary-300 transition-all duration-200"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {footerColumns.map((col) => (
            <div key={col.title}>
              <h3 className="font-display font-semibold text-sm text-white mb-5 uppercase tracking-wider">
                {col.title}
              </h3>
              <ul className="space-y-3">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-slate-400 hover:text-white transition-colors duration-150"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* ── Bottom Bar ── */}
      <div className="border-t border-white/8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-slate-500">
              © {year} LearnVerse, Inc. All rights reserved.
            </p>
            <p className="flex items-center gap-1.5 text-sm text-slate-500">
              Made with{' '}
              <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />{' '}
              for curious minds worldwide
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
