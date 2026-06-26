import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { adminMiddleware } from "../middlewares/admin.middleware.js";
import { getAllTransactionsHistory } from "../controllers/transactions.controller.js";

const transactionsRouter = Router();

transactionsRouter.get(
  "/",
  authMiddleware,
  adminMiddleware,
  getAllTransactionsHistory,
);

export default transactionsRouter;
