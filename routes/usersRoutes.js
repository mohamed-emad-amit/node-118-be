const express = require("express");
const { authMiddleware } = require("../middlewares/authMiddleware");
const { upload } = require("../utils/upload");
const { User } = require("../model/User");
const { updateProfileSchema } = require("../validation/userValidator");
const { Post } = require("../model/Post");

const router = express.Router();

// User Already Exist Update Profile -> Upload Image
router.put(
  "/profile/update",
  authMiddleware,
  upload.single("image"),
  async function (request, response) {
    try {
      // Get User Id
      const id = request.user.id;
      // Find User
      const user = await User.findById(id);
      // Get Image Upload
      const profilePic = request.file.path;
      // Update User -> profilePic
      user.profilePic = profilePic;
      // Save
      await user.save();
      response.json({ message: "Profile Picture Updated.", profilePic });
    } catch (error) {
      console.log(error);
      response.status(500).json({ message: "Internal Server Error!" });
    }
  }
);

// User Already Exist Update Profile -> Change Bio Or Name
router.patch(
  "/profile/update",
  authMiddleware,
  async function (request, response) {
    try {
      // Validation Profile Info
      const data = request.body;

      const { error, value } = updateProfileSchema.validate(data, {
        abortEarly: false,
      });
      if (error) {
        return response
          .status(400)
          .json({ message: error.details.map((e) => e.message) });
      }

      // Extract Data
      const id = request.user.id;
      const { bio, name } = value;

      const user = await User.findByIdAndUpdate(
        id,
        { bio, name },
        { new: true }
      ).select("-password");

      // Return User Front -> Slice
      response.json({ message: "Profile Updated.", user });
    } catch (error) {
      console.log(error);
      response.status(500).json({ message: "Internal Server Error!" });
    }
  }
);

// Get All User Posts
router.get("/:userId/posts", async function (request, response) {
  try {
    const userId = request.params.userId;
    const posts = await Post.find({ userId }).sort({ createdAt: -1 });

    response.json({ posts });
  } catch (error) {
    console.log(error);
    response.status(500).json({ message: "Internal Server Error!" });
  }
});

module.exports = router;
