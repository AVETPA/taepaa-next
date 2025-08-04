import React, { useState, useEffect } from "react";
import { db } from "../../utils/firebase";
import {
  collection,
  getDocs,
  doc,
  setDoc,
  deleteDoc,
  addDoc,
  updateDoc,
} from "firebase/firestore";
import useAuth from "../../hooks/useAuth";
import SectionCard from "../layout/SectionCard";

export default function Section4() {
  const { user } = useAuth();
  const [entries, setEntries] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [newEntry, setNewEntry] = useState({
    licence: "",
    authority: "",
    identifier: "",
    dateAttained: "",
    expiryDate: "",
  });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    if (!user?.uid) return;

    const load = async () => {
      const ref = collection(db, `trainerProfiles/${user.uid}/industryLicences`);
      const snapshot = await getDocs(ref);
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setEntries(data);

      const selectedRef = collection(db, `pdfSelections_section4/${user.uid}/items`);
      const selectedSnap = await getDocs(selectedRef);
      const selected = selectedSnap.docs.map((doc) => doc.id);
      setSelectedIds(selected);
    };

    load();
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewEntry((prev) => ({ ...prev, [name]: value }));
  };

  const handleAdd = async () => {
    if (!newEntry.licence || !newEntry.authority || !newEntry.dateAttained) return;
    const ref = collection(db, `trainerProfiles/${user.uid}/industryLicences`);
    const docRef = await addDoc(ref, newEntry);
    setEntries([{ ...newEntry, id: docRef.id }, ...entries]);
    setNewEntry({ licence: "", authority: "", identifier: "", dateAttained: "", expiryDate: "" });
  };

  const handleDelete = async (id) => {
    await deleteDoc(doc(db, `trainerProfiles/${user.uid}/industryLicences/${id}`));
    setEntries(entries.filter((e) => e.id !== id));
    setSelectedIds((prev) => prev.filter((sid) => sid !== id));
    await deleteDoc(doc(db, `pdfSelections_section4/${user.uid}/items/${id}`));
  };

  const handleEdit = (entry) => {
    setNewEntry(entry);
    setEditingId(entry.id);
  };

  const handleSave = async () => {
    const entryRef = doc(db, `trainerProfiles/${user.uid}/industryLicences/${editingId}`);
    await updateDoc(entryRef, newEntry);
    setEntries(entries.map((e) => (e.id === editingId ? { ...newEntry, id: editingId } : e)));
    setNewEntry({ licence: "", authority: "", identifier: "", dateAttained: "", expiryDate: "" });
    setEditingId(null);
  };

  const toggleSelection = async (entry) => {
    const id = entry.id;
    const selectionRef = doc(db, `pdfSelections_section4/${user.uid}/items/${id}`);
    const isSelected = selectedIds.includes(id);

    if (isSelected) {
      await deleteDoc(selectionRef);
      setSelectedIds((prev) => prev.filter((sid) => sid !== id));
    } else {
      await setDoc(selectionRef, entry);
      setSelectedIds((prev) => [...prev, id]);
    }
  };

  if (!user?.uid) {
    return (
      <SectionCard title="Industry Licences or Regulated Outcomes">
        <p className="text-gray-500 italic">Please sign in to view and manage your licences.</p>
      </SectionCard>
    );
  }

  return (
    <section id="section4">
      <SectionCard title="Industry Licences or Regulated Outcomes">
        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-6 mb-6 text-center shadow-sm rounded">
          <h2 className="text-lg font-semibold text-yellow-800 mb-2">
            📎 To add a Licence or Regulated Outcome:
          </h2>
          Use this section to record any formal authorisations, accreditations, or certifications issued by regulatory bodies that are relevant to your training or assessing role.
        </div>

        <div className="overflow-x-auto mb-2 text-right">
          <span className="text-sm text-gray-500 italic">
            Tick entries to include in your PDF export.
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full border">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2">✔</th>
                <th className="border p-2">Licence or Outcome</th>
                <th className="border p-2">Regulatory Authority</th>
                <th className="border p-2">Licence No. or Identifier</th>
                <th className="border p-2">Date Attained</th>
                <th className="border p-2">Expiry Date</th>
                <th className="border p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border p-2"></td>
                <td className="border p-2">
                  <input
                    name="licence"
                    value={newEntry.licence}
                    onChange={handleChange}
                    className="w-full border px-1"
                  />
                </td>
                <td className="border p-2">
                  <input
                    name="authority"
                    value={newEntry.authority}
                    onChange={handleChange}
                    className="w-full border px-1"
                  />
                </td>
                <td className="border p-2">
                  <input
                    name="identifier"
                    value={newEntry.identifier}
                    onChange={handleChange}
                    className="w-full border px-1"
                  />
                </td>
                <td className="border p-2">
                  <input
                    name="dateAttained"
                    type="date"
                    value={newEntry.dateAttained}
                    onChange={handleChange}
                    className="w-full border px-1"
                  />
                </td>
                <td className="border p-2">
                  <input
                    name="expiryDate"
                    type="date"
                    value={newEntry.expiryDate}
                    onChange={handleChange}
                    className="w-full border px-1"
                  />
                </td>
                <td className="border p-2 text-center">
                  {editingId ? (
                    <button
                      onClick={handleSave}
                      className="text-teal-600 hover:underline"
                    >
                      Save
                    </button>
                  ) : (
                    <button
                      onClick={handleAdd}
                      className="bg-green-500 text-white px-2 py-1 rounded"
                    >
                      Add
                    </button>
                  )}
                </td>
              </tr>
              {entries.map((entry) => (
                <tr key={entry.id}>
                  <td className="border p-2 text-center">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(entry.id)}
                      onChange={() => toggleSelection(entry)}
                    />
                  </td>
                  <td className="border p-2">{entry.licence}</td>
                  <td className="border p-2">{entry.authority}</td>
                  <td className="border p-2">{entry.identifier}</td>
                  <td className="border p-2">{entry.dateAttained ? new Date(entry.dateAttained.seconds ? entry.dateAttained.seconds * 1000 : entry.dateAttained).toLocaleDateString("en-AU") : ""}</td>
                  <td className="border p-2">{entry.expiryDate ? new Date(entry.expiryDate.seconds ? entry.expiryDate.seconds * 1000 : entry.expiryDate).toLocaleDateString("en-AU") : "-"}</td>
                  <td className="border p-2 space-x-2">
                    <button
                      onClick={() => handleEdit(entry)}
                      className="text-blue-600 hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(entry.id)}
                      className="text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </section>
  );
}
