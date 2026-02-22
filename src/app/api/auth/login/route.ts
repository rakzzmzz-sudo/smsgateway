import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();

    // Hardcoded admin credentials for this implementation
    const ADMIN_USERNAME = 'admin';
    const ADMIN_PASSWORD = 'admin_password_123'; // In a real app, this should be hashed/env var

    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      const response = NextResponse.json({ message: 'Login successful' });
      
      // Set a simple session cookie
      (await cookies()).set('auth_session', 'authenticated', {
        httpOnly: true,
        secure: process.env.NODE_SET_SECURE === 'true',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24, // 24 hours
        path: '/',
      });

      return response;
    }

    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ message: 'Logged out successfully' });
  (await cookies()).delete('auth_session');
  return response;
}
