const { rateLimit } = require("express-rate-limit");
const { RedisStore } = require("rate-limit-redis");
const Redis = require("ioredis");
const logger = require('../logger');

function setupRateLimiter() {
  let limiter;
  try {
    const redis = new Redis(process.env.REDIS_URL);
    limiter = rateLimit({
      store: new RedisStore({
        sendCommand: (...args) => redis.call(...args),
      }),
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 5, // limit each IP to 5 requests per windowMs
      message: "Too many requests, please try again later.",
    });
  } catch (error) {
    logger.error('Failed to setup Redis rate limiter, falling back to memory store', error);
    limiter = rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 5,
      message: "Too many requests, please try again later.",
    });
  }
  return limiter;
}

module.exports = setupRateLimiter;