const mongoose = require("mongoose");
const path = require("path");

const userSchema = new mongoose.Schema({
  // Authentication Info
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ["user", "admin", "super_admin"],
    default: "user",
  },

  otp: { type: String, maxLength: 6 },
  otpExpires: { type: Date },
  isVerify: { type: Boolean, default: false },

  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },

  // Profile Info
  name: { type: String, required: true },
  profilePic: {
    type: String,
    default: path.join("public", "default-profile-picture.png"),
  },
  bio: { type: String, default: "" },
});

const User = mongoose.model("User", userSchema);

module.exports = { User };
