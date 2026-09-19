"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GroundedChatEngine = void 0;
const gemini_1 = require("../../services/gemini");
const security_1 = require("../../utils/security");
class GroundedChatEngine {
    geminiService;
    constructor() {
        this.geminiService = gemini_1.GeminiService.getInstance();
    }
    /**
     * Answer a question grounded strictly in the provided document clauses.
     */
    async askQuestion(question, clauses, fullDocumentText) {
        // Check for prompt injection in user's query
        const injectionCheck = security_1.SecurityGuard.detectPromptInjection(question);
        if (injectionCheck.isSuspicious) {
            return {
                question,
                answer: 'Security Notice: The input query contains restricted instruction override patterns and cannot be processed.',
                eli5Answer: 'Please ask a normal question about what the contract says.',
                citations: [],
                confidenceScore: 0.0,
                suggestedFollowUps: ['What are the payment deadlines?', 'How can this contract be terminated?'],
                answeredAt: new Date().toISOString(),
            };
        }
        const cleanQuestion = security_1.SecurityGuard.sanitizeInput(question);
        const clausePayload = clauses.map((c) => ({
            index: c.index,
            type: c.clauseType,
            text: c.sanitizedText,
        }));
        const result = await this.geminiService.answerGroundedQuestion(cleanQuestion, clausePayload, fullDocumentText);
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
exports.GroundedChatEngine = GroundedChatEngine;
