// Simple in-memory per-instance rate limiter (use Redis/Upstash for multi-instance prod).
const hits = new Map<string, { count: number; reset: number }>();
const WINDOW_MS = 60_000;
const MAX_REQ = 15;

export function rateLimit(key: string): { ok: boolean; remaining: number } {
  const now = Date.now();
  const entry = hits.get(key);
  if (!entry || now > entry.reset) {
    hits.set(key, { count: 1, reset: now + WINDOW_MS });
    return { ok: true, remaining: MAX_REQ - 1 };
  }
  entry.count += 1;
  if (entry.count > MAX_REQ) return { ok: false, remaining: 0 };
  return { ok: true, remaining: MAX_REQ - entry.count };
}
