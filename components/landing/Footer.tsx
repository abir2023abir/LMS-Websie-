'use client';

import Link from 'next/link';
import { Phone, Mail, MapPin } from 'lucide-react';
import { contactInfo, hasContactDetails, socialLinks } from '@/lib/contact';
import BrandLogo from '@/components/brand/BrandLogo';

export default function Footer() {
  return (
    <footer id="contact" className="border-t border-slate-200 bg-white pt-10 pb-8 text-[#111827]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="flex flex-col items-start justify-between gap-5 rounded-3xl border border-slate-200 bg-slate-50 px-6 py-6 sm:flex-row sm:items-center">
          <div>
            <p className="font-display text-xl font-extrabold text-[#111827]">Take the next step</p>
            <p className="mt-1 max-w-md text-sm text-[#111827]">Open a course, or talk to the team about bookkeeping for your business.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/courses" className="inline-flex min-h-11 items-center rounded-full border-2 border-[#D4AF37] bg-[#FACC15] px-5 text-sm font-extrabold text-[#111827] hover:bg-[#EAB308]">All courses</Link>
            <Link href="/bookkeeping" className="inline-flex min-h-11 items-center rounded-full border-2 border-[#D4AF37] bg-white px-5 text-sm font-bold text-[#111827] hover:bg-[#FACC15]">Bookkeeping</Link>
          </div>
        </div>
        {/* Top Grid */}
        <div className={`grid grid-cols-1 md:grid-cols-2 gap-8 ${hasContactDetails || socialLinks.length > 0 ? 'lg:grid-cols-4' : 'lg:grid-cols-3'}`}>
          {/* Brand Column */}
          <div className="space-y-4">
            <Link href="/" className="inline-block" aria-label="Career Bridge Studio home">
              <BrandLogo className="h-16 w-auto" />
            </Link>
            <p className="text-xs leading-relaxed text-[#111827]">
              A structured learning platform designed to help learners build knowledge, develop practical skills, and progress toward their goals.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="font-display font-bold text-sm text-[#FACC15] uppercase tracking-wider">
              Quick Links
            </h4>
            <ul className="space-y-2 text-xs text-[#111827]">
              <li><Link href="/" className="hover:underline">Home</Link></li>
              <li><Link href="/courses" className="hover:underline">All Courses</Link></li>
              <li><Link href="/bookkeeping" className="hover:underline">Bookkeeping</Link></li>
              <li><Link href="/contact" className="hover:underline">Contact</Link></li>
              <li><Link href="/login" className="hover:underline">Login / Sign Up</Link></li>
            </ul>
          </div>

          {/* Learning Resources */}
          <div className="space-y-3">
            <h4 className="font-display font-bold text-sm text-[#FACC15] uppercase tracking-wider">
              Learning Resources
            </h4>
            <ul className="space-y-2 text-xs text-[#111827]">
              <li><Link href="/courses" className="hover:underline">Course Catalogue</Link></li>
              <li><Link href="/about" className="hover:underline">Learning Guide</Link></li>
              <li><Link href="/student/quizzes" className="hover:underline">Assessments</Link></li>
              <li><Link href="/contact" className="hover:underline">Student Support</Link></li>
            </ul>
          </div>

          {/* Contact Information — fields come from lib/contact.ts; empty ones stay hidden */}
          {(hasContactDetails || socialLinks.length > 0) && (
            <div className="space-y-3">
              {hasContactDetails && (
                <>
                  <h4 className="font-display font-bold text-sm uppercase tracking-wider text-[#111827]">
                    Contact Information
                  </h4>
                  <div className="space-y-2 text-xs text-[#111827]">
                    {contactInfo.email && (
                      <a href={`mailto:${contactInfo.email}`} className="flex items-center gap-2 hover:underline">
                        <Mail className="w-3.5 h-3.5 text-[#FACC15]" /> {contactInfo.email}
                      </a>
                    )}
                    {contactInfo.phoneDisplay && (
                      <a href={`tel:${contactInfo.phoneTel}`} className="flex items-center gap-2 hover:underline">
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
                  <h4 className="mb-2 font-display text-sm font-bold uppercase tracking-wider text-[#111827]">
                    Social Links
                  </h4>
                  <div className="flex flex-wrap gap-3 text-xs text-[#111827]">
                    {socialLinks.map((item) => (
                      <a key={item.label} href={item.href} target="_blank" rel="noopener noreferrer" className="hover:underline">
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
        <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-200 pt-6 text-xs text-[#111827] sm:flex-row">
          <p>© {new Date().getFullYear()} Career Bridge.Studio. All rights reserved.</p>
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-2">
            <Link href="/about" className="hover:underline">About</Link>
            <Link href="/privacy" className="hover:underline">Privacy</Link>
            <Link href="/terms" className="hover:underline">Terms</Link>
            <Link href="/refund" className="hover:underline">Refunds</Link>
            <Link href="/verify-certificate" className="hover:underline">Verify certificate</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
