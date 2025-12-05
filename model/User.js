const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
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
});

const User = mongoose.model("User", userSchema);

module.exports = { User };
