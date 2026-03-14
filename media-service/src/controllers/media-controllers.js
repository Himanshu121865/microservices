const logger = require("../utils/logger");
const Media = require("../modles/media");
const { uploadMediaToCloudinary } = require("../utils/cloudinary");

const uploadmedia = async (req, res) => {
  logger.info("Start media upload");
  try {
    if (!req.file) {
      logger.error("no file found. Please add a file and try again");
      return res.status(400).json({
        success: false,
        message: "no file found. Please add a file and try again",
      });
    }

    const { originalname, minetype, buffer } = req.file;
    const userId = req.user.userId;

    logger.info(`File details: name=${originalname}, type=${minetype}`);
    logger.info(`Uploading to cloudinary starting...`);

    const cloudinaryUploadResult = await uploadMediaToCloudinary(req.file);
    logger.info(
      `cloudinary upload successfully. Public Id: - ${cloudinaryUploadResult.public_id}`,
    );
    const newlyCreatedmedia = new Media({
      public_id: cloudinaryUploadResult.public_id,
      originalName: originalname,
      mineType: minetype,
      url: cloudinaryUploadResult.secure_url,
      userId,
    });

    await newlyCreatedmedia.save();
    res.status(201).json({
      success: true,
      mediaId: newlyCreatedmedia.id,
      url: newlyCreatedmedia.url,
      message: `Media uploaded successfully`,
    });
  } catch (error) {
    logger.error("error creating media", error);
    return res.status(500).json({
      success: false,
      message: "error creating media",
    });
  }
};

const getAllMedia = async (req, res) => {
  try {
    const result = await Media.find({});
    res.json({ result });
  } catch (error) {
    logger.error("error fetching media", error);
    return res.status(500).json({
      success: false,
      message: "error fetching media",
    });
  }
};

module.exports = { uploadmedia, getAllMedia };
