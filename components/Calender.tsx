"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Calendar as BigCalendar, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay, addMinutes } from "date-fns";
import { enUS } from "date-fns/locale/en-US";
import "react-big-calendar/lib/css/react-big-calendar.css";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { PatientSelect } from "@/components/PatientSelect";
import { scheduleAppointment } from "@/lib/actions/appointment.actions";
import { toast } from "sonner";

const locales = {
  "en-US": enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

export default function Calendar({ userId }: any) {
  const [events, setEvents] = useState([]);
  const router = useRouter();

  const handleSelectSlot = (slotInfo) => {
    const selectedDate = new Date(slotInfo.start);
    const formattedDate = selectedDate.toISOString().split("T")[0];
    router.push(`/appointments/schedule?date=${formattedDate}`);
  };

  return (
    <div className="h-[600px]">
      <BigCalendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: "100%" }}
        selectable
        onSelectSlot={handleSelectSlot}
        onNavigate={(date) => {
          const formattedDate = new Date(date).toISOString().split("T")[0];
          router.push(`/appointment/schedule?date=${formattedDate}`);
        }}
      />
    </div>
  );
}
