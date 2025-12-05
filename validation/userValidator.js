const Joi = require("joi");

const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

const ResendOtpSchema = Joi.object({
  email: Joi.string().email().required(),
});

const verifySchema = Joi.object({
  email: Joi.string().email().required(),
  otp: Joi.string().length(6).required(),
});

module.exports = { registerSchema, verifySchema, loginSchema, ResendOtpSchema };
