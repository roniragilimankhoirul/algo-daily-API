import Joi from "joi";

const createAttendanceValidation = Joi.object({
  attended: Joi.boolean().required(),
  latitude: Joi.number().required(),
  longitude: Joi.number().required(),
  reason: Joi.string().required(),
});

export { createAttendanceValidation };
