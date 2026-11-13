'use client';

import Link from 'next/link';
import { Phone, Mail, MapPin } from 'lucide-react';
import { contactInfo, hasContactDetails, socialLinks } from '@/lib/contact';

export default function Footer() {
  return (
    <footer id="contact" className="bg-[#111827] text-white pt-10 pb-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="flex flex-col items-start justify-between gap-5 rounded-3xl border border-white/10 bg-white/5 px-6 py-6 sm:flex-row sm:items-center">
          <div>
            <p className="font-display text-xl font-extrabold">Take the next step</p>
            <p className="mt-1 max-w-md text-sm text-slate-400">Open a course, or talk to the team about bookkeeping for your business.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/courses" className="inline-flex min-h-11 items-center rounded-full bg-[#FACC15] px-5 text-sm font-extrabold text-[#111827] hover:bg-[#EAB308]">All courses</Link>
            <Link href="/bookkeeping" className="inline-flex min-h-11 items-center rounded-full border border-white/20 px-5 text-sm font-bold text-white hover:border-[#FACC15] hover:text-[#FACC15]">Bookkeeping</Link>
          </div>
        </div>
        {/* Top Grid */}
        <div className={`grid grid-cols-1 md:grid-cols-2 gap-8 ${hasContactDetails || socialLinks.length > 0 ? 'lg:grid-cols-4' : 'lg:grid-cols-3'}`}>
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
              <li><Link href="/bookkeeping" className="hover:text-[#FACC15] transition-colors">Bookkeeping</Link></li>
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

          {/* Contact Information — fields come from lib/contact.ts; empty ones stay hidden */}
          {(hasContactDetails || socialLinks.length > 0) && (
            <div className="space-y-3">
              {hasContactDetails && (
                <>
                  <h4 className="font-display font-bold text-sm text-[#FACC15] uppercase tracking-wider">
                    Contact Information
                  </h4>
                  <div className="space-y-2 text-xs text-slate-300">
                    {contactInfo.email && (
                      <a href={`mailto:${contactInfo.email}`} className="flex items-center gap-2 hover:text-white">
                        <Mail className="w-3.5 h-3.5 text-[#FACC15]" /> {contactInfo.email}
                      </a>
                    )}
                    {contactInfo.phoneDisplay && (
                      <a href={`tel:${contactInfo.phoneTel}`} className="flex items-center gap-2 hover:text-white">
                        <Phone className="w-3.5 h-3.5 text-[#FACC15]" /> {contactInfo.phoneDisplay}
                      </a>
                    )}
                    {contactInfo.address && (
                      <p className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-[#FACC15]" /> {contactInfo.address}
                      </p>
                    )}
                  </div>
                </>
              )}
              {socialLinks.length > 0 && (
                <div className="pt-2">
                  <h4 className="font-display font-bold text-sm text-[#FACC15] uppercase tracking-wider mb-2">
                    Social Links
                  </h4>
                  <div className="flex flex-wrap gap-3 text-xs text-slate-300">
                    {socialLinks.map((item) => (
                      <a key={item.label} href={item.href} target="_blank" rel="noopener noreferrer" className="hover:text-white">
                        {item.label}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Bottom copyright */}
        <div className="flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 text-xs text-slate-500 sm:flex-row">
          <p>© {new Date().getFullYear()} Career Bridge.Studio. All rights reserved.</p>
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-2">
            <Link href="/about" className="hover:text-[#FACC15]">About</Link>
            <Link href="/privacy" className="hover:text-[#FACC15]">Privacy</Link>
            <Link href="/terms" className="hover:text-[#FACC15]">Terms</Link>
            <Link href="/refund" className="hover:text-[#FACC15]">Refunds</Link>
            <Link href="/verify-certificate" className="hover:text-[#FACC15]">Verify certificate</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
