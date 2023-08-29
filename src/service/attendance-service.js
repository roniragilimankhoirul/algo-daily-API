import { prismaClient } from "../application/database.js";
import {
  createAttendanceValidation,
  getAttendanceValidation,
} from "../validation/attendance-validation.js";
import { validate } from "../validation/validation.js";

const createAttendance = async (user, request) => {
  const attendanceData = validate(createAttendanceValidation, request);
  console.log("User ID:", user.id);

  const userInDatabase = await prismaClient.user.findUnique({
    where: {
      email: user.email,
    },
  });

  if (!userInDatabase) {
    throw new ResponseError(404, "User Not Found");
  }

  // Create the attendance record
  const createdAttendance = await prismaClient.attendance.create({
    data: {
      ...attendanceData,
      users: {
        create: [{ user: { connect: { id: userInDatabase.id } } }],
      },
    },
    select: {
      status: true,
      timestamp: true,
      latitude: true,
      longitude: true,
      reason: true,
      created_at: true,
    },
  });

  return createdAttendance;
};

const get = async (user) => {
  user = validate(getAttendanceValidation, user);
  const userInDatabase = await prismaClient.user.findUnique({
    where: {
      email: user,
    },
  });

  if (!userInDatabase) {
    throw new ResponseError(404, "User Not Found");
  }

  const userAttendances = await prismaClient.userAttendance.findMany({
    where: {
      user_id: userInDatabase.id,
    },
    include: {
      attendance: true,
    },
  });

  return userAttendances.map(({ attendance }) => attendance);
};

export default { createAttendance, get };
