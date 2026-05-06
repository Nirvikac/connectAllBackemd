"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getIO = exports.initSocket = void 0;
const socket_io_1 = require("socket.io");
const middleware_1 = require("./middleware");
const events_1 = require("./events");
let io;
// palin js => const initSocket = (httpServer) => {
const initSocket = (httpServer) => {
    //  ^^^^^^                              ^^^^^^^^^^
    //  other files can use this            TS: must be HTTPServer type
    io = new socket_io_1.Server(httpServer, {
        //       ^^^^^^^^^^^^^  ^^^^^^^^^^
        //       create socket  attach to same port as Express
        cors: {
            origin: "*", // allow all addresses to connect
            methods: ["GET", "POST"],
            credentials: true, // allow tokens
        },
        transports: ["websocket", "polling"],
        //            ^^^^^^^^^^^  ^^^^^^^
        //            try fast     fallback if fast fails
    });
    console.log("✅ Socket.IO ready");
    // Auth middleware
    io.use(middleware_1.socketAuth);
    io.on(events_1.SOCKET_EVENTS.CONNECT, (socket) => {
        console.log(`Connected: ${socket.UserId}`);
        // personal room
        socket.join(`user:${socket.UserId}`);
        // Join conversation room
        socket.on(events_1.SOCKET_EVENTS.JOIN_CONVERSATION, ({ conversationId }) => {
            socket.join(`conversation:${conversationId}`);
            console.log(`${socket.UserId} joined -> conversation:${conversationId}`);
        });
        // leave Conversation
        socket.on(events_1.SOCKET_EVENTS.LEAVE_CONVERSATION, ({ conversationId }) => {
            socket.leave(`conversation:${conversationId}`);
            console.log(`${socket.UserId}  left → conversation:${conversationId}`);
        });
        // Typing Start
        socket.on(events_1.SOCKET_EVENTS.TYPING_START, ({ conversationId }) => {
            socket
                .to(`conversation:${conversationId}`)
                .emit(events_1.SOCKET_EVENTS.TYPING_START, {
                userId: socket.UserId,
                conversationId,
            });
        });
        // Typing Stop
        socket.on(events_1.SOCKET_EVENTS.TYPING_STOP, ({ conversationId }) => {
            socket
                .to(`conversation:${conversationId}`)
                .emit(events_1.SOCKET_EVENTS.TYPING_STOP, {
                userId: socket.UserId,
                conversationId,
            });
        });
        // Disconnect
        socket.on(events_1.SOCKET_EVENTS.DISCONNECT, (reason) => {
            console.log(`Disconnected: ${socket.UserId} — ${reason}`);
        });
    });
    return io;
};
exports.initSocket = initSocket;
const getIO = () => {
    if (!io)
        throw new Error("Socket not Initialized");
    return io;
};
exports.getIO = getIO;
// import { Server as HTTPServer } from 'http'
// import { Server as SocketServer } from 'socket.io'
// import { socketAuth, AuthSocket } from './middleware'
// import { SOCKET_EVENTS, JoinPayload, TypingPayload } from './events'
// let io: SocketServer
// export const initSocket = (httpServer: HTTPServer) => {
//   io = new SocketServer(httpServer, {
//     cors: {
//       origin: '*',
//       methods: ['GET', 'POST'],
//       credentials: true,
//     },
//     transports: ['websocket', 'polling'],
//   })
//   // Auth middleware
//   io.use(socketAuth)
//   io.on(SOCKET_EVENTS.CONNECT, (socket: AuthSocket) => {
//     console.log(`🟢 Connected: ${socket.userId}`)
//     // Personal room
//     socket.join(`user:${socket.userId}`)
//     // Join conversation room
//     socket.on(SOCKET_EVENTS.JOIN_CONVERSATION, ({ conversationId }: JoinPayload) => {
//       socket.join(`conversation:${conversationId}`)
//       console.log(`${socket.userId} joined → conversation:${conversationId}`)
//     })
//     // Leave conversation room
//     socket.on(SOCKET_EVENTS.LEAVE_CONVERSATION, ({ conversationId }: JoinPayload) => {
//       socket.leave(`conversation:${conversationId}`)
//       console.log(`${socket.userId} left → conversation:${conversationId}`)
//     })
//     // Typing start
//     socket.on(SOCKET_EVENTS.TYPING_START, ({ conversationId }: TypingPayload) => {
//       socket.to(`conversation:${conversationId}`).emit(SOCKET_EVENTS.TYPING_START, {
//         userId: socket.userId,
//         conversationId,
//       })
//     })
//     // Typing stop
//     socket.on(SOCKET_EVENTS.TYPING_STOP, ({ conversationId }: TypingPayload) => {
//       socket.to(`conversation:${conversationId}`).emit(SOCKET_EVENTS.TYPING_STOP, {
//         userId: socket.userId,
//         conversationId,
//       })
//     })
//     // Disconnect
//     socket.on(SOCKET_EVENTS.DISCONNECT, (reason) => {
//       console.log(`🔴 Disconnected: ${socket.userId} — ${reason}`)
//     })
//   })
//   return io
// }
// export const getIO = (): SocketServer => {
//   if (!io) throw new Error('Socket not initialized')
//   return io
// }
