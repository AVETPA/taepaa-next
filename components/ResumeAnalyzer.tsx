import { useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
import mammoth from "mammoth";
import Papa from "papaparse";
import { createWorker } from "tesseract.js";

pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf-worker/pdf.worker.min.js";

window.Tesseract = {
  ...window.Tesseract,
  workerPath: "/pdf-worker/worker.min.js",
  corePath: "/pdf-worker/tesseract-core.wasm",
  langPath: "/pdf-worker",
};

export default function ResumeAnalyzer({ onExtracted }) {
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
        const buffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
        let fullText = "";

        for (let i = 0; i < pdf.numPages; i++) {
          const page = await pdf.getPage(i + 1);
          const content = await page.getTextContent();
          fullText += content.items.map((item) => item.str).join(" ");
        }

        if (fullText.trim().length < 10) {
          const worker = await createWorker({
            workerPath: "/pdf-worker/worker.min.js",
            corePath: "/pdf-worker/tesseract-core.wasm",
            langPath: "/pdf-worker",
          });
          await worker.load();
          await worker.loadLanguage("eng");
          await worker.initialize("eng");
          const { data: { text } } = await worker.recognize(file);
          await worker.terminate();
          fullText = text;
        }

        extractResume(fullText);
      } else if (["docx", "doc", "rtf"].includes(ext)) {
        const buffer = await file.arrayBuffer();
        const { value } = await mammoth.extractRawText({ arrayBuffer: buffer });
        extractResume(value);
      } else if (["csv"].includes(ext)) {
        Papa.parse(file, {
          complete: (results) => {
            const text = results.data.flat().join(" ");
            extractResume(text);
          },
          error: (err) => setError("CSV Parse Error: " + err.message),
        });
      } else if (
        file.type.startsWith("image/") ||
        ["jpeg", "jpg", "png", "bmp", "gif", "svg", "webp", "tiff", "heic", "dvg"].includes(ext)
      ) {
        const worker = await createWorker({
          workerPath: "/pdf-worker/worker.min.js",
          corePath: "/pdf-worker/tesseract-core.wasm",
          langPath: "/pdf-worker",
        });
        await worker.load();
        await worker.loadLanguage("eng");
        await worker.initialize("eng");
        const { data: { text } } = await worker.recognize(file);
        await worker.terminate();
        extractResume(text);
      } else {
        setError("Unsupported file type. Upload DOCX, DOC, RTF, PDF, or any image.");
      }
    } catch (err) {
      console.error("File parsing error:", err);
      setError("An error occurred while parsing the file.");
    } finally {
      setLoading(false);
    }
  };

  const extractResume = (text) => {
    const lines = text.split(/\r?\n|(?<=\w)\s{2,}(?=\w)/g);
    const entries = [];
    let current = {
      employer: "",
      summary: "",
      dateCommenced: "",
      duration: "",
      relevance: "",
    };

    for (let line of lines) {
      const lower = line.toLowerCase();

      if (lower.includes("company") || lower.includes("employer") || lower.includes("organisation")) {
        if (current.employer) entries.push(current);
        current = {
          employer: line.trim(),
          summary: "",
          dateCommenced: "",
          duration: "",
          relevance: "",
        };
      } else if (lower.match(/duties|responsibilities|skills|tasks/)) {
        current.summary += ` ${line.trim()}`;
      } else if (lower.match(/role|position|title/)) {
        current.summary += ` ${line.trim()}`;
      } else if (line.match(/\b\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}\b/)) {
        if (!current.dateCommenced) current.dateCommenced = line.trim();
        else current.duration = line.trim();
      } else {
        current.summary += ` ${line.trim()}`;
      }
    }

    if (current.employer) entries.push(current);
    if (onExtracted) onExtracted(entries);
  };

  return (
    <div
      className="p-4 border-2 border-dashed border-teal-500 bg-white rounded cursor-pointer hover:bg-teal-50 transition"
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
    >
      <h3 className="text-md font-semibold text-gray-700 mb-1">📂 Upload Resume to Extract Work History</h3>
      <p className="text-sm text-gray-500 mb-2">Supported formats: PDF, DOC, DOCX, RTF, CSV, XLS, JPG, PNG, BMP, DVG, TIFF, HEIC, and more</p>
      <input
        type="file"
        accept=".pdf,.doc,.docx,.rtf,.csv,.xls,.xlsx,.jpg,.jpeg,.png,.bmp,.gif,.svg,.webp,.tiff,.heic,.dvg"
        onChange={handleFileSelect}
        className="mx-auto"
      />
      {loading && <p className="text-teal-600 mt-2">⏳ Processing file...</p>}
      {error && <p className="text-red-600 mt-2">❌ {error}</p>}
    </div>
  );
}