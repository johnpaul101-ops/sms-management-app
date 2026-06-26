import { Router } from "express";
import {
  fiveSimBuyActivationNum,
  fiveSimCancelActivation,
  fiveSimGetBalance,
  fiveSimGetCountryList,
} from "../controllers/fivesim.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const fiveSimRouter = Router();

fiveSimRouter.get("/checkbalance", fiveSimGetBalance);
fiveSimRouter.get("/countries", fiveSimGetCountryList);
fiveSimRouter.get("/activate", authMiddleware, fiveSimBuyActivationNum);
fiveSimRouter.get("/cancel/:id", authMiddleware, fiveSimCancelActivation);

export default fiveSimRouter;
