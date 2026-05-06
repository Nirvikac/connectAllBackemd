import Conversation from "../models/conversation.js";
const getUserId = (req) => {
    const user = req.user;
    if (!user || typeof user === "string")
        return null;
    const maybeId = user.id;
    if (!maybeId)
        return null;
    return String(maybeId);
};
export const getConversations = async (req, res) => {
    try {
        const userId = getUserId(req);
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const page = Number.parseInt(String(req.query.page ?? "1"), 10) || 1;
        const limit = Number.parseInt(String(req.query.limit ?? "20"), 10) || 20;
        const skip = (page - 1) * limit;
        const conversations = await Conversation.find({
            userId,
            isArchived: false,
        })
            .sort({ updatedAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();
        const total = await Conversation.countDocuments({ userId, isArchived: false });
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
export const getConversationById = async (req, res) => {
    try {
        const userId = getUserId(req);
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const conversation = await Conversation.findOne({
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
export const markAsRead = async (req, res) => {
    try {
        const userId = getUserId(req);
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        await Conversation.findOneAndUpdate({ _id: req.params.id, userId }, { unreadCount: 0 });
        return res.json({ message: "Marked as read" });
    }
    catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        return res.status(500).json({ message });
    }
};
