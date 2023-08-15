import { validate } from "../validation/validation";
import { registerUserValidation } from "../validation/user-validation";
import { PrismaClient } from "../application/database";
import { ResponseError } from "../error/response-error";
import bcrypt from "bcrypt";
const register = async (request) => {
  const user = validate(registerUserValidation, request);
  const userCount = await PrismaClient.user.count({
    where: {
      email: user.email,
    },
  });

  if (userCount === 1) {
    throw new ResponseError(400, "Email already been used");
  }
  user.password = await bcrypt.hash(user.password, 10);
  return PrismaClient.user.create({
    data: user,
    select: {
      name: true,
      email: true,
    },
  });
};

module.exports = { register };
