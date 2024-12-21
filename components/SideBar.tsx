"use client";

import { signOut } from "@/lib/actions/user.actions";
import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { AiOutlineLogout } from "react-icons/ai";

const Sidebar = ({
  isSidebarOpen,
  navigationItems,
}: {
  isSidebarOpen: boolean;
  navigationItems: {
    label: string;
    description: string;
    path: string;
    icon: React.ElementType;
  }[];
}) => {
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(false);

  const handleSignOut = () => {
    setIsLoading(true);
    signOut();
  };

  return (
    <aside
      className={`fixed inset-y-0 z-20 w-72 bg-gray-100 shadow-xl transform ${
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      } transition-transform duration-300 lg:translate-x-0 flex flex-col`}
    >
      <div className="p-6 bg-gray-100 border-b">
        <h1 className="text-xl font-bold text-gray-800">Setzu Clinic</h1>
        <p className="text-sm text-gray-500 mt-1">
          Budapest, Kossuth Lajos tér 1-3, 1055
        </p>
      </div>
      <nav className="mt-6 px-4 flex-grow">
        <ul className="space-y-2">
          {navigationItems.map((item, index) => (
            <Link href={item.path} key={index}>
              <motion.li
                className={`px-4 py-3 rounded-lg cursor-pointer transition-all group ${
                  pathname === item.path
                    ? "bg-blue-600 text-white"
                    : "hover:bg-blue-600 hover:text-white"
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center">
                  <item.icon className="w-5 h-5 mr-3" />
                  <div>
                    <div className="text-sm font-medium">{item.label}</div>
                    <div
                      className={`text-xs ${
                        pathname === item.path
                          ? "text-white"
                          : "text-gray-500 group-hover:text-white"
                      }`}
                    >
                      {item.description}
                    </div>
                  </div>
                </div>
              </motion.li>
            </Link>
          ))}
        </ul>
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t">
        <motion.button
          onClick={handleSignOut}
          className="w-full px-4 py-3 rounded-lg cursor-pointer transition-all group hover:bg-blue-600 hover:text-white flex items-center justify-center"
          whileHover={{ scale: isLoading ? 1 : 1.02 }}
          whileTap={{ scale: isLoading ? 1 : 0.98 }}
          disabled={isLoading}
        >
          {isLoading ? (
            <motion.div
              className="flex items-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <span className="text-sm font-medium">Signing out...</span>
            </motion.div>
          ) : (
            <div className="flex items-center">
              <AiOutlineLogout className="w-5 h-5 mr-3" />
              <span className="text-sm font-medium">Sign out</span>
            </div>
          )}
        </motion.button>
      </div>
    </aside>
  );
};

export default Sidebar;
