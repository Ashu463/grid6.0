import { RateLimiterRedis } from 'rate-limiter-flexible';
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL || 'redis://redis:6379');

export const globalLimiter = new RateLimiterRedis({
  storeClient: redis,
  keyPrefix: 'global',
  points: 100, // 100 requests
  duration: 60, // per 60 seconds
});

export const loginLimiter = new RateLimiterRedis({
  storeClient: redis,
  keyPrefix: 'login',
  points: 5, // strict
  duration: 60,
  blockDuration: 300, // block for 5 min
});