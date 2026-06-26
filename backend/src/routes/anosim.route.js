import { Router } from "express";
import {
  anosimActivateSms,
  anosimCancelActivation,
  anosimChangeSmsStatus,
  anosimCheckBalance,
  anosimGetProductPrices,
  getSMSById,
} from "../controllers/anosim.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const anosimRouter = Router();

anosimRouter.get("/checkbalance", anosimCheckBalance);
anosimRouter.get("/products", authMiddleware, anosimGetProductPrices);
anosimRouter.get("/change-status", authMiddleware, anosimChangeSmsStatus);
anosimRouter.get("/get-sms/:id", authMiddleware, getSMSById);
anosimRouter.post("/activate", authMiddleware, anosimActivateSms);
anosimRouter.patch("/cancel/:id", authMiddleware, anosimCancelActivation);
export default anosimRouter;
