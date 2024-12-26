"use client";

import { useEffect, useState } from "react";
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
import {
  scheduleAppointment,
  getAppointments,
} from "@/lib/actions/appointment.actions";
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
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState("");
  const [notes, setNotes] = useState("");

  const handleSelectSlot = (slotInfo) => {
    setSelectedSlot(slotInfo);
    setIsDialogOpen(true);
  };

  const handleSchedule = async () => {
    if (!selectedPatient || !selectedSlot) return;

    const appointmentData = {
      title: "Medical Appointment",
      startTime: selectedSlot.start,
      endTime: addMinutes(selectedSlot.start, 30),
      notes,
      patientId: selectedPatient,
      userId: userId,
    };

    console.log("Scheduling appointment with data:", appointmentData);

    const result = await scheduleAppointment(appointmentData);

    if (result.success) {
      toast.success("Appointment scheduled successfully");

      setIsDialogOpen(false);
      setSelectedSlot(null);
      setSelectedPatient("");
      setNotes("");
    } else {
      toast.error("Failed to schedule appointment");
    }
  };

  return (
    <>
      <div className="h-[600px]">
        <BigCalendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: "100%" }}
          selectable
          onSelectSlot={handleSelectSlot}
        />
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Schedule Appointment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <PatientSelect
              value={selectedPatient}
              onChange={setSelectedPatient}
            />
            <Textarea
              placeholder="Appointment notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
            <Button onClick={handleSchedule}>Schedule Appointment</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
