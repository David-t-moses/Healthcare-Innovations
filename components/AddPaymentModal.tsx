"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { toast } from "sonner";
import { createPayment, getSalesData } from "@/lib/actions/sales.actions";
import { getCurrentUser } from "@/lib/auth";

interface AddPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (data: any) => void;
  patients?: any[];
}

export default function AddPaymentModal({
  isOpen,
  onClose,
  onSuccess,
  patients,
}: AddPaymentModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.target);

    try {
      const user = await getCurrentUser();
      const userId = user?.id;

      const result = await createPayment({
        patientId: formData.get("patientId") as string,
        amount: Number(formData.get("amount")),
        status: formData.get("status") as string,
        paymentMethod: formData.get("paymentMethod") as string,
        userId: userId,
      });

      if (result.success) {
        toast.success("Payment recorded successfully");
        if (onSuccess) await onSuccess();
        onClose();
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error("Failed to record payment");
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
            <h2 className="text-2xl font-bold mb-6">Record New Payment</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Patient
                </label>
                <select
                  name="patientId"
                  className="w-full p-2 border rounded-lg"
                  required
                >
                  <option value="">Select Patient</option>
                  {patients?.map((patient) => (
                    <option key={patient.id} value={patient.id}>
                      {patient.name}
                    </option>
                  ))}
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
                <label className="block text-sm font-medium mb-1">Status</label>
                <select
                  name="status"
                  className="w-full p-2 border rounded-lg"
                  required
                >
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                  <option value="failed">Failed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Payment Method
                </label>
                <select
                  name="paymentMethod"
                  className="w-full p-2 border rounded-lg"
                  required
                >
                  <option value="cash">Cash</option>
                  <option value="card">Card</option>
                  <option value="insurance">Insurance</option>
                </select>
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
                  {isSubmitting ? <>Recording Payment...</> : "Record Payment"}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
