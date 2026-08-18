'use client';

import { useState, type FormEvent } from 'react';
import { ChevronsRight, ArrowRight, Sparkles, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ContactFormSection() {
  const [email, setEmail] = useState('');
  const [program, setProgram] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitted(true);
    setTimeout(() => {
      setEmail('');
      setProgram('');
      setSubmitted(false);
    }, 3000);
  };

  return (
    <section id="contact" className="bg-[#111827] text-white py-20 relative overflow-hidden border-t border-white/10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-8">
        {/* Header */}
        <div className="text-center space-y-3 relative">
          <Sparkles className="w-6 h-6 text-[#FACC15] absolute -top-2 right-12 fill-[#FACC15]" />
          
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/15 text-[#FACC15] rounded-full px-3.5 py-1">
            <div className="bg-[#FACC15] text-[#111827] p-1 rounded-full flex items-center justify-center">
              <ChevronsRight className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-bold tracking-wide">Contact Us</span>
          </div>

          <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-white tracking-tight">
            Here To Answer Your Questions And Support You Anytime
          </h2>
        </div>

        {/* Form Container */}
        <div className="bg-dark-800/90 border border-white/10 p-6 sm:p-10 rounded-3xl shadow-2xl">
          {submitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-8 text-center space-y-3"
            >
              <CheckCircle className="w-12 h-12 text-[#FACC15] mx-auto" />
              <h3 className="font-display font-bold text-xl text-white">Thank You for Reaching Out!</h3>
              <p className="text-xs text-slate-300">Our advisor team will contact you within 2 hours.</p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="w-full bg-dark-900 border border-white/15 rounded-2xl px-4 py-3.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#FACC15]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Program Required
                </label>
                <select
                  value={program}
                  onChange={(e) => setProgram(e.target.value)}
                  className="w-full bg-dark-900 border border-white/15 rounded-2xl px-4 py-3.5 text-sm text-white focus:outline-none focus:border-[#FACC15]"
                >
                  <option value="">Choose the desired program</option>
                  <option value="general">General English Foundation</option>
                  <option value="spoken">Spoken English & Accent</option>
                  <option value="business">Business English & Career</option>
                  <option value="ielts">IELTS Band 8+ Masterclass</option>
                </select>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="group inline-flex items-center bg-[#FACC15] hover:bg-[#eab308] text-[#111827] rounded-full pl-6 pr-1.5 py-3 text-xs font-extrabold shadow-lg shadow-[#FACC15]/20 transition-all"
                >
                  <span>Contact Us</span>
                  <div className="ml-3 w-7 h-7 rounded-full bg-[#111827] flex items-center justify-center">
                    <ArrowRight className="w-3.5 h-3.5 text-[#FACC15]" />
                  </div>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
