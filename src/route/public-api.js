import express, { Router } from "express";
import { userRegister } from "../controller/user-controller.js";

const publicRouter = new express.Router();
publicRouter.post("/api/user", userRegister);

export { publicRouter };
