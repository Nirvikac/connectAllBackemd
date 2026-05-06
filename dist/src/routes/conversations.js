import express from "express";
import { protect } from "../middleware/auth_middleware.js";
import { getConversationById, getConversations, markAsRead, } from "../controllers/conversation_controller.js";
const router = express.Router();
router.get("/", protect, getConversations);
router.get("/:id", protect, getConversationById);
router.patch("/:id/read", protect, markAsRead);
export default router;
