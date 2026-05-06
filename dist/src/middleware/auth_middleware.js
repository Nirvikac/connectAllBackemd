"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.protect = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const protect = (req, res, next) => {
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
        const decoded = jsonwebtoken_1.default.verify(token, jwtSecret);
        res.locals.user = decoded;
        next();
    }
    catch (err) {
        console.log("JWT Error:", err); // 🆕 add this
        console.log("JWT Secret:", jwtSecret); // 🆕 add this
        console.log("Token:", token); // 🆕 add this
        return res.status(403).json({
            message: "Invalid token. Access denied.",
        });
    }
};
exports.protect = protect;
