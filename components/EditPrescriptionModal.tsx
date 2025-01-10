"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { updatePrescription } from "@/lib/actions/prescription.actions";

export default function EditPrescriptionModal({
  prescription,
  open,
  onClose,
  onUpdate,
}) {
  const [formData, setFormData] = useState({
    medication: prescription?.medication || "",
    dosage: prescription?.dosage || "",
    duration: prescription?.duration || "",
    notes: prescription?.notes || "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    await updatePrescription(prescription.id, formData);
    onUpdate();
    setIsSubmitting(false);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Prescription</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Medication</label>
            <Input
              value={formData.medication}
              onChange={(e) =>
                setFormData({ ...formData, medication: e.target.value })
              }
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium">Dosage</label>
            <Input
              value={formData.dosage}
              onChange={(e) =>
                setFormData({ ...formData, dosage: e.target.value })
              }
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium">Duration</label>
            <Input
              value={formData.duration}
              onChange={(e) =>
                setFormData({ ...formData, duration: e.target.value })
              }
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium">Notes</label>
            <Textarea
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? "Recording Payment..." : "Record Payment"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
