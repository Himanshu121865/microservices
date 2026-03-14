const express = require("express");
const {
  createPost,
  getAllPost,
  getPost,
  deletePost,
} = require("..//controller/post-controller");
const { authencationRequest } = require("../middleware/authmiddleware");

const router = express();

router.use(authencationRequest);

router.post("/create-post", createPost);
router.get("/all-posts", getAllPost);
router.get("/:id", getPost);
router.delete("/:id", deletePost);

module.exports = router;
