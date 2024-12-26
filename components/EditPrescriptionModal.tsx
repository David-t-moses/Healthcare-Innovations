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

  const handleSubmit = async (e) => {
    e.preventDefault();
    await updatePrescription(prescription.id, formData);
    onUpdate();
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
            <Button type="submit">Update Prescription</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
