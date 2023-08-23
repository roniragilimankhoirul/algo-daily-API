import express from "express";
import { publicRouter } from "../route/public-api.js";
import { errorMiddleware } from "../middleware/error-middleware.js";
import { requireAuth } from "../middleware/auth-middleware.js";
import { userRouter } from "../route/api.js";

const app = express();
app.use(express.json());
// app.use(requireAuth);
app.use(publicRouter);
app.use(userRouter);
app.use(errorMiddleware);

export { app };
