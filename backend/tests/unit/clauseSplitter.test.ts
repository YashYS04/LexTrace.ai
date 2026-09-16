import { ClauseSplitter } from '../../src/modules/ingestion/clauseSplitter';

describe('ClauseSplitter Unit Tests', () => {
  const sampleContract = `
1. SCOPE OF SERVICES
Contractor agrees to perform development services as specified in SOW.

2. PAYMENT TERMS
Client shall pay $85 per hour within thirty days of invoice.

3. INTELLECTUAL PROPERTY
Client owns all work products developed under this agreement.

4. INDEMNIFICATION
Contractor shall indemnify Client against all third-party claims.

5. TERMINATION
Either party may terminate upon thirty days written notice.
  `.trim();

  it('should split contract text into distinct clauses', () => {
    const clauses = ClauseSplitter.split(sampleContract);
    expect(clauses.length).toBe(5);
  });

  it('should accurately classify clause categories', () => {
    const clauses = ClauseSplitter.split(sampleContract);
    expect(clauses[0].clauseType).toBe('Scope of Work');
    expect(clauses[1].clauseType).toBe('Payment Terms');
    expect(clauses[2].clauseType).toBe('Intellectual Property');
    expect(clauses[3].clauseType).toBe('Indemnification');
    expect(clauses[4].clauseType).toBe('Termination');
  });

  it('should compute deterministic SHA-256 hash for each clause', () => {
    const clauses1 = ClauseSplitter.split(sampleContract);
    const clauses2 = ClauseSplitter.split(sampleContract);

    expect(clauses1[0].hash).toBeDefined();
    expect(clauses1[0].hash).toBe(clauses2[0].hash);
    expect(clauses1[0].hash).not.toBe(clauses1[1].hash);
  });

  it('should handle unformatted single-paragraph text gracefully', () => {
    const text = 'This agreement specifies that the tenant must pay rent on the first of each month without fail.';
    const clauses = ClauseSplitter.split(text);
    expect(clauses.length).toBe(1);
    expect(clauses[0].clauseType).toBe('Payment Terms');
  });

  it('should return empty array for empty string input', () => {
    const clauses = ClauseSplitter.split('');
    expect(clauses).toEqual([]);
  });

  it('should classify specialized lease clauses like Landlord Entry and Security Deposit', () => {
    const entryText = 'Landlord shall have the right of entry to inspect premises upon 24 hours notice.';
    const depositText = 'Tenant shall pay a security deposit of two months rent to be held in escrow.';

    expect(ClauseSplitter.classifyClause(entryText)).toBe('Landlord Entry');
    expect(ClauseSplitter.classifyClause(depositText)).toBe('Security Deposit');
  });

  it('should classify Maintenance, Governing Law, and Force Majeure clauses correctly', () => {
    const maint = 'Tenant is responsible for HVAC servicing and appliance repairs.';
    const gov = 'This contract is governed by the laws and exclusive jurisdiction of Delaware.';
    const force = 'Neither party is liable for acts of God, war, or unforeseen utility disasters.';

    expect(ClauseSplitter.classifyClause(maint)).toBe('Maintenance');
    expect(ClauseSplitter.classifyClause(gov)).toBe('Governing Law');
    expect(ClauseSplitter.classifyClause(force)).toBe('Force Majeure');
  });

  it('should split contracts formatted with ARTICLE and Roman numerals', () => {
    const doc = `ARTICLE I. SCOPE OF SERVICES\nContractor will write software.\n\nARTICLE II. INDEMNIFICATION\nContractor indemnifies client.`;
    const clauses = ClauseSplitter.split(doc);
    expect(clauses.length).toBe(2);
    expect(clauses[0].clauseType).toBe('Scope of Work');
    expect(clauses[1].clauseType).toBe('Indemnification');
  });
});
