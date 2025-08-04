// utils/pdfConfig.ts

import { pdfjs } from 'react-pdf';

// In Next.js, PUBLIC_URL is not defined — use /public directly
pdfjs.GlobalWorkerOptions.workerSrc = '/pdf-worker/pdf.worker.min.js';
