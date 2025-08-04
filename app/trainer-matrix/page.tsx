import { Link } from "react-router-dom";

export default function TrainerMatrix() {
  return (
    <div className="bg-white min-h-screen py-16 px-6 text-gray-800">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <section className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-[#008080] mb-4">Trainer Matrix Builder</h1>
          <p className="text-lg text-gray-700 max-w-3xl mx-auto">
            A powerful tool designed for VET professionals to maintain compliance, showcase capability, and align training delivery with national standards.
          </p>
        </section>

        {/* Preview Image */}
        <section className="text-center mb-16">
          <img
            src="/img/trainer-matrix-preview-blurred.png"
            alt="Blurred Trainer Matrix Preview"
            className="mx-auto rounded-xl shadow-md w-full max-w-4xl"
          />
          <p className="text-sm text-gray-500 mt-2">*Preview blurred for confidentiality</p>
        </section>

        {/* Feature Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <FeatureBox
            title="📋 Auto-Mapped Trainer Profile"
            description="Automatically generate a comprehensive trainer profile across key compliance areas — TAE quals, vocational quals, employment history, PD, licences, and vocational competency."
            color="#008080"
          />
          <FeatureBox
            title="📁 Document Analyzer Integration"
            description="Upload resumes or certificates to auto-fill your profile — extracting codes, RTO names, dates, units of competency, and mapping them to the correct profile sections."
            color="#1F3A93"
          />
          <FeatureBox
            title="✅ Real-Time Compliance Indicators"
            description="Built-in checks notify you of expired units, missing evidence, or outdated qualifications using live status icons and validation rules."
            color="#FF6F61"
          />
          <FeatureBox
            title="📤 Export-Ready Audit Reports"
            description="Generate a clean PDF export of your entire trainer matrix — ideal for internal audits, ASQA evidence, or validation meetings."
            color="#4B4B4B"
          />
        </section>

        {/* CTA */}
        <section className="text-center mt-16">
          <Link
            to="/trainerprofile"
            className="inline-block bg-[#008080] hover:bg-[#006666] text-white font-semibold py-3 px-8 rounded shadow-lg text-lg"
          >
            Start My Trainer Profile
          </Link>
        </section>
      </div>
    </div>
  );
}

// Reusable feature box component
function FeatureBox({ title, description, color }) {
  return (
    <div className={`bg-[#f9fafa] p-6 rounded-2xl border-l-4 shadow`} style={{ borderColor: color }}>
      <h2 className="text-2xl font-bold mb-2" style={{ color }}>{title}</h2>
      <p className="text-gray-700">{description}</p>
    </div>
  );
}
