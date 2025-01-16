"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Calendar as BigCalendar, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay, addMinutes } from "date-fns";
import { enUS } from "date-fns/locale/en-US";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { getSystemPreferences } from "@/lib/actions/settings.actions";
import { Skeleton } from "@/components/ui/skeleton";

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
  const [preferences, setPreferences] = useState({
    calendarView: "week",
    timeZone: "UTC",
  });
  const [loading, setLoading] = useState(true);

  const router = useRouter();

  useEffect(() => {
    const loadPreferences = async () => {
      setLoading(true);
      try {
        const userPreferences = await getSystemPreferences();
        if (userPreferences?.systemPreferences) {
          setPreferences({
            calendarView:
              userPreferences.systemPreferences.calendarView.toLowerCase(),
            timeZone: userPreferences.systemPreferences.timeZone,
          });
        }
      } catch (error) {
        console.error("Error loading preferences:", error);
      } finally {
        setLoading(false);
      }
    };

    loadPreferences();
  }, []);

  const handleSelectSlot = (slotInfo) => {
    const selectedDate = new Date(slotInfo.start);
    const formattedDate = selectedDate.toISOString().split("T")[0];
    router.push(`/appointments/schedule?date=${formattedDate}`);
  };

  if (loading) {
    return (
      <div className="h-[600px] space-y-4 p-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-8 w-48" />
        </div>
        <div className="grid grid-cols-7 gap-4">
          {[...Array(7)].map((_, i) => (
            <Skeleton key={i} className="h-6 w-full" />
          ))}
        </div>
        <div className="grid grid-cols-7 gap-4 mt-2">
          {[...Array(35)].map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      </div>
    );
  }

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
        defaultView={preferences.calendarView}
        view={preferences.calendarView}
        timezone={preferences.timeZone}
        onNavigate={(date) => {
          const formattedDate = new Date(date).toISOString().split("T")[0];
          router.push(`/appointment/schedule?date=${formattedDate}`);
        }}
      />
    </div>
  );
}
