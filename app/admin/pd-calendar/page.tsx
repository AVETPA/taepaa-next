"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import useAuth from "@/hooks/useAuth";

type PdEvent = {
  id: string;
  title: string;
  date: string;
  type: string;
  banner_url?: string;
};

export default function PDCalendarPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [events, setEvents] = useState<PdEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      const { data, error } = await supabase
        .from("pd_events")
        .select("*")
        .order("date", { ascending: true });

      if (error) {
        console.error("Error fetching events:", error.message);
      } else {
        setEvents(data as PdEvent[]);
      }

      setLoading(false);
    };

    fetchEvents();
  }, []);

  if (loading) {
    return <div className="text-center mt-10 text-teal-600">Loading PD Events...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-[#044b4f] mb-6">PD Calendar</h1>

      {events.length === 0 ? (
        <p className="text-gray-500">No events scheduled.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <div
              key={event.id}
              className="bg-white rounded-lg shadow hover:shadow-md transition cursor-pointer"
              onClick={() => router.push(`/event-detail/${event.id}`)}
            >
              {event.banner_url && (
                <img
                  src={event.banner_url}
                  alt={event.title}
                  className="rounded-t-lg w-full h-40 object-cover"
                />
              )}
              <div className="p-4">
                <h2 className="text-lg font-bold text-[#044b4f]">{event.title}</h2>
                <p className="text-sm text-gray-500">{new Date(event.date).toLocaleDateString()}</p>
                <p className="text-sm text-gray-600 mt-1">{event.type}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
