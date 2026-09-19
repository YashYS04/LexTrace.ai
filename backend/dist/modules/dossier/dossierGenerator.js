"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DossierGenerator = void 0;
const gemini_1 = require("../../services/gemini");
class DossierGenerator {
    geminiService;
    constructor() {
        this.geminiService = gemini_1.GeminiService.getInstance();
    }
    /**
     * Generate an Attorney Consultation Briefing Dossier and Obligation Calendar.
     */
    async generateDossier(documentTitle, persona, scoredClauses) {
        const payload = scoredClauses.map((c) => ({
            clauseIndex: c.clauseIndex,
            clauseType: c.clauseType,
            clauseText: c.clauseText,
            riskLevel: c.riskLevel,
            explanation: c.explanation,
        }));
        return this.geminiService.generateLawyerDossier(documentTitle, persona, payload);
    }
}
exports.DossierGenerator = DossierGenerator;
