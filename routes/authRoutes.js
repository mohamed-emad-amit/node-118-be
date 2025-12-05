// imports
const express = require("express");
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");

// internal imports
const {
  registerSchema,
  verifySchema,
  loginSchema,
  ResendOtpSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} = require("../validation/userValidator");
const { User } = require("../model/User");
const { sendMail } = require("../utils/sendEmail");
const { generateOtp } = require("../utils/generateOTP");

// Global Config
dotenv.config();

const router = express.Router();

// TODO: LOGIN
router.post("/login", async function (request, response) {
  try {
    // Validate Data
    const { error, value } = loginSchema.validate(request.body, {
      abortEarly: false,
    });

    if (error) {
      return response
        .status(400)
        .json({ messages: error.details.map((e) => e.message) });
    }

    // Extract Info
    const { email, password } = value;

    // Check User Exist
    const user = await User.findOne({ email });
    if (!user)
      return response
        .status(400)
        .json({ message: "Invalid Email Or Password" });

    // Compare Password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return response
        .status(400)
        .json({ message: "Invalid Email Or Password" });

    // Check Verify
    if (!user.isVerify) {
      return response.status(403).json({
        message: "Account Not Verified Yet.",
        isVerified: false, // Redirect [verify-otp]
        email: user.email,
      });
    }

    // Generate Token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );
    response.json({ message: "Loggedin Successfully", token });
  } catch (error) {
    console.log(error);
    response.status(500).json({ message: "Internal Server Error!" });
  }
});
// TODO: REGISTER
router.post("/register", async function (request, response) {
  try {
    // Validate Data
    const { error, value } = registerSchema.validate(request.body, {
      abortEarly: false,
    });

    if (error) {
      return response
        .status(400)
        .json({ messages: error.details.map((e) => e.message) });
    }

    // Extract Info
    const { email, password } = value;

    // Validate Email Exist Or Not
    const userExisting = await User.findOne({ email });
    if (userExisting) {
      return response.status(400).json({ message: "Email Already Exist." });
    }

    // Hash Password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Generate OTP + Expires
    const { otp, otpExpires } = generateOtp();

    // Save User
    const user = await User.create({
      email,
      password: hashedPassword,
      otp,
      otpExpires,
    });

    // Send Email
    await sendMail(email, "OTP Code", `Your OTP is: ${otp}`);

    response.status(201).json({ message: "OTP Sent To Your Email" });
  } catch (error) {
    console.log(error);
    response.status(500).json({ message: "Internal Server Error!" });
  }
});
// TODO: VERIFY-OTP
router.post("/verify-otp", async function (request, response) {
  try {
    // Validate Data
    const { error, value } = verifySchema.validate(request.body, {
      abortEarly: false,
    });

    if (error) {
      return response
        .status(400)
        .json({ messages: error.details.map((e) => e.message) });
    }

    // Extract Info
    const { email, otp } = value;

    // Validate User
    const user = await User.findOne({ email });
    if (!user) {
      return response
        .status(400)
        .json({ message: "This Email Not Related To User" });
    }

    // Validate otp
    if (user.otp !== otp || user.otpExpires < Date.now()) {
      return response.status(400).json({ message: "Invalid or Expired OTP" });
    }

    // Verify
    user.isVerify = true;

    // Clear OTP
    user.otp = undefined;
    user.otpExpires = undefined;

    // Save
    await user.save();

    response.json({ message: "Account Verified Successfully" });
  } catch (error) {
    console.log(error);
    response.status(500).json({ message: "Internal Server Error!" });
  }
});
// TODO: RESEND-OTP
router.post("/resend-otp", async function (request, response) {
  try {
    // Validate Data
    const { error, value } = ResendOtpSchema.validate(request.body);
    if (error) {
      return response.status(400).json({ message: error.message });
    }
    // Extract Info
    const { email } = value;

    // Check User Exist
    const user = await User.findOne({ email });
    if (!user) {
      return response
        .status(400)
        .json({ message: "This Email Not Related To User" });
    }

    // Check Verified
    if (user.isVerify) {
      return response.status(400).json({ message: "User Already is Verified" });
    }

    // Generate OTP + Expires
    const { otp, otpExpires } = generateOtp();

    // Update User Info
    user.otp = otp;
    user.otpExpires = otpExpires;
    await user.save();

    // Send Email
    await sendMail(email, "OTP Code", `Your OTP is: ${otp}`);

    response.json({ message: "OTP Sent To Your Email" });
  } catch (error) {
    console.log(error);
    response.status(500).json({ message: "Internal Server Error!" });
  }
});

// TODO [NOT IMPLEMENTED YET]

// TODO: Forgot Password
router.post("/forgot-password", async function (requset, response) {
  try {
    // Validate Data
    const { error, value } = forgotPasswordSchema.validate(requset.body);

    if (error) {
      return response.status(400).json({ message: error.message });
    }

    // Extract Info
    const { email } = value;

    // Check User
    const user = await User.findOne({ email });
    if (!user) {
      return response
        .status(400)
        .json({ message: "This Email Not Related To User" });
    }

    // randomBytes Generate 32
    const resetPasswordToken = crypto.randomBytes(32).toString("hex");
    const resetPasswordExpires = Date.now() + 10 * 60 * 1000;

    // Update User
    user.resetPasswordToken = resetPasswordToken;
    user.resetPasswordExpires = resetPasswordExpires;

    await user.save();

    // Origin Front + reset-password/${token}
    const resetUrl = `${process.env.CLIENT_ORIGIN}/reset-password/${resetPasswordToken}`;

    await sendMail(
      email,
      "Reset Password",
      `Click this link to reset your password: ${resetUrl}`
    );

    response.json({ message: "Reset Password Link Sent To Your Mail." });
  } catch (error) {
    console.log(error);
    response.status(500).json({ message: "Internal Server Error!" });
  }
});
// TODO: Reset Password
router.post("/reset-password", async function (requset, response) {
  try {
    // Validate Data
    const { error, value } = resetPasswordSchema.validate(requset.body, {
      abortEarly: false,
    });

    if (error) {
      return response
        .status(400)
        .json({ messages: error.details.map((e) => e.message) });
    }
    // Extract Info
    const { token, newPassword } = value;

    // Check User Exist
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return response.status(400).json({ message: "Invalid Token Or Expired" });
    }

    // Hash
    const password = await bcrypt.hash(newPassword, 12);

    // Update
    user.password = password;

    // Clear
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    response.json({ message: "Password Changes Successfully" });
  } catch (error) {
    console.log(error);
    response.status(500).json({ message: "Internal Server Error!" });
  }
});
module.exports = router;
