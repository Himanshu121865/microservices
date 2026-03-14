const Joi = require("joi");

const validateRegistration = (data) => {
  const schema = Joi.object({
    username: Joi.string().min(3).max(50).required(),
    email: Joi.string().email({
      minDomainSegments: 2,
      tlds: { allow: ["com", "net"] },
    }),
    password: Joi.string().min(6).max(16).required(),
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

module.exports = { validateRegistration, validationLogin };
