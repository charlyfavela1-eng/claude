import IORedis from 'ioredis'

const REDIS_URL = process.env.REDIS_URL ?? 'redis://localhost:6379'

// ioredis connection for BullMQ
export const redisConnection = new IORedis(REDIS_URL, {
  maxRetriesPerRequest: null, // required by BullMQ
})

// Simple key-value helpers (replaces Upstash REST client for local use)
export const redis = {
  get: (key: string) => redisConnection.get(key),
  set: (key: string, value: string, opts?: { ex?: number }) =>
    opts?.ex
      ? redisConnection.set(key, value, 'EX', opts.ex)
      : redisConnection.set(key, value),
  del: (key: string) => redisConnection.del(key),
}
