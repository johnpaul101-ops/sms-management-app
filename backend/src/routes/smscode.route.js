import { Router } from "express";
import {
  getPriceList,
  smsCodeActivateSms,
  smsCodeChangeActivationStatus,
  smsCodeChangeStatus,
  smsCodeGetBalance,
  smsCodeGetCode,
  smsCodeWebhook,
} from "../controllers/smscode.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { verifyProviderIP } from "../middlewares/webhook.middleware.js";

const smsCodeRouter = Router();

smsCodeRouter.get("/checkbalance", smsCodeGetBalance);
smsCodeRouter.get(
  "/change-status",
  authMiddleware,
  smsCodeChangeActivationStatus,
);
smsCodeRouter.post("/price-list", authMiddleware, getPriceList);
smsCodeRouter.post("/activate", authMiddleware, smsCodeActivateSms);
smsCodeRouter.post("/status", authMiddleware, smsCodeChangeStatus);
smsCodeRouter.post("/webhook", verifyProviderIP, smsCodeWebhook);
smsCodeRouter.patch("/get-code/:id", authMiddleware, smsCodeGetCode);
export default smsCodeRouter;
