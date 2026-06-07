import AiUsage from "../models/AiUsage.js";

const getLimit = () => {
  const value = Number(process.env.AI_USAGE_LIMIT || 20);
  return Number.isFinite(value) && value > 0 ? value : 20;
};

const getWindowMs = () => {
  const minutes = Number(process.env.AI_USAGE_WINDOW_MINUTES || 60);
  const safeMinutes = Number.isFinite(minutes) && minutes > 0 ? minutes : 60;
  return safeMinutes * 60 * 1000;
};

const buildFreshUsage = (patientId) => ({
  patientId,
  used: 0,
  limit: getLimit(),
  resetAt: new Date(Date.now() + getWindowMs()),
});

const getUsage = async (patientId) => {
  const now = new Date();
  let usage = await AiUsage.findOne({ patientId });

  if (!usage) {
    usage = await AiUsage.create(buildFreshUsage(patientId));
    return usage;
  }

  const configuredLimit = getLimit();
  const shouldReset = usage.resetAt <= now;
  const shouldSyncLimit = usage.limit !== configuredLimit;

  if (shouldReset || shouldSyncLimit) {
    usage.limit = configuredLimit;
  }

  if (shouldReset) {
    usage.used = 0;
    usage.resetAt = new Date(Date.now() + getWindowMs());
  }

  if (shouldReset || shouldSyncLimit) {
    await usage.save();
  }

  return usage;
};

const consumeUsage = async (patientId) => {
  await getUsage(patientId);

  const usage = await AiUsage.findOneAndUpdate(
    {
      patientId,
      used: { $lt: getLimit() },
      resetAt: { $gt: new Date() },
    },
    {
      $inc: { used: 1 },
      $set: { limit: getLimit() },
    },
    { new: true, runValidators: true }
  );

  if (!usage) {
    const currentUsage = await getUsage(patientId);
    return { allowed: false, usage: currentUsage };
  }

  return { allowed: true, usage };
};

const resetUsage = async (patientId) => {
  const usage = await AiUsage.findOneAndUpdate(
    { patientId },
    buildFreshUsage(patientId),
    { new: true, upsert: true, runValidators: true }
  );

  return usage;
};

const formatUsage = (usage) => ({
  used: usage.used,
  limit: usage.limit,
  remaining: Math.max(usage.limit - usage.used, 0),
  resetAt: usage.resetAt.toISOString(),
});

export { consumeUsage, formatUsage, getUsage, resetUsage };
