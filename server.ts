import { loadEnvConfig } from "@next/env";
import { createServer } from "http";
import { parse } from "url";
import next from "next";
import { Server as SocketIOServer } from "socket.io";

// Ensure .env is loaded before Next.js initializes (custom server)
loadEnvConfig(process.cwd());

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

  // Store userId → Set of socketIds
  const userSockets = new Map<string, Set<string>>();

  const getOnlineUserIds = () => Array.from(userSockets.keys());

  io.on("connection", (socket) => {
    let currentUserId: string | null = null;

    // Client sends their userId on connect
    socket.on("register", (userId: string) => {
      if (!userId) return;
      currentUserId = userId;
      if (!userSockets.has(userId)) {
        userSockets.set(userId, new Set());
      }
      userSockets.get(userId)!.add(socket.id);
      socket.join(`user:${userId}`);

      // Broadcast updated online users to all clients
      io.emit("online-users", getOnlineUserIds());
    });

    // Request active online users list
    socket.on("get-online-users", () => {
      socket.emit("online-users", getOnlineUserIds());
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

    // Read receipt / message seen event
    socket.on("mark-seen", (data: { conversationId: string; userId: string }) => {
      io.to(`conv:${data.conversationId}`).emit("messages-seen", data);
    });

    // Typing indicator
    socket.on("typing", (data: { conversationId: string; userId: string; username: string }) => {
      socket.to(`conv:${data.conversationId}`).emit("user-typing", data);
    });

    socket.on("stop-typing", (data: { conversationId: string; userId: string }) => {
      socket.to(`conv:${data.conversationId}`).emit("user-stop-typing", data);
    });

    // Edit message relay
    socket.on("edit-message", (data: { conversationId: string; message: any }) => {
      io.to(`conv:${data.conversationId}`).emit("message-edited", data.message);
    });

    // Delete message relay
    socket.on("delete-message", (data: { conversationId: string; messageId: string }) => {
      io.to(`conv:${data.conversationId}`).emit("message-deleted", data.messageId);
    });

    // Pin message relay
    socket.on("pin-message", (data: { conversationId: string; message: any }) => {
      io.to(`conv:${data.conversationId}`).emit("message-pinned", data.message);
    });

    socket.on("disconnect", () => {
      if (currentUserId && userSockets.has(currentUserId)) {
        const sockets = userSockets.get(currentUserId)!;
        sockets.delete(socket.id);
        if (sockets.size === 0) {
          userSockets.delete(currentUserId);
          io.emit("online-users", getOnlineUserIds());
        }
      }
    });
  });

  // Attach io to global so server actions can emit if needed
  (global as any).io = io;

  const port = parseInt(process.env.PORT || "3000", 10);
  httpServer.listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`);
  });
});
