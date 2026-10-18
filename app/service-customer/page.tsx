import RoleLoginPage from '@/components/auth/RoleLoginPage';

export default function ServiceCustomerLoginPage() {
  return (
    <RoleLoginPage
      config={{
        requiredRole: 'ServiceCustomer',
        title: 'Service Customer Sign In',
        subtitle: 'Sign in to view bookings, quotations, and your service inbox',
        submitLabel: 'Sign In to Service Portal',
        idPrefix: 'service-customer',
      }}
    />
  );
}
