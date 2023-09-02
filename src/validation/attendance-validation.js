import Joi from "joi";

const StatusEnum = ["ON_DUTY", "PERMIT", "OFF_DUTY", "NOT_FILLED"];

const createAttendanceValidation = Joi.object({
  status: Joi.string()
    .valid(...StatusEnum)
    .required(),
  latitude: Joi.number().allow(null),
  longitude: Joi.number().allow(null),
  reason: Joi.string().allow(null),
});

const getAttendanceValidation = Joi.string().max(100).required();
const getAttendanceByIdValidation = Joi.object({
  id: Joi.string().max(100).required(),
  email: Joi.string().email().max(100).required(),
});

const updateAttendanceValidation = Joi.object({
  status: Joi.string()
    .valid(...StatusEnum)
    .required(),
  latitude: Joi.number(),
  longitude: Joi.number(),
  reason: Joi.string(),
});

export {
  createAttendanceValidation,
  getAttendanceValidation,
  getAttendanceByIdValidation,
  updateAttendanceValidation,
};
