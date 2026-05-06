import express from "express";
import authRoutes from "./routes/auth_routes";
import conversationRoutes from "./routes/conversations";
import messageRoutes from "./routes/messages";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", authRoutes);
app.use("/api/conversations", conversationRoutes);
app.use("/api/messages", messageRoutes);

export default app;
