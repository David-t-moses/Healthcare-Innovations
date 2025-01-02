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
  const [socket, setSocket] = useState(null);
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
    // Initialize socket once
    const newSocket = io(process.env.NEXT_PUBLIC_APP_URL, {
      reconnection: true,
      reconnectionAttempts: 5,
    });
    setSocket(newSocket);

    if (userId) {
      newSocket.emit("join-user-room", userId);

      // Fetch initial notifications
      getNotifications(userId).then((data) => {
        if (data.success) {
          setNotifications(data.notifications);
        }
      });

      // Socket event handlers
      newSocket.on("new-notification", (notification) => {
        console.log("New notification received:", notification);
        setNotifications((prev) => [notification, ...prev]);
      });

      newSocket.on("notification-read", ({ notificationId }) => {
        updateNotificationState(notificationId);
      });

      newSocket.on("all-notifications-read", () => {
        setNotifications((prev) =>
          prev.map((notification) => ({ ...notification, read: true }))
        );
      });
    }

    return () => {
      if (newSocket) {
        newSocket.disconnect();
      }
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
