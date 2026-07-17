import { createHash, randomBytes } from 'crypto';

export const SESSION_COOKIE = 'tix_session';
export const SESSION_DURACION_MS = 30 * 24 * 60 * 60 * 1000; // 30 días

export function generarTokenSesion(): string {
  return randomBytes(32).toString('hex');
}

export function hashTokenSesion(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

export function opcionesCookieSesion() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    domain: process.env.COOKIE_DOMAIN || undefined,
    maxAge: SESSION_DURACION_MS,
    path: '/',
  };
}
