"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { AiOutlinePlus } from "react-icons/ai";
import LoadingSpinner from "@/components/LoadingSpinner";
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
import { MoreVertical, Pencil, Trash2 } from "lucide-react";

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

  useEffect(() => {
    initializePage();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setIsLoading(false);
    };

    fetchData();
  }, []);

  const initializePage = async () => {
    const [salesResponse, patientsResponse] = await Promise.all([
      getSalesData(),
      getPatients(),
    ]);

    if (salesResponse.success) {
      setSalesData(salesResponse.data);
    } else {
      toast.error(salesResponse.error);
    }

    if (patientsResponse.success) {
      setPatients(patientsResponse.data);
    } else {
      toast.error(patientsResponse.error);
    }
  };

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
        toast.error("Failed to delete record");
      }
    }
  };

  if (isLoading) {
    return <LoadingSpinner message="Loading sales data..." />;
  }

  const totalRevenue = salesData?.payments?.reduce(
    (sum, payment) => sum + Number(payment.amount),
    0
  );

  return (
    <div className="max-w-7xl mx-auto p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-900">Sales & Finance</h1>
        <p className="text-gray-600 mt-2">
          Track payments and financial records
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-white p-6 rounded-lg shadow-md"
        >
          <h3 className="text-lg font-semibold text-gray-600">Total Revenue</h3>
          <p className="text-3xl font-bold text-green-600">
            ${totalRevenue.toFixed(2)}
          </p>
        </motion.div>
      </div>

      <div className="flex justify-between items-center mb-8">
        <div className="flex space-x-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveTab("payments")}
            className={`px-6 py-3 rounded-lg font-medium ${
              activeTab === "payments"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-900"
            }`}
          >
            Payments
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveTab("financial")}
            className={`px-6 py-3 rounded-lg font-medium ${
              activeTab === "financial"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-900"
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
          className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2"
        >
          <AiOutlinePlus className="w-5 h-5" />
          {activeTab === "payments" ? "Record Payment" : "Add Financial Record"}
        </motion.button>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {activeTab === "payments" ? (
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Patient
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Payment Method
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {salesData.payments.map((payment) => (
                <tr key={payment.id}>
                  <td className="px-6 py-4">{payment.patient.name}</td>
                  <td className="px-6 py-4">
                    ${Number(payment.amount).toFixed(2)}
                  </td>
                  <td className="px-6 py-4">
                    {format(new Date(payment.date), "PPp")}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium
                      ${
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
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(payment)}>
                          <Pencil className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => handleDelete(payment.id)}
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
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {salesData.financialRecords.map((record) => (
                <tr key={record.id}>
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
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(record)}>
                          <Pencil className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => handleDelete(record.id)}
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
      </div>

      <AddPaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        patients={patients}
      />
      <AddFinancialRecordModal
        isOpen={isFinancialModalOpen}
        onClose={() => setFinancialModalOpen(false)}
      />
      <EditPaymentModal
        payment={editingPayment}
        open={!!editingPayment}
        onClose={() => setEditingPayment(null)}
        onUpdate={initializePage}
      />
      <EditFinancialRecordModal
        record={editingFinancialRecord}
        open={!!editingFinancialRecord}
        onClose={() => setEditingFinancialRecord(null)}
        onUpdate={initializePage}
      />
    </div>
  );
}
