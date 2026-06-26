import { Router } from "express";
import {
  createAccount,
  loginUser,
  refreshToken,
} from "../controllers/auth.controller.js";
import loginLimiter from "../middlewares/ratelimit.middleware.js";

const authRouter = Router();

authRouter.post("/sign-up", createAccount);
authRouter.post("/login", loginLimiter, loginUser);
authRouter.post("/refresh", refreshToken);
export default authRouter;
