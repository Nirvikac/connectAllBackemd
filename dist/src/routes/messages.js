"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_middleware_1 = require("../middleware/auth_middleware");
const message_controller_1 = require("../controllers/message_controller");
const router = express_1.default.Router();
router.get("/:conversationId", auth_middleware_1.protect, message_controller_1.getMessages);
router.post("/:conversationId/reply", auth_middleware_1.protect, message_controller_1.sendMessage);
exports.default = router;
