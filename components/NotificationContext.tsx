"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { io } from "socket.io-client";
import { getNotifications } from "@/lib/actions/notification.actions";

interface NotificationContextType {
  unreadCount: number;
  notifications: any[];
  setNotifications: (notifications: any[]) => void;
  updateNotificationState: (notificationId: string) => void;
}

const socket = io(process.env.NEXT_PUBLIC_APP_URL);

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
    if (userId) {
      socket.emit("join-user-room", userId);

      socket.on("new-notification", (notification) => {
        setNotifications((prev) => [notification, ...prev]);
      });

      socket.on("notification-read", ({ notificationId }) => {
        updateNotificationState(notificationId);
      });

      socket.on("all-notifications-read", () => {
        setNotifications((prev) =>
          prev.map((notification) => ({ ...notification, read: true }))
        );
      });

      // Initial fetch of notifications
      getNotifications(userId).then((data) => {
        if (data.success) {
          setNotifications(data.notifications);
        }
      });
    }

    return () => {
      socket.off("new-notification");
      socket.off("notification-read");
      socket.off("all-notifications-read");
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
