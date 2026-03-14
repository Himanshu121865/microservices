const Redis = require("ioredis");
const logger = require("./logger");

const redisClient = new Redis(process.env.REDIS_URL || "redis://localhost:6379");

redisClient.on("connect", () => {
  logger.info("Connected to Redis");
});

redisClient.on("error", (err) => {
  logger.error("Redis connection error", err);
});

module.exports = redisClient;
