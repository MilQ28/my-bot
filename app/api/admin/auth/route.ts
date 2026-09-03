import { NextRequest, NextResponse } from 'next/server';
import { generateRandomAdminToken, signToken, verifySignedToken, ADMIN_COOKIE_NAME } from '@/lib/adminSession';

import crypto from 'crypto';

const IS_PRODUCTION = process.env.NODE_ENV === 'production';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || (IS_PRODUCTION ? '' : 'admin123');

function isPasswordValid(inputPassword: string): boolean {
  if (!ADMIN_PASSWORD) return false;
  try {
    const inputBuf = Buffer.from(inputPassword);
    const passBuf = Buffer.from(ADMIN_PASSWORD);
    if (inputBuf.length !== passBuf.length) return false;
    return crypto.timingSafeEqual(inputBuf, passBuf);
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { password, action } = body;

    // Action: Logout
    if (action === 'logout') {
      const response = NextResponse.json({ success: true, message: 'Logged out' });
      response.cookies.delete(ADMIN_COOKIE_NAME);
      return response;
    }

    // Action: Verify Password
    if (!password) {
      return NextResponse.json({ error: 'Password wajib diisi' }, { status: 400 });
    }

    if (IS_PRODUCTION && !ADMIN_PASSWORD) {
      console.error('[ADMIN_AUTH_CRITICAL] ADMIN_PASSWORD belum diatur di environment variable production.');
      return NextResponse.json({ error: 'Sistem autentikasi admin belum dikonfigurasi di server.' }, { status: 503 });
    }

    if (isPasswordValid(password)) {
      const randomToken = generateRandomAdminToken();
      const signedValue = signToken(randomToken);

      const response = NextResponse.json({
        success: true,
        redirectUrl: `/admin/${randomToken}`,
      });

      response.cookies.set(ADMIN_COOKIE_NAME, signedValue, {
        httpOnly: true,
        secure: IS_PRODUCTION,
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 12, // 12 hours
      });

      return response;
    }

    // Artificial delay to deter brute force attacks
    await new Promise((resolve) => setTimeout(resolve, 500));
    return NextResponse.json({ error: 'Password salah' }, { status: 401 });
  } catch (error) {
    console.error('[ADMIN_AUTH_ERROR]', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const cookieValue = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
  const validToken = verifySignedToken(cookieValue);

  if (validToken) {
    return NextResponse.json({ authenticated: true, token: validToken });
  }

  return NextResponse.json({ authenticated: false }, { status: 401 });
}
