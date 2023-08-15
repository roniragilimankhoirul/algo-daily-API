import { register } from "../service/user-service.js";
const userRegister = async (req, res, next) => {
  try {
    const result = await register.userRegister(req.body);
    res.status(200).json({
      data: result,
    });
  } catch (e) {
    next(e);
  }
};

export { userRegister };
