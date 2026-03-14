const logger = require("../utils/logger");
const Post = require("../models/post");
const { validateCreatePost } = require("../utils/validation");
const { publishEvent } = require("../utils/rabbitmq");

async function invalidatePostCache(req, input) {
  const cachedKey = `post:${input}`;
  await req.redisClient.del(cachedKey);

  const keys = await req.redisClient.keys("posts:*");

  if (keys.length > 0) {
    await req.redisClient.del(keys);
  }
}

const createPost = async (req, res) => {
  logger.info("Create post endpoint hit...");
  try {
    const { error } = validateCreatePost(req.body);
    if (error) {
      logger.warn("Validation error", error.details[0].message);
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }
    const { content, mediaIds } = req.body;
    const newlyCreatedPost = new Post({
      user: req.user.userId,
      content,
      mediaIds: mediaIds || [],
    });

    await newlyCreatedPost.save();

    await publishEvent("post.created", {
      postId: newlyCreatedPost._id.toString(),
      userId: newlyCreatedPost.user.toString(),
      content: newlyCreatedPost.content,
      createdAt: newlyCreatedPost.createdAt,
    });
    await invalidatePostCache(req, newlyCreatedPost._id.toString());
    logger.info("post created succesfully", newlyCreatedPost);
    res.status(201).json({
      success: true,
      message: "post created succesfully",
    });
  } catch (error) {
    logger.error("error creating post", error);
    res.status(500).json({
      success: false,
      message: "error creating post",
    });
  }
};

const getAllPost = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const startIndex = (page - 1) * limit;

    const cachekey = `posts:${page}:${limit}`;
    const cachePosts = await req.redisClient.get(cachekey);

    if (cachePosts) {
      return res.json(JSON.parse(cachePosts));
    }

    const posts = await Post.find({})
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(limit);

    const totalNoOfPosts = await Post.countDocuments();

    const result = {
      posts,
      currentpage: page,
      totalPages: Math.ceil(totalNoOfPosts / limit),
      totalPosts: totalNoOfPosts,
    };

    await req.redisClient.setex(cachekey, 300, JSON.stringify(result));

    res.json(result);
  } catch (error) {
    logger.error("error fetching post", error);
    res.status(500).json({
      success: false,
      message: "error fetching posts",
    });
  }
};

const getPost = async (req, res) => {
  try {
    const postId = req.params.id;
    const cachekey = `post:${postId}`;
    const cachedPosts = await req.redisClient.get(cachekey);

    if (cachedPosts) {
      return res.json(JSON.parse(cachedPosts));
    }

    const singlePostDetailsById = await Post.findById(postId);

    if (!singlePostDetailsById) {
      return res.status(404).json({
        message: "post not found",
        success: false,
      });
    }

    await req.redisClient.setex(
      cachekey,
      3600,
      JSON.stringify(singlePostDetailsById),
    );

    res.json(singlePostDetailsById);
  } catch (error) {
    logger.error("error fetching post by ID");
    res.status(500).json({
      success: false,
      message: "error fetching post by Id",
    });
  }
};

const deletePost = async (req, res) => {
  try {
    const post = await Post.findOneAndDelete({
      _id: req.params.id,
      user: req.user.userId,
    });

    if (!post) {
      return res.status(404).json({
        message: "post not found",
        success: false,
      });
    }

    await publishEvent("post.deleted", {
      postId: post._id.toString(),
      userId: req.user.userId,
      mediaIds: post.mediaIds,
    });

    await invalidatePostCache(req, req.params.id);
    res.json({
      message: "Post deleted success",
      success: true,
    });
  } catch (error) {
    logger.error("error deleting post", error);
    res.status(500).json({
      success: false,
      message: "error deleting posts",
    });
  }
};

module.exports = { createPost, getAllPost, getPost, deletePost };
