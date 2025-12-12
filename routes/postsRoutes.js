const express = require("express");
const { authMiddleware } = require("../middlewares/authMiddleware");
const { upload } = require("../utils/upload");
const { Post } = require("../model/Post");

const router = express.Router();

// Create Post
router.post(
  "/create",
  authMiddleware,
  upload.array("images", 5),
  async function (request, response) {
    try {
      // Prepare Data => Images and Caption and UserId
      const images = request.files.map((file) => file.path);
      const caption = request.body.caption;
      const userId = request.user.id;

      // Create Post
      const post = await Post.create({ images, caption, userId });
      response.status(201).json({ message: "Post Created Successfully", post });
    } catch (error) {
      console.log(error);
      response.status(500).json({ message: "Internal Server Error!" });
    }
  }
);

// Get All Posts
router.get("/", async function (request, response) {
  try {
    // Get All Posts "Latest" + User
    const posts = await Post.find().populate("userId", "name profilePic").sort({
      createdAt: -1,
    });

    response.json({ message: "Posts Fetched Successfully", posts });
  } catch (error) {
    console.log(error);
    response.status(500).json({ message: "Internal Server Error!" });
  }
});

// Like - Dislike Post
router.put("/:id/like", authMiddleware, async function (request, response) {
  try {
    // Get Post
    const id = request.params.id;
    const post = await Post.findById(id);

    if (!post) return response.status(404).json({ message: "Post Not Found!" });

    // Check User Like Post
    const userId = request.user.id;
    const userExist = post.likes.includes(userId);

    if (userExist) {
      // unlike
      post.likes = post.likes.filter((id) => id != userId);
    } else {
      // like
      post.likes.push(userId);
    }

    // save
    await post.save();

    response.json({ post, likes: post.likes.length });
  } catch (error) {
    console.log(error);
    response.status(500).json({ message: "Internal Server Error!" });
  }
});

module.exports = router;
