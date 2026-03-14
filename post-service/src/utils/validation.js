const Joi = require("joi");

const validateCreatePost = (data) => {
  const schema = Joi.object({
    content: Joi.string().min(3).max(5000).required(),
    content: Joi.array(),
  });
  return schema.validate(data);
};

const validationLogin = (data) => {
  const schema = Joi.object({
    email: Joi.string().email({
      minDomainSegments: 2,
      tlds: { allow: ["com", "net"] },
    }),
    password: Joi.string().min(6).max(16).required(),
  });
  return schema.validate(data);
};

module.exports = { validateCreatePost, validationLogin };
