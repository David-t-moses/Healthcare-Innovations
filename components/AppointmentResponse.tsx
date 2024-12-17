"use client";

import { Button } from "@/components/ui/button";
import { respondToAppointment } from "@/lib/actions/appointment.actions";
import { AppointmentStatus } from "@prisma/client";
import { toast } from "sonner";

export default function AppointmentResponse({ appointment }) {
  const handleResponse = async (status: AppointmentStatus) => {
    try {
      const result = await respondToAppointment({
        appointmentId: appointment.id,
        status,
      });
      if (result.success) {
        toast.success(`Appointment ${status.toLowerCase()}`);
        window.location.reload();
      }
    } catch (error) {
      toast.error("Failed to update appointment");
    }
  };

  if (appointment.status !== "PENDING") {
    return null;
  }

  return (
    <div className="flex gap-2">
      <Button onClick={() => handleResponse("ACCEPTED")} variant="outline">
        Accept
      </Button>
      <Button onClick={() => handleResponse("DECLINED")} variant="destructive">
        Decline
      </Button>
    </div>
  );
}
