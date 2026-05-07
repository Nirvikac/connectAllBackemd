import { Router, Request, Response } from "express";
import dotenv from "dotenv";
dotenv.config();
const router = Router();

router.get("/", (req: Request, res: Response) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === process.env.WEBHOOK_VERIFY_TOKEN) {
    console.log("WEBHOOK_VERIFIED");
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

router.post("/", async (req: Request, res: Response) => {
  res.sendStatus(200); // always ACK immediately

  const body = req.body;
  if (body.object !== "whatsapp_business_account") return;

  const changes = body.entry?.[0]?.changes?.[0]?.value;
  const message = changes?.messages?.[0];
  if (!message) return;

  const from = message.from;
  const text = message.text?.body;
  const externalMessageId = message.id;

  console.log(`Message from ${from}: ${text}`);

  // Next step: save to MongoDB + emit via Socket.IO
});
export default router;
