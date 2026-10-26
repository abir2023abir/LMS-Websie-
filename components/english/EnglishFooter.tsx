'use client';

import Link from 'next/link';
import { ArrowRight, Phone, Mail, MapPin } from 'lucide-react';

export default function EnglishFooter() {
  return (
    <footer id="contact" className="bg-[#111827] text-white pt-16 pb-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Column */}
          <div className="space-y-4">
            <Link href="/" className="inline-block">
              <div className="border border-[#FACC15] px-3 py-1.5 rounded-xl bg-black/40 flex flex-col items-center justify-center w-fit">
                <span className="font-display font-extrabold text-sm tracking-wider text-[#FACC15] uppercase leading-none">
                  Career Bridge
                </span>
                <span className="font-display font-bold text-[10px] tracking-widest text-white uppercase leading-none mt-0.5">
                  .Studio
                </span>
              </div>
            </Link>
            <p className="text-xs text-slate-400 leading-relaxed">
              A structured learning platform designed to help learners build knowledge, develop practical skills, and progress toward their goals.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="font-display font-bold text-sm text-[#FACC15] uppercase tracking-wider">
              Quick Links
            </h4>
            <ul className="space-y-2 text-xs text-slate-300">
              <li><Link href="/" className="hover:text-[#FACC15] transition-colors">Home</Link></li>
              <li><Link href="/courses" className="hover:text-[#FACC15] transition-colors">All Courses</Link></li>
              <li><Link href="/services" className="hover:text-[#FACC15] transition-colors">Career Services</Link></li>
              <li><Link href="/bookkeeping" className="hover:text-[#FACC15] transition-colors">Bookkeeping</Link></li>
              <li><Link href="/blog" className="hover:text-[#FACC15] transition-colors">Blog</Link></li>
              <li><Link href="/contact" className="hover:text-[#FACC15] transition-colors">Contact</Link></li>
              <li><Link href="/login" className="hover:text-[#FACC15] transition-colors">Login / Sign Up</Link></li>
            </ul>
          </div>

          {/* Learning Resources */}
          <div className="space-y-3">
            <h4 className="font-display font-bold text-sm text-[#FACC15] uppercase tracking-wider">
              Learning Resources
            </h4>
            <ul className="space-y-2 text-xs text-slate-300">
              <li><Link href="/courses" className="hover:text-[#FACC15] transition-colors">Course Catalogue</Link></li>
              <li><Link href="/about" className="hover:text-[#FACC15] transition-colors">Learning Guide</Link></li>
              <li><Link href="/student/quizzes" className="hover:text-[#FACC15] transition-colors">Assessments</Link></li>
              <li><Link href="/contact" className="hover:text-[#FACC15] transition-colors">Student Support</Link></li>
            </ul>
          </div>

          {/* Contact Information */}
          <div className="space-y-3">
            <h4 className="font-display font-bold text-sm text-[#FACC15] uppercase tracking-wider">
              Contact Information
            </h4>
            <div className="space-y-2 text-xs text-slate-300">
              <p className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-[#FACC15]" /> [Add your official email address]
              </p>
              <p className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-[#FACC15]" /> [Add your official contact number]
              </p>
              <p className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-[#FACC15]" /> [Add your official business address]
              </p>
            </div>
            <div className="pt-2">
              <h4 className="font-display font-bold text-sm text-[#FACC15] uppercase tracking-wider mb-2">
                Social Links
              </h4>
              <p className="text-xs text-slate-400 italic">
                [Add your official social media links]
              </p>
            </div>
          </div>

        </div>

        {/* Bottom copyright */}
        <div className="border-t border-white/10 pt-6 text-center text-xs text-slate-500">
          © {new Date().getFullYear()} Career Bridge.Studio. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
