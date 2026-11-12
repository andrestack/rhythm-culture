import { createHmac, timingSafeEqual } from 'node:crypto';

// One shared password for the student video pages, set as STUDENT_PASSWORD in Vercel (and .env locally).
// The cookie holds a hash of the password, never the password, so changing it logs everyone out.
export const COOKIE = 'rc_students';
const password = () => import.meta.env.STUDENT_PASSWORD || process.env.STUDENT_PASSWORD || '';
const token = (pw: string) => createHmac('sha256', pw).update('rhythm-culture-students').digest('hex');

const same = (a: string, b: string) => {
  const x = Buffer.from(a), y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
};

// No password set = locked for everyone.
export const passwordOk = (attempt: string) => !!password() && same(attempt, password());
export const cookieOk = (value = '') => !!password() && same(value, token(password()));
export const cookieValue = () => token(password());

// Best-effort limiter, same idea as /api/form: slows guessing from one address.
const hits = new Map<string, number[]>();
export function limited(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < 10 * 60_000);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > 10;
}
