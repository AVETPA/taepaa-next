import { useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../../components/layout/AdminLayout";

export default function AdminAddEvent() {
  const [form, setForm] = useState({
    title: "",
    date: "",
    startTime: "",
    endTime: "",
    type: "ZoomSession",
    presenter: "",
    duration: "",
    description: "",
    bannerUrl: "",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newEvent = {
      ...form,
      date: form.date || new Date().toISOString(),
      created_by: "admin",
      created_at: new Date().toISOString(),
    };

    const { error } = await supabase.from("events").insert([newEvent]);

    if (error) {
      console.error("Error creating event:", error.message);
      alert("Error creating event");
    } else {
      alert("Event created successfully");
      navigate("/admin/pdcalendar");
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-3xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">Add New Event</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="Event Title"
            required
            className="w-full border p-2 rounded"
          />

          <input
            name="date"
            type="date"
            value={form.date}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-700">Start Time</label>
              <input
                name="startTime"
                type="time"
                value={form.startTime}
                onChange={handleChange}
                required
                className="w-full border p-2 rounded"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700">End Time</label>
              <input
                name="endTime"
                type="time"
                value={form.endTime}
                onChange={handleChange}
                required
                className="w-full border p-2 rounded"
              />
            </div>
          </div>

          <select
            name="type"
            value={form.type}
            onChange={handleChange}
            className="w-full border border-gray-300 p-3 rounded"
          >
            <option>ZoomSession</option>
            <option>In Person</option>
            <option>Convention</option>
            <option>Reading</option>
            <option>Course</option>
          </select>

          <input
            name="presenter"
            value={form.presenter}
            onChange={handleChange}
            placeholder="Presenter Name"
            className="w-full border p-2 rounded"
          />

          <input
            name="duration"
            value={form.duration}
            onChange={handleChange}
            placeholder="e.g. 2 hours"
            className="w-full border p-2 rounded"
          />

          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Event Description"
            rows={4}
            className="w-full border p-2 rounded"
          />

          <input
            name="bannerUrl"
            value={form.bannerUrl}
            onChange={handleChange}
            placeholder="Optional Banner Image URL"
            className="w-full border p-2 rounded"
          />

          <button
            type="submit"
            className="bg-teal-600 text-white px-4 py-2 rounded hover:bg-teal-700"
          >
            Save Event
          </button>
        </form>
      </div>
    </AdminLayout>
  );
}
