import mongoose, { InferSchemaType } from "mongoose";

const conversationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
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
  },
  { timestamps: true },
);

conversationSchema.index({ userId: 1, platform: 1 });
conversationSchema.index({ userId: 1, updatedAt: -1 });
conversationSchema.index({ userId: 1, externalId: 1 }, { unique: true });

export type ConversationSchema = InferSchemaType<typeof conversationSchema>;

export default mongoose.model<ConversationSchema>(
  "Conversation",
  conversationSchema,
);
