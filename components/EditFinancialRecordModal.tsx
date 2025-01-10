"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { toast } from "sonner";
import { updateFinancialRecord } from "@/lib/actions/sales.actions";

export default function EditFinancialRecordModal({
  record,
  isOpen,
  onClose,
  onUpdate,
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    type: record?.type || "",
    amount: record?.amount || 0,
    date: record?.date ? new Date(record.date).toISOString().split("T")[0] : "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const result = await updateFinancialRecord(record.id, {
        ...formData,
        amount: parseFloat(formData.amount),
        date: new Date(formData.date),
      });

      if (result.success) {
        toast.success("Financial record updated successfully");
        onUpdate();
        onClose();
      } else {
        toast.error(result.error);
      }
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
            <h2 className="text-2xl font-bold mb-6">Edit Financial Record</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Type</label>
                <select
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value })
                  }
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
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData({ ...formData, amount: e.target.value })
                  }
                  className="w-full p-2 border rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Date</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
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
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50"
                >
                  {isSubmitting ? "Updating Record..." : "Update Record"}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
