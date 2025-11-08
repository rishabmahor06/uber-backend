// Next.js API route — attach Socket.IO to the existing server socket
import { Server } from "socket.io";

export default function handler(req, res) {
  // If socket.io is already attached, do nothing
  if (res.socket.server.io) {
    // socket.io already initialized
    res.end();
    return;
  }

  console.log("Initializing Socket.IO server...");

  const io = new Server(res.socket.server, {
    path: "/api/socket/io",
    cors: {
      origin: [
        process.env.FRONTEND_URL || "http://localhost:5173",
        process.env.FRONTEND_URL || "https://speed-backend-gamma.vercel.app",
      ],
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      credentials: true,
    },
    transports: ["websocket", "polling"],
    allowEIO3: true,
  });

  // basic connection handlers
  io.on("connection", (socket) => {
    console.log(
      "Socket connected:",
      socket.id,
      "via",
      socket.conn.transport?.name
    );

    socket.on("join", (data) => {
      if (data?.userId) socket.join(data.userId);
    });

    socket.on("disconnect", (reason) => {
      console.log("Socket disconnected:", socket.id, reason);
    });

    socket.on("error", (err) => {
      console.error("Socket error:", err);
    });
  });

  // attach to server so subsequent calls reuse same io
  res.socket.server.io = io;
  res.end();
}
