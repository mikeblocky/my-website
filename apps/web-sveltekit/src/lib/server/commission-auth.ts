import { createHash, createHmac, randomBytes, timingSafeEqual } from 'node:crypto';

export const sessionName = 'mike_commissions';
const lifetime = 12 * 60 * 60 * 1000;
export function matchesPasscode(candidate: string, secret: string) {
  return !!secret && candidate.length <= 256 && timingSafeEqual(createHash('sha256').update(candidate).digest(), createHash('sha256').update(secret).digest());
}
export function createCommissionSession(secret: string, now = Date.now()) {
  if (!secret) throw new Error('Admin access is not configured.');
  const payload = Buffer.from(JSON.stringify({ expires: now + lifetime, nonce: randomBytes(16).toString('hex') })).toString('base64url');
  return `${payload}.${createHmac('sha256', secret).update(payload).digest('base64url')}`;
}
export function verifyCommissionSession(cookie: string | undefined, secret: string, now = Date.now()) {
  if (!cookie || !secret || cookie.length > 512) return false;
  try {
    const [payload, signature, extra] = cookie.split('.');
    if (!payload || !signature || extra) return false;
    const expected = createHmac('sha256', secret).update(payload).digest();
    const received = Buffer.from(signature, 'base64url');
    if (received.length !== expected.length || !timingSafeEqual(received, expected)) return false;
    const { expires } = JSON.parse(Buffer.from(payload, 'base64url').toString());
    return Number.isFinite(expires) && expires > now && expires <= now + lifetime;
  } catch { return false; }
}
