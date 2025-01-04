"use server";

import prisma from "@/lib/prisma";
import { emitNotificationRead, emitAllNotificationsRead } from "../socket";

export async function getNotifications(userId: string) {
  try {
    const notifications = await prisma.notification.findMany({
      where: {
        userId: userId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return { success: true, notifications };
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return { success: false, error: "Failed to fetch notifications" };
  }
}

export async function markNotificationAsRead(notificationId: string) {
  try {
    const notification = await prisma.notification.update({
      where: { id: notificationId },
      data: { read: true },
    });

    emitNotificationRead(notification.userId, notificationId);
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}

export async function markAllNotificationsAsRead(userId: string) {
  try {
    await prisma.notification.updateMany({
      where: {
        userId: userId,
        read: false,
      },
      data: { read: true },
    });

    emitAllNotificationsRead(userId);
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}

export async function deleteNotification(notificationId: string) {
  try {
    await prisma.notification.delete({
      where: { id: notificationId },
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to delete notification" };
  }
}

export async function deleteAllNotifications(userId: string) {
  try {
    await prisma.notification.deleteMany({
      where: { userId },
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to delete all notifications" };
  }
}
