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
import { createMedicalRecord } from "@/lib/actions/medical-record.actions";
import { PatientSelect } from "./PatientSelect";

export default function AddMedicalRecordModal({ open, onClose }) {
  const [formData, setFormData] = useState({
    patientId: "",
    diagnosis: "",
    symptoms: "",
    treatment: "",
    notes: "",
    attachments: [],
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await createMedicalRecord(formData);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Medical Record</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <PatientSelect
            value={formData.patientId}
            onChange={(value) => setFormData({ ...formData, patientId: value })}
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

          <Button type="submit">Create Record</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
