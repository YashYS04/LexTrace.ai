import fs from 'fs';
import path from 'path';
import { ClauseSplitter } from '../../src/modules/ingestion/clauseSplitter';
import { ScoringPipeline } from '../../src/modules/audit/scoringPipeline';
import { ContractDiffEngine } from '../../src/modules/comparison/contractDiffEngine';
import { GroundedChatEngine } from '../../src/modules/chat/groundedChatEngine';
import { DossierGenerator } from '../../src/modules/dossier/dossierGenerator';
import { RiskLevel } from '../../src/types';

describe('LexTrace AI End-to-End Pipeline Tests', () => {
  const samplesDir = path.resolve(__dirname, '../../../sample_contracts');
  const scoringPipeline = new ScoringPipeline();
  const diffEngine = new ContractDiffEngine();
  const chatEngine = new GroundedChatEngine();
  const dossierGenerator = new DossierGenerator();

  it('should execute complete audit on Aggressive Freelance Contract', async () => {
    const filePath = path.join(samplesDir, 'Freelance_Agreement_V1_Aggressive.txt');
    const contractText = fs.readFileSync(filePath, 'utf-8');

    const clauses = ClauseSplitter.split(contractText);
    expect(clauses.length).toBeGreaterThanOrEqual(8);

    const audit = await scoringPipeline.analyzeDocument(
      'e2e_freelance_1',
      'Freelance_Agreement_V1_Aggressive.txt',
      clauses,
      'Freelancer'
    );

    expect(audit.overallHealthScore).toBeLessThan(60); // Severely unfavorable terms
    expect(audit.riskSummary.unfavorableCount).toBeGreaterThanOrEqual(3);
    expect(audit.gotchas.length).toBeGreaterThanOrEqual(3);

    // Verify IP and Indemnification were identified as Unfavorable
    const ipClause = audit.clauses.find((c) => c.clauseType === 'Intellectual Property');
    expect(ipClause?.riskLevel).toBe(RiskLevel.Unfavorable);
    expect(ipClause?.counterDraft).toBeDefined();

    const indClause = audit.clauses.find((c) => c.clauseType === 'Indemnification');
    expect(indClause?.riskLevel).toBe(RiskLevel.Unfavorable);
    expect(indClause?.counterDraft).toBeDefined();
  });

  it('should execute complete audit on Aggressive Residential Lease Contract', async () => {
    const filePath = path.join(samplesDir, 'Residential_Lease_Aggressive.txt');
    const contractText = fs.readFileSync(filePath, 'utf-8');

    const clauses = ClauseSplitter.split(contractText);
    expect(clauses.length).toBeGreaterThanOrEqual(7);

    const audit = await scoringPipeline.analyzeDocument(
      'e2e_lease_1',
      'Residential_Lease_Aggressive.txt',
      clauses,
      'Tenant'
    );

    expect(audit.persona).toBe('Tenant');
    expect(audit.overallHealthScore).toBeLessThan(60);

    // Verify Landlord Entry was flagged as Unfavorable
    const entryClause = audit.clauses.find((c) => c.clauseType === 'Landlord Entry');
    expect(entryClause?.riskLevel).toBe(RiskLevel.Unfavorable);

    // Verify Security Deposit was flagged as Unfavorable
    const depositClause = audit.clauses.find((c) => c.clauseType === 'Security Deposit');
    expect(depositClause?.riskLevel).toBe(RiskLevel.Unfavorable);
  });

  it('should execute complete Contract Comparison between Freelance V1 and V2', async () => {
    const textV1 = fs.readFileSync(path.join(samplesDir, 'Freelance_Agreement_V1_Aggressive.txt'), 'utf-8');
    const textV2 = fs.readFileSync(path.join(samplesDir, 'Freelance_Agreement_V2_Balanced.txt'), 'utf-8');

    const clausesV1 = ClauseSplitter.split(textV1);
    const clausesV2 = ClauseSplitter.split(textV2);

    const comparison = await diffEngine.compare(
      'Freelance Agreement V1 (Aggressive)',
      clausesV1,
      'Freelance Agreement V2 (Balanced)',
      clausesV2
    );

    expect(comparison.totalModifications).toBeGreaterThanOrEqual(5);
    expect(comparison.clauseComparisons.length).toBeGreaterThanOrEqual(8);
    expect(comparison.overallDivergenceSummary).toBeDefined();
    expect(comparison.whoBenefitsMost).toBeDefined();
  });

  it('should answer complex grounded legal question on Freelance Contract', async () => {
    const contractText = fs.readFileSync(
      path.join(samplesDir, 'Freelance_Agreement_V1_Aggressive.txt'),
      'utf-8'
    );
    const clauses = ClauseSplitter.split(contractText);

    const answer = await chatEngine.askQuestion(
      'Does client have the right to withhold payment if they are not satisfied?',
      clauses,
      contractText
    );

    expect(answer.answer).toBeDefined();
    expect(answer.citations.length).toBeGreaterThan(0);
    expect(answer.citations[0].clauseType).toBe('Payment Terms');
  });

  it('should generate complete Attorney Consultation Dossier for Employment Contract', async () => {
    const contractText = fs.readFileSync(
      path.join(samplesDir, 'Employment_Agreement_Trap.txt'),
      'utf-8'
    );
    const clauses = ClauseSplitter.split(contractText);
    const audit = await scoringPipeline.analyzeDocument('e2e_emp_1', 'Employment_Agreement_Trap.txt', clauses, 'Employee');

    const dossier = await dossierGenerator.generateDossier('Employment Agreement', 'Employee', audit.clauses);
    expect(dossier.targetedAttorneyQuestions.length).toBe(5);
    expect(dossier.obligationCalendar.length).toBeGreaterThanOrEqual(2);
    expect(dossier.highRiskItems.length).toBeGreaterThanOrEqual(1);
  });
});
