import express from "express";
import userController from "../controller/user-controller.js";
import { requireAuth } from "../middleware/auth-middleware.js";
import multer from "multer";

const userRouter = new express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

userRouter.use(requireAuth);

userRouter.put(
  "/api/users/photo",
  upload.single("photo"),
  userController.updateUserPhoto
);

export { userRouter };
