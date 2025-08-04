import mammoth from 'mammoth';
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist';
import Tesseract from 'tesseract.js';
import qualificationsData from '@/data/qualifications_and_units.json';
import rtoLookup from '@/data/current_rto_lookup.json';

// Required for PDF text extraction
GlobalWorkerOptions.workerSrc = '/pdf-worker/worker.min.js';

// File type helpers
const extractTextFromPDF = async (file: File): Promise<string> => {
  const buffer = await file.arrayBuffer();
  const pdf = await getDocument({ data: buffer }).promise;
  let text = '';
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    text += content.items.map((s: any) => s.str).join(' ') + '\n';
  }
  return text;
};

const extractTextFromDocx = async (file: File): Promise<string> => {
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return result.value;
};

const extractTextFromImage = async (file: File): Promise<string> => {
  const { data: { text } } = await Tesseract.recognize(file, 'eng');
  return text;
};

// Lookup helpers
const getStatus = (code: string): string => {
  const all = [...(qualificationsData?.qualifications || []), ...(qualificationsData?.units || [])];
  const match = all.find((q: any) => q.code === code);
  return match ? match.status || 'unknown' : 'unknown';
};

const getTitle = (code: string): string => {
  const all = [...(qualificationsData?.qualifications || []), ...(qualificationsData?.units || [])];
  const match = all.find((q: any) => q.code === code);
  return match ? match.title : '';
};

const getProvider = (rtoCode: string): string => {
  return rtoLookup[rtoCode] || '';
};

// Extractors
const extractCodes = (text: string, regex: RegExp): string[] => {
  return Array.from(new Set([...text.matchAll(regex)].map(m => m[0])));
};

const extractSection = (text: string, headerKeywords: string[]): string => {
  const lines = text.split(/\n|\r/).map(l => l.trim());
  let start = -1;
  let end = lines.length;
  headerKeywords = headerKeywords.map(h => h.toLowerCase());

  lines.forEach((line, i) => {
    const lower = line.toLowerCase();
    if (start === -1 && headerKeywords.some(h => lower.includes(h))) {
      start = i;
    } else if (start !== -1 && headerKeywords.every(h => !lower.includes(h))) {
      if (line.match(/^(TAE|CHC|BSB|PD|employment|training)/i)) end = i;
    }
  });
  return start !== -1 ? lines.slice(start, end).join('\n') : '';
};

// Main parser
const parseTrainerProfile = async (file: File) => {
  let text = '';
  const ext = file.name.split('.').pop()?.toLowerCase();

  if (ext === 'pdf') {
    text = await extractTextFromPDF(file);
  } else if (['doc', 'docx', 'rtf'].includes(ext || '')) {
    text = await extractTextFromDocx(file);
  } else if (['jpg', 'jpeg', 'png'].includes(ext || '')) {
    text = await extractTextFromImage(file);
  } else {
    throw new Error('Unsupported file type');
  }

  const TAE_REGEX = /TAE[A-Z]{3}\d{3}/g;
  const QUAL_REGEX = /\b[A-Z]{3}\d{5}\b/g;
  const UNIT_REGEX = /\b[A-Z]{4}\d{3}[A-Z]?\b/g;
  const RTO_REGEX = /\b(\d{4,7})\b/g;

  const taeCodes = extractCodes(text, TAE_REGEX);
  const qualCodes = extractCodes(text, QUAL_REGEX);
  const unitCodes = extractCodes(text, UNIT_REGEX);
  const rtoCodes = extractCodes(text, RTO_REGEX);

  const mapEntries = (codes: string[], type: 'qualification' | 'unit') =>
    codes.map(code => ({
      code,
      title: getTitle(code),
      status: getStatus(code),
      rtoCode: rtoCodes[0] || '',
      provider: getProvider(rtoCodes[0] || ''),
      type
    }));

  const pdSection = extractSection(text, ['professional development', 'pd record', 'training attended']);
  const pdEntries = pdSection
    .split(/\n+/)
    .filter(line => line.length > 5 && /\d{4}/.test(line))
    .map(line => ({
      description: line,
      activityDate: '',
    }));

  const empSection = extractSection(text, ['work history', 'employment', 'industry experience']);
  const empEntries = empSection
    .split(/\n+/)
    .filter(line => line.length > 5 && /\d{4}/.test(line))
    .map(line => ({
      role: '',
      business: '',
      duties: line,
      startDate: '',
      endDate: ''
    }));

  const parsedData = {
    trainingProducts: mapEntries([...taeCodes], 'qualification'),
    vocationalQualifications: mapEntries(
      qualCodes.filter(q => !q.startsWith('TAE')),
      'qualification'
    ),
    vocationalCompetency: mapEntries(
      unitCodes.filter(u => !u.startsWith('TAE')),
      'unit'
    ),
    industryEmployment: empEntries,
    industryLicences: [],
    professionalDevelopment: pdEntries,
    tertiaryQualifications: []
  };

  return parsedData;
};

export default parseTrainerProfile;
