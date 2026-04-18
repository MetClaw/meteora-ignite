const SESSION_LIMIT = 50;
const DAY_MS = 24 * 60 * 60 * 1000;

const sessionCalls = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(sessionId: string): {
  allowed: boolean;
  remaining: number;
  resetAt: number;
} {
  const now = Date.now();
  const entry = sessionCalls.get(sessionId);

  if (!entry || now > entry.resetAt) {
    const resetAt = now + DAY_MS;
    sessionCalls.set(sessionId, { count: 1, resetAt });
    return { allowed: true, remaining: SESSION_LIMIT - 1, resetAt };
  }

  if (entry.count >= SESSION_LIMIT) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }

  entry.count++;
  return {
    allowed: true,
    remaining: SESSION_LIMIT - entry.count,
    resetAt: entry.resetAt,
  };
}
