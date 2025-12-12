const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    images: [String],
    caption: { type: String, default: "" },

    userId: { type: mongoose.Types.ObjectId, ref: "User", required: true },
    likes: [{ type: mongoose.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

const Post = mongoose.model("Post", postSchema);

module.exports = { Post };
