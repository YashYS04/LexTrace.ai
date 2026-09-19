import { Application, Request, Response } from 'express';
import { createApp } from './app';
import { VectorStore } from './db/vectorStore';

// Ensure VectorStore is initialized
const vectorStore = VectorStore.getInstance();
vectorStore.initialize().catch((err: Error) => {
  console.warn('[VectorStore] Warning during initialization:', err.message);
});

let app: Application;
try {
  app = createApp();
} catch (err) {
  console.error('[Startup] Failed to create Express app:', err);
  throw err;
}

/**
 * Serverless function invocation handler for cloud edge runtimes.
 */
const handler = (req: Request, res: Response): void => {
  app(req, res);
};

export default app;

// CommonJS compatibility for Vercel Node runtime
module.exports = app;
module.exports.default = app;
module.exports.handler = handler;
