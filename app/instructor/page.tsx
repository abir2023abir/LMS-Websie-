import RoleLoginPage from '@/components/auth/RoleLoginPage';

export default function InstructorLoginPage() {
  return (
    <RoleLoginPage
      config={{
        requiredRole: 'Instructor',
        title: 'Mentor Sign In',
        subtitle: 'Sign in to manage courses, lessons, and student messages',
        submitLabel: 'Sign In to Teacher Panel',
        idPrefix: 'instructor',
      }}
    />
  );
}
