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
                  English
                </span>
                <span className="font-display font-bold text-[10px] tracking-widest text-white uppercase leading-none mt-0.5">
                  Capsules
                </span>
              </div>
            </Link>
            <p className="text-xs text-slate-400 leading-relaxed">
              Empowering learners worldwide with practical, goal-oriented English education since 2015. Short, effective sessions tailored for real progress.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="font-display font-bold text-sm text-[#FACC15] uppercase tracking-wider">
              Quick Links
            </h4>
            <ul className="space-y-2 text-xs text-slate-300">
              <li><a href="#" className="hover:text-[#FACC15] transition-colors">Home</a></li>
              <li><Link href="/courses" className="hover:text-[#FACC15] transition-colors">Price Offers & Courses</Link></li>
              <li><Link href="/services" className="hover:text-[#FACC15] transition-colors">Live Coaching Plans</Link></li>
              <li><a href="#about" className="hover:text-[#FACC15] transition-colors">Who We Are</a></li>
              <li><a href="#contact" className="hover:text-[#FACC15] transition-colors">Branch Locations</a></li>
            </ul>
          </div>

          {/* Branches & Contact */}
          <div className="space-y-3">
            <h4 className="font-display font-bold text-sm text-[#FACC15] uppercase tracking-wider">
              Our Branches
            </h4>
            <div className="space-y-2 text-xs text-slate-300">
              <p className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-[#FACC15]" /> Central Campus Branch
              </p>
              <p className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-[#FACC15]" /> +1 (800) 555-ENGLISH
              </p>
              <p className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-[#FACC15]" /> support@englishcapsules.com
              </p>
            </div>
          </div>

          {/* Newsletter / CTA */}
          <div className="space-y-3">
            <h4 className="font-display font-bold text-sm text-[#FACC15] uppercase tracking-wider">
              Get In Touch
            </h4>
            <p className="text-xs text-slate-400">
              Subscribe to get special discount offers and free English learning tips.
            </p>
            <div className="flex items-center gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="bg-white/10 border border-white/20 rounded-full px-3.5 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#FACC15] w-full"
              />
              <button
                aria-label="Subscribe"
                className="bg-[#FACC15] text-[#111827] p-2.5 rounded-full font-bold hover:bg-[#eab308] transition-all flex-shrink-0"
              >
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="border-t border-white/10 pt-6 text-center text-xs text-slate-500">
          © {new Date().getFullYear()} English Capsules LMS. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
