import express from "express";
import userController from "../controller/user-controller.js";
import { requireAuth } from "../middleware/auth-middleware.js";
import userService from "../service/user-service.js";

const publicRouter = new express.Router();
publicRouter.post("/api/users", userController.register);
// publicRouter.use("/api/users/login", requireAuth);
publicRouter.post("/api/users/login", userController.login);

export { publicRouter };
