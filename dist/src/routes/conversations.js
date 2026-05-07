"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_middleware_1 = require("../middleware/auth_middleware");
const conversation_controller_1 = require("../controllers/conversation_controller");
const router = express_1.default.Router();
router.get("/", auth_middleware_1.protect, conversation_controller_1.getConversations);
//only for testing, should be removed in production
router.post("/", auth_middleware_1.protect, conversation_controller_1.createConversation); // 🆕
router.get("/:id", auth_middleware_1.protect, conversation_controller_1.getConversationById);
router.patch("/:id/read", auth_middleware_1.protect, conversation_controller_1.markAsRead);
exports.default = router;
