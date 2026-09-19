import {
  AuditResult,
  ParsedClause,
  PersonaType,
  RiskLevel,
  ScoredClause,
} from '../../types';
import { VectorStore } from '../../db/vectorStore';
import { GeminiService } from '../../services/gemini';
import { CacheService } from '../../services/cache';
import { SecurityGuard } from '../../utils/security';
import { Hasher } from '../../utils/hasher';

export class ScoringPipeline {
  private vectorStore: VectorStore;
  private geminiService: GeminiService;
  private cacheService: CacheService;

  constructor() {
    this.vectorStore = VectorStore.getInstance();
    this.geminiService = GeminiService.getInstance();
    this.cacheService = CacheService.getInstance();
  }

  /**
   * Run the full two-tier scoring and audit pipeline on parsed clauses.
   */
  public async analyzeDocument(
    documentId: string,
    fileName: string,
    clauses: ParsedClause[],
    persona: PersonaType = 'Freelancer'
  ): Promise<AuditResult> {
    await this.vectorStore.initialize();

    let anyPIIRedacted = false;

    // Concurrently evaluate all clauses to stay well under cloud serverless execution limits
    const scoredClauses = await Promise.all(
      clauses.map(async (clause) => {
        // Step 1: PII Sanitization
        const piiCheck = SecurityGuard.anonymizePII(clause.sanitizedText);
        if (piiCheck.redactedCount > 0) anyPIIRedacted = true;
        const cleanClauseText = piiCheck.sanitizedText;

        // Check cache by clause hash + persona
        const cacheKey = `audit_${clause.hash}_${persona}`;
        const cached = await this.cacheService.get<ScoredClause>(cacheKey);
        if (cached) return cached;

        // Step 2: Tier 1 - Vector Cosine Matching against Market Standard Benchmark
        const benchmarkMatch = this.vectorStore.findNearestBenchmark(
          clause.clauseType,
          cleanClauseText,
          persona
        );

        const benchmarkStandardText = benchmarkMatch
          ? benchmarkMatch.benchmark.standardText
          : 'Parties agree to standard commercial reasonableness with mutual protections.';

        // Step 3: Tier 2 - Gemini Flash Semantic Delta Evaluation
        const deltaResult = await this.geminiService.evaluateSemanticDelta(
          cleanClauseText,
          benchmarkStandardText,
          clause.clauseType,
          persona
        );

        // Step 4: Generate counter-draft if flagged as Caution or Unfavorable
        let counterDraft;
        if (deltaResult.riskLevel !== RiskLevel.Standard) {
          counterDraft = await this.geminiService.generateCounterDraft(
            cleanClauseText,
            benchmarkStandardText,
            clause.clauseType,
            deltaResult.explanation
          );
        }

        const scoredClause: ScoredClause = {
          clauseIndex: clause.index,
          clauseType: clause.clauseType,
          clauseText: clause.originalText,
          riskLevel: deltaResult.riskLevel,
          riskScore: deltaResult.riskScore,
          explanation: deltaResult.explanation,
          eli5Explanation: deltaResult.eli5Explanation,
          matchedBenchmarkId: benchmarkMatch?.benchmark.id,
          similarityScore: benchmarkMatch?.similarity,
          benchmarkStandardText,
          counterDraft,
        };

        await this.cacheService.set(cacheKey, scoredClause);
        return scoredClause;
      })
    );

    // Aggregate counts
    let standardCount = 0;
    let cautionCount = 0;
    let unfavorableCount = 0;
    let totalScoreSum = 0;

    for (const sc of scoredClauses) {
      totalScoreSum += sc.riskScore;
      if (sc.riskLevel === RiskLevel.Standard) standardCount++;
      else if (sc.riskLevel === RiskLevel.Caution) cautionCount++;
      else unfavorableCount++;
    }

    // Step 5: Overall Health Score (0 - 100)
    const avgScore = clauses.length > 0 ? Math.round(totalScoreSum / clauses.length) : 100;
    // Penalty for each severe unfavorable clause
    const overallHealthScore = Math.max(5, avgScore - unfavorableCount * 4);

    // Step 6: Generate "Before You Sign" Gotchas
    const flaggedItems = scoredClauses
      .filter((c) => c.riskLevel !== RiskLevel.Standard)
      .map((c) => ({
        clauseIndex: c.clauseIndex,
        clauseType: c.clauseType,
        clauseText: c.clauseText,
        riskLevel: c.riskLevel,
        explanation: c.explanation,
      }));

    const gotchas = await this.geminiService.generateGotchas(flaggedItems, persona);

    return {
      documentId: documentId || Hasher.generateId('doc'),
      fileName,
      persona,
      overallHealthScore,
      riskSummary: {
        totalClauses: clauses.length,
        standardCount,
        cautionCount,
        unfavorableCount,
      },
      gotchas,
      clauses: scoredClauses,
      piiRedacted: anyPIIRedacted,
      analyzedAt: new Date().toISOString(),
    };
  }
}
