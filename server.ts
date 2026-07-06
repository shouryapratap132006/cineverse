import { createServer } from "http";
import { parse } from "url";
import next from "next";
import { Server as SocketIOServer } from "socket.io";

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    const parsedUrl = parse(req.url!, true);
    handle(req, res, parsedUrl);
  });

  const io = new SocketIOServer(httpServer, {
    path: "/api/socket",
    addTrailingSlash: false,
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  // Store socket id → userId mapping
  const userSockets = new Map<string, string>(); // socketId → userId

  io.on("connection", (socket) => {
    // Client sends their userId on connect
    socket.on("register", (userId: string) => {
      userSockets.set(socket.id, userId);
      socket.join(`user:${userId}`);
    });

    // Join a conversation room
    socket.on("join-conversation", (conversationId: string) => {
      socket.join(`conv:${conversationId}`);
    });

    // Leave a conversation room
    socket.on("leave-conversation", (conversationId: string) => {
      socket.leave(`conv:${conversationId}`);
    });

    // New message — broadcast to everyone in the conversation room
    socket.on("send-message", (data: {
      conversationId: string;
      message: any;
    }) => {
      io.to(`conv:${data.conversationId}`).emit("new-message", data.message);
    });

    // Typing indicator
    socket.on("typing", (data: { conversationId: string; userId: string; username: string }) => {
      socket.to(`conv:${data.conversationId}`).emit("user-typing", data);
    });

    socket.on("stop-typing", (data: { conversationId: string; userId: string }) => {
      socket.to(`conv:${data.conversationId}`).emit("user-stop-typing", data);
    });

    socket.on("disconnect", () => {
      userSockets.delete(socket.id);
    });
  });

  // Attach io to global so server actions can emit if needed
  (global as any).io = io;

  const port = parseInt(process.env.PORT || "3000", 10);
  httpServer.listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`);
  });
});
