"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const messageSchema = new mongoose_1.default.Schema({
    conversationId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "Conversation",
        required: true,
    },
    etxternalMessageId: {
        type: String,
        required: true,
        sparse: true,
    },
    direction: {
        type: String,
        enum: ["inbound", "outbound"],
        required: true,
    },
    content: {
        type: String,
        default: "",
    },
    messageType: {
        type: String,
        enum: ["text", "image", "video", "audio", "file"],
        default: "text",
    },
    mediaUrl: {
        type: String,
    },
    isRead: {
        type: Boolean,
        default: false,
    },
}, { timestamps: true });
messageSchema.index({ conversationId: 1, createdAt: -1 });
exports.default = mongoose_1.default.model("Message", messageSchema);
