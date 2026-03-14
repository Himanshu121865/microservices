require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const errorHandler = require("./middleware/errorHandler");
const logger = require("./utils/logger");
const mediaRoutes = require("./routes/media-routes");
const { connectToRabbitMQ, consumeEvent } = require("./utils/rabbitmq");
const { handlePostDeleted } = require("./eventHandlers/media-eventHandler");

const app = express();
const PORT = process.env.PORT || 3003;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => logger.info("connect to mongodb"))
  .catch((e) => logger.error("Mongo connection error", e));

app.use(cors());
app.use(helmet());
app.use(express.json());

app.use((req, res, next) => {
  logger.info(`Received ${req.method} request to ${req.url}`);
  logger.info(`Request body, ${req.body}`);
});

app.use("/api/media", mediaRoutes);
app.use(errorHandler);

async function starServer() {
  try {
    await connectToRabbitMQ();
    await consumeEvent("post.deleted", handlePostDeleted);
    app.listen(PORT, () => {
      logger.info(`media service is running on port ${PORT}`);
    });
  } catch (error) {
    logger.error("Failed to connect to server", error);
    process.exit(1);
  }
}

starServer();

process.on("unhandledRejection", (reason, promise) => {
  logger.error("Unhandled Rejection at", promise, "reason:", reason);
  process.exit(1);
});
