import { ContractDiffEngine } from '../../src/modules/comparison/contractDiffEngine';
import { ParsedClause } from '../../src/types';

describe('ContractDiffEngine Unit Tests', () => {
  const engine = new ContractDiffEngine();

  it('should compute word-level diff segments correctly', () => {
    const text1 = 'Client shall pay within thirty days of invoice.';
    const text2 = 'Client shall pay within fifteen days of invoice.';

    const diff = ContractDiffEngine.computeWordDiff(text1, text2);
    expect(diff.length).toBeGreaterThanOrEqual(2);

    const hasRemoved = diff.some((d) => d.type === 'removed' && d.text === 'thirty');
    const hasAdded = diff.some((d) => d.type === 'added' && d.text === 'fifteen');
    const hasUnchanged = diff.some((d) => d.type === 'unchanged');

    expect(hasRemoved).toBe(true);
    expect(hasAdded).toBe(true);
    expect(hasUnchanged).toBe(true);
  });

  it('should identify identical clauses as unchanged', async () => {
    const clauses1: ParsedClause[] = [
      {
        index: 0,
        clauseType: 'Confidentiality',
        originalText: 'Both parties agree to hold information strictly confidential for 3 years.',
        sanitizedText: 'Both parties agree to hold information strictly confidential for 3 years.',
        hash: 'hash_conf_1',
      },
    ];

    const clauses2: ParsedClause[] = [
      {
        index: 0,
        clauseType: 'Confidentiality',
        originalText: 'Both parties agree to hold information strictly confidential for 3 years.',
        sanitizedText: 'Both parties agree to hold information strictly confidential for 3 years.',
        hash: 'hash_conf_1',
      },
    ];

    const result = await engine.compare('Version 1', clauses1, 'Version 2', clauses2);
    expect(result.clauseComparisons.length).toBe(1);
    expect(result.clauseComparisons[0].status).toBe('unchanged');
    expect(result.totalModifications).toBe(0);
  });

  it('should detect added clauses in Version 2', async () => {
    const clauses1: ParsedClause[] = [];
    const clauses2: ParsedClause[] = [
      {
        index: 0,
        clauseType: 'Non-Compete/Non-Solicitation',
        originalText: 'Contractor shall not work for any competitor for two years.',
        sanitizedText: 'Contractor shall not work for any competitor for two years.',
        hash: 'hash_noncomp_2',
      },
    ];

    const result = await engine.compare('Version 1', clauses1, 'Version 2', clauses2);
    expect(result.clauseComparisons.length).toBe(1);
    expect(result.clauseComparisons[0].status).toBe('added');
    expect(result.clauseComparisons[0].clauseType).toBe('Non-Compete/Non-Solicitation');
    expect(result.totalModifications).toBe(1);
  });

  it('should detect removed clauses from Version 1', async () => {
    const clauses1: ParsedClause[] = [
      {
        index: 0,
        clauseType: 'Warranty/Representations',
        originalText: 'Contractor warrants that deliverables will be free of defects for 90 days.',
        sanitizedText: 'Contractor warrants that deliverables will be free of defects for 90 days.',
        hash: 'hash_warr_1',
      },
    ];
    const clauses2: ParsedClause[] = [];

    const result = await engine.compare('Version 1', clauses1, 'Version 2', clauses2);
    expect(result.clauseComparisons.length).toBe(1);
    expect(result.clauseComparisons[0].status).toBe('removed');
    expect(result.clauseComparisons[0].clauseType).toBe('Warranty/Representations');
  });
});
