import mongoose, { InferSchemaType } from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
    },
    platform: {
      type: String,
      enum: ["whatsapp", "facebook", "instagram", "tiktok"],
    },
    externalMessageId: {
      type: String,
      required: true,
      sparse: true,
    },
    status: {
      type: String,
      enum: ["sent", "delivered", "seen", "unread"],
      default: "sent",
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
    media: {
      url: String,
      type: String,
      mimeType: String,
      size: Number,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

/*If webhook sends duplicate events (which happens A LOT),
you will store duplicate messages.*/

messageSchema.index(
  { externalMessageId: 1, conversationId: 1 },
  { unique: true },
);

/*To efficiently query messages for a conversation, especially when paginating,you should have an index on conversationId and createdAt.*/
messageSchema.index({ conversationId: 1, createdAt: -1 });

export type MessageSchema = InferSchemaType<typeof messageSchema>;

export default mongoose.model<MessageSchema>("Message", messageSchema);
