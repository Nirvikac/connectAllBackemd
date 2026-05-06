import { Socket } from "socket.io";
import jwt from "jsonwebtoken";

export interface AuthSocket extends Socket {
  UserId?: string;
}

export const socketAuth = (socket: AuthSocket, next: (err?: Error) => void) => {
  try {
    const token = socket.handshake.auth?.token as string;

    if (!token) return next(new Error("Token missing"));

    const cleanToken = token.startsWith("Bearer ") ? token.slice(7) : token;

    const decoded = jwt.verify(
      cleanToken,
      process.env.JWT_SECRET as string,
    ) as { id: string };

    socket.UserId = decoded.id;
    next();
  } catch {
    next(new Error("Invalid token"));
  }
};
