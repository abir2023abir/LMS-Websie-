'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, ChevronRight, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function FloatingNavbar() {
  const [activeTab, setActiveTab] = useState('Home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { name: 'Home', href: '#' },
    { name: 'Price Offers', href: '#courses' },
    { name: 'Our Branches', href: '#branches' },
    { name: 'About Us', href: '#about' },
    { name: 'Contact Us', href: '#contact' },
  ];

  return (
    <header className="fixed top-4 inset-x-0 z-50 px-4 max-w-6xl mx-auto">
      <div className="bg-[#111827] text-white rounded-full px-4 sm:px-6 py-2.5 shadow-2xl border border-white/10 flex items-center justify-between">
        {/* ── Left: Logo ── */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="border border-[#FACC15] px-3 py-1 rounded-lg bg-black/40 flex flex-col items-center justify-center">
            <span className="font-display font-extrabold text-xs tracking-wider text-[#FACC15] uppercase leading-none">
              English
            </span>
            <span className="font-display font-bold text-[9px] tracking-widest text-white uppercase leading-none mt-0.5">
              Capsules
            </span>
          </div>
        </Link>

        {/* ── Center: Nav Links ── */}
        <nav className="hidden lg:flex items-center gap-6">
          {navItems.map((item) => {
            const isActive = activeTab === item.name;
            return (
              <a
                key={item.name}
                href={item.href}
                onClick={() => setActiveTab(item.name)}
                className={`relative text-xs font-semibold transition-colors duration-200 py-1 ${
                  isActive ? 'text-[#FACC15]' : 'text-slate-300 hover:text-white'
                }`}
              >
                {item.name}
                {isActive && (
                  <motion.div
                    layoutId="activePill"
                    className="absolute -bottom-1 left-0 right-0 h-0.5 bg-[#FACC15] rounded-full"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </a>
            );
          })}
        </nav>

        {/* ── Right: Action Pill Buttons ── */}
        <div className="hidden sm:flex items-center gap-3">
          {/* Company Outlined Button */}
          <a
            href="#about"
            className="group flex items-center bg-transparent border border-white/20 hover:border-white/40 text-white rounded-full pl-4 pr-1 py-1 text-xs font-semibold transition-all"
          >
            <span>Company</span>
            <div className="ml-2 w-6 h-6 rounded-full bg-white/10 group-hover:bg-white/20 flex items-center justify-center transition-colors">
              <ArrowRight className="w-3.5 h-3.5 text-white" />
            </div>
          </a>

          {/* Log In Solid Yellow Button */}
          <Link
            href="/login"
            className="group flex items-center bg-[#FACC15] hover:bg-[#eab308] text-[#111827] rounded-full pl-4 pr-1 py-1 text-xs font-bold transition-all shadow-lg shadow-[#FACC15]/20"
          >
            <span>Log In</span>
            <div className="ml-2 w-6 h-6 rounded-full bg-[#111827] flex items-center justify-center transition-colors">
              <ArrowRight className="w-3.5 h-3.5 text-[#FACC15]" />
            </div>
          </Link>
        </div>

        {/* ── Mobile Hamburger Toggle ── */}
        <button
          onClick={() => setMobileMenuOpen((o) => !o)}
          className="lg:hidden p-1.5 text-slate-300 hover:text-white rounded-full hover:bg-white/10"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* ── Mobile Drawer ── */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="lg:hidden mt-2 bg-[#111827] rounded-3xl border border-white/10 p-5 space-y-3 shadow-2xl text-white"
          >
            {navItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                onClick={() => {
                  setActiveTab(item.name);
                  setMobileMenuOpen(false);
                }}
                className="block text-sm font-semibold text-slate-300 hover:text-[#FACC15] py-1.5"
              >
                {item.name}
              </a>
            ))}
            <div className="pt-2 border-t border-white/10 flex flex-col gap-2">
              <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                <div className="w-full flex items-center justify-between bg-[#FACC15] text-[#111827] font-bold text-xs py-2.5 px-4 rounded-full">
                  <span>Log In</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
