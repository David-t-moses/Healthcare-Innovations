"use client";

import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import {
  AiOutlinePlus,
  AiOutlineBell,
  AiOutlineDashboard,
  AiOutlineUser,
  AiOutlineCalendar,
  AiOutlineTeam,
  AiOutlineDollarCircle,
  AiOutlineSetting,
  AiOutlineInbox,
  AiOutlineMedicineBox,
  AiOutlineHistory,
} from "react-icons/ai";
import Sidebar from "./SideBar";
import NotificationDropdown from "./NotificationDropdown";
import { getCurrentUser } from "@/lib/auth";
import { useNotifications } from "./NotificationContext";
import AddPatientModal from "./AddPatientModal";
import AddPrescriptionModal from "./AddPrescriptionModal";
import AddStaffModal from "./AddStaffModal";
import AddStockItemModal from "./AddStockItemModal";
import AddFinancialRecordModal from "./AddFinancialRecordModal";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { SearchContext } from "./SearchContext";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import AddPaymentModal from "./AddPaymentModal";
import { getPatients } from "@/lib/actions/sales.actions";
import AddMedicalRecord from "./AddMedicalRecord";
import { DashboardLayoutSkeleton } from "./SkeletonLayout";

export const staffNavigationItems = [
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
    label: "Stock",
    description: "Medicine and peripherals",
    path: "/stock",
    icon: AiOutlineInbox,
  },
  {
    label: "Prescriptions",
    description: "Manage patient medications",
    path: "/prescriptions",
    icon: AiOutlineMedicineBox,
  },
  {
    label: "Medical History",
    description: "Access patient records",
    path: "/medical-records",
    icon: AiOutlineHistory,
  },
  {
    label: "Settings",
    description: "Clinic Settings",
    path: "/settings",
    icon: AiOutlineSetting,
  },
];

export const patientNavigationItems = [
  {
    label: "Dashboard",
    description: "Your Overview",
    path: "/dashboard",
    icon: AiOutlineDashboard,
  },
  {
    label: "My Appointments",
    description: "Schedule and History",
    path: "/appointments",
    icon: AiOutlineCalendar,
  },
  {
    label: "Prescriptions",
    description: "Your Medications",
    path: "/prescriptions",
    icon: AiOutlineMedicineBox,
  },
  {
    label: "Medical History",
    description: "Your Records",
    path: "/medical-records",
    icon: AiOutlineHistory,
  },
  {
    label: "Settings",
    description: "Update Settings",
    path: "/settings",
    icon: AiOutlineSetting,
  },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [userRole, setUserRole] = useState<"PATIENT" | "STAFF" | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const pathname = usePathname();
  const { unreadCount, notifications } = useNotifications();
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get("q") || "");
  const [patients, setPatients] = useState([]);
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isHeaderExpanded, setIsHeaderExpanded] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      setIsLoading(true);
      const user = await getCurrentUser();
      if (user?.fullName) {
        setFirstName(user.fullName.split(" ")[0]);
        setUserRole(user.role);
      }
      setIsLoading(false);
    };
    fetchUser();
  }, []);

  useEffect(() => {
    const fetchPatients = async () => {
      if (activeModal === "payment") {
        const { success, data } = await getPatients();
        if (success) {
          setPatients(data);
        }
      }
    };

    fetchPatients();
  }, [activeModal]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1280) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };

    // Initial check
    handleResize();

    // Add event listener
    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  const handleSettingsRoute = () => {
    router.push("/settings");
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);

    const params = new URLSearchParams(searchParams);
    if (term) {
      params.set("q", term);
    } else {
      params.delete("q");
    }

    router.replace(`${pathname}?${params.toString()}`);
  };

  const handleQuickAdd = (type: string) => {
    setActiveModal(type);
  };

  const handleModalSuccess = (data: any, type: string) => {
    setActiveModal(null);
    toast.success(`${type} added successfully`);

    switch (type) {
      case "patient":
        router.push("/patients");
        break;
      case "stock":
        router.push("/stock");
        break;
      case "payment":
        router.push("/finances");
        break;
      case "prescription":
        router.push("/prescriptions");
        break;
      case "staff":
        router.push("/staff");
        break;
      case "medical-record":
        router.push("/medical-records");
        break;
      case "finances":
        router.push("/finances");
        break;
    }
  };

  const renderAddButton = () => {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700"
          >
            <AiOutlinePlus className="w-5 h-5" />
          </motion.button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          {[
            { label: "Add Patient", action: "patient" },
            { label: "Add Stock Item", action: "stock" },
            { label: "Record Payment", action: "payment" },
            { label: "Add Prescription", action: "prescription" },
            { label: "Add Staff", action: "staff" },
            { label: "Add Medical Record", action: "medical-record" },
            { label: "Add Financial Record", action: "finances" },
          ].map((item) => (
            <DropdownMenuItem
              key={item.action}
              onClick={() => handleQuickAdd(item.action)}
              className="hover:!bg-blue-600 hover:!text-white transition-colors focus:!bg-blue-600 focus:!text-white"
            >
              {item.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  const navigationItems = useMemo(() => {
    return userRole === "PATIENT"
      ? patientNavigationItems
      : staffNavigationItems;
  }, [userRole]);

  const currentPageTitle = useMemo(() => {
    const currentRoute = navigationItems.find((item) => item.path === pathname);
    return currentRoute?.label || "Pharma";
  }, [pathname, navigationItems]);

  if (isLoading) {
    return <DashboardLayoutSkeleton />;
  }

  return (
    <SearchContext.Provider value={{ searchTerm, setSearchTerm }}>
      <div className="relative flex w-full">
        <Sidebar
          isSidebarOpen={isSidebarOpen}
          toggleSidebar={toggleSidebar}
          navigationItems={navigationItems}
        />

        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 xl:hidden z-10"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <main className="flex-1 w-full xl:ml-72">
          <header className="bg-gray-100 shadow-md sticky top-0 z-10">
            {/* Main Header Row */}
            <div className="flex items-center justify-between px-4 py-4">
              <div className="flex items-center space-x-4">
                <button
                  className="p-2 rounded-lg hover:bg-gray-100 xl:hidden"
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
                  {currentPageTitle || ""}
                </h2>
              </div>

              {/* Desktop View */}
              <div className="hidden md:flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  {userRole === "STAFF" && renderAddButton()}
                  <div className="relative">
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={handleSearch}
                      placeholder={`Search ${currentPageTitle.toLowerCase()}...`}
                      className="w-64 px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <motion.button
                    onClick={() => setShowNotifications(!showNotifications)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className=" relative w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200"
                  >
                    <AiOutlineBell className="w-5 h-5 text-gray-600" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {unreadCount}
                      </span>
                    )}
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    onClick={handleSettingsRoute}
                    whileTap={{ scale: 0.95 }}
                    className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200"
                  >
                    <AiOutlineSetting className="w-5 h-5 text-gray-600" />
                  </motion.button>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="flex items-center space-x-2 bg-blue-600 text-white rounded-lg px-4 py-2 cursor-pointer"
                  >
                    <AiOutlineUser className="w-5 h-5" />
                    <span className="font-medium">{firstName}</span>
                  </motion.div>
                </div>
              </div>

              {/* Mobile Expand Button */}
              <button
                onClick={() => setIsHeaderExpanded(!isHeaderExpanded)}
                className="md:hidden"
              >
                <motion.div
                  animate={{ rotate: isHeaderExpanded ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </motion.div>
              </button>
            </div>

            {/* Mobile Expandable Content */}
            <motion.div
              initial={false}
              animate={{
                height: isHeaderExpanded ? "auto" : 0,
                opacity: isHeaderExpanded ? 1 : 0,
              }}
              className="md:hidden overflow-hidden"
            >
              <div className="px-4 pb-4 space-y-4">
                <div className="flex items-center space-x-2">
                  {userRole === "STAFF" && renderAddButton()}
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={handleSearch}
                    placeholder={`Search ${currentPageTitle.toLowerCase()}...`}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex items-center justify-end space-x-3">
                  <motion.button
                    onClick={() => setShowNotifications(!showNotifications)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="relative w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200"
                  >
                    <AiOutlineBell className="w-5 h-5 text-gray-600" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {unreadCount}
                      </span>
                    )}
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    onClick={handleSettingsRoute}
                    whileTap={{ scale: 0.95 }}
                    className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200"
                  >
                    <AiOutlineSetting className="w-5 h-5 text-gray-600" />
                  </motion.button>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="flex items-center space-x-2 bg-blue-600 text-white rounded-lg px-4 py-2 cursor-pointer"
                  >
                    <AiOutlineUser className="w-5 h-5" />
                    <span className="font-medium">{firstName}</span>
                  </motion.div>
                </div>
              </div>
            </motion.div>
            <div className="xl:relative">
              {showNotifications && (
                <NotificationDropdown
                  notifications={notifications}
                  onClose={() => setShowNotifications(false)}
                />
              )}
            </div>
          </header>

          <div className="p-4 sm:p-6 w-full">{children}</div>
          {activeModal === "patient" && (
            <AddPatientModal
              isOpen={true}
              onClose={() => setActiveModal(null)}
              onSuccess={(data) => handleModalSuccess(data, "patient")}
            />
          )}
          {activeModal === "stock" && (
            <AddStockItemModal
              isOpen={true}
              onClose={() => setActiveModal(null)}
              onSuccess={(data) => handleModalSuccess(data, "stock")}
            />
          )}

          {activeModal === "payment" && (
            <AddPaymentModal
              isOpen={true}
              onClose={() => setActiveModal(null)}
              onSuccess={(data) => handleModalSuccess(data, "payment")}
              patients={patients}
            />
          )}
          {activeModal === "prescription" && (
            <AddPrescriptionModal
              open={true}
              onClose={() => setActiveModal(null)}
              onSuccess={(data) => handleModalSuccess(data, "prescription")}
            />
          )}

          {activeModal === "finances" && (
            <AddFinancialRecordModal
              isOpen={true}
              onClose={() => setActiveModal(null)}
              onSuccess={(data) => handleModalSuccess(data, "finances")}
            />
          )}

          {activeModal === "staff" && (
            <AddStaffModal
              isOpen={true}
              onClose={() => setActiveModal(null)}
              onSuccess={(data) => handleModalSuccess(data, "staff")}
            />
          )}

          {activeModal === "medical-record" && (
            <AddMedicalRecord
              open={true}
              onClose={() => setActiveModal(null)}
              onSuccess={(data) => handleModalSuccess(data, "medical record")}
            />
          )}
        </main>
      </div>
    </SearchContext.Provider>
  );
}
