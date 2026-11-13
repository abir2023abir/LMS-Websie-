const AUTH = 'https://accounts.google.com/o/oauth2/v2/auth';
const TOKEN = 'https://oauth2.googleapis.com/token';
const USERINFO = 'https://openidconnect.googleapis.com/v1/userinfo';

export function googleConfigured() {
  return Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
}

export function googleRedirectUri(origin: string) {
  return `${origin.replace(/\/$/, '')}/api/auth/google/callback`;
}

export function googleAuthUrl(origin: string, state: string) {
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID || '',
    redirect_uri: googleRedirectUri(origin),
    response_type: 'code',
    scope: 'openid email profile',
    state,
    prompt: 'select_account',
  });
  return `${AUTH}?${params.toString()}`;
}

export async function googleProfileFromCode(origin: string, code: string) {
  const tokenRes = await fetch(TOKEN, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID || '',
      client_secret: process.env.GOOGLE_CLIENT_SECRET || '',
      redirect_uri: googleRedirectUri(origin),
      grant_type: 'authorization_code',
    }),
  });
  const token = await tokenRes.json();
  if (!tokenRes.ok || !token.access_token) throw new Error('Google did not return a sign-in token.');

  const infoRes = await fetch(USERINFO, { headers: { Authorization: `Bearer ${token.access_token}` } });
  const info = await infoRes.json();
  if (!infoRes.ok || !info.email || info.email_verified !== true) throw new Error('Google did not confirm this email.');
  return {
    email: String(info.email),
    name: String(info.name || info.email).slice(0, 100),
    sub: String(info.sub || ''),
  };
}
