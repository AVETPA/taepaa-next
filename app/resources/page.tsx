import React from "react";
import { Link } from "react-router-dom";

export default function Resources() {
  return (
    <div className="bg-white py-12 px-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Trainer & Assessor Resources</h1>
      <p className="mb-10 text-gray-700">
        Explore professional development resources, industry events, useful readings, and training tools for VET professionals.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        <ResourceCard
          icon="📅"
          title="Professional Development Calendar"
          description="View upcoming professional development sessions, workshops, and compliance deadlines."
          to="/events"
          linkText="View Calendar →"
        />

        <ResourceCard
          icon="🎓"
          title="Webinars & Events"
          description="Access upcoming webinars, conferences, and networking events."
          to="/events"
          linkText="View Events →"
        />

        <ResourceCard
          icon="📚"
          title="Recommended Readings"
          description="Explore readings on adult learning, competency-based training, and RTO compliance."
          to="/readings"
          linkText="Explore Readings →"
        />

        <ResourceCard
          icon="💡"
          title="PD Courses"
          description="Discover accredited and non-accredited courses to support your development and currency."
          to="/courses"
          linkText="Browse Courses →"
        />

      </div>
    </div>
  );
}

function ResourceCard({ icon, title, description, to, linkText }) {
  return (
    <div className="border rounded-lg p-6 shadow-sm hover:shadow-md transition">
      <h2 className="text-xl font-semibold mb-2">{icon} {title}</h2>
      <p className="text-gray-600 text-sm mb-4">{description}</p>
      <Link to={to} className="text-teal-600 hover:underline font-medium">
        {linkText}
      </Link>
    </div>
  );
}
