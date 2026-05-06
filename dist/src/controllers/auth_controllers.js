"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logout = exports.login = exports.register = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_model_1 = __importDefault(require("../models/user.model"));
const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({
                message: "All fields are required",
            });
        }
        const userExists = await user_model_1.default.findOne({ email });
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
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        const user = await user_model_1.default.create({
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
    }
    catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        return res.status(500).json({ error: message });
    }
};
exports.register = register;
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required",
            });
        }
        const user = await user_model_1.default.findOne({ email });
        if (!user) {
            return res.status(401).json({
                message: "Invalid email or password",
            });
        }
        const isMatch = await bcryptjs_1.default.compare(password, user.password);
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
            ? jsonwebtoken_1.default.sign(payload, jwtSecret, {
                expiresIn: expiration,
            })
            : jsonwebtoken_1.default.sign(payload, jwtSecret);
        return res.status(200).json({
            message: "Login successful",
            user: userData,
            token,
        });
    }
    catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        return res.status(500).json({ error: message });
    }
};
exports.login = login;
const logout = async (req, res) => {
    try {
        // Since we're using JWTs, logout is handled client-side by deleting the token.
        // Optionally, you could implement token blacklisting here.
        return res.status(200).json({ message: "Logout successful" });
    }
    catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        return res.status(500).json({ error: message });
    }
};
exports.logout = logout;
