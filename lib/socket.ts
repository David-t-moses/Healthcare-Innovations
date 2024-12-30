import { Server } from "socket.io";

declare global {
  var io: Server | undefined;
}

export function initSocket(server: any) {
  if (!global.io) {
    global.io = new Server(server, {
      cors: {
        origin: process.env.NEXT_PUBLIC_APP_URL,
        methods: ["GET", "POST"],
      },
    });

    console.log("Socket.IO initialized successfully!");

    global.io.on("connection", (socket) => {
      console.log("New client connected");
      socket.on("join-user-room", (userId) => {
        socket.join(`user-${userId}`);
        console.log(`User ${userId} joined their room`);
      });
    });
  }

  return global.io;
}

export function getIO() {
  if (!global.io) {
    throw new Error("Socket.io not initialized");
  }
  return global.io;
}

export function emitNotification(userId: string, notification: any) {
  getIO().to(`user-${userId}`).emit("new-notification", notification);
}

export function emitNotificationRead(userId: string, notificationId: string) {
  getIO().to(`user-${userId}`).emit("notification-read", { notificationId });
}

export function emitAllNotificationsRead(userId: string) {
  getIO().to(`user-${userId}`).emit("all-notifications-read", {});
}
