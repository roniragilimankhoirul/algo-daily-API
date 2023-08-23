import { validate } from "../validation/validation.js";
import {
  loginUserValidation,
  registerUserValidation,
  updateUserPhotoValidation,
} from "../validation/user-validation.js";
import { prismaClient } from "../application/database.js";
import { ResponseError } from "../error/response-error.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { logger } from "../application/logging.js";
import ImageKit from "imagekit";
import CryptoJS from "crypto-js";
import { request } from "express";

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

const updateUserPhoto = async (userEmail, uploadedFile) => {
  const imagekit = new ImageKit({
    publicKey: "public_9rmFWwNzjI9XVB2JdzaIyI10C+I=",
    privateKey: "private_jm1crOoYsIfCIiyEno50eAz7dXM=",
    urlEndpoint: "https://ik.imagekit.io/abazure/",
  });

  const userInDatabase = await prismaClient.user.findUnique({
    where: {
      email: userEmail,
    },
  });
  if (!userInDatabase) {
    throw new ResponseError(404, "User Not Found");
  }

  // Upload photo to ImageKit.io
  const uploadResponse = await imagekit.upload({
    file: uploadedFile.buffer.toString("base64"), // Convert buffer to base64 string
    fileName: `${userInDatabase.id}_profile_photo.jpg`,
  });

  // Update user's photo_url in the database
  return prismaClient.user.update({
    where: { id: userInDatabase.id },
    data: { photo_url: uploadResponse.url },
    select: {
      name: true,
      email: true,
      photo_url: true,
    },
  });
};

export default { register, login, updateUserPhoto };
