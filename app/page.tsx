'use client';

import Link from 'next/link';
import Image from 'next/image';

export default function Home() {
  return (
    <div className="bg-white text-gray-800">
      {/* Hero Section */}
      <section className="text-center py-16 bg-gradient-to-b from-[#008080] to-[#00a8a8] text-white">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Empowering Australia's VET Trainers & Assessors
        </h1>
        <p className="text-lg md:text-xl mb-8">
          Support. Compliance. Community. Your complete toolkit for staying current and audit-ready.
        </p>
        <div className="flex justify-center gap-4">
          <Link
            href="/membership"
            className="bg-white text-[#008080] font-semibold py-2 px-6 rounded shadow hover:bg-gray-100 transition"
          >
            Join TAEPAA
          </Link>
          <Link
            href="/login"
            className="bg-[#004f4f] text-white font-semibold py-2 px-6 rounded shadow hover:bg-[#003c3c] transition"
          >
            Member Login
          </Link>
        </div>
      </section>

      {/* Trainer Matrix Image Block */}
      <section className="py-16 px-6 text-center bg-gray-50">
        <Link href="/trainer-matrix">
          <img
            src="/img/trainer-matrix.png"
            alt="Trainer Matrix Preview"
            className="mx-auto rounded-2xl shadow-lg w-full max-w-4xl hover:scale-105 transition mb-4"
          />
        </Link>
        <p className="mb-8 max-w-2xl mx-auto text-[#4B4B4B]">
          Stay compliant with confidence. Easily track qualifications, PD, currency, and delivery scope with our smart, auto-mapped Trainer Matrix Builder — built for real VET environments and updated to support 2025 standards.
        </p>
      </section>

      {/* Feature Cards */}
      <section className="bg-white py-16 px-6">
        <div className="max-w-6xl mx-auto grid gap-8 md:grid-cols-3">
          <div className="bg-[#f9fafa] p-8 border-l-4 border-[#008080] rounded-2xl shadow">
            <h3 className="text-xl font-bold text-[#008080] mb-2">📋 Trainer Profile Tabs</h3>
            <p className="text-[#4B4B4B]">
              Track all your TAE, vocational qualifications, licences, PD, and industry experience in one place.
            </p>
          </div>
          <div className="bg-[#f9fafa] p-8 border-l-4 border-[#FF6F61] rounded-2xl shadow">
            <h3 className="text-xl font-bold text-[#FF6F61] mb-2">🛡️ Compliance Made Simple</h3>
            <p className="text-[#4B4B4B]">
              Match ASQA standards with guided fields and smart alerts for outdated units or missing evidence.
            </p>
          </div>
          <div className="bg-[#f9fafa] p-8 border-l-4 border-[#1F3A93] rounded-2xl shadow">
            <h3 className="text-xl font-bold text-[#1F3A93] mb-2">🎓 PD & Evidence Tools</h3>
            <p className="text-[#4B4B4B]">
              Log, view, and export your PD — with certificate links and compliance summaries.
            </p>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="text-center py-12 bg-[#f9fafa] border-t border-gray-200">
        <h2 className="text-2xl font-bold mb-4 text-[#008080]">Stay compliant. Stay connected.</h2>
        <p className="mb-6 text-[#4B4B4B]">Join the VET community that’s built for you.</p>
        <div className="flex justify-center gap-4">
          <Link
            href="/membership"
            className="bg-[#008080] hover:bg-[#006666] text-white font-semibold py-2 px-6 rounded"
          >
            Become a Member
          </Link>
          <Link
            href="/contact"
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-6 rounded"
          >
            Contact Us
          </Link>
        </div>
      </section>
    </div>
  );
}
