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
  Users,
  Briefcase,
} from 'lucide-react';
import { useAuth, type UserRole } from '@/context/AuthContext';
import { homeForRole } from '@/lib/roles';

/** Staff / work signup — not linked from the public site. Requires admin session for non-student roles (API enforced). */
export default function InternalSignUpPage() {
  const router = useRouter();
  const { signUpWithEmail, user, role, loading: authLoading } = useAuth();

  const [selectedRole, setSelectedRole] = useState<UserRole>('Instructor');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [linkedStudentEmail, setLinkedStudentEmail] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && user && role) router.replace(homeForRole(role));
  }, [authLoading, user, role, router]);

  const handleEmailSignUp = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim() || !email.trim() || password.length < 6) {
      setError('Enter name, email, and a password of at least 6 characters.');
      return;
    }
    if (selectedRole === 'Guardian' && !linkedStudentEmail.trim()) {
      setError('Enter the linked student email for guardian accounts.');
      return;
    }

    setIsSubmitting(true);
    try {
      await signUpWithEmail(email, password, name, selectedRole, {
        linkedStudentEmail: selectedRole === 'Guardian' ? linkedStudentEmail : undefined,
      });
      router.push(homeForRole(selectedRole));
    } catch (err: any) {
      setError(err.message || 'Could not create the account.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col justify-center py-12 px-4">
      <Link href="/admin" className="absolute top-6 left-6 text-xs font-bold text-slate-400 hover:text-white flex items-center gap-2">
        <ArrowLeft className="w-4 h-4" /> Admin
      </Link>
      <div className="max-w-md mx-auto w-full space-y-6">
        <div className="text-center space-y-2">
          <h1 className="font-display font-extrabold text-2xl">Internal account setup</h1>
          <p className="text-sm text-slate-400">For administrators. Sign in to /admin first to create mentor, guardian, or service accounts.</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-200 text-xs">{error}</div>
          )}
          <div className="grid grid-cols-2 gap-2">
            {(
              [
                ['Instructor', BookOpen, 'Mentor'],
                ['Guardian', Users, 'Guardian'],
                ['ServiceCustomer', Briefcase, 'Service'],
                ['Student', GraduationCap, 'Student'],
              ] as const
            ).map(([r, Icon, label]) => (
              <button
                key={r}
                type="button"
                onClick={() => setSelectedRole(r)}
                className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 ${
                  selectedRole === r ? 'bg-[#FACC15] text-[#111827] border-[#FACC15]' : 'border-white/10 text-slate-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>
          {selectedRole === 'Guardian' && (
            <input
              type="email"
              value={linkedStudentEmail}
              onChange={(e) => setLinkedStudentEmail(e.target.value)}
              placeholder="Linked student email"
              className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-sm"
            />
          )}
          <form onSubmit={handleEmailSignUp} className="space-y-3">
            <div className="relative">
              <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full name"
                className="w-full bg-black/30 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm"
              />
            </div>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="w-full bg-black/30 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm"
              />
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full bg-black/30 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm"
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#FACC15] text-[#111827] font-extrabold py-3 rounded-xl flex items-center justify-center gap-2"
            >
              Create {selectedRole} account <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
