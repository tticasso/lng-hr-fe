const cacheStore = new Map();
const DEFAULT_TTL = 5 * 60 * 1000;

export const cachedRequest = async (key, requestFn, ttl = DEFAULT_TTL) => {
  const now = Date.now();
  const cached = cacheStore.get(key);

  if (cached && cached.expiresAt > now) {
    return cached.value;
  }

  const value = await requestFn();
  cacheStore.set(key, {
    value,
    expiresAt: now + ttl,
  });

  return value;
};

export const invalidateCache = (keyPrefix) => {
  for (const key of cacheStore.keys()) {
    if (!keyPrefix || key.startsWith(keyPrefix)) {
      cacheStore.delete(key);
    }
  }
};
