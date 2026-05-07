"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createConversation = exports.markAsRead = exports.getConversationById = exports.getConversations = void 0;
const conversation_1 = __importDefault(require("../models/conversation"));
// ✅ res added as second param
const getUserId = (_req, res) => {
    const user = res.locals.user;
    if (!user || typeof user === "string")
        return null;
    const maybeId = user.id;
    if (!maybeId)
        return null;
    return String(maybeId);
};
const getConversations = async (req, res) => {
    try {
        const userId = getUserId(req, res); // ✅ pass res
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const page = Number.parseInt(String(req.query.page ?? "1"), 10) || 1;
        const limit = Number.parseInt(String(req.query.limit ?? "20"), 10) || 20;
        const skip = (page - 1) * limit;
        const conversations = await conversation_1.default.find({
            userId,
            isArchived: false,
        })
            .sort({ updatedAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();
        const total = await conversation_1.default.countDocuments({
            userId,
            isArchived: false,
        });
        return res.json({
            conversations,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        });
    }
    catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        return res.status(500).json({ message });
    }
};
exports.getConversations = getConversations;
const getConversationById = async (req, res) => {
    try {
        const userId = getUserId(req, res); // ✅ pass res
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const conversation = await conversation_1.default.findOne({
            _id: req.params.id,
            userId,
        });
        if (!conversation) {
            return res.status(404).json({ message: "Conversation not found" });
        }
        return res.json({ conversation });
    }
    catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        return res.status(500).json({ message });
    }
};
exports.getConversationById = getConversationById;
const markAsRead = async (req, res) => {
    try {
        const userId = getUserId(req, res); // ✅ pass res
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        await conversation_1.default.findOneAndUpdate({ _id: req.params.id, userId }, { unreadCount: 0 });
        return res.json({ message: "Marked as read" });
    }
    catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        return res.status(500).json({ message });
    }
};
exports.markAsRead = markAsRead;
const createConversation = async (req, res) => {
    try {
        const userId = getUserId(req, res);
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const { platform, externalId, participant } = req.body;
        if (!platform || !externalId || !participant) {
            return res.status(400).json({ message: "Missing required fields" });
        }
        // check if conversation already exists
        const existing = await conversation_1.default.findOne({ userId, externalId });
        if (existing) {
            return res.status(200).json({ conversation: existing });
        }
        const conversation = await conversation_1.default.create({
            userId,
            platform,
            externalId,
            participant: {
                externalUserId: participant.externalUserId,
                username: participant.username,
                profilePictureUrl: participant.profilePictureUrl ?? "",
            },
            lastMessage: null,
            unreadCount: 0,
            isArchived: false,
        });
        return res.status(201).json({ conversation });
    }
    catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        return res.status(500).json({ message });
    }
};
exports.createConversation = createConversation;
