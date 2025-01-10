"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createPrescription } from "@/lib/actions/prescription.actions";
import { PatientSelect } from "./PatientSelect";

export default function AddPrescriptionModal({ open, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    patientId: "",
    medication: "",
    dosage: "",
    duration: "",
    notes: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const newPrescription = await createPrescription(formData);
    if (onSuccess) onSuccess(newPrescription);
    setIsSubmitting(false);
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
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
            <h2 className="text-2xl font-bold mb-6">Add New Prescription</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <PatientSelect
                value={formData.patientId}
                onChange={(value) =>
                  setFormData({ ...formData, patientId: value })
                }
              />
              <div>
                <Label>Medication</Label>
                <Input
                  value={formData.medication}
                  onChange={(e) =>
                    setFormData({ ...formData, medication: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <Label>Dosage</Label>
                <Input
                  value={formData.dosage}
                  onChange={(e) =>
                    setFormData({ ...formData, dosage: e.target.value })
                  }
                  placeholder="e.g., 500mg twice daily"
                  required
                />
              </div>
              <div>
                <Label>Duration</Label>
                <Input
                  value={formData.duration}
                  onChange={(e) =>
                    setFormData({ ...formData, duration: e.target.value })
                  }
                  placeholder="e.g., 7 days"
                  required
                />
              </div>
              <div>
                <Label>Notes</Label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  placeholder="Additional instructions or notes"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? "Adding prescription.." : "Add prescription"}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
