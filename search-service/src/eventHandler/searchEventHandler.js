const search = require("../models/search");

async function handlePostCreated(event) {
  try {
    const newSearchPost = new search({
      postId: event.postId,
      userId: event.userId,
      content: event.content,
      createdAt: event.createdAt,
    });

    await newSearchPost.save();
    logger.info(`Search post created: ${event.postId}, ${newSearchPost._id}`);
  } catch (error) {
    logger.error(error, "Error handling post creation event");
  }
}

async function handlePostDeleted(event) {
  try {
    await search.findOneAndDelete({ postId: event.postId });
    logger.info(`Search post deleted: ${event.postId}`);
  } catch (error) {
    logger.error(error, "Error handling post deletion event");
  }
}

module.exports = { handlePostCreated, handlePostDeleted };
