import { prismaClient } from "../application/database.js";
import { createAttendanceValidation } from "../validation/attendance-validation.js";
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
      attended: true,
      timestamp: true,
      latitude: true,
      longitude: true,
      reason: true,
    },
  });

  return createdAttendance;
};

export default { createAttendance };
