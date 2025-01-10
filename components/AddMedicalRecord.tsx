"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createMedicalRecord } from "@/lib/actions/medical-record.actions";
import { PatientSelect } from "./PatientSelect";

export default function AddMedicalRecord({ open, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    patientId: "",
    diagnosis: "",
    symptoms: "",
    treatment: "",
    notes: "",
    attachments: [],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const newRecord = await createMedicalRecord(formData);
    if (onSuccess) onSuccess(newRecord);
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
            <h2 className="text-2xl font-bold mb-6">Add Medical Record</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <PatientSelect
                value={formData.patientId}
                onChange={(value) =>
                  setFormData({ ...formData, patientId: value })
                }
              />
              <div>
                <Label>Diagnosis</Label>
                <Input
                  value={formData.diagnosis}
                  onChange={(e) =>
                    setFormData({ ...formData, diagnosis: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <Label>Symptoms</Label>
                <Textarea
                  value={formData.symptoms}
                  onChange={(e) =>
                    setFormData({ ...formData, symptoms: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <Label>Treatment</Label>
                <Textarea
                  value={formData.treatment}
                  onChange={(e) =>
                    setFormData({ ...formData, treatment: e.target.value })
                  }
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
                  placeholder="Additional notes or observations"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? <>Creating Record...</> : "Create Record"}
                </Button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
