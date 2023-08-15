import express, { Router } from "express";
import { userRegister } from "../controller/user-controller";

const publicRouter = Router.express();
publicRouter.post("/api/user", userRegister);

module.exports = { publicRouter };
