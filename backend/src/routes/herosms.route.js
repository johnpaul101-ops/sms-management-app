import { Router } from "express";
import {
  getCurrentPricesForRent,
  heroSmsActivateSMS,
  heroSmsChangeSmsStatus,
  heroSmsChangeStatus,
  heroSmsGetBalance,
  heroSmsOffers,
  heroSmsWebhook,
} from "../controllers/herosms.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { verifyProviderIP } from "../middlewares/webhook.middleware.js";

const heroSmsRouter = Router();

heroSmsRouter.get("/checkbalance", heroSmsGetBalance);
heroSmsRouter.post("/activate", authMiddleware, heroSmsActivateSMS);
heroSmsRouter.post("/offers", authMiddleware, heroSmsOffers);
heroSmsRouter.get("/status", authMiddleware, heroSmsChangeStatus);
heroSmsRouter.post("/webhook", verifyProviderIP, heroSmsWebhook);
heroSmsRouter.post("/rental-prices", authMiddleware, getCurrentPricesForRent);
heroSmsRouter.get("/change-status", authMiddleware, heroSmsChangeSmsStatus);
export default heroSmsRouter;
