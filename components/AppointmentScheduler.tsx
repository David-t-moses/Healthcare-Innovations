"use client";

import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { scheduleAppointment } from "@/lib/actions/appointment.actions";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

interface AppointmentSchedulerProps {
  patientId: string;
  staffId: string;
}

// const AppointmentSchedulerSkeleton = () => (
//   <div className="space-y-6 flex flex-col bg-gray-100 p-10 rounded-md shadow-md w-full max-w-[500px] mx-auto">
//     {/* Title Input */}
//     <div>
//       <Skeleton className="h-5 w-24 mb-2 bg-white" />
//       <Skeleton className="h-10 w-full rounded-md bg-white" />
//     </div>

//     {/* Calendar */}
//     <div className="w-full mx-auto">
//       <Skeleton className="h-5 w-24 mb-2" />
//       <div className="bg-white rounded-xl shadow-sm p-4">
//         <Skeleton className="h-[300px] w-full rounded-lg" />
//       </div>
//     </div>

//     {/* Time Input */}
//     <div>
//       <Skeleton className="h-5 w-24 mb-2" />
//       <Skeleton className="h-10 w-full rounded-md" />
//     </div>

//     {/* Notes Textarea */}
//     <div>
//       <Skeleton className="h-5 w-24 mb-2" />
//       <Skeleton className="h-32 w-full rounded-md" />
//     </div>

//     {/* Submit Button */}
//     <Skeleton className="h-10 w-full rounded-md" />
//   </div>
// );

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
      toast.error("Failed to schedule appointment, Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // if (isLoading) {
  //   return <AppointmentSchedulerSkeleton />;
  // }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 flex flex-col bg-gray-100 sm:p-10 p-4 rounded-md shadow-md w-full max-w-[500px] mx-auto"
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

      <div className="w-full mx-auto">
        <label className="block text-sm font-medium mb-2">Date</label>

        <div className="flex justify-center w-full">
          <div className="bg-white rounded-xl shadow-sm p-4 w-full max-w-md">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              disabled={(date) => date < new Date()}
              className="w-full"
              initialFocus
              fixedWeeks
            />
          </div>
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
