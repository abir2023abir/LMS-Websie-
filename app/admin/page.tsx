import { cookies } from 'next/headers';
import AdminLoginForm from '@/components/admin/AdminLoginForm';
import AdminDashboard from '@/components/admin/AdminDashboard';
import { verifyAdminSession } from '@/lib/auth-server';

export default function AdminPage() {
  const cookieStore = cookies();
  const adminSession = cookieStore.get('admin_session');

  // Validate admin JWT token cryptographically
  const validSession = verifyAdminSession(adminSession?.value);

  if (!validSession) {
    return <AdminLoginForm />;
  }

  return <AdminDashboard />;
}
