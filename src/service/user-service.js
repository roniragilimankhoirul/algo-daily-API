import { validate } from "../validation/validation.js";
import {
  getUserStatisticValidation,
  getUserValidation,
  loginUserValidation,
  registerUserValidation,
  updateUserPasswordValidation,
} from "../validation/user-validation.js";
import { prismaClient } from "../application/database.js";
import { ResponseError } from "../error/response-error.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import ImageKit from "imagekit";
import "dotenv/config";

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

  const jwtSecretKey = process.env.JWT_SECRET;

  // const encryptJwtKey =
  const token = jwt.sign({ user }, jwtSecretKey);
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

  // Get the current date
  const currentDate = new Date();

  // Determine the start and end dates for the one-day period
  const endDate = new Date(currentDate);
  endDate.setHours(23, 59, 59, 999);

  const startDate = new Date(currentDate);
  startDate.setHours(0, 0, 0, 0);

  // Find all user attendances within the one-day period
  const userAttendancesDay = await prismaClient.userAttendance.findMany({
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

  // Count the number of on-time and late attendance entries within the day
  let onTimeCountDay = 0;
  let lateCountDay = 0;

  userAttendancesDay.forEach(({ attendance }) => {
    const timestamp = new Date(attendance.timestamp);
    const createdAt = new Date(attendance.created_at);

    const timeDifference = (timestamp - createdAt) / 1000; // In seconds

    if (timeDifference <= 600) {
      // More than or equal to 5 minutes (300 seconds) is considered on-time
      onTimeCountDay++;
    } else {
      lateCountDay++;
    }
  });

  // Determine the start and end dates for the one-week period (5 working days)
  const weekStartDate = new Date(currentDate);
  weekStartDate.setDate(currentDate.getDate() - 4); // Assuming a week is 5 working days (exclude Sat and Sun)
  weekStartDate.setHours(0, 0, 0, 0);

  // Find all user attendances within the one-week period
  const userAttendancesWeek = await prismaClient.userAttendance.findMany({
    where: {
      user_id: userInDatabase.id,
      attendance: {
        timestamp: {
          gte: weekStartDate,
          lte: endDate,
        },
      },
    },
    include: {
      attendance: true,
    },
  });

  // Count the total number of attendance entries within the week
  const totalAttendanceCountWeek = userAttendancesWeek.length;

  // Count the number of on-time attendance entries within the week
  let onTimeCountWeek = 0;

  userAttendancesWeek.forEach(({ attendance }) => {
    const timestamp = new Date(attendance.timestamp);
    const createdAt = new Date(attendance.created_at);

    const timeDifference = (timestamp - createdAt) / 1000; // In seconds

    if (timeDifference <= 600) {
      // More than or equal to 5 minutes (300 seconds) is considered on-time
      onTimeCountWeek++;
    }
  });

  // Calculate the percentage of on-time attendance for the week (5 working days)
  const onTimePercentageWeek = Math.floor(
    (onTimeCountWeek / totalAttendanceCountWeek) * 100
  );

  return {
    onTimeCountDay,
    lateCountDay,
    onTimePercentageWeek,
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
