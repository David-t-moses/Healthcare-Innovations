"use client";

import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { scheduleAppointment } from "@/lib/actions/appointment.actions";
import { toast } from "sonner";

interface AppointmentSchedulerProps {
  patientId: string;
  staffId: string;
}

export default function AppointmentScheduler({
  patientId,
  staffId,
}: AppointmentSchedulerProps) {
  const [title, setTitle] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState("");
  const [notes, setNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedDate || !selectedTime || !title) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsLoading(true);
    try {
      const startTime = new Date(selectedDate);
      const [hours, minutes] = selectedTime.split(":");
      startTime.setHours(parseInt(hours), parseInt(minutes));

      const endTime = new Date(startTime);
      endTime.setHours(startTime.getHours() + 1);

      const result = await scheduleAppointment({
        title,
        startTime,
        endTime,
        notes,
        patientId,
        userId: staffId,
      });

      if (result.success) {
        toast.success("Appointment scheduled successfully");

        setTitle("");
        setSelectedDate(undefined);
        setSelectedTime("");
        setNotes("");
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error("Failed to schedule appointment");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 bg-gray-100 p-10 rounded-md shadow-md w-full max-w-[400px] mx-auto"
    >
      <div>
        <label className="block text-sm font-medium mb-2">Title</label>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Appointment Title"
          required
        />
      </div>

      <div className="calendar-wrapper">
        <label className="block text-sm font-medium mb-2">Date</label>
        <div className="bg-white rounded-md border p-0 flex justify-center items-center">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            disabled={(date) => date < new Date()}
            className="w-full"
            initialFocus
            fixedWeeks
            weekStartsOn={0}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Time</label>
        <Input
          type="time"
          value={selectedTime}
          onChange={(e) => setSelectedTime(e.target.value)}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Notes</label>
        <Textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add appointment notes..."
        />
      </div>

      <Button type="submit" disabled={isLoading}>
        {isLoading ? "Scheduling..." : "Schedule Appointment"}
      </Button>
    </form>
  );
}
