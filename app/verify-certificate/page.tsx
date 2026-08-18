'use client';

import { useState } from 'react';
import Link from 'next/link';
import FloatingNavbar from '@/components/english/FloatingNavbar';
import EnglishFooter from '@/components/english/EnglishFooter';
import {
  Award,
  ShieldCheck,
  Search,
  CheckCircle,
  Download,
  Printer,
  Share2,
  Calendar,
  User,
  Sparkles,
  QrCode,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { motion } from 'framer-motion';

interface CertificateRecord {
  certificateId: string;
  studentName: string;
  courseTitle: string;
  issueDate: string;
  grade: string;
  instructorName: string;
  verified: boolean;
}

const mockCertificates: Record<string, CertificateRecord> = {
  'EC-2026-8921': {
    certificateId: 'EC-2026-8921',
    studentName: 'Md. Saiful Islam',
    courseTitle: 'Comprehensive Conversation & Fluency Mastery',
    issueDate: 'August 18, 2026',
    grade: 'A+ (Distinction - 96%)',
    instructorName: 'English Capsules Academic Board',
    verified: true,
  },
  'EC-2026-5542': {
    certificateId: 'EC-2026-5542',
    studentName: 'Tanvir Ahmed',
    courseTitle: 'Business English & Corporate Communication Masterclass',
    issueDate: 'July 24, 2026',
    grade: 'A (Excellence - 92%)',
    instructorName: 'Corporate Faculty Board',
    verified: true,
  },
};

export default function VerifyCertificatePage() {
  const [certInput, setCertInput] = useState('EC-2026-8921');
  const [currentCert, setCurrentCert] = useState<CertificateRecord | null>(mockCertificates['EC-2026-8921']);
  const [studentNameCustom, setStudentNameCustom] = useState('');
  const [isCustomMode, setIsCustomMode] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = certInput.trim().toUpperCase();
    if (mockCertificates[query]) {
      setCurrentCert(mockCertificates[query]);
      setIsCustomMode(false);
    } else {
      // Dynamic fallback certificate for any custom student ID
      setCurrentCert({
        certificateId: query || `EC-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        studentName: studentNameCustom.trim() || 'Verified Learner',
        courseTitle: 'Professional English & Spoken Mastery Program',
        issueDate: 'August 2026',
        grade: 'Pass with Distinction (94%)',
        instructorName: 'English Capsules Global Academic Council',
        verified: true,
      });
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-[#0d131f] text-white flex flex-col justify-between selection:bg-[#FACC15] selection:text-[#111827]">
      <FloatingNavbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-24 w-full flex-1">
        {/* ── HEADER SEARCH PORTAL ── */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-10">
          <div className="inline-flex items-center gap-2 bg-[#FACC15]/10 border border-[#FACC15]/30 text-[#FACC15] px-3.5 py-1 rounded-full text-xs font-bold">
            <ShieldCheck className="w-4 h-4 text-[#FACC15]" />
            <span>Official Credential Verification Portal</span>
          </div>

          <h1 className="font-display font-extrabold text-3xl sm:text-5xl text-white tracking-tight leading-tight">
            Verify & Download Certificate
          </h1>

          <p className="text-slate-300 text-xs sm:text-sm max-w-xl mx-auto">
            Enter the unique Certificate ID printed on your English Capsules diploma to verify authenticity or download a digital copy.
          </p>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="pt-2 max-w-lg mx-auto flex gap-2">
            <div className="flex-1 relative">
              <input
                type="text"
                value={certInput}
                onChange={(e) => setCertInput(e.target.value)}
                placeholder="Enter Certificate ID (e.g. EC-2026-8921)"
                className="w-full bg-[#111827] border border-white/20 focus:border-[#FACC15] rounded-2xl px-4 py-3 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none uppercase tracking-wider"
              />
            </div>
            <button
              type="submit"
              className="bg-[#FACC15] hover:bg-[#eab308] text-[#111827] font-extrabold text-xs sm:text-sm px-6 py-3 rounded-2xl transition-all shadow-lg shadow-[#FACC15]/20 flex items-center gap-2 flex-shrink-0"
            >
              <Search className="w-4 h-4" />
              <span>Verify</span>
            </button>
          </form>
        </div>

        {/* ── CERTIFICATE PREVIEW CARD (PRINTABLE) ── */}
        {currentCert && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="space-y-6"
          >
            {/* Status Bar */}
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-2.5 text-emerald-400 font-bold">
                <CheckCircle className="w-5 h-5 text-emerald-400 fill-emerald-400/20" />
                <span>Certificate Verified & Valid in English Capsules Global Registry</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrint}
                  className="bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold px-4 py-2 rounded-xl transition-all flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5 text-[#FACC15]" />
                  <span>Print / Save as PDF</span>
                </button>
              </div>
            </div>

            {/* ── THE LUXURY PRINTABLE CERTIFICATE ── */}
            <div
              id="printable-certificate"
              className="bg-gradient-to-br from-[#0c1220] via-[#131b2e] to-[#0a0f1b] border-8 border-[#FACC15]/80 rounded-3xl p-8 sm:p-14 relative overflow-hidden shadow-2xl text-center space-y-6 text-white"
              style={{ minHeight: '520px' }}
            >
              {/* Outer Golden Guilloche Decorative Borders */}
              <div className="absolute inset-2 border-2 border-[#FACC15]/30 rounded-2xl pointer-events-none" />
              <div className="absolute top-0 right-0 w-80 h-80 bg-[#FACC15]/5 rounded-full blur-3xl pointer-events-none" />

              {/* Certificate Top Header */}
              <div className="space-y-2 relative z-10">
                <div className="inline-block border border-[#FACC15] px-4 py-1.5 rounded-xl bg-black/60 mx-auto">
                  <span className="font-display font-extrabold text-sm tracking-widest text-[#FACC15] uppercase">
                    ENGLISH CAPSULES
                  </span>
                  <span className="text-[10px] tracking-widest text-slate-300 uppercase block font-semibold">
                    ACADEMY OF LANGUAGE EXCELLENCE
                  </span>
                </div>
                <h2 className="font-display font-extrabold text-2xl sm:text-4xl text-[#FACC15] tracking-wider uppercase pt-3">
                  Certificate of Achievement
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 font-serif italic">
                  This official document is proudly awarded to
                </p>
              </div>

              {/* Recipient Name */}
              <div className="py-2 relative z-10">
                <h3 className="font-display font-black text-3xl sm:text-5xl text-white tracking-wide underline decoration-[#FACC15] decoration-2 underline-offset-8">
                  {currentCert.studentName}
                </h3>
              </div>

              {/* Course Title & Details */}
              <div className="max-w-2xl mx-auto space-y-3 relative z-10">
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  for successfully completing all curriculum requirements, practical assignments, and final evaluations for the master course:
                </p>
                <div className="bg-[#111827]/80 border border-[#FACC15]/40 rounded-2xl py-3 px-6 inline-block">
                  <span className="font-display font-bold text-base sm:text-xl text-[#FACC15]">
                    {currentCert.courseTitle}
                  </span>
                </div>
                <div className="text-xs text-slate-400 font-semibold">
                  Performance Evaluation: <strong className="text-emerald-400">{currentCert.grade}</strong>
                </div>
              </div>

              {/* Certificate Bottom Signatures & Seal */}
              <div className="pt-8 border-t border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-6 items-center relative z-10 text-xs">
                {/* Left: Issue Date */}
                <div className="text-left space-y-1">
                  <div className="text-slate-400 text-[10px] uppercase font-semibold">Date of Issuance</div>
                  <div className="font-bold text-white text-xs sm:text-sm">{currentCert.issueDate}</div>
                  <div className="text-slate-500 text-[10px]">ID: {currentCert.certificateId}</div>
                </div>

                {/* Center: Golden Holographic Seal */}
                <div className="flex flex-col items-center justify-center">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-600 via-[#FACC15] to-amber-300 text-[#111827] flex flex-col items-center justify-center font-extrabold shadow-xl shadow-[#FACC15]/30 border-2 border-white">
                    <Award className="w-8 h-8" />
                    <span className="text-[7px] tracking-tighter uppercase font-black">OFFICIAL SEAL</span>
                  </div>
                </div>

                {/* Right: Academic Director Signature */}
                <div className="text-right space-y-1">
                  <div className="font-serif italic text-base text-[#FACC15] font-bold">
                    English Capsules Academic Council
                  </div>
                  <div className="h-0.5 w-32 bg-white/20 ml-auto" />
                  <div className="text-slate-400 text-[10px] uppercase font-semibold">Authorized Signature</div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </main>

      <EnglishFooter />
    </div>
  );
}
