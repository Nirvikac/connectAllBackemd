import type { Request, Response } from "express";
import bcryptjs from "bcryptjs";
import jwt, { type SignOptions } from "jsonwebtoken";

import User from "../models/user.model";

type RegisterBody = {
  name?: string;
  email?: string;
  password?: string;
};

type LoginBody = {
  email?: string;
  password?: string;
};

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body as RegisterBody;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(409).json({
        message: "User with this email already exists",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters",
      });
    }

    const hashedPassword = await bcryptjs.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    const userObj = user.toObject();
    const { password: _password, ...userData } = userObj;

    return res.status(201).json({
      message: "User has been created",
      user: userData,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return res.status(500).json({ error: message });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body as LoginBody;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const isMatch = await bcryptjs.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      return res.status(500).json({ message: "JWT_SECRET is not set" });
    }

    const userObj = user.toObject();
    const { password: _password, ...userData } = userObj;

    const payload = { id: user._id.toString(), email: user.email };
    const expiration = process.env.EXPIRATION_TIME;
    const token = expiration
      ? jwt.sign(payload, jwtSecret, {
          expiresIn: expiration as SignOptions["expiresIn"],
        })
      : jwt.sign(payload, jwtSecret);

    return res.status(200).json({
      message: "Login successful",
      user: userData,
      token,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return res.status(500).json({ error: message });
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    // Since we're using JWTs, logout is handled client-side by deleting the token.
    // Optionally, you could implement token blacklisting here.

    return res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return res.status(500).json({ error: message });
  }
};
