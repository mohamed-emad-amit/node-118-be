const express = require("express");
const { authMiddleware } = require("../middlewares/authMiddleware");
const { upload } = require("../utils/upload");
const { User } = require("../model/User");

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

module.exports = router;
