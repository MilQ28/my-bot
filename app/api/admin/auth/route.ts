import { NextRequest, NextResponse } from 'next/server';
import { generateRandomAdminToken, signToken, verifySignedToken, ADMIN_COOKIE_NAME } from '@/lib/adminSession';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

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

    if (password === ADMIN_PASSWORD) {
      const randomToken = generateRandomAdminToken();
      const signedValue = signToken(randomToken);

      const response = NextResponse.json({
        success: true,
        redirectUrl: `/admin/${randomToken}`,
      });

      response.cookies.set(ADMIN_COOKIE_NAME, signedValue, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 12, // 12 hours
      });

      return response;
    }

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
