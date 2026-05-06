import type { Request, Response } from "express";
import Conversation from "../models/conversation";
import Message from "../models/message";
import { getIO } from "../socket/index";

// ✅ defined ONCE at top — not inside any function
const getUserId = (_req: Request, res: Response): string | null => {
  const user = res.locals.user;
  if (!user || typeof user === "string") return null;
  const maybeId = (user as { id?: unknown }).id;
  if (!maybeId) return null;
  return String(maybeId);
};

export const getMessages = async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req, res);
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
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return res.status(500).json({ message });
  }
};

export const sendMessage = async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req, res);
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { content } = (req.body as { content?: string }) ?? {};

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

    // ✅ Save to MongoDB
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

    // ✅ Broadcast to conversation room
    getIO().to(`conversation:${conversation._id}`).emit("message:new", {
      message,
      conversationId: conversation._id,
    });

    return res.status(201).json({ message });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return res.status(500).json({ message });
  }
};
