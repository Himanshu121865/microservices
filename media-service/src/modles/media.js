const mongoose = require("mongoose");

const mediaSchema = new mongoose.Schema(
  {
    publicId: {
      type: String,
      require: true,
    },
    originalName: {
      type: String,
      require: true,
    },
    mimetype: {
      type: String,
      require: true,
    },
    url: {
      type: String,
      require: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);

const Media = mongoose.model("Media", mediaSchema);

module.exports = Media;
