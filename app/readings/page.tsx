// src/pages/Readings.jsx
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function Readings() {
  const [readings, setReadings] = useState([]);

  useEffect(() => {
    const fetchReadings = async () => {
      const { data, error } = await supabase.from("readings").select("*").order("created_at", { ascending: false });
      if (error) console.error("Error fetching readings:", error);
      else setReadings(data || []);
    };
    fetchReadings();
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-[#008080] mb-6">Trainer & Assessor Readings</h1>
      <p className="text-gray-700 mb-8">Explore handpicked articles, compliance updates, and thought leadership for VET professionals.</p>

      {readings.length === 0 ? (
        <p className="text-gray-500">No readings available yet.</p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {readings.map((reading) => (
            <div key={reading.id} className="border rounded-lg p-4 bg-white shadow hover:shadow-md transition">
              <h2 className="text-xl font-semibold text-[#1F3A93] mb-2">{reading.title}</h2>
              <p className="text-sm text-gray-700 mb-4">{reading.summary}</p>
              <a
                href={reading.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-teal-600 font-medium hover:underline"
              >
                Read More →
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
