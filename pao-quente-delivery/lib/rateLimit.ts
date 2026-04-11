// Rate limiting para prevenir ataques de brute force
const requestCounts = new Map<string, { count: number; resetTime: number }>();

const DEFAULT_WINDOW_MS = 5 * 60 * 1000; // 5 minutos
const DEFAULT_MAX_REQUESTS = 5;

export function checkRateLimit(ip: string, maxRequests = DEFAULT_MAX_REQUESTS, windowMs = DEFAULT_WINDOW_MS): boolean {
  const now = Date.now();
  const record = requestCounts.get(ip);

  if (!record || now > record.resetTime) {
    requestCounts.set(ip, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (record.count >= maxRequests) {
    return false;
  }

  record.count++;
  return true;
}

// Cleanup automático a cada 10 minutos
setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of requestCounts.entries()) {
    if (now > record.resetTime) {
      requestCounts.delete(ip);
    }
  }
}, 10 * 60 * 1000);

export function getRateLimitStatus(ip: string) {
  const record = requestCounts.get(ip);
  if (!record) return { remaining: DEFAULT_MAX_REQUESTS, resetIn: 0 };
  const resetIn = Math.max(0, record.resetTime - Date.now());
  return { remaining: Math.max(0, DEFAULT_MAX_REQUESTS - record.count), resetIn };
}
