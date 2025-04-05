"use client";

import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { useRouter } from "next/navigation";
import { Calendar as CalendarIcon } from "lucide-react";

export default function DashboardCalendar() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const router = useRouter();

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      // Format the date as YYYY-MM-DD for the URL
      const formattedDate = date.toISOString().split("T")[0];
      router.push(`/appointments/schedule?date=${formattedDate}`);
    }
    setSelectedDate(date);
  };

  return (
    <div className="bg-transparent rounded-lg p-4 pt-6">
      <div className="mb-2">
        <h3 className="text-sm font-medium text-gray-800 flex items-center">
          <CalendarIcon className="h-4 w-4 mr-2 text-blue-600" />
          Schedule Appointment
        </h3>
      </div>

      <p className="text-sm text-gray-600 mb-4">
        Select a date to schedule a new appointment
      </p>

      <div className="w-full">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={handleDateSelect}
          disabled={(date) => date < new Date()}
          className="w-full border-none"
          initialFocus
          fixedWeeks
        />
      </div>
    </div>
  );
}
