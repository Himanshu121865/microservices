const logger = require("../utils/logger");

const authencationRequest = (req, res, next) => {
  const userId = req.headers["x-user-id"];
  if (!userId) {
    logger.warn(`access attempted without user ID`);
    return res.status(401).json({
      success: false,
      message: "Authencation required please login to continue",
    });
  }
  req.user = { userId };
  next();
};

module.exports = { authencationRequest };
