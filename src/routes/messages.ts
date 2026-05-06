import express from "express";

import { protect } from "../middleware/auth_middleware";
import { getMessages, sendMessage } from "../controllers/message_controller";

const router = express.Router();

router.get("/:conversationId", protect, getMessages);
router.post("/:conversationId/reply", protect, sendMessage);

export default router;
