// The admin's demo student: a preview account only the admin can open, enrolled in every course.
// Its email uses the reserved ".invalid" domain, so no real person can sign up or sign in with it.
export const DEMO_EMAIL_DOMAIN = '@preview.invalid';
export const DEMO_EMAIL = `demo-student${DEMO_EMAIL_DOMAIN}`;

export function isDemoEmail(email: string | null | undefined) {
  return Boolean(email && email.toLowerCase().endsWith(DEMO_EMAIL_DOMAIN));
}
