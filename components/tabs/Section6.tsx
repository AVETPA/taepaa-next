// ✅ Section6.jsx – Vocational Competency Final Version (Auto Evidence + Manual Entry)
import { useEffect, useState } from "react";
import { db, auth } from "../../utils/firebase";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import SectionCard from "../layout/SectionCard";
import toast from "react-hot-toast";
import qualificationsData from "../../data/qualifications_and_units.json";

export default function Section6() {
  const [entries, setEntries] = useState([]);
  const [heldUnits, setHeldUnits] = useState(new Set());
  const [expandedId, setExpandedId] = useState(null);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({
    unitCode: "",
    unitTitle: "",
    competencyEvidence: "",
    currencyEvidence: "",
  });

  useEffect(() => {
    fetchHeldUnits();
    fetchEntries();
  }, []);

  const fetchHeldUnits = async () => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    const snap = await getDocs(collection(db, `trainerProfiles/${uid}/vocationalQualifications`));
    const held = new Set();
    snap.docs.forEach(doc => {
      const d = doc.data();
      if (d.code) held.add(d.code.toUpperCase());
      d.linkedUnits?.forEach(u => u.code && held.add(u.code.toUpperCase()));
    });
    setHeldUnits(held);
  };

  const fetchEntries = async () => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    const snap = await getDocs(collection(db, `trainerProfiles/${uid}/vocationalCompetency`));
    const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setEntries(data);
  };

  const fetchEvidence = async (code) => {
    const prefix = code.slice(0, 3);
    const url = `/data/output_json/${prefix}_units.json`;
    try {
      const res = await fetch(url);
      const data = await res.json();
      const match = data.find(unit => unit.code.toUpperCase() === code);
      if (!match) return {};
      const competency = `Elements: ${match["Elements and Performance Criteria"]?.slice(0, 200)}...`;
      const currency = `Performance: ${match["Performance Evidence"]?.slice(0, 200)}...`;
      return {
        unitTitle: match.title || "",
        competencyEvidence: competency,
        currencyEvidence: currency,
      };
    } catch (err) {
      console.error("Error loading evidence:", err);
      return {};
    }
  };

  const handleChange = async (e) => {
    const { name, value } = e.target;
    if (name === "unitCode") {
      const code = value.toUpperCase();
      const match = qualificationsData.units.find(u => u.code.toUpperCase() === code);
      const unitTitle = match?.title || "";
      const evidence = await fetchEvidence(code);
      setForm(prev => ({
        ...prev,
        unitCode: code,
        unitTitle: unitTitle || evidence.unitTitle,
        competencyEvidence: prev.competencyEvidence || evidence.competencyEvidence || "",
        currencyEvidence: prev.currencyEvidence || evidence.currencyEvidence || "",
      }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async () => {
    const uid = auth.currentUser?.uid;
    if (!uid || !form.unitCode || !form.unitTitle) return;
    const payload = { ...form };
    if (editId) {
      await updateDoc(doc(db, `trainerProfiles/${uid}/vocationalCompetency/${editId}`), payload);
    } else {
      await addDoc(collection(db, `trainerProfiles/${uid}/vocationalCompetency`), payload);
    }
    setForm({ unitCode: "", unitTitle: "", competencyEvidence: "", currencyEvidence: "" });
    setEditId(null);
    fetchEntries();
  };

  const handleEdit = (entry) => {
    setForm({ ...entry });
    setEditId(entry.id);
  };

  const handleDelete = async (id) => {
    const uid = auth.currentUser?.uid;
    await deleteDoc(doc(db, `trainerProfiles/${uid}/vocationalCompetency/${id}`));
    fetchEntries();
  };

  return (
    <SectionCard title="Vocational Competency">
      <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-4">
        <h2 className="text-md font-semibold text-yellow-800">📎 Use this section to record units you deliver:</h2>
        Type a Unit Code to auto-fill the title and auto-generate summary evidence.
      </div>

      <div className="bg-gray-100 p-4 rounded mb-6 flex flex-wrap gap-4">
        <input name="unitCode" placeholder="Unit Code" value={form.unitCode} onChange={handleChange} className="border p-2 rounded w-40" />
        <input name="unitTitle" readOnly placeholder="Auto-filled Title" value={form.unitTitle} className="border p-2 rounded bg-gray-100 w-80" />
        <textarea name="competencyEvidence" placeholder="Competency Evidence" value={form.competencyEvidence} onChange={handleChange} rows={3} className="border p-2 rounded w-full" />
        <textarea name="currencyEvidence" placeholder="Currency Evidence" value={form.currencyEvidence} onChange={handleChange} rows={3} className="border p-2 rounded w-full" />
        <button onClick={handleSubmit} className="bg-teal-600 text-white px-4 py-2 rounded">{editId ? "Update" : "Add Entry"}</button>
      </div>

      <table className="w-full text-sm border">
        <thead className="bg-gray-50">
          <tr>
            <th className="p-2 border w-8"></th>
            <th className="p-2 border text-center">Hold</th>
            <th className="p-2 border">Unit Code</th>
            <th className="p-2 border">Unit Title</th>
            <th className="p-2 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {entries.map(entry => (
            <>
              <tr key={entry.id}>
                <td className="border p-2 text-center cursor-pointer text-gray-600" onClick={() => setExpandedId(expandedId === entry.id ? null : entry.id)}>
                  {expandedId === entry.id ? "▾" : "▸"}
                </td>
                <td className="border p-2 text-center">{heldUnits.has(entry.unitCode) ? "✅" : ""}</td>
                <td className="border p-2 font-medium">{entry.unitCode}</td>
                <td className="border p-2">{entry.unitTitle}</td>
                <td className="border p-2 space-x-2">
                  <button onClick={() => handleEdit(entry)} className="text-blue-600 hover:underline">Edit</button>
                  <button onClick={() => handleDelete(entry.id)} className="text-red-600 hover:underline">Delete</button>
                </td>
              </tr>
              {expandedId === entry.id && (
                <tr>
                  <td colSpan="5" className="bg-gray-50 border-t p-4">
                    <div className="grid grid-cols-2 gap-4 text-sm text-gray-700">
                      <div>
                        <strong>Competency Evidence</strong>
                        <div className="mt-1 whitespace-pre-wrap text-gray-800">{entry.competencyEvidence}</div>
                      </div>
                      <div>
                        <strong>Currency Evidence</strong>
                        <div className="mt-1 whitespace-pre-wrap text-gray-800">{entry.currencyEvidence}</div>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </>
          ))}
        </tbody>
      </table>
    </SectionCard>
  );
}
