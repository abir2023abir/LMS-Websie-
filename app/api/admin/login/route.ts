import { NextResponse } from 'next/server';
import { signAdminSession } from '@/lib/auth-server';

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'abir';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'abir12##';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password } = body;

    // Strict credential check
    if (
      !username ||
      !password ||
      username !== ADMIN_USERNAME ||
      password !== ADMIN_PASSWORD
    ) {
      return NextResponse.json(
        { success: false, message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Sign JWT securely
    const token = signAdminSession(username);

    // Set HTTP-only secure cookie
    const response = NextResponse.json({ success: true });
    response.cookies.set('admin_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
      path: '/',
    });

    return response;
  } catch {
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
