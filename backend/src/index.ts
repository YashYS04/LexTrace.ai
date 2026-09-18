import { createApp } from './app';
import { VectorStore } from './db/vectorStore';

// Ensure VectorStore is initialized
const vectorStore = VectorStore.getInstance();
vectorStore.initialize().catch((err) => {
  console.warn('[VectorStore] Warning during initialization:', (err as Error).message);
});

const app = createApp();

export default app;

// CommonJS compatibility for Vercel Node runtime
module.exports = app;
module.exports.default = app;
