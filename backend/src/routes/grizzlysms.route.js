import { Router } from "express";
import {
  grizzlySmsActivateSms,
  grizzlySmsGetBalance,
  grizzlySmsStatusChanges,
} from "../controllers/grizzlysms.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const grizlySmsRouter = Router();

grizlySmsRouter.get("/checkbalance", grizzlySmsGetBalance);
grizlySmsRouter.get("/activate", authMiddleware, grizzlySmsActivateSms);
grizlySmsRouter.get("/status-changes", authMiddleware, grizzlySmsStatusChanges);
export default grizlySmsRouter;
