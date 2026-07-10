import { Router } from "express";
import {
  smsBowerActivateSms,
  smsBowerChangeActivationStatus,
  smsBowerGetBalance,
  smsBowerGetPrices,
  smsBowerSmsChangeStatus,
  smsBowerWebhook,
} from "../controllers/smsbower.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { verifyProviderIP } from "../middlewares/webhook.middleware.js";

const smsBowerRouter = Router();

smsBowerRouter.get("/checkbalance", smsBowerGetBalance);
smsBowerRouter.get("/status", authMiddleware, smsBowerSmsChangeStatus);
smsBowerRouter.get(
  "/change-status",
  authMiddleware,
  smsBowerChangeActivationStatus,
);
smsBowerRouter.post("/get-prices", authMiddleware, smsBowerGetPrices);
smsBowerRouter.post("/activate", authMiddleware, smsBowerActivateSms);
smsBowerRouter.post("/webhook", verifyProviderIP, smsBowerWebhook);
export default smsBowerRouter;
