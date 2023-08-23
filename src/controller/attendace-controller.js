import attendaceService from "../service/attendance-service.js";
const createAttendance = async (req, res, next) => {
  try {
    const user = req.decodedToken.user;
    console.log(user);
    console.log(req);
    const request = req.body;
    const result = await attendaceService.createAttendance(user, request);
    res.status(200).json({
      data: result,
    });
  } catch (e) {
    next(e);
  }
};

export default { createAttendance };
