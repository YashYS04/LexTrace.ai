"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./app");
const vectorStore_1 = require("./db/vectorStore");
// Ensure VectorStore is initialized
const vectorStore = vectorStore_1.VectorStore.getInstance();
vectorStore.initialize().catch((err) => {
    console.warn('[VectorStore] Warning during initialization:', err.message);
});
const app = (0, app_1.createApp)();
exports.default = app;
// CommonJS compatibility for Vercel Node runtime
module.exports = app;
module.exports.default = app;
