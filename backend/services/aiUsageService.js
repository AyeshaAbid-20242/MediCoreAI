const usageByPatient = new Map();

const getLimit = () => Number(process.env.AI_USAGE_LIMIT || 20);
const getWindowMs = () => Number(process.env.AI_USAGE_WINDOW_MINUTES || 60) * 60 * 1000;

const getUsage = (patientId) => {
  const now = Date.now();
  const limit = getLimit();
  const windowMs = getWindowMs();
  const current = usageByPatient.get(patientId);

  if (!current || current.resetAt <= now) {
    const fresh = {
      used: 0,
      limit,
      resetAt: now + windowMs,
    };
    usageByPatient.set(patientId, fresh);
    return fresh;
  }

  current.limit = limit;
  return current;
};

const consumeUsage = (patientId) => {
  const usage = getUsage(patientId);

  if (usage.used >= usage.limit) {
    return { allowed: false, usage };
  }

  usage.used += 1;
  usageByPatient.set(patientId, usage);
  return { allowed: true, usage };
};

const formatUsage = (usage) => ({
  used: usage.used,
  limit: usage.limit,
  remaining: Math.max(usage.limit - usage.used, 0),
  resetAt: new Date(usage.resetAt).toISOString(),
});

export { consumeUsage, formatUsage, getUsage };
