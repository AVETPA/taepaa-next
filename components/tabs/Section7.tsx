// ✅ Refined Section7.jsx using only methodType for Delivery Method, includes Provider, Evidence, and 12-Month Status
import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  Timestamp,
  getDoc,
} from "firebase/firestore";
import { db } from "../../utils/firebase";
import useAuth from "../../hooks/useAuth";
import SectionCard from "../layout/SectionCard";
import DatePicker, { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import enAU from "date-fns/locale/en-AU";
registerLocale("en-AU", enAU);

export default function Section7() {
  const { user } = useAuth();
  const [entries, setEntries] = useState([]);
  const [editIndex, setEditIndex] = useState(null);
  const [editedEntry, setEditedEntry] = useState({});
  const [newEntry, setNewEntry] = useState({
    activityTitle: "",
    activityDate: null,
    methodType: "",
    timeSpent: "",
    providerDetails: "",
    summaryDescription: "",
    summaryOutcome: "",
    summaryRelevance: "",
    hasEvidence: false,
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!user?.uid) return;

    const fetchAll = async () => {
      const snap = await getDocs(collection(db, `trainerProfiles/${user.uid}/professionaldevelopment`));
      const entries = [];

      for (const docRef of snap.docs) {
        const data = docRef.data();

        if (data.eventId) {
          const eventMeta = await getDoc(doc(db, "events", data.eventId));
          if (eventMeta.exists()) {
            const meta = eventMeta.data();
            entries.push({
              id: docRef.id,
              activityTitle: eventMeta.data().title,
              activityDate: new Date(eventMeta.data().date),
              providerDetails: meta.provider || "",
              methodType: meta.type || "",
              summaryDescription: data.summaryDescription || "",
              summaryOutcome: data.summaryOutcome || "",
              summaryRelevance: data.summaryRelevance || "",
              evidenceURL: data.certificateURL || "",
              attended: data.attended || false,
              certificateIssued: data.certificateIssued || false,
              completed: data.completed,
              source: "inhouse",
            });
          }
        } else {
          entries.push({
            id: docRef.id,
            ...data,
            source: "manual",
          });
        }
      }

      setEntries(entries);
    };

    fetchAll();
  }, [user]);

  const validateEntry = () => {
    const e = {};
    if (!newEntry.activityTitle) e.activityTitle = true;
    if (!newEntry.activityDate) e.activityDate = true;
    if (!newEntry.summaryDescription) e.summaryDescription = true;
    if (!newEntry.summaryOutcome) e.summaryOutcome = true;
    if (!newEntry.summaryRelevance) e.summaryRelevance = true;
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSaveNew = async () => {
    if (!validateEntry()) return;
    const ref = collection(db, `trainerProfiles/${user.uid}/professionaldevelopment`);
    await addDoc(ref, {
      ...newEntry,
      activityDate: Timestamp.fromDate(newEntry.activityDate),
      completed: true,
      attended: false,
      evidenceURL: "",
      createdAt: new Date(),
      source: "manual",
    });
    setNewEntry({
      activityTitle: "",
      activityDate: null,
      timeSpent: "",
      providerDetails: "",
      summaryDescription: "",
      summaryOutcome: "",
      summaryRelevance: "",
      hasEvidence: false,
      methodType: "",
    });
    setErrors({});
    const snapshot = await getDocs(collection(db, `trainerProfiles/${user.uid}/professionaldevelopment`));
    const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setEntries((prev) => [...data, ...prev.filter((e) => e.source === "inhouse")]);
  };

  const handleEdit = (index) => {
    setEditIndex(index);
    setEditedEntry({ ...entries[index] });
  };

  const handleChange = (field, value) => {
    setEditedEntry((prev) => ({ ...prev, [field]: value }));
  };

  const handleUpdate = async (id) => {
    const docRef = doc(db, `trainerProfiles/${user.uid}/professionaldevelopment/${id}`);
    await updateDoc(docRef, editedEntry);
    const updated = [...entries];
    updated[editIndex] = { ...editedEntry };
    setEntries(updated);
    setEditIndex(null);
  };

  const handleDelete = async (id) => {
    await deleteDoc(doc(db, `trainerProfiles/${user.uid}/professionaldevelopment/${id}`));
    setEntries(entries.filter((e) => e.id !== id));
  };

  return (
    <section id="section7">
      <SectionCard title="Professional Development Activities">
        <div className="p-6">
          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-6 text-center shadow-sm rounded">
            <h2 className="text-lg font-semibold text-yellow-800 mb-1">
              📌 Record your professional development activities:
            </h2>
            <p className="text-sm text-gray-800">
              Fill in this form to manually log PD activities. Entries for events you register through the website will appear once attendance is verified.
            </p>
          </div>
    
          {/* Manual Entry Form */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <input type="text" placeholder="Activity Title*" value={newEntry.activityTitle} onChange={(e) => setNewEntry({ ...newEntry, activityTitle: e.target.value })} className={`border px-2 py-1 rounded w-full ${errors.activityTitle ? 'border-red-500' : ''}`} />
            <DatePicker selected={newEntry.activityDate} onChange={(date) => setNewEntry({ ...newEntry, activityDate: date })} dateFormat="dd/MM/yyyy" className={`border px-2 py-1 rounded w-full ${errors.activityDate ? 'border-red-500' : ''}`} locale="en-AU" placeholderText="dd/mm/yyyy*" />
            <select value={newEntry.methodType} onChange={(e) => setNewEntry({ ...newEntry, methodType: e.target.value })} className="border px-2 py-1 rounded w-full">
              <option value="">Delivery Method</option>
              <option>Workshop</option>
              <option>Webinar</option>
              <option>Personal Research</option>
              <option>Industry Visit</option>
              <option>Zoom</option>
              <option>Phone</option>
              <option>In person</option>
              <option>Video</option>
              <option>Online</option>
            </select>
            <input type="text" placeholder="Time Spent" value={newEntry.timeSpent} onChange={(e) => setNewEntry({ ...newEntry, timeSpent: e.target.value })} className="border px-2 py-1 rounded w-full" />
          </div>
    
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <textarea placeholder="Presenter / Business / Contact info" value={newEntry.providerDetails} onChange={(e) => setNewEntry({ ...newEntry, providerDetails: e.target.value })} rows={2} className="border px-2 py-1 rounded w-full" />
            <textarea placeholder="Activity focus and what you did*" value={newEntry.summaryDescription} onChange={(e) => setNewEntry({ ...newEntry, summaryDescription: e.target.value })} rows={2} className={`border px-2 py-1 rounded w-full ${errors.summaryDescription ? 'border-red-500' : ''}`} />
          </div>
    
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <textarea placeholder="What you gained* (skill/knowledge)" value={newEntry.summaryOutcome} onChange={(e) => setNewEntry({ ...newEntry, summaryOutcome: e.target.value })} rows={2} className={`border px-2 py-1 rounded w-full ${errors.summaryOutcome ? 'border-red-500' : ''}`} />
            <textarea placeholder="Relevance to your role as trainer/assessor*" value={newEntry.summaryRelevance} onChange={(e) => setNewEntry({ ...newEntry, summaryRelevance: e.target.value })} rows={2} className={`border px-2 py-1 rounded w-full ${errors.summaryRelevance ? 'border-red-500' : ''}`} />
          </div>
    
          <div className="flex items-center gap-4 mb-6">
            <label className="text-sm">Do you have evidence?</label>
            <select value={newEntry.hasEvidence ? "Yes" : "No"} onChange={(e) => setNewEntry({ ...newEntry, hasEvidence: e.target.value === "Yes" })} className="border px-2 py-1 rounded">
              <option>No</option>
              <option>Yes</option>
            </select>
            <button onClick={handleSaveNew} className="bg-teal-600 text-white px-6 py-2 rounded hover:bg-teal-700 ml-auto">
              Save Activity
            </button>
          </div>
                  <h3 className="text-lg font-semibold mb-2">Your Recorded Activities</h3>
          <table className="min-w-full border text-sm text-left">
            <thead className="bg-gray-100 text-gray-700 font-semibold">
              <tr>
                <th className="border p-2">Title</th>
                <th className="border p-2">Date</th>
                <th className="border p-2">Summary</th>
                <th className="border p-2">Evidence</th>
                <th className="border p-2">Source</th>
                <th className="border p-2">Status</th>
                <th className="border p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry, i) => {
                const date = entry.activityDate instanceof Date ? entry.activityDate : entry.activityDate?.toDate?.();
                const isOutdated = date ? (new Date() - date) > 365 * 24 * 60 * 60 * 1000 : false;
                return (
                  <tr key={entry.id} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    <td className="border p-2">{editIndex === i ? <input value={editedEntry.activityTitle} onChange={(e) => handleChange("activityTitle", e.target.value)} className="border px-2 py-1 rounded w-full" /> : entry.activityTitle}</td>
                    <td className="border p-2">{date?.toLocaleDateString("en-AU")}</td>
                    <td className="border p-2 text-sm">
                      {editIndex === i ? (
                        <>
                          <input value={editedEntry.summaryOutcome} onChange={(e) => handleChange("summaryOutcome", e.target.value)} placeholder="What you gained" className="border px-2 py-1 rounded mb-1 w-full" />
                          <input value={editedEntry.summaryRelevance} onChange={(e) => handleChange("summaryRelevance", e.target.value)} placeholder="Relevance to your role" className="border px-2 py-1 rounded w-full" />
                        </>
                      ) : (
                        <>
                          <strong>Gained:</strong> {entry.summaryOutcome}<br />
                          <strong>Relevance:</strong> {entry.summaryRelevance}
                        </>
                      )}
                    </td>
                   <td className="border p-2 text-center">
  {entry.source === "manual" ? (
    entry.hasEvidence ? "Yes" : "No"
  ) : entry.certificateIssued && entry.evidenceURL ? (
    <a href={entry.evidenceURL} target="_blank" rel="noreferrer" className="text-blue-600 underline">View</a>
  ) : entry.attended ? (
    <span className="text-yellow-600 italic">Awaiting Issue</span>
  ) : (
    "Pending"
  )}
</td>
                    <td className="border p-2">{entry.source === "manual" ? "Manual" : "In house"}</td>
                    <td className="border p-2 text-sm">{isOutdated ? <span className="text-red-600 font-medium">Outdated</span> : <span className="text-green-700">Current</span>}</td>
                 <td className="border p-2">
  {entry.source === "manual" ? (
    editIndex === i ? (
      <>
        <button onClick={() => handleUpdate(entry.id)} className="text-sm text-green-600 mr-2">Save</button>
        <button onClick={() => setEditIndex(null)} className="text-sm text-gray-500">Cancel</button>
      </>
    ) : (
      <>
        <button onClick={() => handleEdit(i)} className="text-sm text-blue-600 mr-2">Edit</button>
        <button onClick={() => handleDelete(entry.id)} className="text-sm text-red-600">Delete</button>
      </>
    )
  ) : entry.attended ? (
    <button onClick={() => handleEdit(i)} className="text-sm text-blue-600">Edit Summary</button>
  ) : (
    <span className="text-gray-400 italic">Locked</span>
  )}
</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </section>
    
      );
    }