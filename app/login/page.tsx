'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, ArrowRight, AlertCircle, Sparkles, ChevronsRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const { loginWithEmail, loginWithGoogle, user, role, loading: authLoading, isDemoMode } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If user is already authenticated, redirect to their role dashboard
  if (!authLoading && user && role) {
    if (role === 'Instructor') {
      router.replace('/dashboard/instructor');
    } else {
      router.replace('/student');
    }
  }

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
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setError('Invalid email or password. Please check your credentials.');
      } else if (err.code === 'auth/api-key-not-valid' || err.message?.includes('api-key-not-valid')) {
        setError('Firebase API Key is in offline demo mode. You can still log in or sign up with any test account!');
      } else {
        setError(err.message || 'Login failed. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setIsSubmitting(true);
    try {
      await loginWithGoogle();
    } catch (err: any) {
      console.error('Google login error:', err);
      if (err.code !== 'auth/popup-closed-by-user') {
        setError('Google sign in failed. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-[#111827] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden selection:bg-[#FACC15] selection:text-[#111827]">
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
          {/* Demo Notice */}
          {isDemoMode && (
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 flex items-center gap-2.5 text-amber-800 text-xs font-semibold">
              <Sparkles className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <span>Demo Mode Active: Enter any email/password to sign in instantly!</span>
            </div>
          )}

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

          {/* Google Login */}
          <div className="space-y-4">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase font-bold">
                <span className="bg-white px-3 text-slate-400">Or continue with</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isSubmitting}
              className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 text-[#111827] font-bold text-xs py-3 px-4 rounded-xl flex items-center justify-center gap-3 transition-colors"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#EA4335"
                  d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"
                />
                <path
                  fill="#4285F4"
                  d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12 0 14.5s.7 4.8 1.9 7.2l3.7-2.9z"
                />
                <path
                  fill="#34A853"
                  d="M12 23.5c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16.5C3.7 20.2 7.5 23.5 12 23.5z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>
          </div>

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
