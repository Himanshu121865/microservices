const mongoose = require("mongoose");

const searchPostSchema = new mongoose.Schema(
  {
    postId: {
      type: String,
      require: true,
      unique: true,
    },
    userId: {
      type: String,
      require: true,
      index: true,
    },
    content: {
      type: String,
      require: true,
    },
    createdAt: {
      type: Date,
      require: true,
    },
  },
  { timestamps: true },
);

searchPostSchema.index({ content: "text" });
searchPostSchema.index({ createdAt: -1 });

const search = mongoose.model("Search", searchPostSchema);

module.exports = search;
