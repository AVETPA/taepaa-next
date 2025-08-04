// src/components/admin/EventFormModal.jsx
import { useState, useEffect } from "react";

export default function EventFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData = {},
  mode = "add"
}) {
  const [form, setForm] = useState({
    title: "",
    date: "",
    startTime: "",
    endTime: "",
    type: "ZoomSession",
    presenter: "",
    duration: "",
    description: "",
    bannerUrl: ""
  });

  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      setForm({
        title: initialData.title || "",
        date: initialData.date ? initialData.date.split("T")[0] : "",
        startTime: initialData.startTime || "",
        endTime: initialData.endTime || "",
        type: initialData.type || "ZoomSession",
        presenter: initialData.presenter || "",
        duration: initialData.duration || "",
        description: initialData.description || "",
        bannerUrl: initialData.bannerUrl || ""
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-3 text-2xl text-gray-500 hover:text-gray-800"
        >
          &times;
        </button>

        <h2 className="text-xl font-semibold mb-4">
          {mode === "edit" ? "Edit Event" : "Add New PD Event"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input name="title" value={form.title} onChange={handleChange} placeholder="Title" required className="w-full border p-2 rounded" />
          <input name="date" type="date" value={form.date} onChange={handleChange} required className="w-full border p-2 rounded" />
          <div className="grid grid-cols-2 gap-4">
            <input name="startTime" type="time" value={form.startTime} onChange={handleChange} required className="w-full border p-2 rounded" />
            <input name="endTime" type="time" value={form.endTime} onChange={handleChange} required className="w-full border p-2 rounded" />
          </div>
          <select name="type" value={form.type} onChange={handleChange} className="w-full border p-2 rounded">
            <option>ZoomSession</option>
            <option>In Person</option>
            <option>Convention</option>
            <option>Reading</option>
            <option>Course</option>
          </select>
          <input name="presenter" value={form.presenter} onChange={handleChange} placeholder="Presenter" className="w-full border p-2 rounded" />
          <input name="duration" value={form.duration} onChange={handleChange} placeholder="Duration (e.g. 2 hours)" className="w-full border p-2 rounded" />
          <textarea name="description" value={form.description} onChange={handleChange} placeholder="Description" rows={3} className="w-full border p-2 rounded" />
          <input name="bannerUrl" value={form.bannerUrl} onChange={handleChange} placeholder="Banner Image URL" className="w-full border p-2 rounded" />
<input
  type="file"
  accept="image/*"
  onChange={async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const filePath = `banners/${Date.now()}_${file.name}`;
    const { error: uploadError } = await supabase.storage
      .from("event-banners")
      .upload(filePath, file);

    if (uploadError) {
      console.error("Upload failed:", uploadError.message);
      return;
    }

    const { data: { publicUrl } } = supabase.storage
      .from("event-banners")
      .getPublicUrl(filePath);

    setForm((prev) => ({ ...prev, bannerUrl: publicUrl }));
  }}
  className="w-full border p-2 rounded"
/>

          <div className="flex justify-end">
            <button type="submit" className="bg-teal-600 text-white px-4 py-2 rounded hover:bg-teal-700">
              {mode === "edit" ? "Save Changes" : "Add Event"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
