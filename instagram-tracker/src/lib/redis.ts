import { Redis } from '@upstash/redis'

// For BullMQ we need ioredis-compatible connection
export const redisConnection = {
  host: process.env.UPSTASH_REDIS_REST_URL?.replace('https://', '') ?? 'localhost',
  port: 6379,
  password: process.env.UPSTASH_REDIS_REST_TOKEN,
  tls: process.env.NODE_ENV === 'production' ? {} : undefined,
}

// For general use (Upstash REST client)
export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL ?? '',
  token: process.env.UPSTASH_REDIS_REST_TOKEN ?? '',
})
