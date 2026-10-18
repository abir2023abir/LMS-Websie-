'use client';

import { Suspense, useEffect, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Mail, Lock, ArrowRight, ArrowLeft, AlertCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { homeForRole } from '@/lib/roles';

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-[#111827] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <LoginPageContent />
    </Suspense>
  );
}

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get('next');
  const { loginWithEmail, user, role, loading: authLoading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If user is already authenticated, redirect to their role dashboard
  useEffect(() => {
    if (!authLoading && user && role) {
      const safeNext =
        nextPath && nextPath.startsWith('/') && !nextPath.startsWith('//') ? nextPath : null;
      router.replace(safeNext || homeForRole(role));
    }
  }, [authLoading, user, role, router, nextPath]);

  const handleEmailLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Please enter both your email and password');
      return;
    }

    setIsSubmitting(true);
    try {
      await loginWithEmail(email, password);
    } catch (err: any) {
      console.error('Login error:', err);
      if (err.code === 'auth/invalid-credential') {
        setError('Invalid email or password. Please check your credentials.');
      } else {
        setError(err.message || 'Login failed. Please try again.');
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
      <div className="absolute top-[-100px] right-[-100px] w-96 h-96 bg-[#FACC15]/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-100px] left-[-100px] w-96 h-96 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

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
          Welcome Back
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 font-medium">
          Sign in to access your English classroom & certificate portal
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10 px-4">
        <div className="bg-white rounded-3xl border border-slate-200/80 p-8 shadow-xl space-y-6">
          {/* Error Banner */}
          {error && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-rose-700 text-xs font-medium">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleEmailLogin} className="space-y-4">
            {/* Email */}
            <div>
              <label htmlFor="login-email" className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="login-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@englishcapsules.com"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-xs sm:text-sm text-[#111827] placeholder-slate-400 focus:outline-none focus:border-[#111827] transition-colors font-medium"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="login-password" className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Password
                </label>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="login-password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-xs sm:text-sm text-[#111827] placeholder-slate-400 focus:outline-none focus:border-[#111827] transition-colors font-medium"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#FACC15] hover:bg-[#eab308] text-[#111827] font-extrabold text-xs sm:text-sm py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md shadow-[#FACC15]/25 disabled:opacity-50 mt-2"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-[#111827] border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In to Classroom</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Sign Up Link */}
          <div className="text-center pt-2 border-t border-slate-100 text-xs text-slate-600">
            Don’t have an account yet?{' '}
            <Link href="/signup" className="text-amber-600 hover:underline font-extrabold">
              Create an Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
