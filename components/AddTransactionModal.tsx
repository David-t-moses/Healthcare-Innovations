"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2 } from "lucide-react";
import {
  createPayment,
  createExpense,
  getPatients,
} from "@/lib/actions/sales.actions";
import { useRouter } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { toast } from "sonner";

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddTransactionModal({
  isOpen,
  onClose,
}: AddTransactionModalProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [patients, setPatients] = useState<{ id: string; name: string }[]>([]);
  const [formData, setFormData] = useState({
    patientId: "",
    customerName: "",
    beneficiary: "", // For outgoing payments
    amount: "",
    status: "pending",
    paymentMethod: "credit_card",
    serviceDescription: "", // Use this for both incoming and outgoing
    dueDate: "",
    paymentType: "incoming",
  });

  // // Fetch patients when modal opens
  // useState(() => {
  //   async function fetchPatients() {
  //     const response = await getPatients();
  //     if (response.success) {
  //       setPatients(response.data);
  //     }
  //   }

  //   if (isOpen) {
  //     fetchPatients();
  //   }
  // });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      console.log("Getting current user...");
      const user = await getCurrentUser();
      console.log("Current user result:", user);

      if (!user) {
        console.log("No user found - session may be invalid");
        toast.error("You must be logged in to add a transaction");
        return;
      }

      const userId = user?.id;

      if (formData.paymentType === "incoming") {
        // Handle incoming payment (revenue)
        const response = await createPayment({
          customerName: formData.customerName,
          amount: parseFloat(formData.amount),
          status: formData.status,
          paymentMethod: formData.paymentMethod,
          userId,
          description: formData.serviceDescription,
          paymentType: "incoming",
          dueDate: formData.dueDate ? new Date(formData.dueDate) : undefined,
        });

        if (response.success) {
          toast.success("Revenue transaction added successfully");
          router.refresh();
          onClose();
        } else {
          toast.error(response.error || "Failed to add transaction");
        }
      } else {
        // Handle outgoing payment (expense)
        const response = await createExpense({
          amount: parseFloat(formData.amount),
          description: formData.serviceDescription, // Use serviceDescription for description
          paymentMethod: formData.paymentMethod,
          userId,
          paymentType: "outgoing",
          beneficiary: formData.beneficiary, // Pass the beneficiary
        });

        if (response.success) {
          toast.success("Expense transaction added successfully");
          router.refresh();
          onClose();
        } else {
          toast.error(response.error || "Failed to add expense");
        }
      }
    } catch (error) {
      console.error("Error adding transaction:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 bg-black/30"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
            />

            {/* Modal */}
            <motion.div
              className="relative w-full max-w-md transform overflow-hidden rounded-lg bg-white p-6 text-left shadow-xl transition-all"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Add New Transaction
                </h3>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label
                    htmlFor="paymentType"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Payment Type
                  </label>
                  <select
                    id="paymentType"
                    name="paymentType"
                    value={formData.paymentType}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                  >
                    <option value="incoming">Incoming (Revenue)</option>
                    <option value="outgoing">Outgoing (Expense)</option>
                  </select>
                </div>

                {/* Conditional field based on payment type */}
                {formData.paymentType === "incoming" ? (
                  <div>
                    <label
                      htmlFor="customerName"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Customer Name
                    </label>
                    <input
                      type="text"
                      id="customerName"
                      name="customerName"
                      value={formData.customerName}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                      placeholder="Enter customer name"
                    />
                  </div>
                ) : (
                  <div>
                    <label
                      htmlFor="beneficiary"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Beneficiary
                    </label>
                    <input
                      type="text"
                      id="beneficiary"
                      name="beneficiary"
                      value={formData.beneficiary}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                      placeholder="Enter beneficiary name"
                    />
                  </div>
                )}

                <div>
                  <label
                    htmlFor="amount"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Amount ($)
                  </label>
                  <input
                    type="number"
                    id="amount"
                    name="amount"
                    required
                    min="0"
                    step="0.01"
                    value={formData.amount}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label
                    htmlFor="serviceDescription"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Description
                  </label>
                  <textarea
                    id="serviceDescription"
                    name="serviceDescription"
                    rows={2}
                    value={formData.serviceDescription}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                    placeholder={
                      formData.paymentType === "incoming"
                        ? "e.g., Consultation, Prescription, Medical Equipment"
                        : "e.g., Supplies, Rent, Utilities, Salaries"
                    }
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {formData.paymentType === "incoming" && (
                    <div>
                      <label
                        htmlFor="status"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Payment Status
                      </label>
                      <select
                        id="status"
                        name="status"
                        required
                        value={formData.status}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                      >
                        <option value="paid">Paid</option>
                        <option value="pending">Pending</option>
                        <option value="overdue">Overdue</option>
                      </select>
                    </div>
                  )}

                  <div>
                    <label
                      htmlFor="paymentMethod"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Payment Method
                    </label>
                    <select
                      id="paymentMethod"
                      name="paymentMethod"
                      required
                      value={formData.paymentMethod}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                    >
                      <option value="credit_card">Credit Card</option>
                      <option value="cash">Cash</option>
                      <option value="insurance">Insurance</option>
                      <option value="bank_transfer">Bank Transfer</option>
                    </select>
                  </div>
                </div>

                {formData.paymentType === "incoming" &&
                  formData.status !== "paid" && (
                    <div>
                      <label
                        htmlFor="dueDate"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Due Date
                      </label>
                      <input
                        type="date"
                        id="dueDate"
                        name="dueDate"
                        value={formData.dueDate}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                      />
                    </div>
                  )}

                <div className="mt-6 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-75"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Processing...
                      </>
                    ) : (
                      "Add Transaction"
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
