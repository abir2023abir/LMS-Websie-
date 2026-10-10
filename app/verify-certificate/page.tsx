'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import FloatingNavbar from '@/components/english/FloatingNavbar';
import EnglishFooter from '@/components/english/EnglishFooter';
import { generateCertificatePDF } from '@/lib/certificate';
import type { CertificateRecord } from '@/lib/certificate-db';
import {
  Award,
  ShieldCheck,
  Search,
  CheckCircle,
  Printer,
  Download,
  Sparkles,
  AlertCircle,
  Calendar,
  User,
  BookOpen,
  GraduationCap,
  ExternalLink,
  Lock,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function VerifyCertificatePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-[#111827] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <VerifyCertificateContent />
    </Suspense>
  );
}

function VerifyCertificateContent() {
  const searchParams = useSearchParams();
  const initialId = searchParams.get('id') || searchParams.get('certificateId') || 'EC-2026-8921';

  const [certInput, setCertInput] = useState(initialId);
  const [currentCert, setCurrentCert] = useState<CertificateRecord | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  // Auto-verify on initial mount if ID is present
  useEffect(() => {
    if (initialId) {
      verifyCertificate(initialId);
    }
  }, [initialId]);

  const verifyCertificate = async (idToVerify: string) => {
    const cleanId = idToVerify.trim().toUpperCase();
    if (!cleanId) return;

    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch(`/api/certificate/verify?id=${encodeURIComponent(cleanId)}`);
      const data = await res.json();

      if (data.success && data.certificate) {
        setCurrentCert(data.certificate);
        setErrorMsg(null);
      } else {
        setCurrentCert(null);
        setErrorMsg(data.message || `No certificate record was found for ID "${cleanId}". Please verify the code on your diploma.`);
      }
    } catch (err: any) {
      console.error('Verification query error:', err);
      setErrorMsg('An error occurred while connecting to the verification registry. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    verifyCertificate(certInput);
  };

  const handleDownloadPDF = async () => {
    if (!currentCert) return;
    setIsDownloading(true);
    try {
      await generateCertificatePDF({
        studentName: currentCert.studentName,
        courseTitle: currentCert.courseTitle,
        certificateId: currentCert.certificateId,
        issueDate: currentCert.issueDate,
        instructorName: currentCert.instructorName,
        grade: currentCert.grade,
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-50 text-[#111827] flex flex-col justify-between selection:bg-[#FACC15] selection:text-[#111827]">
      <FloatingNavbar />

      {/* ── HEADER BANNER ── */}
      <section className="bg-gradient-to-b from-[#FACC15] via-[#FACC15] to-[#EAB308] pt-32 lg:pt-36 pb-14 px-4 sm:px-6 lg:px-8 text-[#111827]">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 bg-[#111827] text-white rounded-full px-3.5 py-1.5 text-xs font-bold shadow-md">
            <ShieldCheck className="w-4 h-4 text-[#FACC15]" />
            <span>Public Credential Verification Registry</span>
          </div>

          <h1 className="font-display font-extrabold text-3xl sm:text-5xl text-[#111827] tracking-tight leading-tight">
            Verify & Authenticate Diplomas
          </h1>

          <p className="text-[#111827]/85 text-sm sm:text-base max-w-xl mx-auto font-medium">
            Enter the unique Certificate ID printed on any English Capsules diploma to validate its accreditation directly against our database.
          </p>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="pt-3 max-w-lg mx-auto flex gap-2">
            <div className="flex-1 relative">
              <input
                type="text"
                value={certInput}
                onChange={(e) => setCertInput(e.target.value)}
                placeholder="Enter Certificate ID (e.g. EC-2026-8921)..."
                className="w-full bg-white text-[#111827] placeholder-slate-400 font-mono font-bold text-xs sm:text-sm px-4 py-3.5 rounded-2xl border-2 border-black/10 shadow-xl focus:outline-none focus:border-[#111827]"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="bg-[#111827] hover:bg-slate-800 text-white font-extrabold text-xs px-6 py-3.5 rounded-2xl transition-all shadow-md flex items-center gap-2 flex-shrink-0 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
              <span>Verify Credential</span>
            </button>
          </form>

          {/* Sample ID suggestions */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-1 text-xs text-[#111827]/70 font-semibold">
            <span>Try sample records:</span>
            {['EC-2026-8921', 'EC-2026-5542', 'EC-2026-7731'].map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => {
                  setCertInput(id);
                  verifyCertificate(id);
                }}
                className="font-mono bg-black/10 hover:bg-black/20 text-[#111827] px-2.5 py-0.5 rounded-md font-bold transition-colors"
              >
                {id}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── MAIN VERIFICATION RESULTS ── */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full flex-1 space-y-8">
        {/* Loading Indicator */}
        {loading && (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3 shadow-sm">
            <div className="w-8 h-8 border-3 border-[#111827] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="font-bold text-sm text-[#111827]">Querying Public Credential Registry...</p>
          </div>
        )}

        {/* Error / Not Found State */}
        {!loading && errorMsg && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-rose-50 border-2 border-rose-200 rounded-3xl p-8 sm:p-10 text-center space-y-4 shadow-sm"
          >
            <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-7 h-7" />
            </div>
            <div className="space-y-1 max-w-md mx-auto">
              <h3 className="font-display font-bold text-xl text-rose-950">
                Unverified Credential
              </h3>
              <p className="text-xs sm:text-sm text-rose-700 font-medium">
                {errorMsg}
              </p>
            </div>
            <div className="pt-2">
              <button
                onClick={() => {
                  setCertInput('EC-2026-8921');
                  verifyCertificate('EC-2026-8921');
                }}
                className="inline-flex items-center gap-1.5 bg-[#111827] text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow"
              >
                <span>Load Verified Sample (EC-2026-8921)</span>
              </button>
            </div>
          </motion.div>
        )}

        {/* Verified Certificate Display */}
        {!loading && currentCert && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Status Announcement Banner */}
            <div className="bg-emerald-50 border-2 border-emerald-300 rounded-3xl p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-md flex-shrink-0">
                  <CheckCircle className="w-6 h-6 stroke-[2.5]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-display font-extrabold text-base sm:text-lg text-emerald-950">
                      Official Credential Verified & Authentic
                    </span>
                    <span className="bg-emerald-200 text-emerald-900 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase">
                      Active
                    </span>
                  </div>
                  <p className="text-xs text-emerald-800 font-medium mt-0.5">
                    Issued by English Capsules Academy • Cryptographically Validated
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2.5">
                <button
                  onClick={handleDownloadPDF}
                  disabled={isDownloading}
                  className="bg-[#111827] hover:bg-slate-800 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl transition-all shadow flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Download className="w-3.5 h-3.5 text-[#FACC15]" />
                  <span>{isDownloading ? 'Generating PDF...' : 'Download PDF'}</span>
                </button>

                <button
                  onClick={handlePrint}
                  className="bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 font-bold text-xs px-4 py-2.5 rounded-xl transition-colors flex items-center gap-1.5 shadow-xs"
                >
                  <Printer className="w-3.5 h-3.5 text-slate-600" />
                  <span className="hidden sm:inline">Print</span>
                </button>
              </div>
            </div>

            {/* ── LUXURY PRINTABLE DIPLOMA CARD ── */}
            <div className="bg-[#FCFBF7] border-8 border-[#111827] rounded-3xl p-6 sm:p-12 shadow-2xl relative overflow-hidden print:p-0 print:border-none print:shadow-none">
              {/* Inner Decorative Gold Border */}
              <div className="border-4 border-[#D4AF37] rounded-2xl p-6 sm:p-10 relative space-y-8 text-center bg-white/60">
                {/* Header Seal */}
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-2 bg-[#111827] text-[#FACC15] border border-[#D4AF37] text-[11px] font-extrabold px-4 py-1 rounded-full uppercase tracking-widest shadow">
                    <Sparkles className="w-3.5 h-3.5 fill-[#FACC15]" />
                    <span>English Capsules Academy</span>
                  </div>
                  <h2 className="font-display font-black text-2xl sm:text-4xl text-[#111827] tracking-tight uppercase pt-2">
                    Certificate of Completion
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 font-semibold uppercase tracking-widest">
                    Official Fluency & Academic Credential
                  </p>
                </div>

                {/* Recipient */}
                <div className="space-y-2 py-2">
                  <p className="text-xs sm:text-sm text-slate-500 italic">This is proudly awarded to</p>
                  <div className="font-display font-black text-2xl sm:text-4xl text-[#111827] underline decoration-[#FACC15] decoration-4 underline-offset-8">
                    {currentCert.studentName}
                  </div>
                </div>

                {/* Course Completion Details */}
                <div className="max-w-2xl mx-auto space-y-2">
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                    for successfully fulfilling all curriculum requirements, continuous assessment drills, and practical speech evaluations in:
                  </p>
                  <div className="font-display font-extrabold text-base sm:text-xl text-amber-900 bg-amber-50/80 border border-amber-200 py-3 px-6 rounded-2xl inline-block">
                    {currentCert.courseTitle}
                  </div>
                </div>

                {/* Metadata Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-200 text-left text-xs">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Certificate ID</span>
                    <span className="font-mono font-extrabold text-[#111827] text-xs sm:text-sm">
                      {currentCert.certificateId}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Issue Date</span>
                    <span className="font-bold text-[#111827] text-xs sm:text-sm">
                      {currentCert.issueDate}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Academic Standing</span>
                    <span className="font-extrabold text-emerald-700 text-xs sm:text-sm">
                      {currentCert.grade}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Issuing Authority</span>
                    <span className="font-bold text-[#111827] text-xs truncate block">
                      {currentCert.instructorName}
                    </span>
                  </div>
                </div>

                {/* Footer Official Seal & Signatures */}
                <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-6">
                  {/* Left Signature */}
                  <div className="text-center sm:text-left space-y-1">
                    <div className="font-serif italic font-bold text-base text-slate-800">
                      Sarah Jenkins, M.Ed
                    </div>
                    <div className="h-0.5 w-36 bg-slate-300 mx-auto sm:mx-0" />
                    <div className="text-[10px] text-slate-400 font-bold uppercase">Dean of Academic Faculty</div>
                  </div>

                  {/* Center Gold Seal */}
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#FACC15] to-[#CA8A04] text-[#111827] flex flex-col items-center justify-center shadow-lg border-2 border-white font-extrabold text-[9px] uppercase tracking-tighter flex-shrink-0">
                    <Award className="w-5 h-5 mb-0.5" />
                    <span>Verified</span>
                  </div>

                  {/* Right Signature */}
                  <div className="text-center sm:text-right space-y-1">
                    <div className="font-serif italic font-bold text-base text-slate-800">
                      Dr. Christopher Lee
                    </div>
                    <div className="h-0.5 w-36 bg-slate-300 mx-auto sm:ml-auto" />
                    <div className="text-[10px] text-slate-400 font-bold uppercase">Academic Council Director</div>
                  </div>
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
