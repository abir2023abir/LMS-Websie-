'use client';

import Link from 'next/link';
import { Phone, Mail, MapPin } from 'lucide-react';
import { contactInfo, hasContactDetails, socialLinks } from '@/lib/contact';

export default function Footer() {
  return (
    <footer id="contact" className="bg-[#111827] text-white pt-16 pb-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
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
        <div className="border-t border-white/10 pt-6 text-center text-xs text-slate-500">
          © {new Date().getFullYear()} Career Bridge.Studio. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
