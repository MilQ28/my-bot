import crypto from 'crypto';
import { cookies } from 'next/headers';

const IS_PRODUCTION = process.env.NODE_ENV === 'production';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || (IS_PRODUCTION ? '' : 'admin123');
const SECRET_SALT = (ADMIN_PASSWORD || 'fallback_dev_salt') + '_portfolio_secure_admin_salt_2026';
export const ADMIN_COOKIE_NAME = 'adm_sec_sess';

export function signToken(token: string): string {
  const hmac = crypto.createHmac('sha256', SECRET_SALT);
  hmac.update(token);
  const signature = hmac.digest('hex');
  return `${token}.${signature}`;
}

export function verifySignedToken(cookieValue: string | undefined): string | null {
  if (!cookieValue) return null;
  // If in production and password is not set, refuse token verification
  if (IS_PRODUCTION && !ADMIN_PASSWORD) return null;

  const parts = cookieValue.split('.');
  if (parts.length !== 2) return null;
  const [token, signature] = parts;
  
  try {
    const hmac = crypto.createHmac('sha256', SECRET_SALT);
    hmac.update(token);
    const expectedSig = hmac.digest('hex');

    const sigBuf = Buffer.from(signature);
    const expBuf = Buffer.from(expectedSig);

    if (sigBuf.length === expBuf.length && crypto.timingSafeEqual(sigBuf, expBuf)) {
      return token;
    }
  } catch {
    return null;
  }
  return null;
}

export function generateRandomAdminToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export async function validateAdminServerSession(routeToken?: string): Promise<boolean> {
  const cookieStore = await cookies();
  const rawCookie = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  const validToken = verifySignedToken(rawCookie);

  if (!validToken) return false;
  if (routeToken && validToken !== routeToken) return false;
  return true;
}
