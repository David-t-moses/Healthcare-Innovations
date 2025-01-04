"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { io } from "socket.io-client";
import { getNotifications } from "@/lib/actions/notification.actions";

interface NotificationContextType {
  unreadCount: number;
  notifications: any[];
  setNotifications: (notifications: any[]) => void;
  updateNotificationState: (notificationId: string) => void;
  refreshNotifications: () => Promise<void>;
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
  const [socket, setSocket] = useState(null);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const updateNotificationState = useCallback((notificationId: string) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === notificationId
          ? { ...notification, read: true }
          : notification
      )
    );
  }, []);

  useEffect(() => {
    const fetchNotifications = async () => {
      const data = await getNotifications(userId);
      if (data.success) {
        setNotifications(data.notifications);
      }
    };
    fetchNotifications();

    const interval = setInterval(fetchNotifications, 30000);

    return () => clearInterval(interval);
  }, [userId]);

  useEffect(() => {
    const newSocket = io(process.env.NEXT_PUBLIC_APP_URL);
    setSocket(newSocket);

    newSocket.on("connect", () => {
      console.log("Socket connected");
      newSocket.emit("join-user-room", userId);
    });

    newSocket.on("new-notification", (notification) => {
      console.log("New notification received:", notification);

      getNotifications(userId).then((data) => {
        if (data.success) {
          setNotifications(data.notifications);
        }
      });
    });

    return () => {
      newSocket.disconnect();
    };
  }, [userId]);

  const refreshNotifications = useCallback(async () => {
    const data = await getNotifications(userId);
    if (data.success) {
      setNotifications(data.notifications);
    }
  }, [userId]);

  const value = {
    notifications,
    setNotifications,
    unreadCount,
    updateNotificationState,
    refreshNotifications,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}
