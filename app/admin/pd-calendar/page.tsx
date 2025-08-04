"use client";

import { useState, useEffect } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { supabase } from "@/lib/supabaseClient";
import "react-big-calendar/lib/css/react-big-calendar.css";

const locales = {
  "en-AU": require("date-fns/locale/en-AU"),
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

interface CalendarEvent {
  title: string;
  start: Date;
  end: Date;
}

export default function PDCalendarClient() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);

  useEffect(() => {
    const fetchEvents = async () => {
      const { data, error } = await supabase.from("pd_events").select("*");
      if (!error && data) {
        const formatted = data.map((event) => ({
          title: event.title,
          start: new Date(event.start_time),
          end: new Date(event.end_time),
        }));
        setEvents(formatted);
      }
    };

    fetchEvents();
  }, []);

  return (
    <Calendar
      localizer={localizer}
      events={events}
      startAccessor="start"
      endAccessor="end"
      style={{ height: 600 }}
    />
  );
}
