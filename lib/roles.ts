export function homeForRole(role: string | null | undefined): string {
  if (role === 'Instructor') return '/teacher';
  if (role === 'Guardian') return '/guardian';
  if (role === 'ServiceCustomer') return '/service';
  return '/student';
}
