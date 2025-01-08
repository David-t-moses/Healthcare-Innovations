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

  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      const user = await getCurrentUser();
      if (user?.fullName) {
        setFirstName(user.fullName.split(" ")[0]);
        setUserRole(user.role);
      }
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

  const handleAddButton = () => {
    switch (currentPageTitle) {
      case "Patients":
        setActiveModal("patient");
        break;
      case "Prescriptions":
        setActiveModal("prescription");
        break;
      case "Sales and Finances":
        setActiveModal("finances");
        break;
      case "Medical History":
        setActiveModal("medical-record");
        break;
      case "Staff List":
        setActiveModal("staff");
        break;
      case "Stock":
        setActiveModal("stock");
        break;
    }
  };

  const handleQuickAdd = (type: string) => {
    setActiveModal(type);
  };

  const handleModalSuccess = (data: any, type: string) => {
    setActiveModal(null);
    toast.success(`${type} added successfully`);

    // Redirect to respective pages
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
    }
  };

  const renderAddButton = () => {
    if (pathname === "/dashboard") {
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
            <DropdownMenuItem onClick={() => handleQuickAdd("patient")}>
              Add Patient
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleQuickAdd("stock")}>
              Add Stock Item
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleQuickAdd("payment")}>
              Record Payment
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    }

    return (
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleAddButton}
        className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700"
      >
        <AiOutlinePlus className="w-5 h-5" />
      </motion.button>
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

  return (
    <SearchContext.Provider value={{ searchTerm, setSearchTerm }}>
      <div className="flex w-full">
        <Sidebar
          isSidebarOpen={isSidebarOpen}
          navigationItems={navigationItems}
        />

        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 lg:hidden z-10"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <main className="flex-1 lg:ml-72">
          <header className="bg-gray-100 shadow-md sticky top-0 z-10">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-4 sm:px-6 py-4 space-y-4 sm:space-y-0">
              {/* Header content */}
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
                  {currentPageTitle || ""}
                </h2>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-4 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
                <div className="flex items-center space-x-2 order-2 sm:order-1">
                  {userRole === "STAFF" && renderAddButton()}

                  <div className="relative hidden md:block">
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={handleSearch}
                      placeholder={`Search ${currentPageTitle.toLowerCase()}...`}
                      className="w-full sm:w-64 px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end space-x-3 order-1 sm:order-2">
                  <div className="relative">
                    <motion.button
                      onClick={() => setShowNotifications(!showNotifications)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200"
                    >
                      <AiOutlineBell className="w-5 h-5 text-gray-600" />
                      {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                          {unreadCount}
                        </span>
                      )}
                    </motion.button>
                    {showNotifications && (
                      <NotificationDropdown
                        notifications={notifications}
                        onClose={() => setShowNotifications(false)}
                      />
                    )}
                  </div>
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
                    <span className="font-medium hidden sm:inline">
                      {firstName}
                    </span>
                  </motion.div>
                </div>
              </div>
            </div>
          </header>

          <div className="p-4 sm:p-6">{children}</div>
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
              open={activeModal === "prescription"}
              onClose={() => setActiveModal(null)}
              onSuccess={async (newPrescription) => {
                setActiveModal(null);
                router.refresh();
                router.push(pathname);
              }}
            />
          )}
          {activeModal === "finances" && (
            <AddFinancialRecordModal
              isOpen={true}
              onClose={() => setActiveModal(null)}
            />
          )}
          {activeModal === "prescription" && (
            <AddPrescriptionModal
              open={activeModal === "prescription"}
              onClose={() => setActiveModal(null)}
              onSuccess={async (newPrescription) => {
                setActiveModal(null);
                router.refresh();
                router.push(pathname);
              }}
            />
          )}
          {activeModal === "staff" && (
            <AddStaffModal isOpen={true} onClose={() => setActiveModal(null)} />
          )}
          {activeModal === "medical-record" && (
            <AddMedicalRecord
              open={true}
              onClose={() => setActiveModal(null)}
              onSuccess={(data) => handleModalSuccess(data, "medical-record")}
            />
          )}
        </main>
      </div>
    </SearchContext.Provider>
  );
}
