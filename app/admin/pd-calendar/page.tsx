import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import enAU from "date-fns/locale/en-AU";
import "react-big-calendar/lib/css/react-big-calendar.css";
import AdminLayout from "../../components/layout/AdminLayout";
import useAuth from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import EventFormModal from "../../components/admin/EventFormModal";

const locales = { "en-AU": enAU };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });

export default function PDCalendar() {
  const [events, setEvents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const { user } = useAuth();
  const navigate = useNavigate();

  const fetchEvents = async () => {
    const { data: eventsData, error } = await supabase.from("events").select("*");

    if (error) {
      console.error("Error fetching events:", error.message);
      return;
    }

   const enriched = await Promise.all(
  eventsData.map(async (event) => {
    const { count } = await supabase
      .from("event_registrations") // <-- ✅ updated table name
      .select("*", { count: "exact", head: true })
      .eq("event_id", event.id);

    const startDateTime = new Date(`${event.date}T${event.startTime || "09:00"}`);
    const endDateTime = new Date(`${event.date}T${event.endTime || "10:00"}`);

    return {
      ...event,
      start: startDateTime,
      end: endDateTime,
      registrants: count || 0,
    };
  })
);

    setEvents(enriched);
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleAddEvent = async (formData) => {
    const newEvent = {
      ...formData,
      date: formData.date || new Date().toISOString().split("T")[0],
      created_by: user?.id || null, // ✅ correct UUID format
      created_at: new Date().toISOString(),
    };

    const { error } = await supabase.from("events").insert([newEvent]);

    if (error) {
      console.error("Error adding event:", error.message);
      alert("Failed to add event.");
    } else {
      alert("Event added!");
      setShowModal(false);
      fetchEvents();
    }
  };

  const handleUpdateEvent = async (formData) => {
    if (!selectedEvent?.id) return;

    const updatedEvent = {
      ...formData,
      updated_by: user?.email || "unknown",
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from("events")
      .update(updatedEvent)
      .eq("id", selectedEvent.id);

    if (error) {
      console.error("Update error:", error.message);
      alert("Failed to update event.");
    } else {
      alert("Event updated!");
      setSelectedEvent(null);
      fetchEvents();
    }
  };

  const handleDeleteEvent = async () => {
    if (!selectedEvent?.id) return;
    const confirmDelete = window.confirm("Are you sure you want to delete this event?");
    if (!confirmDelete) return;

    const { error } = await supabase
      .from("events")
      .delete()
      .eq("id", selectedEvent.id);

    if (error) {
      console.error("Delete error:", error.message);
      alert("Failed to delete event.");
    } else {
      alert("Event deleted!");
      setSelectedEvent(null);
      fetchEvents();
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-[#044b4f]">🗓️ PD Calendar Overview</h1>
          <button
            onClick={() => setShowModal(true)}
            className="bg-teal-600 text-white px-4 py-2 rounded hover:bg-teal-700 text-sm"
          >
            ➕ Add Event
          </button>
        </div>

        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          selectable
          onSelectEvent={(event) => {
            setSelectedEvent(event);
            setShowModal(true);
          }}
          onSelectSlot={(slotInfo) => {
            setSelectedEvent({ date: format(slotInfo.start, "yyyy-MM-dd") });
            setShowModal(true);
          }}
          style={{ height: 500 }}
        />

        <h2 className="text-xl font-semibold mt-10 mb-4">All Events</h2>
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="min-w-full text-sm text-left">
            <thead className="bg-gray-100 text-gray-700 font-semibold">
              <tr>
                <th className="px-4 py-2 border-b">Title</th>
                <th className="px-4 py-2 border-b">Date</th>
                <th className="px-4 py-2 border-b">Time</th>
                <th className="px-4 py-2 border-b">Created By</th>
                <th className="px-4 py-2 border-b">Updated By</th>
                <th className="px-4 py-2 border-b">Registered</th>
                <th className="px-4 py-2 border-b">Action</th>
              </tr>
            </thead>
            <tbody>
              {events.map((event) => (
                <tr key={event.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2">{event.title}</td>
                  <td className="px-4 py-2">{new Date(event.start).toLocaleDateString()}</td>
                  <td className="px-4 py-2">{event.startTime || "—"} - {event.endTime || "—"}</td>
                  <td className="px-4 py-2">{event.created_by || "—"}</td>
                  <td className="px-4 py-2">{event.updated_by || "—"}</td>
                  <td className="px-4 py-2">{event.registrants ?? 0}</td>
                  <td className="px-4 py-2">
                    <a
                      href={`/admin/pdmanager/${event.id}`}
                      className="text-blue-600 hover:underline"
                    >
                      View Details
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <EventFormModal
        isOpen={showModal || !!selectedEvent}
        onClose={() => {
          setShowModal(false);
          setSelectedEvent(null);
        }}
        initialData={selectedEvent || {}}
        mode={selectedEvent ? "edit" : "add"}
        onSubmit={(formData) => {
          if (selectedEvent) {
            handleUpdateEvent(formData);
          } else {
            handleAddEvent(formData);
          }
        }}
        onDelete={handleDeleteEvent}
      />
    </AdminLayout>
  );
}
