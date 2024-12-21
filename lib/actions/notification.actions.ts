"use server";

import prisma from "@/lib/prisma";
import { pusherServer } from "@/lib/pusher";

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

    // Trigger Pusher event to update UI
    await pusherServer.trigger(
      `user-${notification.userId}`,
      "notification-read",
      { notificationId }
    );

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

    // Trigger Pusher event to update UI
    await pusherServer.trigger(`user-${userId}`, "all-notifications-read", {});

    return { success: true };
  } catch (error) {
    return { success: false };
  }
}
