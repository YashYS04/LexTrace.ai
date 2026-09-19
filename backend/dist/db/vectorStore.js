"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VectorStore = void 0;
const benchmarkClauses_1 = require("../seeds/benchmarkClauses");
class VectorStore {
    static instance;
    benchmarks = [...benchmarkClauses_1.SEED_BENCHMARKS];
    isInitialized = false;
    benchmarkTokenCache = new Map();
    constructor() { }
    static getInstance() {
        if (!VectorStore.instance) {
            VectorStore.instance = new VectorStore();
        }
        return VectorStore.instance;
    }
    /**
     * Tokenize string into lowercase alphanumeric word set.
     */
    static tokenize(str) {
        return new Set(str
            .toLowerCase()
            .replace(/[^\w\s]/g, ' ')
            .split(/\s+/)
            .filter((w) => w.length > 3));
    }
    /**
     * Initialize and seed the benchmark corpus with pre-computed token caches.
     */
    async initialize() {
        if (this.isInitialized)
            return;
        if (!this.benchmarks || this.benchmarks.length === 0) {
            this.benchmarks = [...benchmarkClauses_1.SEED_BENCHMARKS];
        }
        // Pre-compute token sets for all benchmarks to ensure O(1) similarity comparisons
        for (const bm of this.benchmarks) {
            this.benchmarkTokenCache.set(bm.id, VectorStore.tokenize(bm.standardText));
        }
        this.isInitialized = true;
        console.log(`[VectorStore] Initialized with ${this.benchmarks.length} market benchmark clauses.`);
    }
    /**
     * Cosine similarity between two float vectors.
     */
    static cosineSimilarity(vecA, vecB) {
        if (!vecA || !vecB || vecA.length !== vecB.length)
            return 0;
        let dotProduct = 0;
        let normA = 0;
        let normB = 0;
        for (let i = 0; i < vecA.length; i++) {
            dotProduct += vecA[i] * vecB[i];
            normA += vecA[i] * vecA[i];
            normB += vecB[i] * vecB[i];
        }
        if (normA === 0 || normB === 0)
            return 0;
        return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
    }
    /**
     * Fast token-overlap and keyword semantic similarity using Jaccard index.
     */
    static lexicalSemanticSimilarity(textA, textB) {
        const tokensA = VectorStore.tokenize(textA);
        const tokensB = VectorStore.tokenize(textB);
        return VectorStore.computeJaccard(tokensA, tokensB);
    }
    /**
     * Fast Jaccard similarity between two pre-computed token sets.
     */
    static computeJaccard(tokensA, tokensB) {
        if (tokensA.size === 0 || tokensB.size === 0)
            return 0;
        let intersection = 0;
        for (const token of tokensA) {
            if (tokensB.has(token)) {
                intersection++;
            }
        }
        const union = new Set([...tokensA, ...tokensB]).size;
        return union === 0 ? 0 : intersection / union;
    }
    /**
     * Find the most relevant market-standard benchmark clause for a given clause type and text.
     * Utilizes pre-tokenized benchmark caches for ultra-low latency.
     */
    findNearestBenchmark(clauseType, clauseText, persona = 'All', clauseEmbedding) {
        if (this.benchmarks.length === 0)
            return null;
        // Filter by clauseType and persona compatibility
        let candidates = this.benchmarks.filter((b) => b.clauseType.toLowerCase() === clauseType.toLowerCase() &&
            (b.applicablePersonas.includes('All') ||
                b.applicablePersonas.includes(persona) ||
                persona === 'All'));
        // Fallback: match by clauseType only
        if (candidates.length === 0) {
            candidates = this.benchmarks.filter((b) => b.clauseType.toLowerCase() === clauseType.toLowerCase());
        }
        // Fallback: all benchmarks
        if (candidates.length === 0) {
            candidates = this.benchmarks;
        }
        let bestMatch = candidates[0];
        let highestScore = -1;
        // Tokenize target clause once for all candidate comparisons
        const clauseTokens = !clauseEmbedding ? VectorStore.tokenize(clauseText) : null;
        for (const candidate of candidates) {
            let score = 0;
            if (clauseEmbedding && candidate.embedding) {
                score = VectorStore.cosineSimilarity(clauseEmbedding, candidate.embedding);
            }
            else if (clauseTokens) {
                // Fast-path using cached benchmark token sets
                const cachedBmTokens = this.benchmarkTokenCache.get(candidate.id) || VectorStore.tokenize(candidate.standardText);
                score = VectorStore.computeJaccard(clauseTokens, cachedBmTokens);
                // Boost if clauseType matches exactly
                if (candidate.clauseType.toLowerCase() === clauseType.toLowerCase()) {
                    score = Math.min(1.0, score + 0.35);
                }
            }
            if (score > highestScore) {
                highestScore = score;
                bestMatch = candidate;
            }
        }
        return {
            benchmark: bestMatch,
            similarity: Math.round(Math.max(0.1, highestScore) * 100) / 100,
        };
    }
    getAllBenchmarks() {
        return [...this.benchmarks];
    }
}
exports.VectorStore = VectorStore;
