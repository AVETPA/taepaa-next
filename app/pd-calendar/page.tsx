import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import useAuth from "../hooks/useAuth";

export default function PDCalendar() {
  const [events, setEvents] = useState([]);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvents = async () => {
      const { data, error } = await supabase.from("events").select("*").order("date", { ascending: true });
      if (error) console.error("Error fetching events:", error);
      else setEvents(data || []);
    };
    fetchEvents();
  }, []);

  const register = async (eventId) => {
    if (!user) return navigate("/login");

    const selected = events.find((e) => e.id === eventId);
    if (!selected) return;

    // Add to registrations
    const { error: regError } = await supabase.from("event_registrations").insert([{
      event_id: eventId,
      user_id: user.id,
      name: user.user_metadata?.firstName + " " + user.user_metadata?.surname || "Registered User",
      email: user.email,
      timestamp: new Date().toISOString(),
    }]);

    if (regError) {
      console.error("Registration error:", regError);
      return alert("Registration failed. Please try again.");
    }

    // Add to trainer PD records (section 7)
    const { error: pdError } = await supabase.from("trainer_pd_section7").insert([{
      user_id: user.id,
      event_id: eventId,
      title: selected.title,
      provider: selected.provider || "AVETPA",
      date: selected.date,
      type: selected.type,
      certificate_issued: false,
      completed: false,
      created_at: new Date().toISOString(),
    }]);

    if (pdError) {
      console.error("PD record error:", pdError);
      return alert("Registration saved, but failed to add to your PD record.");
    }

    alert("Registered successfully! This event has been added to your PD record.");
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Upcoming Professional Development</h1>

      {events.length === 0 ? (
        <div className="text-gray-600 bg-gray-50 p-6 rounded border text-center shadow">
          <p>No PD events are currently scheduled.</p>
          <p className="text-sm mt-2">
            Please check back soon or browse <a href="/resources" className="text-teal-600 underline">Trainer Resources</a>.
          </p>
        </div>
      ) : (
        <div className="grid gap-6">
          {events.map((event) => (
            <div key={event.id} className="border p-4 rounded shadow bg-white">
              <h2 className="text-lg font-semibold">{event.title}</h2>
              <p className="text-sm text-gray-600">{event.date} • {event.type}</p>
              <p className="my-2">{event.description}</p>
              <button
                onClick={() => register(event.id)}
                className="bg-teal-600 text-white px-4 py-2 rounded hover:bg-teal-700"
              >
                Register
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
