import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

export const protect = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers["authorization"];

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "No token provided. Access denied.",
    });
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.sendStatus(401);
  }

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    return res.status(500).json({ message: "JWT_SECRET is not set" });
  }

  try {
    const decoded = jwt.verify(token, jwtSecret);
    res.locals.user = decoded;
    next();
  } catch (err) {
    console.log("JWT Error:", err); // 🆕 add this
    console.log("JWT Secret:", jwtSecret); // 🆕 add this
    console.log("Token:", token); // 🆕 add this
    return res.status(403).json({
      message: "Invalid token. Access denied.",
    });
  }
};
