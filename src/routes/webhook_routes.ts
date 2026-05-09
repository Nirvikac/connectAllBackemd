import { Router, Request, Response } from "express";
import Conversation from "../models/conversation";
import Message from "../models/message";
import { getIO } from "../socket";
import User from "../models/user.model";

const router = Router();

router.get("/", (req: Request, res: Response) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === process.env.WEBHOOK_VERIFY_TOKEN) {
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

router.post("/", async (req: Request, res: Response) => {
  res.sendStatus(200);

  const body = req.body;
  if (body.object !== "whatsapp_business_account") return;

  const changes = body.entry?.[0]?.changes?.[0]?.value;
  const message = changes?.messages?.[0];
  if (!message) return;

  const from = message.from;
  const text = message.text?.body;
  const externalMessageId = message.id;
  const phoneNumberId = changes?.metadata?.phone_number_id;
  const user = await User.findOne({
    "whatsapp.phone_number_id": phoneNumberId,
  });
  if (!user) return;

  // Find or create conversation
  let conversation = await Conversation.findOne({
    externalId: from,
    userId: user._id,
  });
  if (!conversation) {
    conversation = new Conversation({
      platform: "whatsapp",
      externalId: from,
      userId: user._id,
      participant: [{ externalMessageId: from }],
    });
  }

  // Save message to MongoDB
  const newMessage = await Message.create({
    conversationId: conversation._id,
    externalMessageId: externalMessageId,
    direction: "inbound",
    content: text,
    messageType: "text",
  });
  // Emit via Socket.IO
  getIO()
    .to(`conversation:${conversation._id}`)
    .emit("message:new", newMessage);

  console.log(`Saved message from ${from}: ${text}`);
});

export default router;
