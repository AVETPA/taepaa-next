// src/components/UpcomingPDList.jsx
import React from "react";

export default function UpcomingPDList({ events }) {
  if (!events.length) {
    return <p className="text-gray-500 italic">No upcoming PD events found.</p>;
  }

  return (
    <ul className="space-y-4">
      {events.map((event, idx) => (
        <li
          key={idx}
          className="p-4 bg-[#f0fdfd] border-l-4 border-[#00a0a3] rounded-md shadow"
        >
          <h4 className="text-[#007a7c] font-semibold">
            {event.title || "Untitled PD Event"}
          </h4>
          <p className="text-sm text-gray-600">
            <strong>Date:</strong>{" "}
            {new Date(event.date).toLocaleDateString()} <br />
            <strong>Provider:</strong> {event.provider || "Unknown"}
          </p>
        </li>
      ))}
    </ul>
  );
}
