'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Zap,
  Mail,
  Lock,
  User,
  GraduationCap,
  BookOpen,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';
import { useAuth, type UserRole } from '@/context/AuthContext';
import Button from '@/components/ui/Button';

export default function SignUpPage() {
  const router = useRouter();
  const { signUpWithEmail, loginWithGoogle, user, role, loading: authLoading, isDemoMode } = useAuth();

  const [selectedRole, setSelectedRole] = useState<UserRole>('Student');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if user is already logged in
  if (!authLoading && user && role) {
    if (role === 'Instructor') {
      router.replace('/dashboard/instructor');
    } else {
      router.replace('/dashboard/student');
    }
  }

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
      setError('Password must be at least 6 characters long');
      return;
    }

    setIsSubmitting(true);
    try {
      await signUpWithEmail(email, password, name, selectedRole);
      // Redirect based on role
      if (selectedRole === 'Instructor') {
        router.push('/dashboard/instructor');
      } else {
        router.push('/dashboard/student');
      }
    } catch (err: any) {
      console.error('Sign up error:', err);
      if (err.code === 'auth/email-already-in-use') {
        setError('An account with this email already exists. Try logging in instead.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Please provide a valid email address.');
      } else if (err.code === 'auth/weak-password') {
        setError('Password is too weak. Please use at least 6 characters.');
      } else if (err.code === 'auth/api-key-not-valid' || err.message?.includes('api-key-not-valid')) {
        setError('Firebase API Key is missing or invalid. Please provide your real Firebase project credentials in .env.local and restart the server.');
      } else if (err.code === 'auth/operation-not-allowed') {
        setError('Email/Password sign-in is not enabled in your Firebase Console. Please enable it under Authentication > Sign-in method.');
      } else {
        setError(err.message || 'Failed to create account. Please check your credentials.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setIsSubmitting(true);
    try {
      await loginWithGoogle(selectedRole);
      // Auth context updates role from Firestore or sets preferred role
    } catch (err: any) {
      console.error('Google Sign-in error:', err);
      if (err.code !== 'auth/popup-closed-by-user') {
        setError('Google authentication failed. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-[-100px] left-[-100px] w-96 h-96 bg-primary-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-100px] right-[-100px] w-96 h-96 bg-accent-500/20 rounded-full blur-3xl pointer-events-none" />

      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center z-10">
        <Link href="/" className="inline-flex items-center gap-2.5 mb-6 group">
          <div className="w-10 h-10 rounded-xl bg-primary-gradient flex items-center justify-center shadow-lg shadow-primary-600/40">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <span className="font-display font-bold text-2xl text-white">
            Learn<span className="gradient-text">Verse</span>
          </span>
        </Link>
        <h2 className="font-display font-extrabold text-3xl text-white tracking-tight">
          Create Your Account
        </h2>
        <p className="mt-2 text-sm text-slate-400">
          Join 500,000+ learners and top instructors today
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10 px-4">
        <div className="glass rounded-3xl border border-white/10 p-8 shadow-2xl">
          {/* Demo Mode Notice */}
          {isDemoMode && (
            <div className="mb-5 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-2.5 text-amber-300 text-xs font-medium">
              <Zap className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <span>Offline / Demo Mode Active — create any account to test instantly without Firebase keys!</span>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3 text-rose-300 text-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* ── Role Selector ── */}
          <div className="mb-6">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
              Select Your Role
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setSelectedRole('Student')}
                className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all duration-200 ${
                  selectedRole === 'Student'
                    ? 'bg-primary-600/20 border-primary-500 text-white shadow-lg shadow-primary-600/20'
                    : 'bg-white/5 border-white/8 text-slate-400 hover:text-white hover:bg-white/10'
                }`}
              >
                <GraduationCap
                  className={`w-6 h-6 mb-2 ${
                    selectedRole === 'Student' ? 'text-primary-400' : 'text-slate-500'
                  }`}
                />
                <span className="font-semibold text-sm">Student</span>
                <span className="text-[10px] text-slate-400 mt-0.5">Learn & Upskill</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedRole('Instructor')}
                className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all duration-200 ${
                  selectedRole === 'Instructor'
                    ? 'bg-accent-500/20 border-accent-500 text-white shadow-lg shadow-accent-500/20'
                    : 'bg-white/5 border-white/8 text-slate-400 hover:text-white hover:bg-white/10'
                }`}
              >
                <BookOpen
                  className={`w-6 h-6 mb-2 ${
                    selectedRole === 'Instructor' ? 'text-accent-400' : 'text-slate-500'
                  }`}
                />
                <span className="font-semibold text-sm">Instructor</span>
                <span className="text-[10px] text-slate-400 mt-0.5">Teach & Earn</span>
              </button>
            </div>
          </div>

          {/* ── Form ── */}
          <form onSubmit={handleEmailSignUp} className="space-y-4">
            {/* Full Name */}
            <div>
              <label htmlFor="signup-name" className="block text-xs font-medium text-slate-300 mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <User className="w-5 h-5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="signup-name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Jane Doe"
                  className="w-full bg-dark-800 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="signup-email" className="block text-xs font-medium text-slate-300 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-5 h-5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="signup-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="jane@example.com"
                  className="w-full bg-dark-800 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="signup-password" className="block text-xs font-medium text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-5 h-5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="signup-password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-dark-800 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors"
                />
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              isLoading={isSubmitting}
              rightIcon={<ArrowRight className="w-4 h-4" />}
              className="mt-6"
            >
              Create {selectedRole} Account
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-dark-700 px-3 text-slate-500 font-medium">Or continue with</span>
            </div>
          </div>

          {/* ── Google Sign-in Button ── */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl py-3 px-4 text-sm font-semibold text-white transition-colors duration-150 disabled:opacity-50"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#EA4335"
                d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.3 9 5 12 5z"
              />
              <path
                fill="#4285F4"
                d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
              />
              <path
                fill="#FBBC05"
                d="M5.6 14.8c-.3-.8-.4-1.8-.4-2.8s.1-2 .4-2.8L1.9 6.3C.7 8.7 0 10.3 0 12s.7 3.3 1.9 5.7l3.7-2.9z"
              />
              <path
                fill="#34A853"
                d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.3-6.4-5.2L1.9 16C3.7 19.7 7.5 23 12 23z"
              />
            </svg>
            Sign up with Google
          </button>

          {/* Login Redirection link */}
          <div className="mt-6 text-center text-xs text-slate-400">
            Already have an account?{' '}
            <Link href="/login" className="font-semibold text-primary-400 hover:text-primary-300">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
