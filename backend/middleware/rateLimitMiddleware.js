const buckets = new Map();
const loginFailures = new Map();

const getClientIp = (req) =>
  req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
  req.socket.remoteAddress ||
  "unknown";

const createRateLimiter = ({ windowMs, max, message }) => {
  return (req, res, next) => {
    const key = `${getClientIp(req)}:${req.originalUrl}`;
    const now = Date.now();
    const bucket = buckets.get(key) || { count: 0, resetAt: now + windowMs };

    if (now > bucket.resetAt) {
      bucket.count = 0;
      bucket.resetAt = now + windowMs;
    }

    bucket.count += 1;
    buckets.set(key, bucket);

    if (bucket.count > max) {
      return res.status(429).json({
        message,
        retryAfterSeconds: Math.ceil((bucket.resetAt - now) / 1000),
      });
    }

    next();
  };
};

const blockOnTooManyLoginFailures = (req, res, next) => {
  const ip = getClientIp(req);
  const item = loginFailures.get(ip);

  if (item?.blockedUntil && item.blockedUntil > Date.now()) {
    return res.status(429).json({
      message: "Too many failed login attempts. Try again after 30 minutes.",
      retryAfterSeconds: Math.ceil((item.blockedUntil - Date.now()) / 1000),
    });
  }

  next();
};

const recordFailedLogin = (req) => {
  const ip = getClientIp(req);
  const now = Date.now();
  const item = loginFailures.get(ip) || { count: 0, firstFailedAt: now, blockedUntil: null };

  if (now - item.firstFailedAt > 30 * 60 * 1000) {
    item.count = 0;
    item.firstFailedAt = now;
    item.blockedUntil = null;
  }

  item.count += 1;
  if (item.count >= 5) {
    item.blockedUntil = now + 30 * 60 * 1000;
  }

  loginFailures.set(ip, item);
};

const clearFailedLogins = (req) => {
  loginFailures.delete(getClientIp(req));
};

export {
  blockOnTooManyLoginFailures,
  clearFailedLogins,
  createRateLimiter,
  recordFailedLogin,
};
