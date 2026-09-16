export enum RiskLevel {
  Standard = 'Standard',
  Caution = 'Caution',
  Unfavorable = 'Unfavorable',
}

export type PersonaType = 'Freelancer' | 'Tenant' | 'Employee' | 'SmallBusiness' | 'All';

export type ReadingLevel = 'ELI5' | 'Standard' | 'Legal';

export interface CounterDraftResult {
  counterDraft: string;
  explanation: string;
  keyChanges: string[];
}

export interface ScoredClause {
  clauseIndex: number;
  clauseType: string;
  clauseText: string;
  riskLevel: RiskLevel;
  riskScore: number;
  explanation: string;
  eli5Explanation: string;
  matchedBenchmarkId?: string;
  similarityScore?: number;
  benchmarkStandardText?: string;
  counterDraft?: CounterDraftResult;
}

export interface GotchaItem {
  id: string;
  title: string;
  explanation: string;
  eli5Explanation: string;
  riskLevel: RiskLevel;
  relatedClauseIndex: number;
  actionableTip: string;
}

export interface AuditResult {
  documentId: string;
  fileName: string;
  persona: PersonaType;
  overallHealthScore: number;
  riskSummary: {
    totalClauses: number;
    standardCount: number;
    cautionCount: number;
    unfavorableCount: number;
  };
  gotchas: GotchaItem[];
  clauses: ScoredClause[];
  piiRedacted: boolean;
  analyzedAt: string;
}

export interface DiffSegment {
  type: 'added' | 'removed' | 'unchanged';
  text: string;
}

export interface ClauseComparison {
  clauseType: string;
  status: 'modified' | 'added' | 'removed' | 'unchanged';
  version1Text?: string;
  version2Text?: string;
  diffSegments: DiffSegment[];
  semanticShift: string;
  favorableTo: 'Version1' | 'Version2' | 'Neutral';
  riskImpact: 'Increased' | 'Decreased' | 'Neutral';
}

export interface ComparisonResult {
  comparisonId: string;
  doc1Name: string;
  doc2Name: string;
  overallDivergenceSummary: string;
  whoBenefitsMost: string;
  clauseComparisons: ClauseComparison[];
  totalModifications: number;
  highRiskShifts: number;
  comparedAt: string;
}

export interface Citation {
  clauseIndex: number;
  clauseType: string;
  excerpt: string;
}

export interface ChatAnswer {
  question: string;
  answer: string;
  eli5Answer: string;
  citations: Citation[];
  confidenceScore: number;
  suggestedFollowUps: string[];
  answeredAt: string;
}

export interface AttorneyQuestion {
  question: string;
  rationale: string;
  relatedClauseType: string;
}

export interface ObligationDeadline {
  milestone: string;
  clauseType: string;
  timeframe: string;
  responsibleParty: string;
  actionRequired: string;
}

export interface LawyerDossier {
  documentTitle: string;
  executiveSummary: string;
  persona: PersonaType;
  highRiskItems: {
    clauseType: string;
    riskLevel: RiskLevel;
    coreConcern: string;
  }[];
  unresolvedAmbiguities: string[];
  targetedAttorneyQuestions: AttorneyQuestion[];
  obligationCalendar: ObligationDeadline[];
  generatedAt: string;
}
