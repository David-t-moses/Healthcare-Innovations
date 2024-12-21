"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { pusherClient } from "@/lib/pusher";
import { getNotifications } from "@/lib/actions/notification.actions";

interface NotificationContextType {
  unreadCount: number;
  notifications: any[];
  setNotifications: (notifications: any[]) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error(
      "useNotifications must be used within a NotificationProvider"
    );
  }
  return context;
}

export function NotificationProvider({
  children,
  userId,
}: {
  children: React.ReactNode;
  userId: string;
}) {
  const [notifications, setNotifications] = useState([]);
  const unreadCount = notifications.filter((n) => !n.read).length;

  // Add this function to update notification state after marking as read
  const updateNotificationState = (notificationId: string) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === notificationId
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  useEffect(() => {
    const channel = pusherClient.subscribe(`user-${userId}`);

    channel.bind("all-notifications-read", () => {
      setNotifications((prev) =>
        prev.map((notification) => ({
          ...notification,
          read: true,
        }))
      );
    });

    channel.bind("new-notification", (notification: any) => {
      setNotifications((prev) => [notification, ...prev]);
    });

    channel.bind("notification-read", ({ notificationId }) => {
      updateNotificationState(notificationId);
    });

    getNotifications(userId).then(({ notifications }) => {
      if (notifications) {
        setNotifications(notifications);
      }
    });

    return () => {
      channel.unbind_all();
      channel.unsubscribe();
    };
  }, [userId]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        setNotifications,
        unreadCount,
        updateNotificationState,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}
