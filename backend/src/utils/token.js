import jwt from "jsonwebtoken";

export const generateAccessToken = (userId, isAdmin) => {
  return jwt.sign({ id: userId, isAdmin }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "15m",
  });
};

export const generateRefreshToken = (userId, isAdmin) => {
  return jwt.sign({ id: userId, isAdmin }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: "30d",
  });
};
