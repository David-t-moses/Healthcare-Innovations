import { Server } from "socket.io";

declare global {
  var io: Server | undefined;
}

export function getIO() {
  if (!global.io) {
    console.warn("Socket.io not initialized - notifications will not work in real-time");
    return null;
  }
  return global.io;
}

export function emitNotification(userId: string, notification: any) {
  const io = getIO();
  if (io) {
    io.to(`user-${userId}`).emit("new-notification", notification);
    console.log(`Emitting notification to user ${userId}:`, notification);
  }
}

export function emitNotificationRead(userId: string, notificationId: string) {
  const io = getIO();
  if (io) {
    io.to(`user-${userId}`).emit("notification-read", { notificationId });
  }
}

export function emitAllNotificationsRead(userId: string) {
  const io = getIO();
  if (io) {
    io.to(`user-${userId}`).emit("all-notifications-read", {});
  }
}

export function emitNotificationDeleted(userId: string, notificationId: string) {
  const io = getIO();
  if (io) {
    io.to(`user-${userId}`).emit("notification-deleted", notificationId);
  }
}

export function emitNotificationsCleared(userId: string) {
  const io = getIO();
  if (io) {
    io.to(`user-${userId}`).emit("notifications-cleared", userId);
  }
}
