'use client';

import { useState } from 'react';
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist/legacy/build/pdf';
import mammoth from 'mammoth';
import Papa from 'papaparse';
import { createWorker } from 'tesseract.js';
import rtoLookup from '@/data/current_rto_lookup.json';
import qualData from '@/data/qualifications_and_units.json';

GlobalWorkerOptions.workerSrc = '/pdf-worker/worker.min.js';

const UNIT_CODE_REGEX = /\b[A-Z]{3,6}\d{3}[A-Z]?\b/g;
const QUAL_CODE_REGEX = /\b[A-Z]{3}\d{5}\b/g;
const DATE_REGEX = /\b(?:\d{1,2}[\/\-]){2}\d{2,4}\b/g;
const RTO_PATTERNS = [
  /(?:RTO\s*(?:Code|Number)?|NTIS\s*Code|NRT\s*Code|SRTO\s*Code|National\s*Code)[:\s]*?(\d{3,6})/gi,
  /\bRTO\s*(\d{3,6})\b/gi
];

type ExtractedEntry = {
  code: string;
  title: string;
  type: 'Qualification' | 'Unit';
  rtoCode: string;
  provider: string;
  dateAwarded: string;
  status?: string;
  linkedUnits?: {
    code: string;
    title: string;
    type: 'Unit';
    status?: string;
  }[];
};

interface Props {
  onExtracted: (entries: ExtractedEntry[]) => void;
}

export default function TaeAnalyzer({ onExtracted }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const formatDateToDDMMYYYY = (input: string): string => {
    const [d, m, y] = input.split(/[\/\-]/);
    if (!d || !m || !y) return input;
    const dd = d.padStart(2, '0');
    const mm = m.padStart(2, '0');
    const yyyy = y.length === 2 ? `20${y}` : y;
    return `${dd}/${mm}/${yyyy}`;
  };

  const extractRTOs = (text: string): string => {
    for (const pattern of RTO_PATTERNS) {
      const match = pattern.exec(text);
      if (match) return match[1];
    }
    return '';
  };

  const lookupByCode = (code: string) => {
    return (
      qualData.qualifications?.find((q) => q.code.toUpperCase() === code.toUpperCase()) ||
      qualData.units?.find((u) => u.code.toUpperCase() === code.toUpperCase()) ||
      null
    );
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) await handleFile(file);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) await handleFile(file);
  };

  const handleFile = async (file: File) => {
    setLoading(true);
    setError('');
    const ext = file.name.split('.').pop()?.toLowerCase();

    try {
      if (ext === 'pdf') {
        await handlePdf(file);
      } else if (ext === 'docx') {
        const buffer = await file.arrayBuffer();
        const { value } = await mammoth.extractRawText({ arrayBuffer: buffer });
        extractData(value);
      } else if (ext === 'csv') {
        Papa.parse(file, {
          complete: (results) => {
            const text = (results.data as string[][]).flat().join(' ');
            extractData(text);
          },
          error: (err) => setError('CSV Parse Error: ' + err.message)
        });
      } else {
        setError('Unsupported file type. Please upload a PDF, DOCX, or CSV.');
      }
    } catch (err) {
      console.error('File parse error:', err);
      setError('Something went wrong. Please try manual entry.');
    } finally {
      setLoading(false);
    }
  };

  const handlePdf = async (file: File) => {
    const buffer = await file.arrayBuffer();
    const pdf = await getDocument({ data: buffer }).promise;
    let fullText = '';

    for (let i = 0; i < pdf.numPages; i++) {
      const page = await pdf.getPage(i + 1);
      const content = await page.getTextContent();
      const pageText = content.items.map((item: any) => item.str).join(' ');
      fullText += pageText;
    }

    if (fullText.trim().length < 10) {
      console.warn('🧠 OCR fallback triggered...');
      const worker = await createWorker({
        workerPath: '/pdf-worker/worker.min.js',
        corePath: '/pdf-worker/tesseract-core.wasm',
        langPath: '/pdf-worker',
        logger: () => {}
      });
      await worker.load();
      await worker.loadLanguage('eng');
      await worker.initialize('eng');
      const { data: { text } } = await worker.recognize(file);
      await worker.terminate();
      fullText = text;
    }

    if (!fullText.trim()) {
      setError('No readable text found. Please try a clearer scan or enter manually.');
    } else {
      extractData(fullText);
    }
  };

  const extractData = (text: string) => {
    const lines = text.split(/\r?\n|(?<=\w)\s{2,}(?=\w)/g);
    const dateMatches = [...text.matchAll(DATE_REGEX)].map((m) => formatDateToDDMMYYYY(m[0]));
    const rtoCode = extractRTOs(text);
    const provider = rtoLookup[rtoCode]?.name || '';

    const qualifications: ExtractedEntry[] = [];
    const standaloneUnits: ExtractedEntry[] = [];
    let currentQual: ExtractedEntry | null = null;
    let isTranscript = false;

    for (let line of lines) {
      const lower = line.toLowerCase();

      if (
        lower.includes('record of results') ||
        lower.includes('transcript') ||
        lower.includes('competencies attained') ||
        lower.includes('units achieved') ||
        lower.includes('attainment') ||
        lower.includes('this certifies')
      ) {
        isTranscript = true;
        continue;
      }

      const qualMatch = line.match(QUAL_CODE_REGEX);
      if (qualMatch) {
        const code = qualMatch[0];
        if (!code.startsWith('TAE')) continue;
        const lookup = lookupByCode(code);
        currentQual = {
          code,
          title: lookup?.title || '',
          type: 'Qualification',
          rtoCode,
          provider,
          dateAwarded: dateMatches[0] || '',
          linkedUnits: []
        };
        qualifications.push(currentQual);
        continue;
      }

      const unitMatch = line.match(UNIT_CODE_REGEX);
      if (unitMatch) {
        const code = unitMatch[0];
        if (!code.startsWith('TAE')) continue;
        const lookup = lookupByCode(code);
        const unit = {
          code,
          title: lookup?.title || '',
          type: 'Unit',
          status: lookup?.status || '',
          rtoCode,
          provider,
          dateAwarded: dateMatches[0] || ''
        };

        if (isTranscript && currentQual) {
          currentQual.linkedUnits?.push({
            code: unit.code,
            title: unit.title,
            type: 'Unit',
            status: unit.status
          });
        } else {
          standaloneUnits.push(unit);
        }
      }
    }

    onExtracted([...qualifications, ...standaloneUnits]);
  };

  return (
    <div
      className="p-4 border border-dashed border-gray-400 rounded text-center"
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
    >
      <h3 className="font-semibold mb-2">📂 Upload Certificate File (PDF, DOCX, CSV)</h3>
      <input type="file" accept=".pdf,.docx,.csv" onChange={handleFileSelect} className="mb-2" />
      <p className="text-sm text-gray-500">Or drag and drop your file above</p>
      {loading && <p className="text-teal-600">⏳ Processing...</p>}
      {error && <p className="text-red-600">❌ {error}</p>}
    </div>
  );
}
