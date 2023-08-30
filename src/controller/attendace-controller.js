import { request } from "express";
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

const get = async (req, res, next) => {
  try {
    const user = req.decodedToken.user.email;
    const result = await attendaceService.get(user);
    res.status(200).json({
      data: result,
    });
  } catch (e) {
    next(e);
  }
};

const getById = async (req, res, next) => {
  try {
    const email = req.decodedToken.user.email;
    const request = req.params;
    request.email = email;
    console.log(request);
    const result = await attendaceService.getById(request);
    res.status(200).json({
      data: result,
    });
  } catch (e) {
    next(e);
  }
};

export default { createAttendance, get, getById };
