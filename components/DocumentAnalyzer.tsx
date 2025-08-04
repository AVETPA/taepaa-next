import { useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
import mammoth from "mammoth";
import Papa from "papaparse";
import { createWorker } from "tesseract.js";

import rtoLookup from "../data/current_rto_lookup.json";
import qualData from "../data/qualifications_and_units.json";

pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf-worker/pdf.worker.min.js";

window.Tesseract = {
  ...window.Tesseract,
  workerPath: "/pdf-worker/worker.min.js",
  corePath: "/pdf-worker/tesseract-core.wasm",
  langPath: "/pdf-worker",
};

const UNIT_CODE_REGEX = /\b[A-Z]{3,6}\d{3}[A-Z]?\b/g;
const QUAL_CODE_REGEX = /\b[A-Z]{3}\d{5}\b/g;
const DATE_REGEX = /\b\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}\b/g;
const RTO_PATTERNS = [
  /(?:RTO\s*(?:Code|Number)?|NTIS\s*Code|NRT\s*Code|SRTO\s*Code|National\s*Code)[:\s]*?(\d{3,6})/gi,
  /\bRTO\s*(\d{3,6})\b/gi,
];

const extractRTOs = (text) => {
  for (const pattern of RTO_PATTERNS) {
    const clonedPattern = new RegExp(pattern.source, pattern.flags);
    const match = clonedPattern.exec(text);
    if (match) return match[1];
  }
  return "";
};

const lookupByCode = (code) => {
  return (
    qualData.qualifications.find((q) => q.code.toUpperCase() === code.toUpperCase()) ||
    qualData.units.find((u) => u.code.toUpperCase() === code.toUpperCase()) ||
    null
  );
};

export default function TAEAnalyzer({ onComplete }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleDrop = async (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) await handleFile(file);
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (file) await handleFile(file);
  };

  const handleFile = async (file) => {
    setLoading(true);
    setError("");
    const ext = file.name.split(".").pop().toLowerCase();

    try {
      if (ext === "pdf") {
        await handlePdf(file);
      } else if (ext === "docx") {
        const buffer = await file.arrayBuffer();
        const { value } = await mammoth.extractRawText({ arrayBuffer: buffer });
        extractData(value);
      } else if (ext === "csv") {
        Papa.parse(file, {
          complete: (results) => {
            const text = results.data.flat().join(" ");
            extractData(text);
          },
          error: (err) => setError("CSV Parse Error: " + err.message),
        });
      } else {
        setError("Unsupported file type. Please enter manually.");
      }
    } catch (err) {
      console.error("File parse error:", err);
      setError("Something went wrong. Please enter manually.");
    } finally {
      setLoading(false);
    }
  };

  const handlePdf = async (file) => {
    const buffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
    let fullText = "";

    for (let i = 0; i < pdf.numPages; i++) {
      const page = await pdf.getPage(i + 1);
      const content = await page.getTextContent();
      const pageText = content.items.map((item) => item.str).join(" ");
      fullText += pageText;
    }

    if (fullText.trim().length < 10) {
      console.warn("🧠 Falling back to OCR...");

      const worker = await createWorker({
        workerPath: "/pdf-worker/worker.min.js",
        corePath: "/pdf-worker/tesseract-core.wasm",
        langPath: "/pdf-worker",
      });

      await worker.load();
      await worker.loadLanguage("eng");
      await worker.initialize("eng");

      const {
        data: { text },
      } = await worker.recognize(file);

      await worker.terminate();
      fullText = text;
    }

    if (!fullText.trim()) {
      setError("No text could be extracted from this file. Please enter manually.");
    } else {
      extractData(fullText);
    }
  };

  const extractData = (text) => {
    const lines = text.split(/\r?\n|(?<=\w)\s{2,}(?=\w)/g);
    const lowerText = text.toLowerCase();

    const resumeKeywords = ["employment", "experience", "work history", "duties", "responsibilities"];
    const looksLikeResume = resumeKeywords.some((kw) => lowerText.includes(kw));

    if (looksLikeResume) {
      const employmentEntries = extractEmploymentHistory(lines);
      onComplete(employmentEntries.map((e) => ({ ...e, type: "Employment" })));
      return;
    }

    const dateMatches = [...text.matchAll(DATE_REGEX)].map((m) => m[0]);
    const rawDate = dateMatches[0] || "";
    const parsedDate = rawDate
      ? new Date(rawDate.split(/[\/\-]/).reverse().join("-"))
      : null;

    const rtoCode = extractRTOs(text);
    const provider = rtoLookup[rtoCode]?.name || "";

    const qualifications = [];
    const standaloneUnits = [];
    let currentQual = null;
    let isTranscript = false;

    for (let line of lines) {
      const lower = line.toLowerCase();

      if (
        lower.includes("record of results") ||
        lower.includes("transcript") ||
        lower.includes("competencies attained") ||
        lower.includes("units achieved") ||
        lower.includes("attainment") ||
        lower.includes("this certifies")
      ) {
        isTranscript = true;
        continue;
      }

      const qualMatch = line.match(QUAL_CODE_REGEX);
      if (qualMatch) {
        const code = qualMatch[0];
        const lookup = lookupByCode(code);
        currentQual = {
          code,
          title: lookup?.title || "",
          type: lookup?.type || "Qualification",
          rtoCode,
          provider,
          dateAwarded: parsedDate,
          linkedUnits: [],
        };
        qualifications.push(currentQual);
        continue;
      }

      const unitMatch = line.match(UNIT_CODE_REGEX);
      if (unitMatch) {
        for (const code of unitMatch) {
          const lookup = lookupByCode(code);
          const unit = {
            code,
            title: lookup?.title || "",
            type: "Unit",
            status: lookup?.status || "",
          };

          if (isTranscript && currentQual) {
            currentQual.linkedUnits.push(unit);
          } else {
            standaloneUnits.push({
              ...unit,
              rtoCode,
              provider,
              dateAwarded: parsedDate,
            });
          }
        }
      }
    }

    onComplete([...qualifications, ...standaloneUnits]);
  };

  const extractEmploymentHistory = (lines) => {
    const entries = [];
    let current = { employer: "", summary: "", dateCommenced: "", duration: "", relevance: "" };

    lines.forEach((line) => {
      const lower = line.toLowerCase();

      if (lower.includes("company") || lower.includes("employer") || lower.includes("organisation")) {
        if (current.employer) entries.push(current);
        current = { employer: line.trim(), summary: "", dateCommenced: "", duration: "", relevance: "" };
      } else if (lower.includes("duties") || lower.includes("responsibilities") || lower.includes("summary")) {
        current.summary += ` ${line.trim()}`;
      } else if (line.match(/\b\d{4}\b/)) {
        current.dateCommenced = line.trim();
      } else if (line.match(/(months|years|duration)/i)) {
        current.duration = line.trim();
      } else if (lower.includes("relevant") || lower.includes("qualification")) {
        current.relevance = line.trim();
      } else {
        current.summary += ` ${line.trim()}`;
      }
    });

    if (current.employer) entries.push(current);
    return entries;
  };

  return (
    <div
      className="p-4 border-2 border-dashed border-teal-500 bg-white rounded cursor-pointer hover:bg-teal-50 transition"
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
    >
      <h3 className="text-md font-semibold text-gray-700 mb-1">📂 Drag & Drop Certificate or Resume</h3>
      <p className="text-sm text-gray-500 mb-2">(PDF, DOCX, CSV)</p>
      <input
        type="file"
        accept=".pdf,.docx,.csv"
        onChange={handleFileSelect}
        className="mx-auto"
      />
      {loading && <p className="text-teal-600 mt-2">⏳ Processing...</p>}
      {error && <p className="text-red-600 mt-2">❌ {error}</p>}
    </div>
  );
}
