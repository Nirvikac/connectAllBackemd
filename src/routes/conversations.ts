import express from "express";
import { protect } from "../middleware/auth_middleware";
import {
  getConversationById,
  getConversations,
  markAsRead,
  createConversation, // 🆕
} from "../controllers/conversation_controller";

const router = express.Router();

router.get("/", protect, getConversations);
//only for testing, should be removed in production
router.post("/", protect, createConversation); // 🆕
router.get("/:id", protect, getConversationById);
router.patch("/:id/read", protect, markAsRead);

export default router;
