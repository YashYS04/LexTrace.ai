import { ChatAnswer, ParsedClause } from '../../types';
import { GeminiService } from '../../services/gemini';
import { SecurityGuard } from '../../utils/security';

export class GroundedChatEngine {
  private geminiService: GeminiService;

  constructor() {
    this.geminiService = GeminiService.getInstance();
  }

  /**
   * Answer a question grounded strictly in the provided document clauses.
   */
  public async askQuestion(
    question: string,
    clauses: ParsedClause[],
    fullDocumentText: string
  ): Promise<ChatAnswer> {
    // Check for prompt injection in user's query
    const injectionCheck = SecurityGuard.detectPromptInjection(question);
    if (injectionCheck.isSuspicious) {
      return {
        question,
        answer:
          'Security Notice: The input query contains restricted instruction override patterns and cannot be processed.',
        eli5Answer: 'Please ask a normal question about what the contract says.',
        citations: [],
        confidenceScore: 0.0,
        suggestedFollowUps: ['What are the payment deadlines?', 'How can this contract be terminated?'],
        answeredAt: new Date().toISOString(),
      };
    }

    const cleanQuestion = SecurityGuard.sanitizeInput(question);

    const clausePayload = clauses.map((c) => ({
      index: c.index,
      type: c.clauseType,
      text: c.sanitizedText,
    }));

    const result = await this.geminiService.answerGroundedQuestion(
      cleanQuestion,
      clausePayload,
      fullDocumentText
    );

    return {
      question: cleanQuestion,
      answer: result.answer,
      eli5Answer: result.eli5Answer,
      citations: result.citations,
      confidenceScore: result.confidenceScore,
      suggestedFollowUps: result.suggestedFollowUps,
      answeredAt: new Date().toISOString(),
    };
  }
}
