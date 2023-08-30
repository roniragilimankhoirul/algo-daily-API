import Joi from "joi";

// const createAttendanceValidation = Joi.object({
//   attended: Joi.boolean().required(),
//   latitude: Joi.number().required(),
//   longitude: Joi.number().required(),
//   reason: Joi.string().required(),
// });

const StatusEnum = ["ON_DUTY", "PERMIT", "OFF_DUTY", "NOT_FILLED"];

const createAttendanceValidation = Joi.object({
  status: Joi.string()
    .valid(...StatusEnum)
    .required(),
  latitude: Joi.number(),
  longitude: Joi.number(),
  reason: Joi.string(),
});

const getAttendanceValidation = Joi.string().max(100).required();
const getAttendanceByIdValidation = Joi.object({
  id: Joi.string().max(100).required(),
  email: Joi.string().email().max(100).required(),
});

export {
  createAttendanceValidation,
  getAttendanceValidation,
  getAttendanceByIdValidation,
};
