import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { adminMiddleware } from "../middlewares/admin.middleware.js";
import {
  deleteUserById,
  getAllUsers,
} from "../controllers/users.controller.js";

const userRouter = Router();

userRouter.get("/", authMiddleware, adminMiddleware, getAllUsers);
userRouter.delete("/:id", authMiddleware, adminMiddleware, deleteUserById);
export default userRouter;
