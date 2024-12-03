"use client";

import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { getCurrentUser } from "@/lib/actions/user.actions";
import {
  AiOutlinePlus,
  AiOutlineBell,
  AiOutlineMessage,
  AiOutlineDashboard,
  AiOutlineUser,
  AiOutlineCalendar,
  AiOutlineTeam,
  AiOutlineDollarCircle,
  AiOutlineSetting,
  AiOutlineInbox,
} from "react-icons/ai";
import Sidebar from "./SideBar";

const navigationItems = [
  {
    label: "Dashboard",
    description: "General Overview",
    path: "/dashboard",
    icon: AiOutlineDashboard,
  },
  {
    label: "Patients",
    description: "Menu of patients",
    path: "/patients",
    icon: AiOutlineUser,
  },
  {
    label: "Appointments",
    description: "Scheduled appointments",
    path: "/appointments",
    icon: AiOutlineCalendar,
  },
  {
    label: "Staff List",
    description: "Overview of colleagues",
    path: "/staff",
    icon: AiOutlineTeam,
  },
  {
    label: "Sales and Finances",
    description: "Sales and financial report",
    path: "/finances",
    icon: AiOutlineDollarCircle,
  },
  {
    label: "Settings",
    description: "Clinic Settings",
    path: "/settings",
    icon: AiOutlineSetting,
  },
  {
    label: "Stock",
    description: "Medicine and peripherals",
    path: "/stock",
    icon: AiOutlineInbox,
  },
];

export default function Dashboard({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [firstName, setFirstName] = useState("");
  const pathname = usePathname();

  useEffect(() => {
    const fetchUser = async () => {
      const user = await getCurrentUser();
      if (user?.fullName) {
        setFirstName(user.fullName.split(" ")[0]);
      }
    };
    fetchUser();
  }, []);

  const currentPageTitle = useMemo(() => {
    const currentRoute = navigationItems.find((item) => item.path === pathname);
    return currentRoute?.label || "Dashboard";
  }, [pathname]);

  return (
    <div className="flex">
      <Sidebar
        isSidebarOpen={isSidebarOpen}
        navigationItems={navigationItems}
      />

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 lg:hidden z-10"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 lg:ml-72">
        <header className="bg-gray-100/90 shadow-md backdrop-blur-sm sticky top-0 z-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-4 sm:px-6 py-4 space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-4 w-full sm:w-auto">
              <button
                className="p-2 rounded-lg hover:bg-gray-100 lg:hidden"
                onClick={() => setSidebarOpen(!isSidebarOpen)}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 6h16M4 12h16m-7 6h7"
                  />
                </svg>
              </button>
              <h2 className="text-xl font-semibold text-gray-800">
                {currentPageTitle}
              </h2>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-4 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
              <div className="flex items-center space-x-2 order-2 sm:order-1">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700"
                >
                  <AiOutlinePlus className="w-5 h-5" />
                </motion.button>

                <div className="relative hidden md:block">
                  <input
                    type="text"
                    placeholder="Search..."
                    className="w-full sm:w-64 px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 order-1 sm:order-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200"
                >
                  <AiOutlineBell className="w-5 h-5 text-gray-600" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200"
                >
                  <AiOutlineMessage className="w-5 h-5 text-gray-600" />
                </motion.button>

                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center space-x-2 bg-blue-600 text-white rounded-lg px-4 py-2 cursor-pointer"
                >
                  <AiOutlineUser className="w-5 h-5" />
                  <span className="font-medium hidden sm:inline">
                    {firstName || "Guest"}
                  </span>
                </motion.div>
              </div>
            </div>
          </div>
        </header>

        <div className="p-4 sm:p-6">{children}</div>
      </main>
    </div>
  );
}
