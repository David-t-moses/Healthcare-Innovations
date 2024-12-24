"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FiUser, FiLock, FiSettings, FiBell } from "react-icons/fi";
import { toast } from "sonner";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import {
  updateProfile,
  updateNotificationPreferences,
  updatePassword,
  getUserSettings,
} from "@/lib/actions/settings.actions";
import Button from "@/components/Button";
import LoadingSpinner from "@/components/LoadingSpinner";
import { getCurrentUser } from "@/lib/auth";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");
  const [isLoading, setIsLoading] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [userData, setUserData] = useState({
    fullName: "",
    email: "",
    role: "",
    note: "",
    notificationPreferences: {
      emailNotifications: true,
      appointmentReminders: true,
    },
    systemPreferences: {
      calendarView: "week",
      timeZone: "UTC",
    },
  });

  const supabase = createClientComponentClient();

  useEffect(() => {
    const fetchUserData = async () => {
      const user = await getCurrentUser();
      if (user) {
        setUserData((prevData) => ({
          ...prevData,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
          // Preserve other state properties
          notificationPreferences: prevData.notificationPreferences,
          systemPreferences: prevData.systemPreferences,
        }));
      }
      setIsPageLoading(false);
    };

    fetchUserData();
  }, []);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await updateProfile({
        fullName: userData.fullName,
        email: userData.email,
      });

      if (result.success) {
        toast.success(
          "Profile updated successfully! Reload browser to see changes."
        );
        setUserData((prev) => ({
          ...prev,
          ...result.data,
        }));
      } else {
        toast.error(result.error || "Update failed");
      }
    } catch (error) {
      console.error("Profile Update Error:", error);
      toast.error("An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  // const handleNotificationUpdate = async (key, value) => {
  //   const {
  //     data: { session },
  //   } = await supabase.auth.getSession();
  //   const newPreferences = {
  //     ...userData.notificationPreferences,
  //     [key]: value,
  //   };

  //   const result = await updateNotificationPreferences(
  //     session?.user?.id,
  //     newPreferences
  //   );

  //   if (result.success) {
  //     setUserData((prev) => ({
  //       ...prev,
  //       notificationPreferences: newPreferences,
  //     }));
  //     toast.success("Notification preferences updated");
  //   } else {
  //     toast.error(result.error);
  //   }
  // };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const newPassword = formData.get("newPassword");
    const confirmPassword = formData.get("confirmPassword");

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    const result = await updatePassword({
      currentPassword: formData.get("currentPassword"),
      newPassword: newPassword,
    });

    if (result.success) {
      toast.success("Password updated successfully");
      e.target.reset();
    } else {
      toast.error(result.error || "Failed to update password");
    }
  };

  const tabs =
    userData?.role === "STAFF"
      ? [
          { id: "profile", label: "Profile Settings", icon: FiUser },
          // { id: "notifications", label: "Notifications", icon: FiBell },
          { id: "security", label: "Security", icon: FiLock },
          { id: "system", label: "System", icon: FiSettings },
        ]
      : [
          { id: "profile", label: "Profile Settings", icon: FiUser },
          { id: "security", label: "Security", icon: FiLock },
        ];

  if (isPageLoading) {
    return <LoadingSpinner message="Loading settings..." />;
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-2">Manage your account preferences</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-4">
            {tabs.map((tab) => (
              <motion.button
                key={tab.id}
                whileHover={{ x: 5 }}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center space-x-2 p-3 rounded-lg mb-2 ${
                  activeTab === tab.id
                    ? "bg-blue-50 text-blue-600"
                    : "hover:bg-gray-50"
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span>{tab.label}</span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="md:col-span-3">
          <div className="bg-white rounded-lg shadow-md p-6">
            {activeTab === "profile" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                <h2 className="text-xl font-semibold mb-6">Profile Settings</h2>
                <form
                  onSubmit={handleProfileUpdate}
                  className="grid grid-cols-1 md:grid-cols-2 gap-6"
                >
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={userData?.fullName}
                      onChange={(e) =>
                        setUserData((prev) => ({
                          ...prev,
                          fullName: e.target.value,
                        }))
                      }
                      className="w-full p-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={userData?.email}
                      onChange={(e) =>
                        setUserData((prev) => ({
                          ...prev,
                          email: e.target.value,
                        }))
                      }
                      className="w-full p-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Role
                    </label>
                    <div className="w-full p-2 border rounded-lg bg-gray-50 text-gray-700 capitalize">
                      {userData?.role === "PATIENT" ? "Patient" : "Staff"}
                    </div>
                  </div>

                  <div className="md:col-span-2 flex justify-end">
                    <Button
                      isLoading={isLoading}
                      main_text="Save Profile"
                      loading_text="Saving..."
                      onClick={handleProfileUpdate}
                    />
                  </div>
                </form>
              </motion.div>
            )}

            {/* {userData?.role === "STAFF" && activeTab === "notifications" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                <h2 className="text-xl font-semibold mb-6">
                  Notification Preferences
                </h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h3 className="font-medium">Email Notifications</h3>
                      <p className="text-sm text-gray-600">
                        Receive email updates
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={
                          userData?.notificationPreferences
                            ?.emailNotifications || false
                        }
                        onChange={(e) =>
                          handleNotificationUpdate(
                            "emailNotifications",
                            e.target.checked
                          )
                        }
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h3 className="font-medium">Appointment Reminders</h3>
                      <p className="text-sm text-gray-600">
                        Get notified about upcoming appointments
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={
                          userData?.notificationPreferences
                            ?.appointmentReminders || false
                        }
                        onChange={(e) =>
                          handleNotificationUpdate(
                            "appointmentReminders",
                            e.target.checked
                          )
                        }
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </motion.div>
            )} */}

            {activeTab === "security" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                <h2 className="text-xl font-semibold mb-6">
                  Security Settings
                </h2>
                <form onSubmit={handlePasswordUpdate} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Current Password
                    </label>
                    <input
                      type="password"
                      name="currentPassword"
                      className="w-full p-2 border rounded-lg"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      New Password
                    </label>
                    <input
                      type="password"
                      name="newPassword"
                      className="w-full p-2 border rounded-lg"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      className="w-full p-2 border rounded-lg"
                      required
                    />
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg"
                    >
                      Update Password
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {userData?.role === "STAFF" && activeTab === "system" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                <h2 className="text-xl font-semibold mb-6">
                  System Preferences
                </h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h3 className="font-medium">Appointment Calendar View</h3>
                      <p className="text-sm text-gray-600">
                        Default calendar view preference
                      </p>
                    </div>
                    <select
                      className="p-2 border rounded-lg"
                      value={
                        userData?.systemPreferences?.calendarView || "week"
                      }
                      onChange={(e) =>
                        setUserData((prev) => ({
                          ...prev,
                          systemPreferences: {
                            ...prev.systemPreferences,
                            calendarView: e.target.value,
                          },
                        }))
                      }
                    >
                      <option value="week">Week View</option>
                      <option value="month">Month View</option>
                      <option value="agenda">Agenda View</option>
                    </select>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h3 className="font-medium">Time Zone</h3>
                      <p className="text-sm text-gray-600">
                        Set your local time zone
                      </p>
                    </div>
                    <select
                      className="p-2 border rounded-lg"
                      value={userData?.systemPreferences?.timeZone || "UTC"}
                      onChange={(e) =>
                        setUserData((prev) => ({
                          ...prev,
                          systemPreferences: {
                            ...prev.systemPreferences,
                            timeZone: e.target.value,
                          },
                        }))
                      }
                    >
                      <option value="UTC">UTC</option>
                      <option value="EST">Eastern Time</option>
                      <option value="PST">Pacific Time</option>
                      <option value="GMT">GMT</option>
                    </select>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
