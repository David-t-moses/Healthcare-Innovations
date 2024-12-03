"use client";

import { useEffect, useState } from "react";
import { Calendar as BigCalendar, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import enUS from "date-fns/locale/en-US";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

export default function Calendar() {
  const [events, setEvents] = useState([]);
  const [patients, setPatients] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState("");
  const [notes, setNotes] = useState("");
  const supabase = createClientComponentClient();

  useEffect(() => {
    fetchEvents();
    fetchPatients();
    setupRealtimeSubscription();
  }, []);

  const fetchEvents = async () => {
    const { data } = await supabase.from("appointments").select(`
        *,
        patients (
          name
        )
      `);
    setEvents(
      data?.map((event) => ({
        ...event,
        start: new Date(event.scheduled_for),
        end: new Date(new Date(event.scheduled_for).getTime() + 30 * 60000),
        title: event.patients?.name,
      })) || []
    );
  };

  const fetchPatients = async () => {
    const { data } = await supabase.from("patients").select("id, name");
    setPatients(data || []);
  };

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel("appointments")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "appointments" },
        () => fetchEvents()
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  };

  const handleSelectSlot = (slotInfo) => {
    setSelectedSlot(slotInfo);
    setIsDialogOpen(true);
  };

  const handleSchedule = async () => {
    if (!selectedPatient || !selectedSlot) return;

    await supabase.from("appointments").insert({
      patient_id: selectedPatient,
      scheduled_for: selectedSlot.start,
      notes,
      status: "scheduled",
    });

    setIsDialogOpen(false);
    setSelectedSlot(null);
    setSelectedPatient("");
    setNotes("");
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
            <Select value={selectedPatient} onValueChange={setSelectedPatient}>
              <SelectTrigger>
                <SelectValue placeholder="Select Patient" />
              </SelectTrigger>
              <SelectContent>
                {patients.map((patient) => (
                  <SelectItem key={patient.id} value={patient.id}>
                    {patient.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
