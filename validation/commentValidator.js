const Joi = require("joi");

const createCommentSchema = Joi.object({
  postId: Joi.string().required(),
  text: Joi.string().required(),
});

module.exports = { createCommentSchema };
