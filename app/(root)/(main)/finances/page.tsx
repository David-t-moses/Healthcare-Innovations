"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { AiOutlinePlus } from "react-icons/ai";
import { Skeleton } from "@/components/ui/skeleton";
import AddPaymentModal from "@/components/AddPaymentModal";
import EditPaymentModal from "@/components/EditPaymentModal";
import AddFinancialRecordModal from "@/components/AddFinancialRecordModal";
import EditFinancialRecordModal from "@/components/EditFinancialRecordModal";
import {
  getSalesData,
  getPatients,
  deletePayment,
  deleteFinancialRecord,
} from "@/lib/actions/sales.actions";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Pencil, Trash2, DollarSign } from "lucide-react";

const SalesSkeleton = () => (
  <div className="max-w-7xl mx-auto p-6 space-y-8">
    {/* Header Section */}
    <div className="space-y-2">
      <Skeleton className="h-10 w-[280px] bg-white" />
      <Skeleton className="h-6 w-[240px] bg-white" />
    </div>

    {/* Revenue Card */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-4">
          <Skeleton className="h-12 w-12 rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-8 w-32" />
          </div>
        </div>
      </div>
    </div>

    {/* Tab Buttons */}
    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
      <div className="flex gap-4">
        <Skeleton className="h-12 w-28 rounded-xl" />
        <Skeleton className="h-12 w-28 rounded-xl" />
      </div>
      <Skeleton className="h-12 w-40 rounded-xl" />
    </div>

    {/* Table */}
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6">
        {/* Table Header */}
        <div className="flex gap-4 mb-6">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-4 w-24" />
          ))}
        </div>
        {/* Table Rows */}
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="flex items-center gap-4 py-4 border-b border-gray-100"
          >
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-24" />
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default function SalesPage() {
  const [patients, setPatients] = useState([]);
  const [salesData, setSalesData] = useState({
    payments: [],
    financialRecords: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("payments");
  const [isPaymentModalOpen, setPaymentModalOpen] = useState(false);
  const [isFinancialModalOpen, setFinancialModalOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState(null);
  const [editingFinancialRecord, setEditingFinancialRecord] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    initializePage();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(false);
    };

    fetchData();
  }, []);

  const refreshData = useCallback(async () => {
    const salesResponse = await getSalesData();
    if (salesResponse.success) {
      setSalesData(salesResponse.data);
    }
  }, []);

  const initializePage = useCallback(async () => {
    setIsLoading(true);
    try {
      const [salesResponse, patientsResponse] = await Promise.all([
        getSalesData(),
        getPatients(),
      ]);

      if (salesResponse.success) {
        setSalesData(salesResponse.data);
      }

      if (patientsResponse.success) {
        setPatients(patientsResponse.data);
      }
    } catch (error) {
      toast.error("Failed to load data");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleEdit = (item) => {
    if (activeTab === "payments") {
      setEditingPayment(item);
    } else {
      setEditingFinancialRecord(item);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this record?")) {
      const action =
        activeTab === "payments" ? deletePayment : deleteFinancialRecord;
      const result = await action(id);

      if (result.success) {
        toast.success("Record deleted successfully");
        const salesResponse = await getSalesData();
        if (salesResponse.success) {
          setSalesData(salesResponse.data);
        }
      } else {
        toast.error("Failed to delete record, Please try again");
      }
    }
  };

  const getCurrentItems = () => {
    const items =
      activeTab === "payments"
        ? salesData.payments
        : salesData.financialRecords;
    if (!items?.length) return [];

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return items.slice(startIndex, endIndex);
  };

  const renderPagination = () => (
    <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
        >
          Previous
        </Button>

        <div className="flex gap-1">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <Button
              key={page}
              variant={currentPage === page ? "default" : "outline"}
              size="sm"
              onClick={() => setCurrentPage(page)}
              className={`w-8 h-8 ${
                currentPage === page ? "bg-blue-600 text-white" : ""
              }`}
            >
              {page}
            </Button>
          ))}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            setCurrentPage((prev) => Math.min(prev + 1, totalPages))
          }
          disabled={currentPage === totalPages}
        >
          Next
        </Button>
      </div>

      <div className="text-sm text-gray-500">
        Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
        {Math.min(
          currentPage * itemsPerPage,
          activeTab === "payments"
            ? salesData.payments.length
            : salesData.financialRecords.length
        )}{" "}
        of{" "}
        {activeTab === "payments"
          ? salesData.payments.length
          : salesData.financialRecords.length}{" "}
        entries
      </div>
    </div>
  );

  const totalPages = Math.ceil(
    (activeTab === "payments"
      ? salesData.payments.length
      : salesData.financialRecords.length) / itemsPerPage
  );

  if (isLoading) {
    return <SalesSkeleton />;
  }

  const totalRevenue = salesData?.payments?.reduce(
    (sum, payment) => sum + Number(payment.amount),
    0
  );

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gray-200 min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-bold text-gray-900 tracking-tight">
          Sales & Finance
        </h1>
        <p className="text-gray-600 mt-2 text-lg">
          Track payments and manage financial records
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-600">
                Total Revenue
              </h3>
              <p className="text-3xl font-bold text-green-600">
                ${totalRevenue.toFixed(2)}
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
        <div className="flex gap-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              setActiveTab("payments");
              setCurrentPage(1);
            }}
            className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
              activeTab === "payments"
                ? "bg-blue-600 text-white shadow-lg shadow-blue-200"
                : "bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            Payments
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              setActiveTab("financial");
              setCurrentPage(1);
            }}
            className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
              activeTab === "financial"
                ? "bg-blue-600 text-white shadow-lg shadow-blue-200"
                : "bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            Financial Records
          </motion.button>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() =>
            activeTab === "payments"
              ? setPaymentModalOpen(true)
              : setFinancialModalOpen(true)
          }
          className="px-6 py-3 bg-blue-600 text-white rounded-xl flex items-center gap-2 hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
        >
          <AiOutlinePlus className="w-5 h-5" />
          <span>
            {activeTab === "payments"
              ? "Record Payment"
              : "Add Financial Record"}
          </span>
        </motion.button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          {activeTab === "payments" ? (
            <table className="w-full min-w-[800px]">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">
                    Patient
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">
                    Amount
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">
                    Date
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">
                    Payment Method
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {getCurrentItems().map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">{payment.patient.name}</td>
                    <td className="px-6 py-4">
                      ${Number(payment.amount).toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      {format(new Date(payment.date), "PPp")}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          payment.status === "completed"
                            ? "bg-green-100 text-green-800"
                            : payment.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {payment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {payment.paymentMethod || "N/A"}
                    </td>
                    <td className="px-6 py-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            className="h-8 w-8 p-0 hover:bg-gray-100"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[160px]">
                          <DropdownMenuItem
                            onClick={() => handleEdit(payment)}
                            className="cursor-pointer"
                          >
                            <Pencil className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(payment.id)}
                            className="cursor-pointer text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="w-full min-w-[800px]">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">
                    Type
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">
                    Amount
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">
                    Date
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {getCurrentItems().map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">{record.type}</td>
                    <td className="px-6 py-4">
                      ${Number(record.amount).toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      {format(new Date(record.date), "PPp")}
                    </td>
                    <td className="px-6 py-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            className="h-8 w-8 p-0 hover:bg-gray-100"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[160px]">
                          <DropdownMenuItem
                            onClick={() => handleEdit(record)}
                            className="cursor-pointer"
                          >
                            <Pencil className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(record.id)}
                            className="cursor-pointer text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {totalPages > 1 && renderPagination()}
        </div>
      </div>

      <AddPaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        onSuccess={refreshData}
        patients={patients}
      />
      <AddFinancialRecordModal
        isOpen={isFinancialModalOpen}
        onClose={() => setFinancialModalOpen(false)}
        onSuccess={refreshData}
      />
      <EditPaymentModal
        payment={editingPayment}
        isOpen={!!editingPayment}
        onClose={() => setEditingPayment(null)}
        onSuccess={refreshData}
      />
      <EditFinancialRecordModal
        record={editingFinancialRecord}
        isOpen={!!editingFinancialRecord}
        onClose={() => setEditingFinancialRecord(null)}
        onSuccess={refreshData}
      />
    </div>
  );
}
