import { createApp } from './app';
import { VectorStore } from './db/vectorStore';

// Ensure VectorStore is initialized
const vectorStore = VectorStore.getInstance();
vectorStore.initialize().catch((err) => {
  console.warn('[VectorStore] Warning during initialization:', (err as Error).message);
});

let app: any;
try {
  app = createApp();
} catch (err) {
  console.error('[Startup] Failed to create Express app:', err);
  throw err;
}

const handler = (req: any, res: any) => {
  return app(req, res);
};

export default app;

// CommonJS compatibility for Vercel Node runtime
module.exports = app;
module.exports.default = app;
module.exports.handler = handler;
