import { validate } from "../validation/validation.js";
import {
  loginUserValidation,
  registerUserValidation,
} from "../validation/user-validation.js";
import { prismaClient } from "../application/database.js";
import { ResponseError } from "../error/response-error.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { logger } from "../application/logging.js";
import CryptoJS from "crypto-js";

const register = async (request) => {
  const user = validate(registerUserValidation, request);
  const userCount = await prismaClient.user.count({
    where: {
      email: user.email,
    },
  });

  if (userCount === 1) {
    throw new ResponseError(400, "Email already been used");
  }
  user.password = await bcrypt.hash(user.password, 10);
  return prismaClient.user.create({
    data: user,
    select: {
      name: true,
      email: true,
    },
  });
};

const login = async (request) => {
  const loginRequest = validate(loginUserValidation, request);
  const user = await prismaClient.user.findUnique({
    where: {
      email: loginRequest.email,
    },
    select: {
      name: true,
      email: true,
      password: true,
    },
  });

  if (!user) {
    throw new ResponseError(
      401,
      "The email address or password is incorrect. Please retry..."
    );
  }
  const isPasswordValid = await bcrypt.compare(
    loginRequest.password,
    user.password
  );
  if (!isPasswordValid) {
    throw new ResponseError(
      401,
      "The email address or password is incorrect. Please retry..."
    );
  }
  const jwtSecretKey =
    "CoAmswhTKX+W4/I2einL3kIrTQ8nAHny902dTJO1n3JJ2EmQci2Cs5QedkHwEsgW+SSEYBmCN4YZbh9e0KfZ3Q==";
  // const encryptJwtKey =
  const token = jwt.sign({ user }, jwtSecretKey, { expiresIn: "1h" });
  logger.info(token);
  const userFullData = await prismaClient.user.findUnique({
    where: {
      email: user.email,
    },
  });
  logger.info(token);
  return { token, userFullData };
};

export default { register, login };
