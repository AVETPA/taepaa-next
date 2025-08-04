'use client';

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import AdminLayout from "@/components/layout/AdminLayout";
import { PDFViewer, PDFDownloadLink } from "@react-pdf/renderer";
import CertificateDocument from "@/components/CertificateDocument";

export default function PDManagerDetail() {
  const searchParams = useSearchParams();
  const eventId = searchParams.get("eventId");

  const [event, setEvent] = useState(null);
  const [registrants, setRegistrants] = useState([]);
  const [showOnlyAttended, setShowOnlyAttended] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
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

  useEffect(() => {
    if (!eventId) return;

    const loadAll = async () => {
      const { data: eventData } = await supabase
        .from("events")
        .select("*")
        .eq("id", eventId)
        .single();

      if (eventData) {
        setEvent(eventData);
        setForm({
          title: eventData.title,
          date: eventData.date?.split("T")[0] || "",
          startTime: eventData.startTime || "",
          endTime: eventData.endTime || "",
          type: eventData.type || "ZoomSession",
          presenter: eventData.presenter || "",
          duration: eventData.duration || "",
          description: eventData.description || "",
          bannerUrl: eventData.bannerUrl || "",
        });
      }

      const { data: regs } = await supabase
        .from("registrations")
        .select("*")
        .eq("event_id", eventId);

      if (regs) setRegistrants(regs);
    };

    loadAll();
  }, [eventId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdateEvent = async () => {
    const { error } = await supabase
      .from("events")
      .update({
        ...form,
        updated_at: new Date().toISOString(),
      })
      .eq("id", eventId);

    if (!error) {
      setEvent((prev) => ({ ...prev, ...form }));
      setShowEditModal(false);
    } else {
      alert("Failed to update event.");
    }
  };

  const toggleAttendance = async (reg) => {
    const newValue = !reg.attended;

    const { error } = await supabase
      .from("registrations")
      .update({ attended: newValue, updated_at: new Date().toISOString() })
      .eq("id", reg.id);

    if (!error) {
      setRegistrants((prev) =>
        prev.map((r) => (r.id === reg.id ? { ...r, attended: newValue } : r))
      );
    }
  };

  const generateCertificate = async (reg) => {
    try {
      const response = await fetch("/api/generateCertificate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: reg.name,
          eventTitle: event.title,
          date: new Date(event.date).toLocaleDateString(),
          location: event.location,
          provider: event.presenter,
          userId: reg.user_id,
          eventId,
        }),
      });

      const data = await response.json();

      if (data?.certificateURL) {
        alert(`✅ Certificate generated for ${reg.name}`);
        setRegistrants((prev) =>
          prev.map((r) =>
            r.id === reg.id ? { ...r, certificate_issued: true } : r
          )
        );
      }
    } catch (err) {
      alert("Failed to generate certificate.");
    }
  };

  const handlePreview = (reg) => {
    setPreviewData({
      name: reg.name,
      eventTitle: event.title,
      date: new Date(event.date).toLocaleDateString(),
      location: event.location,
      provider: event.presenter,
      certificateId: `TAEP-${eventId}-${reg.user_id?.slice(0, 6)?.toUpperCase()}`,
    });
  };

  const filteredRegistrants = showOnlyAttended
    ? registrants.filter((r) => r.attended)
    : registrants;

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-[#044b4f] mb-4">{event?.title || "PD Event"}</h1>
          {event && (
            <button
              onClick={() => setShowEditModal(true)}
              className="bg-teal-600 text-white px-4 py-2 rounded hover:bg-teal-700"
            >
              ✏️ Edit Event
            </button>
          )}
        </div>

        {!event && <p className="text-center text-gray-600">No upcoming events found.</p>}

        {event && (
          <>
            <p className="text-gray-600 mb-1"><strong>🗓️ Date:</strong> {new Date(event.date).toLocaleDateString()}</p>
            <p className="text-gray-600 mb-1"><strong>🎤 Presenter:</strong> {event.presenter || "N/A"}</p>
            <p className="text-gray-600 mb-1"><strong>🕒 Duration:</strong> {event.duration || "—"}</p>
            <p className="text-gray-600 mb-6"><strong>📄 Description:</strong> {event.description || "—"}</p>

            <div className="flex justify-between items-center mb-2">
              <h2 className="text-xl font-semibold">Registrants</h2>
              <label className="text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={showOnlyAttended}
                  onChange={(e) => setShowOnlyAttended(e.target.checked)}
                  className="mr-2"
                />
                Show only attended
              </label>
            </div>

            <div className="overflow-x-auto bg-white border rounded">
              <table className="min-w-full text-sm text-left">
                <thead className="bg-gray-100 text-gray-700 font-semibold">
                  <tr>
                    <th className="px-4 py-2 border-b">Name</th>
                    <th className="px-4 py-2 border-b">Email</th>
                    <th className="px-4 py-2 border-b">Attended</th>
                    <th className="px-4 py-2 border-b">Cert Sent</th>
                    <th className="px-4 py-2 border-b">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRegistrants.length === 0 && (
                    <tr><td colSpan="5" className="text-gray-500 px-4 py-3">No registrants to display.</td></tr>
                  )}
                  {filteredRegistrants.map((r) => (
                    <tr key={r.id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-2">{r.name || r.user_id}</td>
                      <td className="px-4 py-2">{r.email}</td>
                      <td className="px-4 py-2">
                        <label className="inline-flex items-center">
                          <input
                            type="checkbox"
                            checked={r.attended || false}
                            onChange={() => toggleAttendance(r)}
                            className="mr-2"
                          />
                          Attended
                        </label>
                      </td>
                      <td className="px-4 py-2">{r.certificate_issued ? "✅" : "—"}</td>
                      <td className="px-4 py-2">
                        {r.attended && (
                          <>
                            <button
                              onClick={() => generateCertificate(r)}
                              className="text-blue-600 hover:underline mr-2"
                            >
                              Generate Cert
                            </button>
                            <button
                              onClick={() => handlePreview(r)}
                              className="text-gray-500 hover:underline"
                            >
                              Preview
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {previewData && (
          <div className="fixed inset-0 z-50 bg-black bg-opacity-80 flex items-center justify-center p-4">
            <div className="bg-white w-full h-full max-w-4xl shadow-xl rounded relative">
              <button
                onClick={() => setPreviewData(null)}
                className="absolute top-2 right-4 text-gray-800 font-bold text-xl"
              >
                ×
              </button>
              <PDFViewer style={{ width: "100%", height: "100%" }}>
                <CertificateDocument {...previewData} />
              </PDFViewer>
            </div>
          </div>
        )}

        {showEditModal && (
          <div className="fixed inset-0 z-50 bg-black bg-opacity-30 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
              <h2 className="text-xl font-semibold mb-4">Edit PD Event</h2>
              <form onSubmit={(e) => { e.preventDefault(); handleUpdateEvent(); }} className="space-y-4">
                <input name="title" value={form.title} onChange={handleChange} className="w-full border p-2 rounded" />
                <input name="date" type="date" value={form.date} onChange={handleChange} className="w-full border p-2 rounded" />
                <div className="grid grid-cols-2 gap-4">
                  <input name="startTime" type="time" value={form.startTime} onChange={handleChange} className="w-full border p-2 rounded" />
                  <input name="endTime" type="time" value={form.endTime} onChange={handleChange} className="w-full border p-2 rounded" />
                </div>
                <select name="type" value={form.type} onChange={handleChange} className="w-full border p-2 rounded">
                  <option>ZoomSession</option>
                  <option>In Person</option>
                  <option>Convention</option>
                  <option>Reading</option>
                  <option>Course</option>
                </select>
                <input name="presenter" value={form.presenter} onChange={handleChange} className="w-full border p-2 rounded" />
                <input name="duration" value={form.duration} onChange={handleChange} className="w-full border p-2 rounded" />
                <textarea name="description" value={form.description} onChange={handleChange} rows={3} className="w-full border p-2 rounded" />
                <input name="bannerUrl" value={form.bannerUrl} onChange={handleChange} className="w-full border p-2 rounded" />
                <div className="flex justify-end gap-4">
                  <button type="button" onClick={() => setShowEditModal(false)} className="text-gray-600 hover:underline">Cancel</button>
                  <button type="submit" className="bg-teal-600 text-white px-4 py-2 rounded hover:bg-teal-700">Save</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {previewData && (
          <div className="mt-4">
            <PDFDownloadLink
              document={<CertificateDocument {...previewData} />}
              fileName="preview-certificate.pdf"
            >
              {({ loading }) =>
                loading ? "Loading preview..." : "Download Certificate Preview"
              }
            </PDFDownloadLink>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
