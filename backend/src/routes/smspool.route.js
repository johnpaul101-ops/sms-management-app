import { Router } from "express";
import {
  smsPoolGetBalance,
  smsPoolGetCountryList,
  smsPoolGetServices,
} from "../controllers/smspool.controller.js";

const smsPoolRouter = Router();

smsPoolRouter.get("/services", smsPoolGetServices);
smsPoolRouter.get("/countries", smsPoolGetCountryList);
smsPoolRouter.post("/checkbalance", smsPoolGetBalance);

export default smsPoolRouter;
