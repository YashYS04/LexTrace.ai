"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const validation_1 = require("../middleware/validation");
const clauseSplitter_1 = require("../modules/ingestion/clauseSplitter");
const textExtractor_1 = require("../modules/ingestion/textExtractor");
const scoringPipeline_1 = require("../modules/audit/scoringPipeline");
const contractDiffEngine_1 = require("../modules/comparison/contractDiffEngine");
const groundedChatEngine_1 = require("../modules/chat/groundedChatEngine");
const dossierGenerator_1 = require("../modules/dossier/dossierGenerator");
const vectorStore_1 = require("../db/vectorStore");
const hasher_1 = require("../utils/hasher");
const router = (0, express_1.Router)();
const upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});
const scoringPipeline = new scoringPipeline_1.ScoringPipeline();
const diffEngine = new contractDiffEngine_1.ContractDiffEngine();
const chatEngine = new groundedChatEngine_1.GroundedChatEngine();
const dossierGenerator = new dossierGenerator_1.DossierGenerator();
const vectorStore = vectorStore_1.VectorStore.getInstance();
/**
 * POST /api/documents/upload
 * Accepts multipart file upload (.pdf or .txt) and extracts plain text.
 */
router.post('/upload', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            res.status(400).json({ success: false, error: { message: 'No file uploaded.' } });
            return;
        }
        const text = await textExtractor_1.TextExtractor.extractText(req.file.buffer, req.file.mimetype);
        res.json({
            success: true,
            data: {
                fileName: req.file.originalname,
                text,
                charCount: text.length,
            },
        });
    }
    catch (err) {
        res.status(500).json({ success: false, error: { message: err.message } });
    }
});
/**
 * POST /api/documents/audit
 * Complete audit with vector similarity, semantic delta, gotchas, and counter-drafts.
 */
router.post('/audit', (0, validation_1.validateBody)(validation_1.auditRequestSchema), async (req, res) => {
    try {
        const { text, fileName, persona } = req.body;
        const docId = hasher_1.Hasher.generateId('doc');
        const clauses = clauseSplitter_1.ClauseSplitter.split(text);
        const result = await scoringPipeline.analyzeDocument(docId, fileName, clauses, persona);
        res.json({ success: true, data: result });
    }
    catch (err) {
        res.status(500).json({ success: false, error: { message: err.message } });
    }
});
/**
 * POST /api/documents/compare
 * Compare Version 1 vs Version 2, computing redline diffs and semantic divergence.
 */
router.post('/compare', (0, validation_1.validateBody)(validation_1.compareRequestSchema), async (req, res) => {
    try {
        const { doc1Text, doc1Name, doc2Text, doc2Name } = req.body;
        const clauses1 = clauseSplitter_1.ClauseSplitter.split(doc1Text);
        const clauses2 = clauseSplitter_1.ClauseSplitter.split(doc2Text);
        const result = await diffEngine.compare(doc1Name, clauses1, doc2Name, clauses2);
        res.json({ success: true, data: result });
    }
    catch (err) {
        res.status(500).json({ success: false, error: { message: err.message } });
    }
});
/**
 * POST /api/documents/chat
 * Grounded RAG Q&A with exact clause citations.
 */
router.post('/chat', (0, validation_1.validateBody)(validation_1.chatRequestSchema), async (req, res) => {
    try {
        const { question, documentText = '' } = req.body;
        const clauses = documentText && documentText.trim().length > 0 ? clauseSplitter_1.ClauseSplitter.split(documentText) : [];
        const answer = await chatEngine.askQuestion(question, clauses, documentText);
        res.json({ success: true, data: answer });
    }
    catch (err) {
        res.status(500).json({ success: false, error: { message: err.message } });
    }
});
/**
 * POST /api/documents/dossier
 * Generate Attorney Consultation Briefing Packet and Obligation Calendar.
 */
router.post('/dossier', (0, validation_1.validateBody)(validation_1.dossierRequestSchema), async (req, res) => {
    try {
        const { documentText, documentTitle, persona } = req.body;
        const clauses = clauseSplitter_1.ClauseSplitter.split(documentText);
        const audit = await scoringPipeline.analyzeDocument('temp_dossier', documentTitle, clauses, persona);
        const dossier = await dossierGenerator.generateDossier(documentTitle, persona, audit.clauses);
        res.json({ success: true, data: dossier });
    }
    catch (err) {
        res.status(500).json({ success: false, error: { message: err.message } });
    }
});
/**
 * GET /api/documents/benchmarks
 * Retrieve list of all standard benchmarks.
 */
router.get('/benchmarks', async (req, res) => {
    try {
        await vectorStore.initialize();
        res.json({
            success: true,
            data: {
                total: vectorStore.getAllBenchmarks().length,
                benchmarks: vectorStore.getAllBenchmarks(),
            },
        });
    }
    catch (err) {
        res.status(500).json({ success: false, error: { message: err.message } });
    }
});
exports.default = router;
