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
import { updateMedicalRecord } from "@/lib/actions/medical-record.actions";

export default function EditMedicalRecordModal({
  record,
  open,
  onClose,
  onUpdate,
}) {
  const [formData, setFormData] = useState({
    diagnosis: record?.diagnosis || "",
    symptoms: record?.symptoms || "",
    treatment: record?.treatment || "",
    notes: record?.notes || "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await updateMedicalRecord(record.id, formData);
    onUpdate();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Medical Record</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Diagnosis</label>
            <Input
              value={formData.diagnosis}
              onChange={(e) =>
                setFormData({ ...formData, diagnosis: e.target.value })
              }
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium">Symptoms</label>
            <Textarea
              value={formData.symptoms}
              onChange={(e) =>
                setFormData({ ...formData, symptoms: e.target.value })
              }
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium">Treatment</label>
            <Textarea
              value={formData.treatment}
              onChange={(e) =>
                setFormData({ ...formData, treatment: e.target.value })
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
            <Button type="submit">Update Record</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
