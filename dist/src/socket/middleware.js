"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.socketAuth = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const socketAuth = (socket, next) => {
    try {
        const token = socket.handshake.auth?.token;
        if (!token)
            return next(new Error("Token missing"));
        const cleanToken = token.startsWith("Bearer ") ? token.slice(7) : token;
        const decoded = jsonwebtoken_1.default.verify(cleanToken, process.env.JWT_SECRET);
        socket.UserId = decoded.id;
        next();
    }
    catch {
        next(new Error("Invalid token"));
    }
};
exports.socketAuth = socketAuth;
