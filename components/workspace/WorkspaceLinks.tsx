'use client';

import Link from 'next/link';
import { useAuth, type UserRole } from '@/context/AuthContext';
import { homeForRole } from '@/lib/roles';
import { useRouter } from 'next/navigation';

const links = [
  { href: '/exams', label: 'Exams' },
  { href: '/publish', label: 'Publish' },
  { href: '/audit', label: 'Audit' },
];

export default function WorkspaceLinks() {
  const { userProfile, role, addRole, switchRole } = useAuth();
  const router = useRouter();
  const roles = userProfile?.roles || (role ? [role] : []);

  const changeRole = async (next: UserRole) => {
    try {
      if (roles.includes(next)) await switchRole(next);
      else await addRole(next);
      router.push(homeForRole(next));
    } catch (err: any) {
      alert(err.message || 'Could not change the role.');
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-4 shadow-sm flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        {links.map((item) => (
          <Link key={item.href} href={item.href} className="text-xs font-bold px-3 py-2 rounded-full bg-slate-100 hover:bg-[#FACC15]">
            {item.label}
          </Link>
        ))}
      </div>
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-xs font-bold text-slate-500">Roles on this account:</span>
        {(['Student', 'Instructor', 'Guardian', 'ServiceCustomer'] as UserRole[]).map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => changeRole(item)}
            className={`text-xs font-bold px-3 py-2 rounded-full border ${
              role === item ? 'bg-[#111827] text-white border-[#111827]' : 'bg-white border-slate-200'
            }`}
          >
            {roles.includes(item) ? item : `Add ${item}`}
          </button>
        ))}
      </div>
    </div>
  );
}
