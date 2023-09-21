import { prismaClient } from "../application/database.js";
import {
  createAttendanceValidation,
  getAttendanceByIdValidation,
  getAttendanceValidation,
  updateAttendanceValidation,
} from "../validation/attendance-validation.js";
import { validate } from "../validation/validation.js";
import { ResponseError } from "../error/response-error.js";

const createAttendance = async (user, request) => {
  // Check if the request is an array or a single object
  const isBulk = Array.isArray(request);

  // Ensure that request is an array for bulk operations
  if (!isBulk) {
    request = [request];
  }

  // Validate the request data using Joi schema
  const validatedData = request.map((data) => {
    return validate(createAttendanceValidation, data);
  });

  // Find the user in the database
  const userInDatabase = await prismaClient.user.findUnique({
    where: {
      email: user.email,
    },
  });

  if (!userInDatabase) {
    throw new ResponseError(404, "User Not Found");
  }

  // Create attendance records based on the validated data
  const createdAttendances = await Promise.all(
    validatedData.map(async (attendanceData) => {
      const createdAttendance = await prismaClient.attendance.create({
        data: {
          ...attendanceData,
          users: {
            create: [{ user: { connect: { id: userInDatabase.id } } }],
          },
        },
        select: {
          id: true,
          status: true,
          timestamp: true,
          latitude: true,
          longitude: true,
          reason: true,
          created_at: true,
        },
      });
      return createdAttendance;
    })
  );

  // If it was a single object request, return the first created attendance record
  if (!isBulk) {
    return createdAttendances[0];
  }

  // If it was a bulk request, return an array of created attendance records
  return createdAttendances;
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
    orderBy: {
      attendance: {
        created_at: "desc",
      },
    },
  });

  return userAttendances.map(({ attendance }) => attendance);
};

const getById = async (request) => {
  const validatedRequest = validate(getAttendanceByIdValidation, request);
  const userInDatabase = await prismaClient.user.findUnique({
    where: {
      email: validatedRequest.email,
    },
  });

  if (!userInDatabase) {
    throw new ResponseError(404, "User Not Found");
  }

  const userAttendance = await prismaClient.userAttendance.findUnique({
    where: {
      user_id_attendance_id: {
        user_id: userInDatabase.id,
        attendance_id: validatedRequest.id,
      },
    },
    include: {
      attendance: true,
    },
  });

  if (!userAttendance) {
    throw new ResponseError(404, "Attendance Not Found");
  }

  return userAttendance.attendance;
};

const updateAttendance = async (user, attendace, request) => {
  request = validate(updateAttendanceValidation, request);
  const userInDatabase = await prismaClient.user.findUnique({
    where: {
      email: user.email,
    },
  });

  if (!userInDatabase) {
    throw new ResponseError(404, "User Not Found");
  }

  const existingUserAttendance = await prismaClient.userAttendance.findUnique({
    where: {
      user_id_attendance_id: {
        user_id: userInDatabase.id,
        attendance_id: attendace.id,
      },
    },
  });

  if (!existingUserAttendance) {
    throw new ResponseError(404, "User Attendance Not Found");
  }

  const updatedUserAttendance = await prismaClient.userAttendance.update({
    where: {
      user_id_attendance_id: {
        user_id: userInDatabase.id,
        attendance_id: attendace.id,
      },
    },
    data: {
      attendance: {
        update: {
          ...request,
          timestamp: new Date(), // Update the timestamp field
        },
      },
    },
    include: {
      attendance: true,
    },
  });

  return updatedUserAttendance.attendance;
};

export default { createAttendance, get, getById, updateAttendance };
