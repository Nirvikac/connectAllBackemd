import { Server as HTTPServer } from "http";
import { Server as SocketServer } from "socket.io";
import { socketAuth, AuthSocket } from "./middleware";
import { SOCKET_EVENTS, JoinPayload, TypingPayload } from "./events";

let io: SocketServer;

// palin js => const initSocket = (httpServer) => {
export const initSocket = (httpServer: HTTPServer) => {
  //  ^^^^^^                              ^^^^^^^^^^
  //  other files can use this            TS: must be HTTPServer type

  io = new SocketServer(httpServer, {
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
  io.use(socketAuth);

  io.on(SOCKET_EVENTS.CONNECT, (socket: AuthSocket) => {
    console.log(`Connected: ${socket.UserId}`);

    // personal room
    socket.join(`user:${socket.UserId}`);

    // Join conversation room
    socket.on(
      SOCKET_EVENTS.JOIN_CONVERSATION,
      ({ conversationId }: JoinPayload) => {
        socket.join(`conversation:${conversationId}`);
        console.log(
          `${socket.UserId} joined -> conversation:${conversationId}`,
        );
      },
    );

    // leave Conversation
    socket.on(
      SOCKET_EVENTS.LEAVE_CONVERSATION,
      ({ conversationId }: JoinPayload) => {
        socket.leave(`conversation:${conversationId}`);
        console.log(`${socket.UserId}  left → conversation:${conversationId}`);
      },
    );

    // Typing Start
    socket.on(
      SOCKET_EVENTS.TYPING_START,
      ({ conversationId }: TypingPayload) => {
        socket
          .to(`conversation:${conversationId}`)
          .emit(SOCKET_EVENTS.TYPING_START, {
            userId: socket.UserId,
            conversationId,
          });
      },
    );
    // Typing Stop
    socket.on(
      SOCKET_EVENTS.TYPING_STOP,
      ({ conversationId }: TypingPayload) => {
        socket
          .to(`conversation:${conversationId}`)
          .emit(SOCKET_EVENTS.TYPING_STOP, {
            userId: socket.UserId,
            conversationId,
          });
      },
    );

    // Disconnect
    socket.on(SOCKET_EVENTS.DISCONNECT, (reason) => {
      console.log(`Disconnected: ${socket.UserId} — ${reason}`);
    });
  });
  return io;
};

export const getIO = (): SocketServer => {
  if (!io) throw new Error("Socket not Initialized");
  return io;
};
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
