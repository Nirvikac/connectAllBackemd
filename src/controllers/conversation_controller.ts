import type { Request, Response } from "express";
import Conversation from "../models/conversation";

// ✅ res added as second param
const getUserId = (_req: Request, res: Response): string | null => {
  const user = res.locals.user;
  if (!user || typeof user === "string") return null;
  const maybeId = (user as { id?: unknown }).id;
  if (!maybeId) return null;
  return String(maybeId);
};

export const getConversations = async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req, res); // ✅ pass res
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

    const total = await Conversation.countDocuments({
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
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return res.status(500).json({ message });
  }
};

export const getConversationById = async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req, res); // ✅ pass res
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
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return res.status(500).json({ message });
  }
};

export const markAsRead = async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req, res); // ✅ pass res
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    await Conversation.findOneAndUpdate(
      { _id: req.params.id, userId },
      { unreadCount: 0 },
    );
    return res.json({ message: "Marked as read" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return res.status(500).json({ message });
  }
};

export const createConversation = async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req, res);
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { platform, externalId, participant } = req.body as {
      platform: string;
      externalId: string;
      participant: {
        externalUserId: string;
        username: string;
        profilePictureUrl?: string;
      };
    };

    if (!platform || !externalId || !participant) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // check if conversation already exists
    const existing = await Conversation.findOne({ userId, externalId });
    if (existing) {
      return res.status(200).json({ conversation: existing });
    }

    const conversation = await Conversation.create({
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
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return res.status(500).json({ message });
  }
};
