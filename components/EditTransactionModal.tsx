"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  updatePaymentStatus,
  updateExpense,
  updatePayment,
} from "@/lib/actions/sales.actions";
import { getCurrentUser } from "@/lib/auth";
import { toast } from "sonner";

interface EditTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: any;
  onSuccess: () => void;
}

export default function EditTransactionModal({
  isOpen,
  onClose,
  transaction,
  onSuccess,
}: EditTransactionModalProps) {
  const [formData, setFormData] = useState({
    status: "",
    amount: "",
    serviceDescription: "",
    paymentMethod: "",
    customerName: "",
    beneficiary: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();

  useEffect(() => {
    if (transaction) {
      setFormData({
        status: transaction.status || "",
        amount: transaction.amount?.toString() || "",
        serviceDescription: transaction.serviceDescription || "",
        paymentMethod: transaction.paymentMethod || "",
        customerName: transaction.customerName || "",
        beneficiary: transaction.beneficiary || "",
      });
    }
  }, [transaction]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Get the current user
      const user = await getCurrentUser();

      if (!user) {
        toast.error("You must be logged in to edit a transaction");
        return;
      }

      if (transaction.paymentType === "incoming") {
        // Update incoming payment
        // First, check if status changed
        if (formData.status !== transaction.status) {
          const statusResult = await updatePaymentStatus(
            transaction.id,
            formData.status
          );
          if (!statusResult.success) {
            throw new Error(
              statusResult.error || "Failed to update payment status"
            );
          }
        }

        // Then update other payment details
        const updateResult = await updatePayment(transaction.id, {
          amount: parseFloat(formData.amount),
          description: formData.serviceDescription,
          paymentMethod: formData.paymentMethod,
          customerName: formData.customerName,
        });

        toast.success("Transaction updated successfully");
        onSuccess();
        router.refresh();
        onClose();

        if (!updateResult.success) {
          throw new Error(
            updateResult.error || "Failed to update payment details"
          );
        }
      } else {
        const result = await updateExpense(transaction.id, {
          amount: parseFloat(formData.amount),
          description: formData.serviceDescription,
          category: formData.serviceDescription,
        });

        toast.success("Transaction updated successfully");
        onSuccess();
        router.refresh();
        onClose();

        if (!result.success) {
          throw new Error(result.error || "Failed to update expense");
        }
      }

      toast.success("Transaction updated successfully");
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error updating transaction:", error);
      toast.error("Failed to update transaction");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/50 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-lg shadow-lg w-full max-w-md pointer-events-auto"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", duration: 0.3 }}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b">
                <h2 className="text-lg font-semibold text-gray-900">
                  {transaction?.paymentType === "incoming"
                    ? "Edit Revenue"
                    : "Edit Expense"}
                </h2>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-500 focus:outline-none"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-4">
                <div className="space-y-4">
                  {/* Only show status field for incoming payments */}
                  {transaction?.paymentType === "incoming" && (
                    <div>
                      <label
                        htmlFor="status"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Status
                      </label>
                      <select
                        id="status"
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                        className="w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                      >
                        <option value="paid">Paid</option>
                        <option value="pending">Pending</option>
                        <option value="overdue">Overdue</option>
                      </select>
                    </div>
                  )}

                  <div>
                    <label
                      htmlFor="amount"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Amount
                    </label>
                    <input
                      type="number"
                      id="amount"
                      name="amount"
                      value={formData.amount}
                      onChange={handleChange}
                      className="w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                      step="0.01"
                    />
                  </div>

                  {/* Show customer name for incoming payments */}
                  {transaction?.paymentType === "incoming" && (
                    <div>
                      <label
                        htmlFor="customerName"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Customer Name
                      </label>
                      <input
                        type="text"
                        id="customerName"
                        name="customerName"
                        value={formData.customerName}
                        onChange={handleChange}
                        className="w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                      />
                    </div>
                  )}

                  {/* Show beneficiary for outgoing payments */}
                  {transaction?.paymentType === "outgoing" && (
                    <div>
                      <label
                        htmlFor="beneficiary"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Beneficiary
                      </label>
                      <input
                        type="text"
                        id="beneficiary"
                        name="beneficiary"
                        value={formData.beneficiary}
                        onChange={handleChange}
                        className="w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                      />
                    </div>
                  )}

                  {/* Payment method for incoming payments */}
                  {transaction?.paymentType === "incoming" && (
                    <div>
                      <label
                        htmlFor="paymentMethod"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Payment Method
                      </label>
                      <select
                        id="paymentMethod"
                        name="paymentMethod"
                        value={formData.paymentMethod}
                        onChange={handleChange}
                        className="w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                      >
                        <option value="cash">Cash</option>
                        <option value="card">Card</option>
                        <option value="transfer">Bank Transfer</option>
                        <option value="mobile">Mobile Payment</option>
                      </select>
                    </div>
                  )}

                  <div>
                    <label
                      htmlFor="serviceDescription"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      {transaction?.paymentType === "incoming"
                        ? "Description"
                        : "Category/Description"}
                    </label>
                    <textarea
                      id="serviceDescription"
                      name="serviceDescription"
                      value={formData.serviceDescription}
                      onChange={handleChange}
                      rows={3}
                      className="w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                    />
                  </div>
                </div>

                {/* Footer */}
                <div className="mt-5 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? "Updating..." : "Update Transaction"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
