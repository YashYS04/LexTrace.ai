"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./app");
const vectorStore_1 = require("./db/vectorStore");
// Ensure VectorStore is initialized
const vectorStore = vectorStore_1.VectorStore.getInstance();
vectorStore.initialize().catch((err) => {
    console.warn('[VectorStore] Warning during initialization:', err.message);
});
let app;
try {
    app = (0, app_1.createApp)();
}
catch (err) {
    console.error('[Startup] Failed to create Express app:', err);
    throw err;
}
/**
 * Serverless function invocation handler for cloud edge runtimes.
 */
const handler = (req, res) => {
    app(req, res);
};
exports.default = app;
// CommonJS compatibility for Vercel Node runtime
module.exports = app;
module.exports.default = app;
module.exports.handler = handler;
