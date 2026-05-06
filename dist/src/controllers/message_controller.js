import Conversation from "../models/conversation.js";
import Message from "../models/message.js";
const getUserId = (req) => {
    const user = req.user;
    if (!user || typeof user === "string")
        return null;
    const maybeId = user.id;
    if (!maybeId)
        return null;
    return String(maybeId);
};
export const getMessages = async (req, res) => {
    try {
        const userId = getUserId(req);
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const page = Number.parseInt(String(req.query.page ?? "1"), 10) || 1;
        const limit = Number.parseInt(String(req.query.limit ?? "30"), 10) || 30;
        const skip = (page - 1) * limit;
        const conversation = await Conversation.findOne({
            _id: req.params.conversationId,
            userId,
        });
        if (!conversation) {
            return res.status(404).json({ message: "Conversation not found" });
        }
        const messages = await Message.find({
            conversationId: req.params.conversationId,
        })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();
        const total = await Message.countDocuments({
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
export const sendMessage = async (req, res) => {
    try {
        const userId = getUserId(req);
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const { content } = req.body ?? {};
        if (!content || content.trim() === "") {
            return res.status(400).json({ message: "Message content is required" });
        }
        const conversation = await Conversation.findOne({
            _id: req.params.conversationId,
            userId,
        });
        if (!conversation) {
            return res.status(404).json({ message: "Conversation not found" });
        }
        const message = await Message.create({
            conversationId: conversation._id,
            etxternalMessageId: `local-${Date.now()}`,
            direction: "outbound",
            content: content.trim(),
            messageType: "text",
            isRead: true,
        });
        await Conversation.findByIdAndUpdate(conversation._id, {
            lastMessage: {
                content: content.trim(),
                timestamp: new Date(),
                direction: "outbound",
            },
        });
        return res.status(201).json({ message });
    }
    catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        return res.status(500).json({ message });
    }
};
