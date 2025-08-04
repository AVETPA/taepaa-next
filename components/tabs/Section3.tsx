// src/components/profile/Section3.tsx
"use client";

import React, { useState, useEffect, useRef } from "react";
import { createClient } from "@supabase/supabase-js";
import useAuth from "../../hooks/useAuth";
import SectionCard from "../layout/SectionCard";
import rtoLookup from "../../data/current_rto_lookup.json";
import qualificationsData from "../../data/qualifications_and_units.json";
import toast from "react-hot-toast";
import { useSearchParams } from "next/navigation";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type QualificationEntry = {
  id: number;
  code: string;
  title: string;
  provider: string;
  rto_code: string;
  date_awarded: string;
  status: string;
  superseded_by: string;
  type: string;
};

type LinkedUnit = {
  code: string;
  title: string;
};

type FormState = {
  code: string;
  title: string;
  provider: string;
  rtoCode: string;
  dateAwarded: string;
  status: string;
  supersededBy: string;
  type: string;
};

const isTAEQualification = (code: string) =>
  code.startsWith("TAE") && /^[A-Z]{3}\d{5}$/.test(code);

const Section3: React.FC = () => {
  const { user } = useAuth();
  const userId = user?.id || user?.uid;
  const formRef = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();
  const [qualificationEntries, setQualificationEntries] = useState<QualificationEntry[]>([]);
  const [unitEntries, setUnitEntries] = useState<QualificationEntry[]>([]);
  const [editId, setEditId] = useState<number | null>(null);
  const [editUnitId, setEditUnitId] = useState<number | null>(null);
  const [qualifications, setQualifications] = useState<Record<string, any>>({});

  const [form, setForm] = useState<FormState>({
    code: "",
    title: "",
    provider: "",
    rtoCode: "",
    dateAwarded: "",
    status: "",
    supersededBy: "",
    type: ""
  });

  useEffect(() => {
    if (!userId) return;
    const map: Record<string, any> = {};
    qualificationsData.qualifications.forEach((q: any) => {
      map[q.code.toUpperCase()] = {
        title: q.title,
        status: q.status,
        supersededBy: q.supersededBy || "",
        type: "Qualification",
        linkedUnits: q.linkedUnits || []
      };
    });
    qualificationsData.units.forEach((u: any) => {
      map[u.code.toUpperCase()] = {
        title: u.title,
        status: u.status,
        supersededBy: u.supersededBy || "",
        type: "Unit"
      };
    });
    setQualifications(map);
    fetchEntries();
  }, [userId]);

  const fetchEntries = async () => {
    const [qualRes, unitRes] = await Promise.all([
      supabase.from("vocational_qualifications").select("*").eq("user_id", userId),
      supabase.from("standalone_vocational_units").select("*").eq("user_id", userId)
    ]);

    if (qualRes.error) toast.error("Failed to load qualifications");
    else setQualificationEntries(qualRes.data.filter((e: any) => !isTAEQualification(e.code)));

    if (unitRes.error) toast.error("Failed to load standalone units");
    else setUnitEntries(unitRes.data);
  };

  const getProvider = (rtoCode: string) => rtoLookup[rtoCode]?.name || "unknown";

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "code") {
      const code = value.toUpperCase();
      const match = qualifications[code];
      setForm((prev) => ({
        ...prev,
        code,
        ...(match
          ? {
              title: match.title || "",
              status: match.status || "Current",
              supersededBy: match.supersededBy || "",
              type: match.type || ""
            }
          : {}),
        provider: getProvider(prev.rtoCode)
      }));
    } else if (name === "rtoCode") {
      setForm((prev) => ({ ...prev, rtoCode: value, provider: getProvider(value) }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async () => {
    const { code, rtoCode, dateAwarded, title } = form;
    if (!code || !rtoCode || !dateAwarded || !title) {
      toast.error("Please complete all required fields");
      return;
    }
    if (isTAEQualification(code)) {
      toast.error("TAE qualifications must be added in Section 1");
      return;
    }

    const payload = {
      code: form.code.toUpperCase(),
      title: form.title,
      provider: form.provider,
      rto_code: form.rtoCode,
      date_awarded: form.dateAwarded,
      status: form.status || "Current",
      superseded_by: form.supersededBy || "",
      type: form.type,
      user_id: userId
    };

    const targetTable = form.type === "Unit" ? "standalone_vocational_units" : "vocational_qualifications";
    const isEdit = form.type === "Unit" ? editUnitId : editId;

    let error;
    if (isEdit) {
      ({ error } = await supabase.from(targetTable).update(payload).eq("id", isEdit));
    } else {
      ({ error } = await supabase.from(targetTable).insert([payload]));
    }

    if (error) toast.error("Save failed");
    else toast.success(isEdit ? "Updated" : "Added");

    setForm({ code: "", title: "", provider: "", rtoCode: "", dateAwarded: "", status: "", supersededBy: "", type: "" });
    setEditId(null);
    setEditUnitId(null);
    fetchEntries();
  };

  const handleEdit = (entry: QualificationEntry, isUnit = false) => {
    setForm({
      code: entry.code,
      title: entry.title,
      provider: entry.provider,
      rtoCode: entry.rto_code,
      dateAwarded: entry.date_awarded,
      status: entry.status,
      supersededBy: entry.superseded_by,
      type: entry.type
    });
    isUnit ? setEditUnitId(entry.id) : setEditId(entry.id);
    formRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const renderLinkedUnits = (code: string) => {
    const unitList: LinkedUnit[] = qualifications[code]?.linkedUnits || [];
    return unitList.length > 0 ? (
      <ul className="ml-4 text-xs text-gray-600 list-disc">
        {unitList.map((unit) => (
          <li key={unit.code}>{unit.code} — {unit.title}</li>
        ))}
      </ul>
    ) : null;
  };

  const renderStatusIcon = (status: string) => {
    switch (status) {
      case "Current": return <span title="Current">✅</span>;
      case "Superseded": return <span title="Superseded">⚠️</span>;
      case "Deleted": return <span title="Deleted">❌</span>;
      default: return <span title="Unknown">—</span>;
    }
  };

  const renderTable = (data: QualificationEntry[], isUnit = false) => (
    <table className="w-full text-sm border">
      <thead className="bg-gray-100">
        <tr>
          <th className="p-2 border">Code</th>
          <th className="p-2 border">Title</th>
          <th className="p-2 border">RTO Code</th>
          <th className="p-2 border">Provider</th>
          <th className="p-2 border">Date Awarded</th>
          <th className="p-2 border">Status</th>
          <th className="p-2 border">Actions</th>
        </tr>
      </thead>
      <tbody>
        {data.map((entry) => (
          <React.Fragment key={entry.id}>
            <tr>
              <td className="p-2 border font-mono">{entry.code}</td>
              <td className="p-2 border">{entry.title || "—"}</td>
              <td className="p-2 border">{entry.rto_code || "—"}</td>
              <td className="p-2 border">{entry.provider || "—"}</td>
              <td className="p-2 border">{new Date(entry.date_awarded + "T00:00:00").toLocaleDateString("en-AU")}</td>
              <td className="p-2 border">{renderStatusIcon(entry.status)}</td>
              <td className="p-2 border space-x-2">
                <button onClick={() => handleEdit(entry, isUnit)} className="text-blue-600 hover:underline">Edit</button>
              </td>
            </tr>
            {!isUnit && renderLinkedUnits(entry.code)}
          </React.Fragment>
        ))}
      </tbody>
    </table>
  );

  return (
    <SectionCard title="Vocational Qualifications & Units">
      <div className="p-6">
        <div ref={formRef} className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 p-4 rounded">
          <input name="code" className="border p-2 rounded" placeholder="Code" value={form.code} onChange={handleChange} />
          <input className="border p-2 rounded bg-gray-100" placeholder="Title" value={form.title} readOnly />
          <input name="rtoCode" className="border p-2 rounded" placeholder="RTO Code" value={form.rtoCode} onChange={handleChange} />
          <input className="border p-2 rounded bg-gray-100" placeholder="Provider" value={form.provider} readOnly />
          <input name="dateAwarded" type="date" className="border p-2 rounded" value={form.dateAwarded || ""} onChange={handleChange} />
          <div className="flex gap-2">
            <button onClick={handleSubmit} className="bg-teal-600 hover:bg-teal-700 text-white p-2 rounded">
              {(editId || editUnitId) ? "Update" : "+ Add Qualification or Unit"}
            </button>
          </div>
        </div>

        <div className="mt-10">
          <h3 className="text-lg font-semibold mb-2">Vocational Qualifications</h3>
          {renderTable(qualificationEntries)}
        </div>

        <div className="mt-10">
          <h3 className="text-lg font-semibold mb-2">Standalone Units</h3>
          {renderTable(unitEntries, true)}
        </div>
      </div>
    </SectionCard>
  );
};

export default Section3;
