import request from 'supertest';
import { createApp } from '../../src/app';
import { Application } from 'express';

describe('API Integration Tests', () => {
  let app: Application;

  beforeAll(() => {
    process.env.NODE_ENV = 'test';
    app = createApp();
  });

  describe('GET /api/health', () => {
    it('should return health status 200', async () => {
      const res = await request(app).get('/api/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('healthy');
      expect(res.body.service).toContain('LexTrace AI');
    });
  });

  describe('GET /api/documents/benchmarks', () => {
    it('should return standard benchmark clauses', async () => {
      const res = await request(app).get('/api/documents/benchmarks');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.total).toBeGreaterThanOrEqual(15);
      expect(Array.isArray(res.body.data.benchmarks)).toBe(true);
    });
  });

  describe('POST /api/documents/audit', () => {
    const sampleContract = `
1. PAYMENT TERMS
Client shall pay $85.00 per hour. Client reserves sole discretion to withhold payment for any reason.

2. INTELLECTUAL PROPERTY
All code created by Contractor on personal time shall become exclusive property of Client worldwide.

3. INDEMNIFICATION
Contractor shall fully indemnify Client from all third party claims regardless of fault.
    `.trim();

    it('should audit contract and return risk scores, gotchas, and counterdrafts', async () => {
      const res = await request(app)
        .post('/api/documents/audit')
        .send({
          text: sampleContract,
          fileName: 'Test_Contract.txt',
          persona: 'Freelancer',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const audit = res.body.data;
      expect(audit.fileName).toBe('Test_Contract.txt');
      expect(audit.persona).toBe('Freelancer');
      expect(audit.clauses.length).toBe(3);
      expect(audit.overallHealthScore).toBeLessThanOrEqual(70); // Discovers predatory terms
      expect(audit.gotchas.length).toBeGreaterThan(0);
      expect(audit.clauses.some((c: any) => c.counterDraft !== undefined)).toBe(true);
    });

    it('should reject audit request with payload below min length', async () => {
      const res = await request(app)
        .post('/api/documents/audit')
        .send({ text: 'Too short' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/documents/compare', () => {
    it('should compare two versions of a contract and return diffs', async () => {
      const doc1 = '1. PAYMENT TERMS\nClient shall pay within ninety (90) days with zero interest.';
      const doc2 = '1. PAYMENT TERMS\nClient shall pay within thirty (30) days with 1.5% interest.';

      const res = await request(app)
        .post('/api/documents/compare')
        .send({
          doc1Text: doc1,
          doc1Name: 'Version 1 - Unfavorable',
          doc2Text: doc2,
          doc2Name: 'Version 2 - Balanced',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const comparison = res.body.data;
      expect(comparison.clauseComparisons.length).toBe(1);
      expect(comparison.clauseComparisons[0].status).toBe('modified');
      expect(comparison.totalModifications).toBe(1);
    });
  });

  describe('POST /api/documents/chat', () => {
    it('should answer questions grounded in the document with citations', async () => {
      const doc = '1. PAYMENT TERMS\nClient shall pay $120/hr Net 30 for all engineering deliverables.';

      const res = await request(app)
        .post('/api/documents/chat')
        .send({
          question: 'What is the hourly rate for engineering?',
          documentText: doc,
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.answer).toBeDefined();
      expect(res.body.data.citations.length).toBeGreaterThan(0);
    });
  });

  describe('POST /api/documents/dossier', () => {
    it('should generate an attorney consultation brief and obligation timeline', async () => {
      const doc = '1. INDEMNIFICATION\nContractor indemnifies client unconditionally.\n2. TERMINATION\nClient terminates at will.';

      const res = await request(app)
        .post('/api/documents/dossier')
        .send({
          documentText: doc,
          documentTitle: 'Freelance Tech Contract',
          persona: 'Freelancer',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.targetedAttorneyQuestions.length).toBe(5);
      expect(res.body.data.obligationCalendar.length).toBeGreaterThan(0);
    });
  });

  describe('POST /api/documents/upload', () => {
    it('should extract text from an uploaded text file', async () => {
      const buffer = Buffer.from('1. PAYMENT TERMS\nTenant pays $2000 per month.', 'utf-8');

      const res = await request(app)
        .post('/api/documents/upload')
        .attach('file', buffer, 'lease_sample.txt');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.fileName).toBe('lease_sample.txt');
      expect(res.body.data.text).toContain('Tenant pays $2000');
    });

    it('should return 400 when no file is uploaded', async () => {
      const res = await request(app).post('/api/documents/upload');
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('Validation Error Handling', () => {
    it('should reject compare request missing doc2Text with 400', async () => {
      const res = await request(app)
        .post('/api/documents/compare')
        .send({ doc1Text: '1. PAYMENT TERMS\nClient pays $100.' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should reject chat request with empty question with 400', async () => {
      const res = await request(app)
        .post('/api/documents/chat')
        .send({ question: '', documentText: 'Some contract text here...' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });
});
