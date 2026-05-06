"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./src/app"));
const dotenv_1 = __importDefault(require("dotenv"));
const db_1 = __importDefault(require("./src/config/db"));
const http_1 = __importDefault(require("http"));
const index_1 = require("./src/socket/index");
dotenv_1.default.config();
const port = Number(process.env.PORT ?? 3000);
const bootstrap = async () => {
    // 1. Connect MongoDB
    await (0, db_1.default)();
    // 2. Create HTTP server from your express app
    const httpServer = http_1.default.createServer(app_1.default);
    // 3. Attach Socket.IO to same server
    (0, index_1.initSocket)(httpServer);
    // 4. Listen — httpServer instead of app.listen
    httpServer.listen(port, () => {
        console.log(`✅ Server running on port ${port}`);
    });
};
bootstrap().catch((err) => {
    console.error("Bootstrap error:", err);
    process.exit(1);
});
