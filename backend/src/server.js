import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import connectDB from "./config/mongodb.js";
import authRouter from "./routes/auth.route.js";
import anosimRouter from "./routes/anosim.route.js";
import smsPoolRouter from "./routes/smspool.route.js";
import heroSmsRouter from "./routes/herosms.route.js";
import fiveSimRouter from "./routes/fiveSim.route.js";
import grizlySmsRouter from "./routes/grizzlysms.route.js";
import userRouter from "./routes/users.route.js";
import transactionsRouter from "./routes/transactions.route.js";
import { createServer } from "http";
import { Server } from "socket.io";
import User from "./models/user.model.js";

dotenv.config();

const app = express();
const server = createServer(app);
const PORT = process.env.PORT_NUM || 5000;

const allowedOrigins = [
  "https://sms-management-app.vercel.app",
  "http://localhost:5173",
  "http://localhost:3000",
];

app.set("trust proxy", 1);

const io = new Server(server, {
  cors: {
    origin: [
      "https://sms-management-app.vercel.app",
      "http://localhost:5173",
      "http://localhost:3000",
    ],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  },
});

app.use(cookieParser());
app.use(express.json());
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.error("CORS Blocked origin:", origin);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/anosim", anosimRouter);
app.use("/api/v1/smspool", smsPoolRouter);
app.use("/api/v1/herosms", heroSmsRouter);
app.use("/api/v1/fivesim", fiveSimRouter);
app.use("/api/v1/grizzlysms", grizlySmsRouter);
app.use("/api/v1/transactions", transactionsRouter);

io.on("connection", async (socket) => {
  const userId = socket.handshake.query.userId;

  if (!userId) {
    return socket.disconnect(true);
  }

  try {
    await User.findByIdAndUpdate(userId, { isOnline: true });

    io.emit("user_status_changed", { userId, isOnline: true });
  } catch (error) {
    console.error(error);
  }

  socket.on("disconnect", async () => {
    try {
      await User.findByIdAndUpdate(userId, { isOnline: false });
      io.emit("user_status_changed", { userId, isOnline: false });
    } catch (error) {
      console.error(error);
    }
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  connectDB();
});
