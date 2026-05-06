import app from "./src/app";
import dotenv from "dotenv";
import connectDB from "./src/config/db";
import http from "http";
import { initSocket } from "./src/socket/index";

dotenv.config();

const port = Number(process.env.PORT ?? 3000);

const bootstrap = async () => {
  // 1. Connect MongoDB
  await connectDB();

  // 2. Create HTTP server from your express app
  const httpServer = http.createServer(app);

  // 3. Attach Socket.IO to same server
  initSocket(httpServer);

  // 4. Listen — httpServer instead of app.listen
  httpServer.listen(port, () => {
    console.log(`✅ Server running on port ${port}`);
  });
};

bootstrap().catch((err) => {
  console.error("Bootstrap error:", err);
  process.exit(1);
});
