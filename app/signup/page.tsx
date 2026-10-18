'use client';

import { useEffect, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  GraduationCap,
  Mail,
  Lock,
  User,
  BookOpen,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
} from 'lucide-react';
import { useAuth, type UserRole } from '@/context/AuthContext';
import { homeForRole } from '@/lib/roles';
import { Users, Briefcase } from 'lucide-react';

export default function SignUpPage() {
  const router = useRouter();
  const { signUpWithEmail, user, role, loading: authLoading } = useAuth();

  const [selectedRole, setSelectedRole] = useState<UserRole>('Student');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [linkedStudentEmail, setLinkedStudentEmail] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if user is already logged in
  useEffect(() => {
    if (!authLoading && user && role) router.replace(homeForRole(role));
  }, [authLoading, user, role, router]);

  const handleEmailSignUp = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Please enter your full name');
      return;
    }
    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (selectedRole === 'Guardian' && !linkedStudentEmail.trim()) {
      setError('Enter the email of the student this guardian is linked to');
      return;
    }

    setIsSubmitting(true);
    try {
      await signUpWithEmail(email, password, name, selectedRole, {
        linkedStudentEmail: selectedRole === 'Guardian' ? linkedStudentEmail : undefined,
      });
      router.push(homeForRole(selectedRole));
    } catch (err: any) {
      console.error('Sign up error:', err);
      if (err.code === 'auth/email-already-in-use') {
        setError('An account with this email already exists. Try logging in instead.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Please provide a valid email address.');
      } else if (err.code === 'auth/weak-password') {
        setError('Password is too weak. Please use at least 6 characters.');
      } else {
        setError(err.message || 'Failed to create account. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-[#111827] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden selection:bg-[#FACC15] selection:text-[#111827]">
      {/* Back to Home */}
      <Link
        href="/"
        className="absolute top-6 left-6 sm:top-8 sm:left-8 z-20 inline-flex items-center gap-2 bg-white/90 backdrop-blur border border-slate-200 hover:border-[#111827] hover:bg-[#FACC15] text-[#111827] text-xs font-bold px-4 py-2.5 rounded-full shadow-sm transition-all"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Home
      </Link>

      {/* Background Soft Glow */}
      <div className="absolute top-[-100px] left-[-100px] w-96 h-96 bg-[#FACC15]/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-100px] right-[-100px] w-96 h-96 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center z-10 px-4 space-y-3">
        <Link href="/" className="inline-flex items-center gap-2 group">
          <div className="border-2 border-[#111827] px-3.5 py-1.5 rounded-2xl bg-[#FACC15] shadow-md flex flex-col items-center justify-center">
            <span className="font-display font-black text-xs tracking-wider text-[#111827] uppercase leading-none">
              English
            </span>
            <span className="font-display font-bold text-[9px] tracking-widest text-[#111827] uppercase leading-none mt-0.5">
              Capsules
            </span>
          </div>
        </Link>
        <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-[#111827] tracking-tight">
          Create Your Account
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 font-medium">
          Join 500,000+ students mastering fluent English today
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10 px-4">
        <div className="bg-white rounded-3xl border border-slate-200/80 p-8 shadow-xl space-y-6">
          {/* Role Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">
              I am joining as a:
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setSelectedRole('Student')}
                className={`p-3.5 rounded-2xl border flex flex-col items-center gap-1.5 transition-all text-xs font-bold ${
                  selectedRole === 'Student'
                    ? 'bg-[#FACC15] text-[#111827] border-[#111827] shadow-md shadow-[#FACC15]/20'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-[#111827] hover:bg-slate-100'
                }`}
              >
                <GraduationCap className="w-5 h-5" />
                <span>Student</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedRole('Instructor')}
                className={`p-3.5 rounded-2xl border flex flex-col items-center gap-1.5 transition-all text-xs font-bold ${
                  selectedRole === 'Instructor'
                    ? 'bg-[#FACC15] text-[#111827] border-[#111827] shadow-md shadow-[#FACC15]/20'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-[#111827] hover:bg-slate-100'
                }`}
              >
                <BookOpen className="w-5 h-5" />
                <span>Mentor</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedRole('Guardian')}
                className={`p-3.5 rounded-2xl border flex flex-col items-center gap-1.5 transition-all text-xs font-bold ${
                  selectedRole === 'Guardian'
                    ? 'bg-[#FACC15] text-[#111827] border-[#111827] shadow-md shadow-[#FACC15]/20'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-[#111827] hover:bg-slate-100'
                }`}
              >
                <Users className="w-5 h-5" />
                <span>Guardian</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedRole('ServiceCustomer')}
                className={`p-3.5 rounded-2xl border flex flex-col items-center gap-1.5 transition-all text-xs font-bold ${
                  selectedRole === 'ServiceCustomer'
                    ? 'bg-[#FACC15] text-[#111827] border-[#111827] shadow-md shadow-[#FACC15]/20'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-[#111827] hover:bg-slate-100'
                }`}
              >
                <Briefcase className="w-5 h-5" />
                <span>Service Customer</span>
              </button>
            </div>
            {selectedRole === 'Guardian' && (
              <div className="mt-3">
                <label htmlFor="linked-student" className="block text-xs font-bold text-slate-700 mb-1.5">
                  Linked student email
                </label>
                <input
                  id="linked-student"
                  type="email"
                  value={linkedStudentEmail}
                  onChange={(e) => setLinkedStudentEmail(e.target.value)}
                  placeholder="student@email.com"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs sm:text-sm text-[#111827] placeholder-slate-400 focus:outline-none focus:border-[#111827] font-medium"
                />
                <p className="mt-1.5 text-[11px] text-slate-500">
                  The student or an admin must approve this link before you see anything.
                </p>
              </div>
            )}
          </div>

          {/* Error Banner */}
          {error && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-rose-700 text-xs font-medium">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleEmailSignUp} className="space-y-4">
            {/* Name */}
            <div>
              <label htmlFor="signup-name" className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="signup-name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Sarah Ahmed"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-xs sm:text-sm text-[#111827] placeholder-slate-400 focus:outline-none focus:border-[#111827] transition-colors font-medium"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="signup-email" className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="signup-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="sarah@englishcapsules.com"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-xs sm:text-sm text-[#111827] placeholder-slate-400 focus:outline-none focus:border-[#111827] transition-colors font-medium"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="signup-password" className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="signup-password"
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-xs sm:text-sm text-[#111827] placeholder-slate-400 focus:outline-none focus:border-[#111827] transition-colors font-medium"
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#FACC15] hover:bg-[#eab308] text-[#111827] font-extrabold text-xs sm:text-sm py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md shadow-[#FACC15]/25 disabled:opacity-50 mt-2"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-[#111827] border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Create {selectedRole} Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Login Link */}
          <div className="text-center pt-2 border-t border-slate-100 text-xs text-slate-600">
            Already have an account?{' '}
            <Link href="/login" className="text-amber-600 hover:underline font-extrabold">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
