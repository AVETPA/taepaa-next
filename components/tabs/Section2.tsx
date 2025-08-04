'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import useAuth from '@/hooks/useAuth';
import SectionCard from '@/components/layout/SectionCard';
import toast from 'react-hot-toast';

interface TertiaryEntry {
  id?: string;
  qualification: string;
  institution: string;
  transcript: string;
  date_awarded: string;
  user_id?: string;
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const Section2 = () => {
  const { user } = useAuth();
  const userId = user?.id || user?.uid;
  const [entries, setEntries] = useState<TertiaryEntry[]>([]);
  const [newEntry, setNewEntry] = useState<TertiaryEntry>({
    qualification: '',
    institution: '',
    transcript: 'Yes',
    date_awarded: ''
  });
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [editedEntry, setEditedEntry] = useState<TertiaryEntry>({} as TertiaryEntry);

  const fetchEntries = async () => {
    if (!userId) return;
    const { data, error } = await supabase
      .from('training_products')
      .select('*')
      .eq('user_id', userId)
      .eq('type', 'Tertiary');

    if (error) {
      toast.error('Failed to load entries');
    } else {
      setEntries(data || []);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, [userId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewEntry((prev) => ({ ...prev, [name]: value }));
  };

  const handleAdd = async () => {
    if (!newEntry.qualification || !newEntry.institution || !newEntry.date_awarded) {
      toast.error('Please complete all fields');
      return;
    }

    const payload = {
      ...newEntry,
      user_id: userId,
      type: 'Tertiary'
    };

    const { error } = await supabase.from('training_products').insert([payload]);

    if (error) toast.error('Failed to add entry');
    else {
      toast.success('Entry added');
      setNewEntry({ qualification: '', institution: '', transcript: 'Yes', date_awarded: '' });
      fetchEntries();
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('training_products').delete().eq('id', id);
    if (error) toast.error('Failed to delete');
    else {
      toast.success('Entry deleted');
      fetchEntries();
    }
  };

  const handleEditClick = (index: number) => {
    setEditIndex(index);
    setEditedEntry({ ...entries[index] });
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditedEntry((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!editedEntry.id) return;
    const { id, ...dataToUpdate } = editedEntry;

    const { error } = await supabase.from('training_products').update(dataToUpdate).eq('id', id);
    if (error) toast.error('Failed to update');
    else {
      toast.success('Entry updated');
      setEditIndex(null);
      setEditedEntry({} as TertiaryEntry);
      fetchEntries();
    }
  };

  const handleCancel = () => {
    setEditIndex(null);
    setEditedEntry({} as TertiaryEntry);
  };

  return (
    <section id="section2">
      <SectionCard title="Tertiary Qualifications">
        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-6 mb-6 text-center shadow-sm rounded">
          <h2 className="text-lg font-semibold text-yellow-800 mb-2">
            📎 To add a Degree or Transcript:
          </h2>
          Use this section to record any completed tertiary degrees such as Bachelor, Masters,
          or PhD qualifications. You may also include Graduate Certificates, Diplomas, or
          other tertiary awards that support your training and assessment role.
        </div>

        <div className="flex flex-wrap gap-2 mb-4 items-center">
          <input
            type="text"
            name="qualification"
            placeholder="Qualification Title"
            value={newEntry.qualification}
            onChange={handleChange}
            className="border p-2 rounded w-64"
          />
          <input
            type="text"
            name="institution"
            placeholder="Awarding Institution"
            value={newEntry.institution}
            onChange={handleChange}
            className="border p-2 rounded w-64"
          />
          <select
            name="transcript"
            value={newEntry.transcript}
            onChange={handleChange}
            className="border p-2 rounded w-32"
          >
            <option value="Yes">Yes</option>
            <option value="No">No</option>
          </select>
          <input
            type="date"
            name="date_awarded"
            value={newEntry.date_awarded}
            onChange={handleChange}
            className="border p-2 rounded w-40"
          />
          <button
            onClick={handleAdd}
            className="bg-teal-600 text-white px-4 py-2 rounded hover:bg-teal-700"
          >
            Add Degree
          </button>
        </div>

        <table className="min-w-full border border-gray-300 text-sm text-left mb-6">
          <thead className="bg-gray-100 text-gray-700 font-semibold">
            <tr>
              <th className="border p-2">Degree Title</th>
              <th className="border p-2">Institution</th>
              <th className="border p-2">Transcript</th>
              <th className="border p-2">Date Awarded</th>
              <th className="border p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry, index) => (
              <tr key={entry.id} className="odd:bg-white even:bg-gray-50">
                {editIndex === index ? (
                  <>
                    <td className="border p-2">
                      <input
                        type="text"
                        name="qualification"
                        value={editedEntry.qualification}
                        onChange={handleEditChange}
                        className="w-full border p-1"
                      />
                    </td>
                    <td className="border p-2">
                      <input
                        type="text"
                        name="institution"
                        value={editedEntry.institution}
                        onChange={handleEditChange}
                        className="w-full border p-1"
                      />
                    </td>
                    <td className="border p-2">
                      <select
                        name="transcript"
                        value={editedEntry.transcript}
                        onChange={handleEditChange}
                        className="w-full border p-1"
                      >
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
                      </select>
                    </td>
                    <td className="border p-2">
                      <input
                        type="date"
                        name="date_awarded"
                        value={editedEntry.date_awarded}
                        onChange={handleEditChange}
                        className="w-full border p-1"
                      />
                    </td>
                    <td className="border p-2 space-x-2">
                      <button onClick={handleSave} className="text-teal-600 hover:underline">Save</button>
                      <button onClick={handleCancel} className="text-gray-600 hover:underline">Cancel</button>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="border p-2">{entry.qualification}</td>
                    <td className="border p-2">{entry.institution}</td>
                    <td className="border p-2">{entry.transcript}</td>
                    <td className="border p-2">
                      {entry.date_awarded
                        ? new Date(entry.date_awarded).toLocaleDateString('en-AU')
                        : ''}
                    </td>
                    <td className="border p-2 space-x-2">
                      <button onClick={() => handleEditClick(index)} className="text-teal-600 hover:underline">Edit</button>
                      <button onClick={() => handleDelete(entry.id!)} className="text-red-6
