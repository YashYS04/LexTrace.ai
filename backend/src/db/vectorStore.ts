import fs from 'fs';
import path from 'path';
import { BenchmarkClause, PersonaType } from '../types';
import { env } from '../config/env';

export interface VectorSearchResult {
  benchmark: BenchmarkClause;
  similarity: number; // 0.0 to 1.0
}

export class VectorStore {
  private static instance: VectorStore;
  private benchmarks: BenchmarkClause[] = [];
  private isInitialized: boolean = false;

  private constructor() {}

  public static getInstance(): VectorStore {
    if (!VectorStore.instance) {
      VectorStore.instance = new VectorStore();
    }
    return VectorStore.instance;
  }

  /**
   * Initialize and seed the benchmark corpus.
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      const candidates = [
        path.resolve(__dirname, '../seeds/benchmark-clauses.json'),
        path.resolve(__dirname, '../../src/seeds/benchmark-clauses.json'),
        path.resolve(process.cwd(), 'src/seeds/benchmark-clauses.json'),
        path.resolve(process.cwd(), 'backend/src/seeds/benchmark-clauses.json'),
      ];

      const foundPath = candidates.find((p) => fs.existsSync(p));

      if (foundPath) {
        const rawData = fs.readFileSync(foundPath, 'utf-8');
        this.benchmarks = JSON.parse(rawData);
      } else {
        console.warn(`[VectorStore] Seed file not found in candidates. Using built-in fallbacks.`);
      }
    } catch (err) {
      console.error('[VectorStore] Error loading benchmark seeds:', (err as Error).message);
    }

    this.isInitialized = true;
    console.log(`[VectorStore] Initialized with ${this.benchmarks.length} market benchmark clauses.`);
  }

  /**
   * Cosine similarity between two float vectors.
   */
  public static cosineSimilarity(vecA: number[], vecB: number[]): number {
    if (!vecA || !vecB || vecA.length !== vecB.length) return 0;

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }

    if (normA === 0 || normB === 0) return 0;
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  /**
   * Fast token-overlap and keyword semantic similarity (used when vector embeddings are offline or mocked).
   */
  public static lexicalSemanticSimilarity(textA: string, textB: string): number {
    const tokenize = (str: string) =>
      new Set(
        str
          .toLowerCase()
          .replace(/[^\w\s]/g, ' ')
          .split(/\s+/)
          .filter((w) => w.length > 3)
      );

    const tokensA = tokenize(textA);
    const tokensB = tokenize(textB);

    if (tokensA.size === 0 || tokensB.size === 0) return 0;

    let intersection = 0;
    for (const token of tokensA) {
      if (tokensB.has(token)) {
        intersection++;
      }
    }

    // Jaccard similarity
    const union = new Set([...tokensA, ...tokensB]).size;
    return union === 0 ? 0 : intersection / union;
  }

  /**
   * Find the most relevant market-standard benchmark clause for a given clause type and text.
   */
  public findNearestBenchmark(
    clauseType: string,
    clauseText: string,
    persona: PersonaType = 'All',
    clauseEmbedding?: number[]
  ): VectorSearchResult | null {
    if (this.benchmarks.length === 0) return null;

    // Filter by clauseType and persona compatibility
    let candidates = this.benchmarks.filter(
      (b) =>
        b.clauseType.toLowerCase() === clauseType.toLowerCase() &&
        (b.applicablePersonas.includes('All') ||
          b.applicablePersonas.includes(persona) ||
          persona === 'All')
    );

    // Fallback: match by clauseType only
    if (candidates.length === 0) {
      candidates = this.benchmarks.filter(
        (b) => b.clauseType.toLowerCase() === clauseType.toLowerCase()
      );
    }

    // Fallback: all benchmarks
    if (candidates.length === 0) {
      candidates = this.benchmarks;
    }

    let bestMatch: BenchmarkClause = candidates[0];
    let highestScore = -1;

    for (const candidate of candidates) {
      let score = 0;

      if (clauseEmbedding && candidate.embedding) {
        score = VectorStore.cosineSimilarity(clauseEmbedding, candidate.embedding);
      } else {
        // High-precision lexical-semantic fallback
        score = VectorStore.lexicalSemanticSimilarity(clauseText, candidate.standardText);
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

  public getAllBenchmarks(): BenchmarkClause[] {
    return [...this.benchmarks];
  }
}
