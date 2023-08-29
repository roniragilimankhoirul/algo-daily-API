import Joi from "joi";

const registerUserValidation = Joi.object({
  name: Joi.string().max(100).required(),
  email: Joi.string().email().max(100).required(),
  password: Joi.string().max(100).required(),
});
const loginUserValidation = Joi.object({
  email: Joi.string().max(100).required(),
  password: Joi.string().max(100).required(),
});

const getUserValidation = Joi.string().required();

const updateUserPhotoValidation = Joi.object({
  email: Joi.string().max(100).required(),
  photo_url: Joi.required(),
});

const updateUserPasswordValidation = Joi.object({
  newPassword: Joi.string().max(100).required(),
  confirmPassword: Joi.string()
    .valid(Joi.ref("newPassword"))
    .required()
    .messages({ "any.only": "Passwords must match" }),
});

export {
  registerUserValidation,
  loginUserValidation,
  getUserValidation,
  updateUserPhotoValidation,
  updateUserPasswordValidation,
};
