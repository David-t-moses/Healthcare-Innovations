"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createPrescription } from "@/lib/actions/prescription.actions";
import { PatientSelect } from "./PatientSelect";

export default function AddPrescriptionModal({ open, onClose }) {
  const [formData, setFormData] = useState({
    patientId: "",
    medication: "",
    dosage: "",
    duration: "",
    notes: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await createPrescription(formData);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Prescription</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <PatientSelect
            value={formData.patientId}
            onChange={(value) => setFormData({ ...formData, patientId: value })}
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

          <Button type="submit">Create Prescription</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
