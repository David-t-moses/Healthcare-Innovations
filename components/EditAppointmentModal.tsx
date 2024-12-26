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
import { updateAppointment } from "@/lib/actions/appointment.actions";

export default function EditAppointmentModal({
  appointment,
  open,
  onClose,
  onUpdate,
}) {
  const [formData, setFormData] = useState({
    title: appointment?.title || "",
    startTime: appointment?.startTime
      ? new Date(appointment.startTime).toISOString().slice(0, 16)
      : "",
    endTime: appointment?.endTime
      ? new Date(appointment.endTime).toISOString().slice(0, 16)
      : "",
    notes: appointment?.notes || "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await updateAppointment(appointment.id, {
      ...formData,
      startTime: new Date(formData.startTime),
      endTime: new Date(formData.endTime),
    });
    onUpdate();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Appointment</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Title</label>
            <Input
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium">Start Time</label>
            <Input
              type="datetime-local"
              value={formData.startTime}
              onChange={(e) =>
                setFormData({ ...formData, startTime: e.target.value })
              }
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium">End Time</label>
            <Input
              type="datetime-local"
              value={formData.endTime}
              onChange={(e) =>
                setFormData({ ...formData, endTime: e.target.value })
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
            <Button type="submit">Update Appointment</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
