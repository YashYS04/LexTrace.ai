"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./app");
const env_1 = require("./config/env");
const vectorStore_1 = require("./db/vectorStore");
async function startServer() {
    const app = (0, app_1.createApp)();
    // Initialize and seed vector store
    const vectorStore = vectorStore_1.VectorStore.getInstance();
    await vectorStore.initialize();
    const port = env_1.env.PORT || 3000;
    app.listen(port, () => {
        console.log(`=======================================================`);
        console.log(`🚀 LexTrace AI Backend running on http://localhost:${port}`);
        console.log(`🛡️  Model: ${env_1.env.GEMINI_MODEL}`);
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
