import express from "express";
import dotenv from "dotenv";
import connectDB from "./src/config/db.js";
import authRoutes from "./src/routes/auth_routes.js";
import conversationRoutes from "./src/routes/conversations.js";
import messageRoutes from "./src/routes/messages.js";
dotenv.config();
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
connectDB();
app.use("/api/auth", authRoutes);
app.use("/api/conversations", conversationRoutes);
app.use("/api/messages", messageRoutes);
const port = Number(process.env.PORT ?? 3000);
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
