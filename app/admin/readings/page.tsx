// src/pages/admin/AdminReadings.jsx
import { useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { toast } from "react-toastify";

export default function AdminReadings() {
  const [form, setForm] = useState({
    title: "",
    summary: "",
    link: "",
  });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { title, summary, link } = form;
    const { error } = await supabase.from("readings").insert([{ title, summary, link }]);

    if (error) {
      console.error("Insert error:", error);
      toast.error("Failed to add reading");
    } else {
      toast.success("Reading added!");
      setForm({ title: "", summary: "", link: "" });
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Add New Reading</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="title"
          placeholder="Title"
          value={form.title}
          onChange={handleChange}
          required
          className="w-full border px-3 py-2 rounded"
        />
        <textarea
          name="summary"
          placeholder="Short Summary"
          value={form.summary}
          onChange={handleChange}
          required
          className="w-full border px-3 py-2 rounded"
        />
        <input
          name="link"
          placeholder="Link (e.g. https://...)"
          type="url"
          value={form.link}
          onChange={handleChange}
          required
          className="w-full border px-3 py-2 rounded"
        />
        <button
          type="submit"
          className="bg-teal-600 text-white px-4 py-2 rounded hover:bg-teal-700"
        >
          Add Reading
        </button>
      </form>
    </div>
  );
}
