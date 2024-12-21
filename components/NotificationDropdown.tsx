"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import {
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "@/lib/actions/notification.actions";
import { motion } from "framer-motion";
import { Bell } from "lucide-react";

export default function NotificationDropdown({ notifications, onClose }) {
  const router = useRouter();
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  const handleNotificationClick = async (notification) => {
    await markNotificationAsRead(notification.id);

    if (notification.type === "STOCK_LOW") {
      router.push("/stock");
    }

    if (notification.type === "PRESCRIPTIONS") {
      router.push("/prescriptions");
    }

    if (notification.type === "MEDICAL_RECORDS") {
      router.push("/medical-records");
    }

    if (
      notification.type === "APPOINTMENT_REQUEST" ||
      notification.type === "APPOINTMENT_RESPONSE"
    ) {
      router.push("/appointments");
    }

    onClose();
  };

  const handleMarkAllAsRead = async () => {
    await markAllNotificationsAsRead(notifications[0]?.userId);
  };

  return (
    <motion.div
      ref={dropdownRef}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="absolute right-0 sm:right-0 mt-2 w-[calc(100vw-2rem)] sm:w-96 bg-white rounded-xl shadow-2xl z-50 border border-gray-100 overflow-hidden transform -translate-x-1/2 left-1/2 sm:transform-none sm:left-auto"
    >
      <div className="p-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white flex justify-between items-center">
        <h3 className="font-semibold text-lg">Notifications</h3>
        {notifications.some((n) => !n.read) && (
          <button
            onClick={handleMarkAllAsRead}
            className="text-sm bg-white/20 hover:bg-white/30 px-2 py-1 rounded-md transition-colors"
          >
            Mark all as read
          </button>
        )}
      </div>

      <div
        className="max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-blue-500 scrollbar-track-gray-100"
        style={{
          scrollbarWidth: "thin",
          scrollbarColor: "#3B82F6 #F3F4F6",
        }}
      >
        {notifications.length === 0 ? (
          <div className="p-8 text-center">
            <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No new notifications</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <motion.div
              key={notification.id}
              whileHover={{ backgroundColor: "#F8FAFC" }}
              onClick={() => handleNotificationClick(notification)}
              className={`p-4 border-b border-gray-100 cursor-pointer transition-colors ${
                !notification.read
                  ? "bg-blue-50 hover:bg-blue-50/80"
                  : "hover:bg-gray-50"
              }`}
            >
              <h4 className="font-semibold text-gray-900 mb-1">
                {notification.title}
              </h4>
              <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                {notification.message}
              </p>
              <span className="text-xs text-gray-400 font-medium">
                {new Date(notification.createdAt).toLocaleString(undefined, {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </span>
            </motion.div>
          ))
        )}
      </div>
    </motion.div>
  );
}
