import { createApp } from './app';
import { env } from './config/env';
import { VectorStore } from './db/vectorStore';

async function startServer(): Promise<void> {
  const app = createApp();

  // Initialize and seed vector store
  const vectorStore = VectorStore.getInstance();
  await vectorStore.initialize();

  const port = env.PORT || 3000;
  app.listen(port, () => {
    console.log(`=======================================================`);
    console.log(`🚀 LexTrace AI Backend running on http://localhost:${port}`);
    console.log(`🛡️  Model: ${env.GEMINI_MODEL}`);
    console.log(`📜 Slogan: Trace the clause. Understand the risk. Know what to ask.`);
    console.log(`=======================================================`);
  });
}

if (process.env.NODE_ENV !== 'test') {
  startServer().catch((err) => {
    console.error('Fatal server startup error:', err);
    process.exit(1);
  });
}
