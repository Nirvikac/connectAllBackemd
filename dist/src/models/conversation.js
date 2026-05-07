"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const conversationSchema = new mongoose_1.default.Schema({
    userId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    platform: {
        type: String,
        enum: ["whatsapp", "facebook", "instagram", "tiktok"],
        required: true,
    },
    externalId: {
        type: String,
        required: true,
    },
    participant: {
        externalUserId: String,
        username: String,
        profilePictureUrl: String,
    },
    lastMessage: {
        content: String,
        timestamp: Date,
        direction: {
            type: String,
            enum: ["inbound", "outbound"],
        },
    },
    unreadCount: {
        type: Number,
        default: 0,
    },
    isArchived: {
        type: Boolean,
        default: false,
    },
}, { timestamps: true });
conversationSchema.index({ userId: 1, platform: 1 });
conversationSchema.index({ userId: 1, updatedAt: -1 });
conversationSchema.index({ userId: 1, externalId: 1 }, { unique: true });
exports.default = mongoose_1.default.model("Conversation", conversationSchema);
