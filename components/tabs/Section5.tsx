import React, { useState, useEffect } from "react";
import SectionCard from "../layout/SectionCard";
import { db, auth } from "../../utils/firebase";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import ResumeAnalyzer from "../ResumeAnalyzer"; // Updated path
import DatePicker, { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import enAU from "date-fns/locale/en-AU";
registerLocale("en-AU", enAU);

const Section5 = () => {
  const [entries, setEntries] = useState([]);
  const [newEntry, setNewEntry] = useState({
    employer: "",
    summary: "",
    dateCommenced: "",
    duration: "",
    relevance: "",
  });
  const [editIndex, setEditIndex] = useState(null);
  const [editedEntry, setEditedEntry] = useState({});
  const [entryIds, setEntryIds] = useState([]);

  const fetchEntries = async () => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    const snapshot = await getDocs(
      collection(db, "trainerProfiles", userId, "industryEmployment")
    );

    const data = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    setEntries(data);
    setEntryIds(data.map((entry) => entry.id));
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  const handleAdd = async () => {
    const userId = auth.currentUser?.uid;
    if (!userId || !newEntry.employer || !newEntry.dateCommenced) return;

    const docRef = await addDoc(
      collection(db, "trainerProfiles", userId, "industryEmployment"),
      newEntry
    );

    setEntries([...entries, { ...newEntry, id: docRef.id }]);
    setNewEntry({
      employer: "",
      summary: "",
      dateCommenced: "",
      duration: "",
      relevance: "",
    });
  };

  const handleDelete = async (index) => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    const entryId = entries[index].id;
    await deleteDoc(doc(db, "trainerProfiles", userId, "industryEmployment", entryId));

    setEntries(entries.filter((_, i) => i !== index));
  };

  const handleEdit = (index) => {
    setEditIndex(index);
    setEditedEntry({ ...entries[index] });
  };

  const handleSave = async (index) => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    const entryId = entries[index].id;
    await updateDoc(
      doc(db, "trainerProfiles", userId, "industryEmployment", entryId),
      editedEntry
    );

    const updated = [...entries];
    updated[index] = { ...editedEntry, id: entryId };
    setEntries(updated);
    setEditIndex(null);
  };

  return (
    <section id="section5">
      <SectionCard title="Industry Employment Skills">
        <p className="text-sm text-gray-700 mb-4">
          Use this section to record work experience that supports your vocational competency.
        </p>

        <div className="mb-6">
          <ResumeAnalyzer
            onExtracted={async (newEntries) => {
              const userId = auth.currentUser?.uid;
              if (!userId) return;

              const savedEntries = await Promise.all(
                newEntries.map(async (entry) => {
                  const docRef = await addDoc(
                    collection(db, "trainerProfiles", userId, "industryEmployment"),
                    entry
                  );
                  return { ...entry, id: docRef.id };
                })
              );

              setEntries((prev) => [...prev, ...savedEntries]);
            }}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <textarea
            className="border p-2 w-full"
            placeholder="Employer Details"
            value={newEntry.employer}
            onChange={(e) => setNewEntry({ ...newEntry, employer: e.target.value })}
          />
          <textarea
            className="border p-2 w-full"
            placeholder="Summary of Employment"
            value={newEntry.summary}
            onChange={(e) => setNewEntry({ ...newEntry, summary: e.target.value })}
          />
          <input
            type="month"
            className="border p-2"
            placeholder="Date Commenced"
            value={newEntry.dateCommenced}
            onChange={(e) => setNewEntry({ ...newEntry, dateCommenced: e.target.value })}
          />
          <input
            className="border p-2"
            placeholder="Duration (e.g. 26 months)"
            value={newEntry.duration}
            onChange={(e) => setNewEntry({ ...newEntry, duration: e.target.value })}
          />
          <textarea
            className="border p-2 w-full md:col-span-2"
            placeholder="Relevance to Qualification"
            value={newEntry.relevance}
            onChange={(e) => setNewEntry({ ...newEntry, relevance: e.target.value })}
          />
        </div>
        <button className="bg-teal-600 text-white px-4 py-2 rounded" onClick={handleAdd}>
          + Add Entry
        </button>

        <table className="min-w-full border border-gray-300 text-sm mt-6">
          <thead className="bg-gray-100 text-gray-700 font-semibold">
            <tr>
              <th className="border p-2">Employer Details</th>
              <th className="border p-2">Summary</th>
              <th className="border p-2">Date Commenced</th>
              <th className="border p-2">Duration</th>
              <th className="border p-2">Relevance</th>
              <th className="border p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry, index) => (
              <tr key={entry.id || index} className="odd:bg-white even:bg-gray-50">
                {editIndex === index ? (
                  <>
                    <td className="border p-2">
                      <textarea
                        className="w-full"
                        value={editedEntry.employer}
                        onChange={(e) =>
                          setEditedEntry({ ...editedEntry, employer: e.target.value })
                        }
                      />
                    </td>
                    <td className="border p-2">
                      <textarea
                        className="w-full"
                        value={editedEntry.summary}
                        onChange={(e) =>
                          setEditedEntry({ ...editedEntry, summary: e.target.value })
                        }
                      />
                    </td>
                    <td className="border p-2">
                      <input
                        type="month"
                        className="w-full"
                        value={editedEntry.dateCommenced}
                        onChange={(e) =>
                          setEditedEntry({ ...editedEntry, dateCommenced: e.target.value })
                        }
                      />
                    </td>
                    <td className="border p-2">
                      <input
                        className="w-full"
                        value={editedEntry.duration}
                        onChange={(e) =>
                          setEditedEntry({ ...editedEntry, duration: e.target.value })
                        }
                      />
                    </td>
                    <td className="border p-2">
                      <textarea
                        className="w-full"
                        value={editedEntry.relevance}
                        onChange={(e) =>
                          setEditedEntry({ ...editedEntry, relevance: e.target.value })
                        }
                      />
                    </td>
                    <td className="border p-2 space-x-2 text-teal-600">
                      <button onClick={() => handleSave(index)}>Save</button>
                      <button onClick={() => setEditIndex(null)}>Cancel</button>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="border p-2">{entry.employer}</td>
                    <td className="border p-2">{entry.summary}</td>
                    <td className="border p-2">{entry.dateCommenced}</td>
                    <td className="border p-2">{entry.duration}</td>
                    <td className="border p-2">{entry.relevance}</td>
                    <td className="border p-2 space-x-2 text-teal-600">
                      <button onClick={() => handleEdit(index)}>Edit</button>
                      <button onClick={() => handleDelete(index)}>Delete</button>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </SectionCard>
    </section>
  );
};

export default Section5;
