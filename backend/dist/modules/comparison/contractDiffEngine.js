"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContractDiffEngine = void 0;
const gemini_1 = require("../../services/gemini");
const hasher_1 = require("../../utils/hasher");
class ContractDiffEngine {
    geminiService;
    constructor() {
        this.geminiService = gemini_1.GeminiService.getInstance();
    }
    /**
     * Word-level diff segment generator between two text strings.
     */
    static computeWordDiff(text1, text2) {
        const words1 = text1.split(/\s+/);
        const words2 = text2.split(/\s+/);
        const segments = [];
        const maxLen = Math.max(words1.length, words2.length);
        let i = 0;
        let j = 0;
        while (i < words1.length || j < words2.length) {
            if (i < words1.length && j < words2.length && words1[i] === words2[j]) {
                // Collect identical run
                let run = words1[i];
                i++;
                j++;
                while (i < words1.length && j < words2.length && words1[i] === words2[j]) {
                    run += ' ' + words1[i];
                    i++;
                    j++;
                }
                segments.push({ type: 'unchanged', text: run });
            }
            else {
                if (i < words1.length && (j >= words2.length || !words2.slice(j, j + 4).includes(words1[i]))) {
                    segments.push({ type: 'removed', text: words1[i] });
                    i++;
                }
                else if (j < words2.length) {
                    segments.push({ type: 'added', text: words2[j] });
                    j++;
                }
            }
        }
        return segments;
    }
    /**
     * Compare two sets of parsed contract clauses.
     */
    async compare(doc1Name, clauses1, doc2Name, clauses2) {
        const clauseComparisons = [];
        let totalModifications = 0;
        let highRiskShifts = 0;
        const map1 = new Map();
        for (const c of clauses1) {
            map1.set(c.clauseType, c);
        }
        const map2 = new Map();
        for (const c of clauses2) {
            map2.set(c.clauseType, c);
        }
        // Collect all distinct clause types in order
        const allTypes = Array.from(new Set([...clauses1.map((c) => c.clauseType), ...clauses2.map((c) => c.clauseType)]));
        const clausesToAnalyzeV1 = [];
        const clausesToAnalyzeV2 = [];
        for (const type of allTypes) {
            const c1 = map1.get(type);
            const c2 = map2.get(type);
            if (c1 && c2) {
                if (c1.hash === c2.hash) {
                    clauseComparisons.push({
                        clauseType: type,
                        status: 'unchanged',
                        version1Text: c1.originalText,
                        version2Text: c2.originalText,
                        diffSegments: [{ type: 'unchanged', text: c1.originalText }],
                        semanticShift: 'Clauses are identical.',
                        favorableTo: 'Neutral',
                        riskImpact: 'Neutral',
                    });
                }
                else {
                    totalModifications++;
                    const diff = ContractDiffEngine.computeWordDiff(c1.originalText, c2.originalText);
                    clausesToAnalyzeV1.push({ index: c1.index, type, text: c1.originalText });
                    clausesToAnalyzeV2.push({ index: c2.index, type, text: c2.originalText });
                    clauseComparisons.push({
                        clauseType: type,
                        status: 'modified',
                        version1Text: c1.originalText,
                        version2Text: c2.originalText,
                        diffSegments: diff,
                        semanticShift: 'Evaluating legal variation...',
                        favorableTo: 'Neutral',
                        riskImpact: 'Neutral',
                    });
                }
            }
            else if (!c1 && c2) {
                totalModifications++;
                highRiskShifts++;
                clausesToAnalyzeV2.push({ index: c2.index, type, text: c2.originalText });
                clauseComparisons.push({
                    clauseType: type,
                    status: 'added',
                    version2Text: c2.originalText,
                    diffSegments: [{ type: 'added', text: c2.originalText }],
                    semanticShift: `Newly added ${type} clause absent from Version 1.`,
                    favorableTo: 'Version2',
                    riskImpact: 'Increased',
                });
            }
            else if (c1 && !c2) {
                totalModifications++;
                clausesToAnalyzeV1.push({ index: c1.index, type, text: c1.originalText });
                clauseComparisons.push({
                    clauseType: type,
                    status: 'removed',
                    version1Text: c1.originalText,
                    diffSegments: [{ type: 'removed', text: c1.originalText }],
                    semanticShift: `${type} present in Version 1 was deleted in Version 2.`,
                    favorableTo: 'Version1',
                    riskImpact: 'Increased',
                });
            }
        }
        // Run AI Semantic Divergence Analysis
        const aiComparison = await this.geminiService.compareContracts(clausesToAnalyzeV1, clausesToAnalyzeV2);
        // Merge AI semantic shift annotations
        for (const shift of aiComparison.shifts) {
            const match = clauseComparisons.find((c) => c.clauseType.toLowerCase() === shift.clauseType.toLowerCase());
            if (match) {
                match.semanticShift = shift.semanticShift;
                match.favorableTo = shift.favorableTo;
                match.riskImpact = shift.riskImpact;
                if (shift.riskImpact === 'Increased') {
                    highRiskShifts++;
                }
            }
        }
        return {
            comparisonId: hasher_1.Hasher.generateId('cmp'),
            doc1Name,
            doc2Name,
            overallDivergenceSummary: aiComparison.overallSummary,
            whoBenefitsMost: aiComparison.whoBenefitsMost,
            clauseComparisons,
            totalModifications,
            highRiskShifts,
            comparedAt: new Date().toISOString(),
        };
    }
}
exports.ContractDiffEngine = ContractDiffEngine;
