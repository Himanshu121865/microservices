require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const logger = require("./utils/logger");
const helmet = require("helmet");
const cors = require("cors");
const { rateLimit } = require("express-rate-limit");
const routes = require("./routes/identity-servies");
const errorHandler = require("./middleware/errorHandler");
const { RedisStore } = require("rate-limit-redis");
const redisClient = require("./utils/redisClient");

const app = express();
const PORT = process.env.PORT || 3001;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => logger.info("connected to mongodb"))
  .catch((e) => logger.error("Mongo connection error", e));

app.use(helmet());
app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  logger.info(`Recived ${req.method} requrest to ${req.url}`);
  logger.info(`Request body,${JSON.stringify(req.body)}`);
  next();
});

const sensitiveEndpointsLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn(`sensitive endpoint rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({ success: false, message: "too many Request" });
  },
  store: new RedisStore({
    sendCommand: (...args) => redisClient.call(...args),
  }),
});

app.use("/api/auth/register", sensitiveEndpointsLimiter);

// Mount authentication routes
app.use("/api/auth", routes);

app.use(errorHandler);

app.listen(PORT, () => {
  logger.info(`Identity service running on port ${PORT}`);
});

process.on("unhandledRejection", (reason, promise) => {
  logger.error("Unhandled Rejection at", { promise, reason });
});
