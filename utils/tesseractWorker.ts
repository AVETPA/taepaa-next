// utils/tesseractWorker.ts
import { createWorker, Worker } from 'tesseract.js';

let worker: Worker | null = null;

/**
 * Initializes and returns a singleton Tesseract.js worker
 */
export async function getWorker(): Promise<Worker | null> {
  if (!worker) {
    try {
      worker = await createWorker({
        workerPath: '/pdf-worker/worker.min.js',
        langPath: '/pdf-worker',
        corePath: '/pdf-worker/tesseract-core.wasm',
      });
      await worker.load();
      await worker.loadLanguage('eng');
      await worker.initialize('eng');
    } catch (err) {
      console.error('⚠️ Failed to create Tesseract worker:', err);
      worker = null;
    }
  }
  return worker;
}

/**
 * Terminates the Tesseract.js worker to free up memory
 */
export async function terminateWorker(): Promise<void> {
  if (worker) {
    await worker.terminate();
    worker = null;
  }
}
