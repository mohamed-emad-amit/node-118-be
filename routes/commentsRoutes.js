const express = require("express");
const { authMiddleware } = require("../middlewares/authMiddleware");
const { createCommentSchema } = require("../validation/commentValidator");
const { Comment } = require("../model/Comment");
const router = express.Router();

// Create Comment
router.post("", authMiddleware, async function (request, response) {
  try {
    // Prepare Data
    const userId = request.user.id;
    const data = request.body;

    // Validation
    const { error, value } = createCommentSchema.validate(data, {
      abortEarly: false,
    });

    if (error)
      return response
        .status(400)
        .json({ messages: error.details.map((e) => e.message) });

    // Extract Data
    const { postId, text } = value;

    // Create
    const comment = await Comment.create({ text, postId, userId });

    response
      .status(201)
      .json({ message: "Comment Added Successfully", comment });
  } catch (error) {
    console.log(error);
    response.status(500).json({ message: "Internal Server Error!" });
  }
});

// Update Comment
router.patch("/:id", authMiddleware, async function (request, response) {
  try {
    // Prepare Data
    const id = request.params.id;
    const userId = request.user.id;

    const text = request.body.text;

    // Update Comment
    const comment = await Comment.findOneAndUpdate(
      { userId, _id: id }, // Search Comment ID & Owner
      { text },
      { new: true }
    );

    if (!comment) {
      return response.status(403).json({ message: "Access Denied!" });
    }

    response.json({ message: "Comment Updated Successfully!", comment });
  } catch (error) {
    console.log(error);
    response.status(500).json({ message: "Internal Server Error!" });
  }
});

// Delete Comment

module.exports = router;
