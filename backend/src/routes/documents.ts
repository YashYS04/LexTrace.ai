import { Router, Request, Response } from 'express';
import multer from 'multer';
import {
  auditRequestSchema,
  chatRequestSchema,
  compareRequestSchema,
  dossierRequestSchema,
  validateBody,
} from '../middleware/validation';
import { ClauseSplitter } from '../modules/ingestion/clauseSplitter';
import { TextExtractor } from '../modules/ingestion/textExtractor';
import { ScoringPipeline } from '../modules/audit/scoringPipeline';
import { ContractDiffEngine } from '../modules/comparison/contractDiffEngine';
import { GroundedChatEngine } from '../modules/chat/groundedChatEngine';
import { DossierGenerator } from '../modules/dossier/dossierGenerator';
import { VectorStore } from '../db/vectorStore';
import { Hasher } from '../utils/hasher';
import { LEGAL_DISCLAIMER } from '../utils/security';

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

const scoringPipeline = new ScoringPipeline();
const diffEngine = new ContractDiffEngine();
const chatEngine = new GroundedChatEngine();
const dossierGenerator = new DossierGenerator();
const vectorStore = VectorStore.getInstance();

/**
 * POST /api/documents/upload
 * Accepts multipart file upload (.pdf or .txt) and extracts plain text.
 */
router.post('/upload', upload.single('file'), async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, error: { message: 'No file uploaded.' }, disclaimer: LEGAL_DISCLAIMER });
      return;
    }

    const text = await TextExtractor.extractText(req.file.buffer, req.file.mimetype);
    res.json({
      success: true,
      data: {
        fileName: req.file.originalname,
        text,
        charCount: text.length,
      },
      disclaimer: LEGAL_DISCLAIMER,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: { message: (err as Error).message }, disclaimer: LEGAL_DISCLAIMER });
  }
});

/**
 * POST /api/documents/audit
 * Complete audit with vector similarity, semantic delta, gotchas, and counter-drafts.
 */
router.post('/audit', validateBody(auditRequestSchema), async (req: Request, res: Response): Promise<void> => {
  try {
    const { text, fileName, persona } = req.body;
    const docId = Hasher.generateId('doc');
    const clauses = ClauseSplitter.split(text);

    const result = await scoringPipeline.analyzeDocument(docId, fileName, clauses, persona);
    res.json({ success: true, data: result, disclaimer: LEGAL_DISCLAIMER });
  } catch (err) {
    res.status(500).json({ success: false, error: { message: (err as Error).message }, disclaimer: LEGAL_DISCLAIMER });
  }
});

/**
 * POST /api/documents/compare
 * Compare Version 1 vs Version 2, computing redline diffs and semantic divergence.
 */
router.post('/compare', validateBody(compareRequestSchema), async (req: Request, res: Response): Promise<void> => {
  try {
    const { doc1Text, doc1Name, doc2Text, doc2Name } = req.body;
    const clauses1 = ClauseSplitter.split(doc1Text);
    const clauses2 = ClauseSplitter.split(doc2Text);

    const result = await diffEngine.compare(doc1Name, clauses1, doc2Name, clauses2);
    res.json({ success: true, data: result, disclaimer: LEGAL_DISCLAIMER });
  } catch (err) {
    res.status(500).json({ success: false, error: { message: (err as Error).message }, disclaimer: LEGAL_DISCLAIMER });
  }
});

/**
 * POST /api/documents/chat
 * Grounded RAG Q&A with exact clause citations.
 */
router.post('/chat', validateBody(chatRequestSchema), async (req: Request, res: Response): Promise<void> => {
  try {
    const { question, documentText = '' } = req.body;
    const clauses = documentText && documentText.trim().length > 0 ? ClauseSplitter.split(documentText) : [];

    const answer = await chatEngine.askQuestion(question, clauses, documentText);
    res.json({ success: true, data: answer, disclaimer: LEGAL_DISCLAIMER });
  } catch (err) {
    res.status(500).json({ success: false, error: { message: (err as Error).message }, disclaimer: LEGAL_DISCLAIMER });
  }
});

/**
 * POST /api/documents/dossier
 * Generate Attorney Consultation Briefing Packet and Obligation Calendar.
 */
router.post('/dossier', validateBody(dossierRequestSchema), async (req: Request, res: Response): Promise<void> => {
  try {
    const { documentText, documentTitle, persona } = req.body;
    const clauses = ClauseSplitter.split(documentText);
    const audit = await scoringPipeline.analyzeDocument('temp_dossier', documentTitle, clauses, persona);

    const dossier = await dossierGenerator.generateDossier(documentTitle, persona, audit.clauses);
    res.json({ success: true, data: dossier, disclaimer: LEGAL_DISCLAIMER });
  } catch (err) {
    res.status(500).json({ success: false, error: { message: (err as Error).message }, disclaimer: LEGAL_DISCLAIMER });
  }
});

/**
 * GET /api/documents/benchmarks
 * Retrieve list of all standard benchmarks.
 */
router.get('/benchmarks', async (req: Request, res: Response): Promise<void> => {
  try {
    await vectorStore.initialize();
    res.json({
      success: true,
      data: {
        total: vectorStore.getAllBenchmarks().length,
        benchmarks: vectorStore.getAllBenchmarks(),
      },
      disclaimer: LEGAL_DISCLAIMER,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: { message: (err as Error).message }, disclaimer: LEGAL_DISCLAIMER });
  }
});

export default router;
