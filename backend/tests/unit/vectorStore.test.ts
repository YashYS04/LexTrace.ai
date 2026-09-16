import { VectorStore } from '../../src/db/vectorStore';

describe('VectorStore Unit Tests', () => {
  let vectorStore: VectorStore;

  beforeAll(async () => {
    vectorStore = VectorStore.getInstance();
    await vectorStore.initialize();
  });

  it('should initialize and seed benchmark clauses', () => {
    const benchmarks = vectorStore.getAllBenchmarks();
    expect(benchmarks.length).toBeGreaterThanOrEqual(15);
  });

  it('should compute exact cosine similarity for identical vectors', () => {
    const vecA = [1.0, 0.0, 0.5];
    const sim = VectorStore.cosineSimilarity(vecA, vecA);
    expect(sim).toBeCloseTo(1.0, 4);
  });

  it('should compute zero cosine similarity for orthogonal vectors', () => {
    const vecA = [1.0, 0.0];
    const vecB = [0.0, 1.0];
    const sim = VectorStore.cosineSimilarity(vecA, vecB);
    expect(sim).toBeCloseTo(0.0, 4);
  });

  it('should retrieve matching market benchmark for Payment Terms for Freelancer', () => {
    const clauseText = 'Client shall pay Contractor $85 per hour within thirty days.';
    const result = vectorStore.findNearestBenchmark('Payment Terms', clauseText, 'Freelancer');

    expect(result).not.toBeNull();
    expect(result?.benchmark.clauseType).toBe('Payment Terms');
    expect(result?.similarity).toBeGreaterThan(0.3);
  });

  it('should retrieve matching Landlord Entry benchmark for Tenant persona', () => {
    const clauseText = 'Landlord may enter premises at any hour without notice.';
    const result = vectorStore.findNearestBenchmark('Landlord Entry', clauseText, 'Tenant');

    expect(result).not.toBeNull();
    expect(result?.benchmark.clauseType).toBe('Landlord Entry');
    expect(result?.benchmark.standardText).toContain('twenty-four (24) hours advance written notice');
  });

  it('should fallback gracefully when persona does not match exactly', () => {
    const clauseText = 'Either party may terminate upon written notice.';
    const result = vectorStore.findNearestBenchmark('Termination', clauseText, 'SmallBusiness');

    expect(result).not.toBeNull();
    expect(result?.benchmark.clauseType).toBe('Termination');
  });
});
