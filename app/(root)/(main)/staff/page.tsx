"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  getStaffList,
  updateStaffStatus,
  deleteStaff,
} from "@/lib/actions/staff.actions";
import { AiOutlinePlus, AiOutlineDelete } from "react-icons/ai";
import AddStaffModal from "@/components/AddStaffModal";
import { Skeleton } from "@/components/ui/skeleton";

const StaffPageSkeleton = () => (
  <div className="max-w-7xl mx-auto p-6">
    {/* Header Section */}
    <div className="mb-8">
      <Skeleton className="h-9 w-64 mb-2 bg-white" />
      <Skeleton className="h-6 w-80 bg-white" />
    </div>

    {/* Add Staff Button */}
    <Skeleton className="h-10 w-40 rounded-lg mb-6 bg-white" />

    {/* Staff Grid */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[
        1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
      ].map((index) => (
        <div key={index} className="bg-white rounded-lg shadow-md p-6">
          {/* Header with Name and Status */}
          <div className="flex items-center justify-between mb-4">
            <div className="space-y-2">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-40" />
            </div>
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>

          {/* Staff Details */}
          <div className="space-y-3">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-4 w-48" />

            {/* Action Buttons */}
            <div className="flex gap-2 mt-4">
              <Skeleton className="h-9 flex-1 rounded-md" />
              <Skeleton className="h-9 flex-1 rounded-md" />
              <Skeleton className="h-9 w-9 rounded-full" />
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default function StaffPage() {
  const [staffList, setStaffList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingStaffId, setUpdatingStaffId] = useState(null);
  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [deletingStaffId, setDeletingStaffId] = useState(null);
  const [loadingActions, setLoadingActions] = useState({
    active: null,
    break: null,
    delete: null,
  });

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);

      await fetchStaffData();
    };

    loadData();
  }, []);

  const fetchStaffData = async () => {
    const { success, data, error } = await getStaffList();
    setStaffList(data);
    setIsLoading(false);
  };

  const handleAddStaff = () => {
    setAddModalOpen(true);
  };

  const handleStaffAdded = (newStaff) => {
    setStaffList((prevList) => [...prevList, newStaff]);
  };

  const handleStatusUpdate = async (staffId: string, newStatus: string) => {
    const actionType = newStatus.toLowerCase();
    setLoadingActions((prev) => ({ ...prev, [actionType]: staffId }));

    try {
      const { success, error } = await updateStaffStatus(staffId, newStatus);
      if (success) {
        toast.success("Staff status updated successfully");
        fetchStaffData();
      } else {
        toast.error(error);
      }
    } finally {
      setLoadingActions((prev) => ({ ...prev, [actionType]: null }));
    }
  };

  const handleDeleteStaff = async (staffId: string) => {
    setLoadingActions((prev) => ({ ...prev, delete: staffId }));
    const result = await deleteStaff(staffId);
    if (result.success) {
      toast.success("Staff member deleted successfully");
      fetchStaffData();
    } else {
      toast.error(result.error);
    }
    setLoadingActions((prev) => ({ ...prev, delete: null }));
  };

  if (isLoading) {
    return <StaffPageSkeleton />;
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-bold text-gray-900">Staff Management</h1>
        <p className="text-gray-600 mt-2">Monitor and manage staff status</p>
      </motion.div>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleAddStaff}
        className="mb-6 px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2"
      >
        <AiOutlinePlus className="w-5 h-5" />
        Add Staff Member
      </motion.button>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {staffList.map((staff) => (
          <motion.div
            key={staff.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-md p-6 border border-gray-100"
          >
            <div className="flex items-center gap-4 mb-6">
              {/* Decorative Initial Circle */}
              <div className="relative w-16 h-16">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 rounded-full opacity-90" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(255,255,255,0.2),transparent)] rounded-full" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">
                    {staff.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>

              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-900">
                  {staff.name}
                </h3>
                <p className="text-sm text-gray-500">{staff.email}</p>
                <span
                  className={`inline-block px-3 py-1 rounded-full text-sm font-medium mt-2
              ${
                staff.status === "ACTIVE"
                  ? "bg-green-100 text-green-800"
                  : staff.status === "ON_BREAK"
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-red-100 text-red-800"
              }`}
                >
                  {staff.status}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-gray-600 font-medium">{staff.role}</p>
              <p className="text-sm text-gray-500">
                Last updated: {format(new Date(staff.lastUpdated), "PPp")}
              </p>

              <div className="flex items-center gap-2 mt-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleStatusUpdate(staff.id, "ACTIVE")}
                  disabled={loadingActions.active === staff.id}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  Set Active
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleStatusUpdate(staff.id, "ON_BREAK")}
                  disabled={loadingActions.break === staff.id}
                  className="flex-1 px-4 py-2 bg-white/80 border border-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-all disabled:opacity-70 disabled:cursor-not-allowed backdrop-blur-sm hover:bg-gray-50"
                >
                  Set Break
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.1, backgroundColor: "#FEE2E2" }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleDeleteStaff(staff.id)}
                  disabled={deletingStaffId === staff.id}
                  className="p-2.5 bg-white border border-red-200 text-red-600 rounded-lg transition-all hover:border-red-300 group"
                >
                  {deletingStaffId === staff.id ? (
                    <div className="w-5 h-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <AiOutlineDelete className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  )}
                </motion.button>
              </div>
            </div>
          </motion.div>
        ))}
        <AddStaffModal
          isOpen={isAddModalOpen}
          onClose={() => setAddModalOpen(false)}
          onSuccess={handleStaffAdded}
        />
      </div>
    </div>
  );
}
