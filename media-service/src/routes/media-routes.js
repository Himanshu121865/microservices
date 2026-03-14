const express = require("express");
const multer = require("../utils/multer");

const {
  uploadmedia,
  getAllMedia,
} = require("../controllers/media-controllers");
const { authencationRequest } = require("../middleware/authmiddleware");
const logger = require("../utils/logger");

const router = express.Router();

router.post(
  "/upload",
  authencationRequest,
  (req, res, next) => {
    upload(req, res, function (err) {
      if (err instanceof multer.MulterError) {
        logger.error("Multer Error while uploading", err);
        return res.status(400).json({
          message: `Multer Error while uploading`,
          error: err.message,
          stack: err.stack,
        });
      } else if (err) {
        logger.error("unknown error occored while uploading", err);
        return res.status(500).json({
          message: "unknown error occured while uploading",
          error: err.message,
          stack: err.stack,
        });
      }
      if (!req.file) {
        return res.status(400).json({
          message: "no file found",
        });
      }
      next();
    });
  },
  uploadmedia,
);

router.get("/get", authencationRequest, getAllMedia);

module.exports = router;
