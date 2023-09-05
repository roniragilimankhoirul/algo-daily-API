import { validate } from "../validation/validation.js";
import {
  getUserStatisticValidation,
  getUserValidation,
  loginUserValidation,
  registerUserValidation,
  updateUserPasswordValidation,
  updateUserPhotoValidation,
} from "../validation/user-validation.js";
import { prismaClient } from "../application/database.js";
import { ResponseError } from "../error/response-error.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import ImageKit from "imagekit";

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
      id: true,
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
  const token = jwt.sign({ user }, jwtSecretKey, { expiresIn: "1d" });
  const userFullData = await prismaClient.user.findUnique({
    where: {
      email: user.email,
    },
  });
  return { token, userFullData };
};

const get = async (user) => {
  user = validate(getUserValidation, user);
  const userInDatabase = await prismaClient.user.findUnique({
    where: {
      email: user,
    },
    select: {
      name: true,
      email: true,
      password: true,
      photo_url: true,
    },
  });
  if (!userInDatabase) {
    throw new ResponseError("User not Found");
  }

  if (userInDatabase.photo_url === null) {
    userInDatabase.photo_url =
      "https://ui-avatars.com/api/?size=128&background=0D8ABC&color=fff&name=" +
      encodeURIComponent(userInDatabase.name);
  }

  console.log(userInDatabase);
  return userInDatabase;
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

const updateUserPassword = async (user, newPassword) => {
  // Validate the newPasswordData
  const validatedData = validate(updateUserPasswordValidation, newPassword);

  const userInDatabase = await prismaClient.user.findUnique({
    where: {
      email: user,
    },
  });
  if (!userInDatabase) {
    throw new ResponseError(404, "User Not Found");
  }

  const newPasswordHash = await bcrypt.hash(validatedData.newPassword, 10);

  return prismaClient.user.update({
    where: { id: userInDatabase.id },
    data: { password: newPasswordHash },
    select: {
      name: true,
      email: true,
    },
  });
};

const getUserStatistic = async (user) => {
  user = validate(getUserStatisticValidation, user);
  const userInDatabase = await prismaClient.user.findUnique({
    where: {
      email: user,
    },
  });

  if (!userInDatabase) {
    throw new ResponseError(404, "User Not Found");
  }

  // Mendapatkan tanggal saat ini secara dinamis
  const currentDate = new Date();

  // Tentukan tanggal awal dan akhir untuk pencarian attendance dalam satu hari
  const startDate = new Date(currentDate);
  startDate.setHours(0, 0, 0, 0);

  const endDate = new Date(currentDate);
  endDate.setHours(23, 59, 59, 999);

  // Temukan semua attendance pengguna pada tanggal yang diberikan
  const userAttendances = await prismaClient.userAttendance.findMany({
    where: {
      user_id: userInDatabase.id,
      attendance: {
        timestamp: {
          gte: startDate,
          lte: endDate,
        },
      },
    },
    include: {
      attendance: true,
    },
  });

  // Hitung jumlah attendance yang tepat waktu dan telat
  let onTimeCount = 0;
  let lateCount = 0;

  userAttendances.forEach(({ attendance }) => {
    const timestamp = new Date(attendance.timestamp);
    const createdAt = new Date(attendance.created_at);

    const timeDifference = (timestamp - createdAt) / 1000; // Dalam detik

    if (timeDifference <= 300) {
      // Lebih dari atau sama dengan 5 menit (300 detik) adalah tepat waktu
      onTimeCount++;
    } else {
      lateCount++;
    }
  });

  return {
    onTimeCount,
    lateCount,
  };
};

export default {
  register,
  login,
  get,
  updateUserPhoto,
  updateUserPassword,
  getUserStatistic,
};
