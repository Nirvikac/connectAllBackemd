import express from "express";
import whatsappRoutes from "./routes/whatsapp_routes";
import authRoutes from "./routes/auth_routes";
import conversationRoutes from "./routes/conversations";
import messageRoutes from "./routes/messages";
import { protect } from "./middleware/auth_middleware";
import webhookRouter from "./routes/webhook_routes";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", authRoutes);
app.use("/api/conversations", protect, conversationRoutes);
app.use("/api/messages", protect, messageRoutes);
app.use("/api/webhook", webhookRouter);
app.use("/api/whatsapp", protect, whatsappRoutes);
export default app;
