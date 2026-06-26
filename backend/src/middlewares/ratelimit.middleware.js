import rateLimit from "express-rate-limit";

const loginLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  statusCode: 429,
  message: {
    success: false,
    message: "Too many login attempts, please try again after 1 minute",
  },
});

export default loginLimiter;
