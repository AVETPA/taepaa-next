"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import useAuth from "@/hooks/useAuth";
import AdminLayout from "@/components/layout/AdminLayout";

export default function PDCalendarPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      if (authLoading) return;

      if (!user) {
        router.push("/login");
        return;
      }

      const { data, error } = await supabase
        .from("pd_events")
        .select("*")
        .order("start_time", { ascending: true });

      if (error) {
        console.error("Error loading events:", error.message);
        return;
      }

      setEvents(data || []);
      setLoading(false);
    };

    fetchEvents();
  }, [user, authLoading, router]);

  if (authLoading || loading) {
    return <div className="text-center mt-10 text-teal-600">Loading PD Calendar...</div>;
  }

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto py-10">
        <h1 className="text-3xl font-bold text-[#044b4f] mb-6">PD Calendar</h1>
        {/* Render your calendar component or event list here */}
        <ul className="space-y-4">
          {events.map((event) => (
            <li key={event.id} className="bg-white p-4 rounded shadow">
              <h2 className="text-lg font-semibold text-[#007a7c]">{event.title}</h2>
              <p className="text-sm text-gray-600">
                {new Date(event.start_time).toLocaleString()} –{" "}
                {new Date(event.end_time).toLocaleString()}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </AdminLayout>
  );
}
