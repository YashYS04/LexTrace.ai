import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from '../config/env';
import {
  RiskLevel,
  PersonaType,
  GotchaItem,
  CounterDraftResult,
  Citation,
  LawyerDossier,
  ObligationDeadline,
  AttorneyQuestion,
} from '../types';
import { SecurityGuard } from '../utils/security';

const LEGAL_DISCLAIMER =
  'IMPORTANT: This analysis is provided for informational and educational purposes only and does not constitute formal legal advice. No attorney-client relationship is created. Consult a licensed attorney before signing or relying on binding contracts.';

export class GeminiService {
  private static instance: GeminiService;
  private client: GoogleGenerativeAI | null = null;
  private modelName: string;
  private activeWorkingModel: string | null = null;

  private constructor() {
    this.modelName = env.GEMINI_MODEL || 'gemini-3.8-flash';
    if (env.GEMINI_API_KEY && env.GEMINI_API_KEY.trim() !== '' && env.GEMINI_API_KEY !== 'your_gemini_api_key_here') {
      try {
        this.client = new GoogleGenerativeAI(env.GEMINI_API_KEY);
      } catch (err) {
        console.warn('[GeminiService] Failed to initialize GoogleGenerativeAI client:', (err as Error).message);
      }
    }
  }

  public static getInstance(): GeminiService {
    if (!GeminiService.instance) {
      GeminiService.instance = new GeminiService();
    }
    return GeminiService.instance;
  }

  /**
   * Reset client instance (helpful for testing or switching keys).
   */
  public static resetInstance(): void {
    GeminiService.instance = new GeminiService();
  }

  /**
   * Helper to invoke Gemini Flash models with cascading failover and dynamic pinning.
   */
  private async generateJSON<T>(systemPrompt: string, userPrompt: string, fallbackFn: () => T): Promise<T> {
    // In automated test runs, use deterministic mock to preserve user live API quota
    if (process.env.NODE_ENV === 'test') {
      return fallbackFn();
    }

    if (!this.client) {
      throw new Error('Google Gemini API Key is required. Live GenAI is strictly enforced.');
    }

    const candidateModels = [
      ...(this.activeWorkingModel ? [this.activeWorkingModel] : []),
      this.modelName,
      'gemini-3.5-flash',
      'gemini-3.8-flash',
      'gemini-3.6-flash',
      'gemini-3.1-flash-lite',
      'gemini-flash-latest',
    ].filter((m, idx, arr) => arr.indexOf(m) === idx);

    let lastError: Error | null = null;
    for (const m of candidateModels) {
      try {
        const model = this.client.getGenerativeModel({
          model: m,
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.2,
          },
          systemInstruction: `${systemPrompt}\n\n${LEGAL_DISCLAIMER}`,
        });

        const response = await model.generateContent(userPrompt);
        const text = response.response.text();
        this.activeWorkingModel = m; // pin working model to prevent repeated latency on subsequent calls
        return JSON.parse(text) as T;
      } catch (err) {
        lastError = err as Error;
        if (this.activeWorkingModel === m) {
          this.activeWorkingModel = null;
        }
        console.warn(`[GeminiService] Model ${m} attempt failed (${(err as Error).message}).`);
      }
    }

    // In unit testing, allow mock fallback if specified
    if (process.env.NODE_ENV === 'test') {
      return fallbackFn();
    }

    // Strictly enforce GenAI: throw real error if API fails
    throw new Error(
      `GenAI generation failed across models (${candidateModels.join(', ')}): ${lastError?.message || 'Unknown error'}`
    );
  }

  /**
   * Evaluate semantic delta between a contract clause and market-standard benchmark.
   */
  public async evaluateSemanticDelta(
    clauseText: string,
    benchmarkText: string,
    clauseType: string,
    persona: PersonaType = 'All'
  ): Promise<{
    riskLevel: RiskLevel;
    riskScore: number;
    explanation: string;
    eli5Explanation: string;
  }> {
    const fallbackFn = () => this.mockSemanticDelta(clauseText, clauseType, persona);

    const systemPrompt = `You are an elite legal contract analysis engine specializing in protecting individuals, freelancers, tenants, and small businesses from predatory legal terms. Evaluate the legal variance and directional risk of the provided clause against a fair-market benchmark standard.
Return JSON with this schema:
{
  "riskLevel": "Standard" | "Caution" | "Unfavorable",
  "riskScore": number (0 to 100, where 100 is completely fair and 0 is extremely predatory),
  "explanation": "Clear, professional explanation of why this clause deviates and what the risk is (2-3 sentences).",
  "eli5Explanation": "Simple, friendly 'Explain Like I'm 5' summary using relatable analogies (1-2 sentences)."
}`;

    const userPrompt = `PERSONA: ${persona}
CLAUSE TYPE: ${clauseType}

CONTRACT CLAUSE:
${clauseText}

MARKET BENCHMARK:
${benchmarkText}`;

    return this.generateJSON(systemPrompt, userPrompt, fallbackFn);
  }

  /**
   * Generate a balanced, negotiation-ready counter-proposal clause.
   */
  public async generateCounterDraft(
    clauseText: string,
    benchmarkText: string,
    clauseType: string,
    issues: string
  ): Promise<CounterDraftResult> {
    const fallbackFn = (): CounterDraftResult => {
      return {
        counterDraft: benchmarkText,
        explanation: `Replaces aggressive unilateral language in ${clauseType} with market-standard mutual protections.`,
        keyChanges: [
          'Added mutual standard of care',
          'Established reasonable notification windows',
          'Capped exposure to standard commercial limits',
        ],
      };
    };

    const systemPrompt = `You are a contract drafting specialist assisting in legal document negotiation. Create a fair, commercially reasonable counter-draft that neutralizes one-sided risks while remaining acceptable to the other party. Ground your counter-draft in the benchmark.
Return JSON:
{
  "counterDraft": "The complete, ready-to-use alternative clause text.",
  "explanation": "Concise rationale explaining why this counter-proposal is reasonable for both sides.",
  "keyChanges": ["Bullet 1", "Bullet 2", "Bullet 3"]
}`;

    const userPrompt = `CLAUSE TYPE: ${clauseType}
FLAGGED CLAUSE:
${clauseText}

MARKET BENCHMARK:
${benchmarkText}

IDENTIFIED RISKS:
${issues}`;

    return this.generateJSON(systemPrompt, userPrompt, fallbackFn);
  }

  /**
   * Generate "Before You Sign" Gotchas executive warning items.
   */
  public async generateGotchas(
    flaggedClauses: Array<{
      clauseIndex: number;
      clauseType: string;
      clauseText: string;
      riskLevel: RiskLevel;
      explanation: string;
    }>,
    persona: PersonaType
  ): Promise<GotchaItem[]> {
    if (flaggedClauses.length === 0) return [];

    const fallbackFn = (): GotchaItem[] => {
      return flaggedClauses.map((c, i) => ({
        id: `gotcha_${i + 1}`,
        title: `Watch out: Aggressive ${c.clauseType}`,
        explanation: c.explanation,
        eli5Explanation: `Be careful: this rule makes you take on unfair blame or costs if anything goes wrong.`,
        riskLevel: c.riskLevel,
        relatedClauseIndex: c.clauseIndex,
        actionableTip: `Request amending this to a mutual standard before signing.`,
      }));
    };

    const systemPrompt = `You are a legal risk communicator for non-lawyers. Create clear 'Before You Sign' Gotcha items for flagged contract clauses. Emphasize practical, real-world consequences (e.g. lost deposits, uncapped liability, weekend code ownership).
Return JSON array:
[
  {
    "id": "gotcha_1",
    "title": "Short punchy warning title",
    "explanation": "Plain language explanation of the real-world consequence (1-2 sentences).",
    "eli5Explanation": "Extremely simple analogy-driven summary.",
    "riskLevel": "Caution" | "Unfavorable",
    "relatedClauseIndex": number,
    "actionableTip": "One concrete step the signer should take."
  }
]`;

    const userPrompt = `PERSONA: ${persona}
FLAGGED CLAUSES:
${JSON.stringify(flaggedClauses, null, 2)}`;

    return this.generateJSON(systemPrompt, userPrompt, fallbackFn);
  }

  /**
   * Compare two contract versions (v1 vs v2) and detect semantic drift and sneaky risk shifts.
   */
  public async compareContracts(
    clausesV1: Array<{ index: number; type: string; text: string }>,
    clausesV2: Array<{ index: number; type: string; text: string }>
  ): Promise<{
    overallSummary: string;
    whoBenefitsMost: string;
    shifts: Array<{
      clauseType: string;
      semanticShift: string;
      favorableTo: 'Version1' | 'Version2' | 'Neutral';
      riskImpact: 'Increased' | 'Decreased' | 'Neutral';
    }>;
  }> {
    const fallbackFn = () => ({
      overallSummary:
        'Version 2 introduces significant rebalancing, establishing mutual liability caps, standard payment terms, and clear IP carve-outs.',
      whoBenefitsMost: 'Signer / Contractor',
      shifts: clausesV2.map((c) => ({
        clauseType: c.type,
        semanticShift: `Refined terms under ${c.type} towards market balance.`,
        favorableTo: 'Version2' as const,
        riskImpact: 'Decreased' as const,
      })),
    });

    const systemPrompt = `You are an expert contract redline & comparison auditor. Compare two versions of a contract, identifying which party benefits from each modification, subtle legal traps introduced or eliminated, and overall direction of risk.
Return JSON:
{
  "overallSummary": "High-level executive summary of key differences (2-3 sentences).",
  "whoBenefitsMost": "Party name or role who benefits most from the changes.",
  "shifts": [
    {
      "clauseType": "Clause Category",
      "semanticShift": "Detailed explanation of what changed in the legal rights or obligations.",
      "favorableTo": "Version1" | "Version2" | "Neutral",
      "riskImpact": "Increased" | "Decreased" | "Neutral"
    }
  ]
}`;

    const userPrompt = `VERSION 1 CLAUSES:
${JSON.stringify(clausesV1, null, 2)}

VERSION 2 CLAUSES:
${JSON.stringify(clausesV2, null, 2)}`;

    return this.generateJSON(systemPrompt, userPrompt, fallbackFn);
  }

  /**
   * Grounded RAG Q&A: Answers user questions strictly grounded in the document text with citations.
   */
  public async answerGroundedQuestion(
    question: string,
    clauses: Array<{ index: number; type: string; text: string }>,
    documentText: string
  ): Promise<{
    answer: string;
    eli5Answer: string;
    citations: Citation[];
    confidenceScore: number;
    suggestedFollowUps: string[];
  }> {
    const fallbackFn = () => {
      const qLower = question.toLowerCase().trim();
      const isGreeting =
        qLower === 'hi' ||
        qLower === 'hello' ||
        qLower === 'hey' ||
        qLower.startsWith('hi ') ||
        qLower.startsWith('hello ');
      const isProjectQuery =
        qLower.includes('lextrace') ||
        qLower.includes('project') ||
        qLower.includes('what can you do') ||
        qLower.includes('how to use');

      if (isGreeting || isProjectQuery) {
        return {
          answer:
            'Hello! I am LexTrace AI, your dedicated contract intelligence and legal analysis copilot. You can ask me any question regarding terms in your contract (such as payment withholding, IP ownership, liability, or termination), or use our tools to run a 40-benchmark risk audit, redline contract versions, and generate an Attorney Consultation Dossier.',
          eli5Answer:
            'Hi! I help you spot hidden traps in contracts and understand your legal rights in plain English.',
          citations: [],
          confidenceScore: 1.0,
          suggestedFollowUps: [
            'Can the client refuse or delay my payments?',
            'Do they claim ownership of my weekend code?',
            'What are the penalties if I terminate early?',
          ],
        };
      }

      const matched =
        clauses && clauses.length > 0
          ? clauses.find(
              (c) =>
                qLower.includes(c.type.toLowerCase()) ||
                c.text.toLowerCase().split(' ').some((w) => w.length > 4 && qLower.includes(w))
            ) || clauses[0]
          : null;

      if (matched) {
        return {
          answer: `Based on Section ${matched.index + 1} (${matched.type}), the contract specifies: "${matched.text.substring(0, 150)}..."`,
          eli5Answer: `According to the contract, the rules in ${matched.type} apply directly to this situation.`,
          citations: [
            {
              clauseIndex: matched.index,
              clauseType: matched.type,
              excerpt: matched.text.substring(0, 120),
            },
          ],
          confidenceScore: 0.95,
          suggestedFollowUps: [
            'What are the exact penalty fees if I terminate early?',
            'Can this clause be renegotiated?',
            'What happens in case of an unforeseen emergency?',
          ],
        };
      }

      return {
        answer:
          'I am ready to analyze your contract. Please select or paste a contract into LexTrace AI, and ask any specific question about your clauses, obligations, or risks.',
        eli5Answer: 'Please load a contract so I can read it and answer your specific questions.',
        citations: [],
        confidenceScore: 1.0,
        suggestedFollowUps: [
          'What are the payment terms?',
          'Is my liability capped or unlimited?',
          'What is the notice period for termination?',
        ],
      };
    };

    const systemPrompt = `You are LexTrace AI's elite contract intelligence copilot ("Trace the clause. Understand the risk. Know what to ask.").
1. If the user provides a greeting (e.g. "hi", "hello", "hey") or asks about LexTrace AI / this project / capabilities:
   - Warmly greet them, state your identity as LexTrace AI, and summarize your capabilities (contract risk scoring against 40+ benchmarks, redline diffing, citation-grounded Q&A, and 1-click attorney dossier).
   - Set "citations" to an empty array [].
2. If the user asks a question about the contract:
   - Answer accurately and strictly based on the provided document clauses.
   - Provide exact citations with clauseIndex (number), clauseType (string), and excerpt (exact quotation snippet).
3. Always provide both a professional "answer" and a simple plain-language "eli5Answer".
4. Suggest 3 relevant "suggestedFollowUps" questions.
Return JSON:
{
  "answer": "Clear, direct answer explaining what the contract says or welcoming the user.",
  "eli5Answer": "Simple 1-sentence version in plain English.",
  "citations": [
    {
      "clauseIndex": number,
      "clauseType": "string",
      "excerpt": "Exact quote snippet from the clause"
    }
  ],
  "confidenceScore": number (0.0 to 1.0),
  "suggestedFollowUps": ["Question 1", "Question 2", "Question 3"]
}`;

    const userPrompt = `QUESTION: ${question}

DOCUMENT CLAUSES:
${JSON.stringify(clauses, null, 2)}`;

    return this.generateJSON(systemPrompt, userPrompt, fallbackFn);
  }

  /**
   * Generate Attorney Consultation Briefing Dossier and Obligation Calendar.
   */
  public async generateLawyerDossier(
    title: string,
    persona: PersonaType,
    scoredClauses: Array<{
      clauseIndex: number;
      clauseType: string;
      clauseText: string;
      riskLevel: RiskLevel;
      explanation: string;
    }>
  ): Promise<LawyerDossier> {
    const highRisks = scoredClauses.filter((c) => c.riskLevel !== RiskLevel.Standard);

    const fallbackFn = (): LawyerDossier => {
      const targetedQuestions: AttorneyQuestion[] = [
        {
          question: 'Is the unilateral indemnification clause enforceable under state law, and what specific carve-outs should we demand?',
          rationale: 'Unilateral indemnity leaves the client vulnerable to paying for the counterparty’s independent mistakes.',
          relatedClauseType: 'Indemnification',
        },
        {
          question: 'Does the intellectual property assignment provision overreach into pre-existing background tools or off-hours personal projects?',
          rationale: 'Broad IP clauses risk transferring ownership of personal portfolio code or trade tools.',
          relatedClauseType: 'Intellectual Property',
        },
        {
          question: 'What is the statutory limit on security deposit deductions, and can the landlord legally commingle funds?',
          rationale: 'Deposit protections are frequently mandated by state habitability and escrow statutes.',
          relatedClauseType: 'Security Deposit',
        },
        {
          question: 'Are the post-termination non-compete and non-solicitation restrictions reasonable in geographical and substantive scope?',
          rationale: 'Overbroad non-competes are increasingly prohibited by federal FTC guidelines and state labor codes.',
          relatedClauseType: 'Non-Compete/Non-Solicitation',
        },
        {
          question: 'What specific language should be added to ensure mutual termination for convenience with a 30-day notice period?',
          rationale: 'Asymmetric termination rights allow one side to cancel instantly while locking the other party in.',
          relatedClauseType: 'Termination',
        },
      ];

      const obligations: ObligationDeadline[] = [
        {
          milestone: 'Payment Invoicing',
          clauseType: 'Payment Terms',
          timeframe: 'Bi-weekly / Net 30',
          responsibleParty: 'Signer & Client',
          actionRequired: 'Submit itemized invoices; track payment receipt within 30 days.',
        },
        {
          milestone: 'Notice of Termination / Non-Renewal',
          clauseType: 'Termination',
          timeframe: '30 to 120 Days prior',
          responsibleParty: 'Signer',
          actionRequired: 'Provide written notice via email or certified mail to prevent automatic contract rollover.',
        },
        {
          milestone: 'Notice of Material Breach / Cure Window',
          clauseType: 'Dispute Resolution / Termination',
          timeframe: '15 Days from notice',
          responsibleParty: 'Breaching Party',
          actionRequired: 'Remedy any written notice of deficiency before termination rights take effect.',
        },
      ];

      return {
        documentTitle: title,
        executiveSummary: `This contract contains significant contractual asymmetry that heavily disfavors the ${persona}. Key areas of legal exposure include uncapped liability, aggressive termination barriers, and expansive restrictive covenants.`,
        persona,
        highRiskItems: highRisks.map((c) => ({
          clauseType: c.clauseType,
          riskLevel: c.riskLevel,
          coreConcern: c.explanation,
        })),
        unresolvedAmbiguities: [
          'Vague definition of "satisfactory deliverables" permitting subjective payment withholding.',
          'Ambiguous calculation of late charges and repair deductions without mandatory receipt presentation.',
          'Unclear distinction between pre-existing Background IP and commissioned project deliverables.',
        ],
        targetedAttorneyQuestions: targetedQuestions,
        obligationCalendar: obligations,
        generatedAt: new Date().toISOString(),
      };
    };

    const systemPrompt = `You are an expert legal strategist. Generate an 'Attorney Consultation Dossier' designed to save clients hundreds of dollars in legal fees by organizing all red flags, ambiguities, and formulating 5 precision high-value questions for legal counsel, along with an obligation timeline.
Return JSON matching the LawyerDossier structure.`;

    const userPrompt = `DOCUMENT TITLE: ${title}
PERSONA: ${persona}
FLAGGED CLAUSES:
${JSON.stringify(highRisks, null, 2)}`;

    return this.generateJSON(systemPrompt, userPrompt, fallbackFn);
  }

  /**
   * Deterministic semantic delta scoring fallback using rule-based legal heuristic patterns.
   */
  private mockSemanticDelta(
    clauseText: string,
    clauseType: string,
    persona: PersonaType
  ): {
    riskLevel: RiskLevel;
    riskScore: number;
    explanation: string;
    eli5Explanation: string;
  } {
    const textLower = clauseText.toLowerCase();

    // High risk triggers
    const aggressiveTriggers = [
      'sole discretion',
      'unreviewable discretion',
      'unconditional',
      'hold harmless client, its officers',
      'regardless of whether client was contributorily negligent',
      'completely uncapped',
      'worldwide in perpetuity',
      'personal time',
      'two (2) years',
      'three (3) years',
      'twenty-four (24) months',
      'thirty-six (36) months',
      'at any hour of the day or night without prior notice',
      'strictly non-refundable',
      'tenant shall pay landlord\'s legal fees and expenses in full, even if tenant prevails',
      'unilateral',
      'accelerated and payable upon demand',
      'waive all rights to a trial by jury',
    ];

    // Caution triggers
    const cautionTriggers = [
      'within sixty (60) days',
      'within ninety (90) days',
      'one hundred and twenty (120)',
      'discretionary',
      'at-will',
      'without cause immediately',
      'shall accrue interest at the rate of',
      'indemnify',
      'exclusive property',
      'exclusive jurisdiction',
    ];

    const hasAggressive = aggressiveTriggers.some((t) => textLower.includes(t));
    const hasCaution = cautionTriggers.some((t) => textLower.includes(t));

    if (hasAggressive) {
      return {
        riskLevel: RiskLevel.Unfavorable,
        riskScore: 25,
        explanation: `This ${clauseType} clause imposes unilateral, heavily one-sided burdens with aggressive terms that significantly exceed fair market standards.`,
        eli5Explanation: `This rule is very unfair: it gives the other person all the power and makes you carry all the risk if things go wrong.`,
      };
    } else if (hasCaution) {
      return {
        riskLevel: RiskLevel.Caution,
        riskScore: 60,
        explanation: `This ${clauseType} clause contains terms that deviate from standard balanced language and warrants careful negotiation or clarifying amendments.`,
        eli5Explanation: `This rule is a bit one-sided. You should ask to adjust a few words so you are treated fairly.`,
      };
    } else {
      return {
        riskLevel: RiskLevel.Standard,
        riskScore: 90,
        explanation: `This ${clauseType} clause aligns closely with standard, balanced commercial practice for ${persona}.`,
        eli5Explanation: `This rule is standard and fair. Both parties are treated equally.`,
      };
    }
  }
}
