const RefreshToken = require("../models/refreshToken");
const User = require("../models/user");
const generateTokens = require("../utils/generateToken");
const {
  validateRegistration,
  validationLogin,
} = require("../utils/validation");
const logger = require("../utils/logger");

const registerUser = async (req, res) => {
  logger.info("registration endpoint hit...");
  try {
    const { error } = validateRegistration(req.body);
    if (error) {
      logger.warn("validation error", error.details[0].message);
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }
    const { email, password, username } = req.body;

    let user = await User.findOne({ $or: [{ email }, { username }] });
    if (user) {
      logger.warn("User already exists");
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }
    user = new User({ username, email, password });
    await user.save();
    logger.warn("User saved successfully", user._id);

    const { accessToken, refreshToken } = await generateTokens(user);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      accessToken,
      refreshToken,
    });
  } catch (error) {
    logger.error("registration error occured", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const loginUser = async (req, res) => {
  logger.info("login endpoint hit...");
  try {
    const { error } = validationLogin(req.body);
    if (error) {
      logger.warn("Validation error", error.details[0].message);
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      logger.warn("Invalid user");
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }
    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      logger.warn("Invalid password");
      return res.status(400).json({
        success: false,
        message: "Invalid password",
      });
    }
    const { accessToken, refreshToken } = await generateTokens(user);
    res.json({
      accessToken,
      refreshToken,
      userid: user._id,
    });
  } catch (error) {
    logger.error("registration error occured", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const refreshTokenUser = async (req, res) => {
  logger.info("refreshToken endpoint hit...");
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      logger.warn("refresh token missing");
      return res.status(400).json({
        success: false,
        message: "refreshToken missing",
      });
    }

    const storedToken = await RefreshToken.findOne({ token: refreshToken });

    if (!storedToken || storedToken.expireAt < new Date()) {
      logger.warn("Invalid or expired refresh token");
      return res.status(401).json({
        success: false,
        message: `Invalid or expired refresh token`,
      });
    }
    const user = await User.findById(storedToken.user);
    if (!user) {
      logger.warn("user not found");
      return res.status(401).json({
        success: false,
        message: "user not found",
      });
    }
    const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
      await generateTokens(user);

    await RefreshToken.deleteOne({ _id: storedToken._id });

    res.json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    logger.error("refreshToken error occured", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const logoutUser = async (req, res) => {
  logger.info("logout endpoint hit...");
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      logger.warn("refresh token missing");
      return res.status(400).json({
        success: false,
        message: "refreshToken missing",
      });
    }
    await RefreshToken.deleteOne({ token: refreshToken });
    logger.info("Refresh token deleted for logout");

    res.json({
      success: true,
      message: "logged out successfully",
    });
  } catch (error) {
    logger.error("Error while logging out", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = { registerUser, loginUser, refreshTokenUser, logoutUser };
