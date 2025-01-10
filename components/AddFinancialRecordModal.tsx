"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { toast } from "sonner";
import {
  createFinancialRecord,
  getSalesData,
} from "@/lib/actions/sales.actions";

export default function AddFinancialRecordModal({
  isOpen,
  onClose,
  onSuccess,
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [salesData, setSalesData] = useState({
    payments: [],
    financialRecords: [],
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.target);

    try {
      const result = await createFinancialRecord({
        type: formData.get("type") as string,
        amount: Number(formData.get("amount")),
        date: new Date(formData.get("date") as string),
      });

      if (result.success) {
        toast.success("Financial record added successfully");
        if (onSuccess) await onSuccess();
        onClose();
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error("Failed to add financial record");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        >
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.95 }}
            className="bg-white rounded-lg p-6 w-full max-w-md"
          >
            <h2 className="text-2xl font-bold mb-6">Add Financial Record</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Type</label>
                <select
                  name="type"
                  className="w-full p-2 border rounded-lg"
                  required
                >
                  <option value="">Select Type</option>
                  <option value="INCOME">Income</option>
                  <option value="EXPENSE">Expense</option>
                  <option value="SALARY">Salary Payment</option>
                  <option value="UTILITIES">Utilities</option>
                  <option value="SUPPLIES">Medical Supplies</option>
                  <option value="EQUIPMENT">Equipment Purchase</option>
                  <option value="MAINTENANCE">Maintenance</option>
                  <option value="INSURANCE">Insurance</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Amount</label>
                <input
                  name="amount"
                  type="number"
                  step="0.01"
                  className="w-full p-2 border rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Date</label>
                <input
                  name="date"
                  type="date"
                  className="w-full p-2 border rounded-lg"
                  required
                />
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? "Adding Record..." : "Add Record"}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
