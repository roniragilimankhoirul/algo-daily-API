import userService from "../service/user-service.js";
const register = async (req, res, next) => {
  try {
    const result = await userService.register(req.body);
    res.status(200).json({
      data: result,
    });
  } catch (e) {
    next(e);
  }
};

const login = async (req, res, next) => {
  try {
    const result = await userService.login(req.body);
    res.status(200).json({
      data: {
        token: result.token,
      },
    });
  } catch (e) {
    next(e);
  }
};

const get = async (req, res, next) => {
  try {
    const user = req.decodedToken.user.email;
    console.log(user);
    const result = await userService.get(user);
    res.status(200).json({
      data: result,
    });
  } catch (e) {
    next(e);
  }
};

const updateUserPhoto = async (req, res, next) => {
  try {
    const userEmail = req.decodedToken.user.email;
    const uploadedFile = req.file;
    console.log(req);

    const result = await userService.updateUserPhoto(userEmail, uploadedFile);
    res.status(200).json({
      data: result,
    });
  } catch (e) {
    next(e);
  }
};

export default { register, login, get, updateUserPhoto };
