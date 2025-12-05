// imports
const nodemailer = require("nodemailer");
const dotenv = require("dotenv");

// Config
dotenv.config();

// transporter sender
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST_PROVIDER,
  port: process.env.SMTP_PORT,

  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function sendMail(to, subject, text) {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      text,
    });
  } catch (error) {
    console.log(error);
  }
}

module.exports = { sendMail };
