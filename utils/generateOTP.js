const { generate } = require("otp-generator");

function generateOtp() {
  // Generate OTP + Expires
  const otp = generate(6, { digits: true, specialChars: true });
  const otpExpires = Date.now() + 10 * 60 * 1000;

  return { otp, otpExpires };
}

module.exports = { generateOtp };
