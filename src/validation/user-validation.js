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

const getUserValidation = Joi.string().max(100).required();

const updateUserPhotoValidation = Joi.object({
  email: Joi.string().max(100).required(),
  photo_url: Joi.required(),
});

export {
  registerUserValidation,
  loginUserValidation,
  getUserValidation,
  updateUserPhotoValidation,
};
