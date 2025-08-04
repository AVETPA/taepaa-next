import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useReactToPrint } from "react-to-print";

export default function Privacy() {
  const [showCookieBanner, setShowCookieBanner] = useState(false);
  const componentRef = useRef();

  useEffect(() => {
    const accepted = localStorage.getItem("cookieConsent");
    if (!accepted) setShowCookieBanner(true);
  }, []);

  const acceptCookies = () => {
    localStorage.setItem("cookieConsent", "true");
    setShowCookieBanner(false);
  };

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: "AVETPA Privacy Policy",
  });

  return (
    <div className="relative">
      {/* Cookie Consent Banner */}
      {showCookieBanner && (
        <div className="fixed bottom-0 w-full bg-gray-900 text-white px-6 py-4 z-50 flex justify-between items-center">
          <span>
            We use cookies to enhance your experience. By continuing to browse,
            you agree to our{" "}
            <Link to="/privacy" className="underline text-teal-300">
              Privacy Policy
            </Link>.
          </span>
          <button
            onClick={acceptCookies}
            className="ml-4 bg-teal-500 text-white px-4 py-2 rounded hover:bg-teal-600"
          >
            Accept
          </button>
        </div>
      )}

      {/* Privacy Policy Content */}
      <div ref={componentRef} className="p-8 max-w-4xl mx-auto text-gray-800">
        <h1 className="text-3xl font-bold text-[#008080] mb-6">Privacy Policy</h1>

        <p className="mb-4">
          This Privacy Policy outlines how the Australian VET Practitioners Association (AVETPA)
          collects, uses, discloses, and safeguards your personal information in compliance with
          the <strong>Privacy Act 1988 (Cth)</strong> and the <strong>Australian Privacy Principles (APPs)</strong>.
        </p>

        <p className="mb-4">
          By using our website, you agree to the terms outlined here and in our{" "}
          <Link to="/terms" className="text-[#008080] underline">
            Terms of Use
          </Link>.
        </p>

        <h2 className="text-2xl font-semibold mt-6 mb-2">Children and vulnerable users</h2>
        <p className="mb-4">
          AVETPA does not knowingly collect personal information from children under 15 years
          of age. If we become aware that we have inadvertently collected such data, we will
          delete it as soon as possible. Parents, guardians, or carers should contact us
          immediately at{" "}
          <a href="mailto:avetpaassociation@gmail.com" className="underline text-teal-600">
            avetpaassociation@gmail.com
          </a>{" "}
          if they believe their dependent’s data has been submitted.
        </p>

        <h2 className="text-2xl font-semibold mt-6 mb-2">What information we collect</h2>
        <p className="mb-4">
          We collect information you provide when you register, contact us, or use features of the platform.
          This may include your name, email, address, qualification data, PD records, or uploaded documents.
        </p>

        <h2 className="text-2xl font-semibold mt-6 mb-2">How we use your information</h2>
        <p className="mb-4">
          AVETPA uses your information to support your membership, provide services, maintain
          compliance tools, and communicate relevant updates or event reminders.
        </p>

        <h2 className="text-2xl font-semibold mt-6 mb-2">Data security and third-party services</h2>
        <p className="mb-4">
          We use Supabase to manage and store user information securely. While we take reasonable
          precautions, no method of online transmission or storage is 100% secure.
        </p>

        <h2 className="text-2xl font-semibold mt-6 mb-2">Your rights and contact</h2>
        <p className="mb-4">
          You can request access to your data or ask for corrections by contacting us. We will
          respond within a reasonable timeframe.
        </p>

        <p className="mt-6 text-sm text-gray-500">Last updated: 23 May 2025</p>

        <button
          onClick={handlePrint}
          className="mt-6 bg-teal-600 text-white px-4 py-2 rounded hover:bg-teal-700"
        >
          📄 Download Privacy Policy (PDF)
        </button>
      </div>
    </div>
  );
}
