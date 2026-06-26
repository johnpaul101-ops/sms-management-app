import User from "../models/user.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { generateAccessToken, generateRefreshToken } from "../utils/token.js";

export const createAccount = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!email || typeof email !== "string") {
      return res
        .status(400)
        .json({ message: "Email is required and must be a string" });
    }

    const cleanEmail = email.trim();

    if (cleanEmail.includes(" ")) {
      return res
        .status(400)
        .json({ message: "Spaces are not allowed inside the email" });
    }

    const gmailRegex = /^[^@\s]+@gmail\.com$/i;

    if (!gmailRegex.test(cleanEmail)) {
      return res.status(400).json({
        message: "Please provide a valid Gmail address (e.g., user@gmail.com)",
      });
    }

    const finalizedEmail = cleanEmail.toLowerCase();

    const user = await User.findOne({ email });

    if (user) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const dateCreated = new Date().toLocaleDateString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "2-digit",
    });
    const newUser = await User.create({
      name,
      email: finalizedEmail,
      password: hashedPassword,
      isAdmin: false,
      dateCreated,
    });

    res.status(201).json({
      success: true,
      message: "User created successfully",
      data: { newUser },
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
    console.error(error);
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const comparePassword = await bcrypt.compare(password, user.password);

    if (!comparePassword) {
      return res.status(400).json({ message: "Invalid password" });
    }

    const accessToken = generateAccessToken(user._id, user.isAdmin);
    const refreshToken = generateRefreshToken(user._id, user.isAdmin);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    const { password: _, ...safeUser } = user._doc;

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        user: safeUser,
        accessToken,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
    console.error(error);
  }
};

export const refreshToken = (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({ message: "Refresh token not found" });
    }

    jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET,
      (err, decoded) => {
        if (err) {
          return res
            .status(403)
            .json({ message: "Invalid or expired refresh token" });
        }

        const newAccessToken = generateAccessToken(decoded.id, decoded.isAdmin);

        return res.json({ accessToken: newAccessToken });
      },
    );
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Invalid or Expired refresh token" });
  }
};
