'use client';

import { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import {
  Award,
  Download,
  Printer,
  X,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  Calendar,
  User,
  Share2,
  FileCheck,
} from 'lucide-react';
import { generateCertificatePDF } from '@/lib/certificate';

interface CertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentName: string;
  courseTitle: string;
  certificateId?: string;
  issueDate?: string;
  completedAt?: string;
  instructorName?: string;
}

export default function CertificateModal({
  isOpen,
  onClose,
  studentName,
  courseTitle,
  certificateId = 'EC-2026-8921',
  issueDate,
  completedAt,
  instructorName = 'Sarah Jenkins',
}: CertificateModalProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const formattedDate =
    issueDate ||
    (completedAt
      ? new Date(completedAt).toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        })
      : new Date().toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        }));

  // Launch celebratory confetti when modal opens
  useEffect(() => {
    if (isOpen) {
      const end = Date.now() + 1.5 * 1000;
      const colors = ['#FACC15', '#10B981', '#6366F1', '#EC4899', '#38BDF8'];

      (function frame() {
        confetti({
          particleCount: 4,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors,
        });
        confetti({
          particleCount: 4,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors,
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      })();
    }
  }, [isOpen]);

  // Auto-register certificate in backend database when modal opens
  useEffect(() => {
    if (isOpen && certificateId && studentName) {
      fetch('/api/certificate/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          certificateId,
          studentName,
          courseTitle,
          completionDate: formattedDate,
          instructorName,
        }),
      }).catch((err) => console.warn('Certificate registry sync notice:', err));
    }
  }, [isOpen, certificateId, studentName, courseTitle, formattedDate, instructorName]);

  if (!isOpen) return null;

  const handleDownloadPDF = async () => {
    try {
      setIsDownloading(true);
      await generateCertificatePDF({
        studentName: studentName || 'Verified Student',
        courseTitle,
        certificateId,
        issueDate: formattedDate,
        instructorName,
      });
    } catch (err) {
      console.error('Error generating PDF:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleCopyVerification = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(
        `${window.location.origin}/verify-certificate?id=${certificateId}`
      );
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-[#111827] border border-white/15 rounded-3xl shadow-2xl overflow-hidden my-8">
        {/* Top Header Bar */}
        <div className="bg-gradient-to-r from-purple-900/40 via-amber-900/30 to-[#111827] border-b border-white/10 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FACC15] text-[#111827] flex items-center justify-center shadow-lg shadow-[#FACC15]/30">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[#FACC15] text-xs font-extrabold uppercase tracking-wider">
                  Official Diploma
                </span>
                <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 border border-emerald-500/30">
                  <CheckCircle2 className="w-3 h-3" /> 100% Completed
                </span>
              </div>
              <h2 className="text-white font-display font-bold text-lg">
                Certificate of Academic Achievement
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Certificate Canvas Simulation */}
        <div className="p-6 sm:p-8 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Certificate Visual Card */}
          <div
            id="certificate-print-area"
            className="relative bg-[#faf7f0] text-[#0f172a] rounded-2xl p-6 sm:p-10 border-4 border-[#0f172a] shadow-inner select-none"
            style={{
              backgroundImage: 'radial-gradient(#d4af37 0.75px, transparent 0.75px)',
              backgroundSize: '24px 24px',
            }}
          >
            {/* Inner Gold Border */}
            <div className="border-2 border-[#d4af37] p-6 sm:p-8 rounded-xl relative space-y-6 text-center">
              {/* Top Crest / Academy Header */}
              <div className="space-y-1">
                <div className="text-[11px] sm:text-xs font-bold tracking-widest text-[#0f172a] uppercase">
                  LearnVerse • English Capsules Global Academy
                </div>
                <div className="text-[9px] sm:text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                  Accredited Continuing Education & Skill Mastery Council
                </div>
                <div className="w-24 h-0.5 bg-[#d4af37] mx-auto mt-2" />
              </div>

              {/* Certificate Title */}
              <div className="space-y-1 pt-2">
                <h1 className="font-display font-black text-2xl sm:text-4xl text-[#0f172a] tracking-tight uppercase">
                  Certificate of Completion
                </h1>
                <p className="text-[11px] font-extrabold text-amber-700 uppercase tracking-widest">
                  ★ With Distinction & Practical Merit ★
                </p>
              </div>

              {/* Conferred to */}
              <div className="space-y-1 pt-2">
                <p className="text-xs sm:text-sm text-slate-500 italic">
                  This official credential is proudly conferred upon
                </p>
                <div className="text-2xl sm:text-3xl font-extrabold text-[#0f172a] tracking-normal font-display">
                  {studentName || 'Verified Learner'}
                </div>
                <div className="w-48 h-0.5 bg-[#d4af37] mx-auto" />
              </div>

              {/* Description */}
              <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">
                for successfully completing all curriculum video modules, real-world case studies,
                practical speech exercises, and the comprehensive evaluation criteria in
              </p>

              {/* Course Title Banner */}
              <div className="bg-slate-100/90 border border-slate-300/80 rounded-xl py-3 px-4 max-w-lg mx-auto shadow-sm">
                <h3 className="font-display font-bold text-sm sm:text-base text-[#0f172a]">
                  {courseTitle}
                </h3>
              </div>

              {/* Seal & Metadata Grid */}
              <div className="pt-4 grid grid-cols-1 sm:grid-cols-3 items-center gap-4 text-xs border-t border-slate-200">
                {/* Left Meta */}
                <div className="text-left space-y-1">
                  <div className="text-[10px] text-slate-500 font-semibold uppercase">
                    Issue Date
                  </div>
                  <div className="font-bold text-[#0f172a]">{formattedDate}</div>
                  <div className="text-[10px] text-emerald-700 font-bold">
                    Grade: Distinction (100%)
                  </div>
                </div>

                {/* Center Seal Stamp */}
                <div className="flex flex-col items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-amber-100 border-2 border-[#d4af37] flex flex-col items-center justify-center shadow-md">
                    <span className="text-[7px] font-black text-amber-800 uppercase tracking-tighter">
                      Official Seal
                    </span>
                    <span className="text-xs font-extrabold text-amber-900">★ 100% ★</span>
                    <span className="text-[6px] font-bold text-amber-700 uppercase">Verified</span>
                  </div>
                </div>

                {/* Right Meta */}
                <div className="text-right space-y-1">
                  <div className="text-[10px] text-slate-500 font-semibold uppercase">
                    Credential ID
                  </div>
                  <div className="font-mono font-bold text-[#0f172a] tracking-wider">
                    {certificateId}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    Verify at: englishcapsules.com/verify
                  </div>
                </div>
              </div>

              {/* Signatures */}
              <div className="pt-6 grid grid-cols-2 gap-8 max-w-lg mx-auto">
                <div className="space-y-1 border-t border-slate-400 pt-2 text-center">
                  <div className="font-serif italic text-base text-slate-800">
                    {instructorName}
                  </div>
                  <div className="text-[10px] font-bold text-[#0f172a] uppercase">
                    {instructorName}
                  </div>
                  <div className="text-[9px] text-slate-500">Lead Master Instructor</div>
                </div>

                <div className="space-y-1 border-t border-slate-400 pt-2 text-center">
                  <div className="font-serif italic text-base text-slate-800">
                    Dr. Robert Vance
                  </div>
                  <div className="text-[10px] font-bold text-[#0f172a] uppercase">
                    Dr. Robert Vance
                  </div>
                  <div className="text-[9px] text-slate-500">Director of Academic Affairs</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="bg-[#0f172a] border-t border-white/10 p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-[#FACC15]" />
            <span>High-Resolution Vector PDF • Ready for Print & LinkedIn</span>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto justify-end">
            <button
              onClick={handleCopyVerification}
              className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 text-xs font-semibold flex items-center gap-1.5 transition-all"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{copiedLink ? 'Link Copied!' : 'Share Verification'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-semibold flex items-center gap-1.5 transition-all"
            >
              <Printer className="w-3.5 h-3.5 text-[#FACC15]" />
              <span>Print Diploma</span>
            </button>

            <button
              onClick={handleDownloadPDF}
              disabled={isDownloading}
              className="px-6 py-2.5 rounded-xl bg-[#FACC15] hover:bg-[#eab308] text-[#111827] font-extrabold text-xs flex items-center gap-2 transition-all shadow-lg shadow-[#FACC15]/20 disabled:opacity-50"
            >
              {isDownloading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-[#111827] border-t-transparent rounded-full animate-spin" />
                  <span>Generating Vector PDF...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Download PDF Certificate</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
