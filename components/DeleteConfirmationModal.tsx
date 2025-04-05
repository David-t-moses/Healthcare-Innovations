"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Loader2 } from "lucide-react";

export function DeleteConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Deletion",
  description = "Are you sure you want to delete this item? This action cannot be undone.",
  cancelText = "Cancel",
  confirmText = "Delete",
  isDangerous = true,
  itemToDelete,
  onCancel,
  onSuccess,
  onError,
}: DeleteConfirmationModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirm = async () => {
    try {
      setIsDeleting(true);
      await onConfirm();
      onSuccess?.();
      onClose();
    } catch (error) {
      onError?.(error as Error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 flex items-center justify-center z-50"
          >
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h2 className="text-xl font-bold mb-4">{title}</h2>
              <p className="text-gray-600 mb-6">
                {itemToDelete ? (
                  <>
                    Are you sure you want to delete{" "}
                    <strong>{itemToDelete}</strong>?
                    <br />
                    {description}
                  </>
                ) : (
                  description
                )}
              </p>
              <div className="flex justify-end gap-4">
                <button
                  onClick={onClose}
                  disabled={isDeleting}
                  className="px-4 py-2 text-gray-600 border rounded-lg hover:bg-gray-50"
                >
                  {cancelText}
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={isDeleting}
                  className={`px-4 py-2 rounded-lg flex items-center ${
                    isDangerous
                      ? "bg-red-600 text-white hover:bg-red-700"
                      : "bg-primary text-white hover:bg-primary/90"
                  } ${isDeleting ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  {isDeleting && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {isDeleting ? "Deleting..." : confirmText}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
