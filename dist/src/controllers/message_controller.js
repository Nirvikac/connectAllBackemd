"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendMessage = exports.getMessages = void 0;
const conversation_1 = __importDefault(require("../models/conversation"));
const message_1 = __importDefault(require("../models/message"));
const index_1 = require("../socket/index");
// ✅ defined ONCE at top — not inside any function
const getUserId = (_req, res) => {
    const user = res.locals.user;
    if (!user || typeof user === "string")
        return null;
    const maybeId = user.id;
    if (!maybeId)
        return null;
    return String(maybeId);
};
const getMessages = async (req, res) => {
    try {
        const userId = getUserId(req, res);
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const page = Number.parseInt(String(req.query.page ?? "1"), 10) || 1;
        const limit = Number.parseInt(String(req.query.limit ?? "30"), 10) || 30;
        const skip = (page - 1) * limit;
        const conversation = await conversation_1.default.findOne({
            _id: req.params.conversationId,
            userId,
        });
        if (!conversation) {
            return res.status(404).json({ message: "Conversation not found" });
        }
        const messages = await message_1.default.find({
            conversationId: req.params.conversationId,
        })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();
        const total = await message_1.default.countDocuments({
            conversationId: req.params.conversationId,
        });
        return res.json({
            messages,
            pagination: { page, limit, total, pages: Math.ceil(total / limit) },
        });
    }
    catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        return res.status(500).json({ message });
    }
};
exports.getMessages = getMessages;
const sendMessage = async (req, res) => {
    try {
        const userId = getUserId(req, res);
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const { content } = req.body ?? {};
        if (!content || content.trim() === "") {
            return res.status(400).json({ message: "Message content is required" });
        }
        const conversation = await conversation_1.default.findOne({
            _id: req.params.conversationId,
            userId,
        });
        if (!conversation) {
            return res.status(404).json({ message: "Conversation not found" });
        }
        // ✅ Save to MongoDB
        const message = await message_1.default.create({
            conversationId: conversation._id,
            etxternalMessageId: `local-${Date.now()}`,
            direction: "outbound",
            content: content.trim(),
            messageType: "text",
            isRead: true,
        });
        await conversation_1.default.findByIdAndUpdate(conversation._id, {
            lastMessage: {
                content: content.trim(),
                timestamp: new Date(),
                direction: "outbound",
            },
        });
        // ✅ Broadcast to conversation room
        (0, index_1.getIO)().to(`conversation:${conversation._id}`).emit("message:new", {
            message,
            conversationId: conversation._id,
        });
        return res.status(201).json({ message });
    }
    catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        return res.status(500).json({ message });
    }
};
exports.sendMessage = sendMessage;
