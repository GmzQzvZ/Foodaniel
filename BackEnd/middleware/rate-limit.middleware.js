const windowMs = Number(process.env.LOGIN_RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000);
const maxAttempts = Number(process.env.LOGIN_RATE_LIMIT_MAX || 10);

const attemptsByIp = new Map();
const maxTrackedIps = 10000;

function cleanupExpired(now) {
  for (const [ip, entry] of attemptsByIp.entries()) {
    if (entry.resetAt <= now) {
      attemptsByIp.delete(ip);
    }
  }
}

exports.loginRateLimit = (req, res, next) => {
  const now = Date.now();
  const ip = req.ip || req.socket?.remoteAddress || 'unknown';
  const existing = attemptsByIp.get(ip);

  if (attemptsByIp.size >= maxTrackedIps && !existing) cleanupExpired(now);
  if (attemptsByIp.size >= maxTrackedIps && !existing) {
    return res.status(503).json({ error: 'Rate limit capacity reached' });
  }

  if (!existing || existing.resetAt <= now) {
    attemptsByIp.set(ip, { count: 1, resetAt: now + windowMs });
    return next();
  }

  if (existing.count >= maxAttempts) {
    const retryAfterSeconds = Math.ceil((existing.resetAt - now) / 1000);
    res.setHeader('Retry-After', retryAfterSeconds);
    return res.status(429).json({
      error: 'Too many login attempts. Try again later.'
    });
  }

  existing.count += 1;
  return next();
};
