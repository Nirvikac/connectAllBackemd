"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_routes_1 = __importDefault(require("./routes/auth_routes"));
const conversations_1 = __importDefault(require("./routes/conversations"));
const messages_1 = __importDefault(require("./routes/messages"));
const auth_middleware_1 = require("./middleware/auth_middleware");
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use("/api/auth", auth_routes_1.default);
app.use("/api/conversations", auth_middleware_1.protect, conversations_1.default);
app.use("/api/messages", auth_middleware_1.protect, messages_1.default);
exports.default = app;
