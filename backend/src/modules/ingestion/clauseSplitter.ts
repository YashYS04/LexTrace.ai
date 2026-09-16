import { ParsedClause } from '../../types';
import { Hasher } from '../../utils/hasher';
import { SecurityGuard } from '../../utils/security';

export class ClauseSplitter {
  private static readonly CLAUSE_PATTERNS = [
    // 1. CLAUSE NAME or 1.1 CLAUSE NAME
    /(?:^|\n)(?:SECTION|ARTICLE)?\s*(\d+(?:\.\d+)?)\s*[:.\-]\s*([A-Z\s,/&'\-]{3,50})(?:\n|$)/gi,
    // (A) CLAUSE NAME or [1] CLAUSE NAME
    /(?:^|\n)(?:\(([a-zA-Z0-9]+)\)|\[([a-zA-Z0-9]+)\])\s*([A-Z\s,/&'\-]{3,50})(?:\n|$)/gi,
    // ALL CAPS HEADINGS on their own line
    /(?:^|\n)([A-Z\s,/&'\-]{4,50})(?:\n)/g,
  ];

  private static readonly CATEGORY_KEYWORDS: Record<string, string[]> = {
    'Security Deposit': ['security deposit', 'damage deposit', 'escrow deposit', 'deposit with landlord'],
    'Landlord Entry': ['right of entry', 'landlord right of entry', 'inspection', 'access to premises', 'enter the premises'],
    'Payment Terms': ['payment terms', 'payment', 'compensation', 'fees', 'invoice', 'rent', 'billing', 'late charge'],
    'Scope of Work': ['scope of services', 'scope of work', 'duties', 'deliverables', 'premises and term', 'position and duties'],
    'Intellectual Property': ['intellectual property', 'ownership', 'inventions', 'work made for hire', 'copyright', 'patent', 'moral rights'],
    'Indemnification': ['indemnification', 'indemnify', 'hold harmless', 'defense and indemnity'],
    'Limitation of Liability': ['limitation of liability', 'damages', 'consequential damages', 'liability cap', 'waiver of liability'],
    'Termination': ['termination', 'cancellation', 'term and termination', 'non-renewal', 'early termination'],
    'Non-Compete/Non-Solicitation': ['non-compete', 'non-competition', 'non-solicitation', 'restrictive covenants', 'non-disparagement'],
    'Maintenance': ['maintenance', 'repairs', 'structural repairs', 'condition of premises', 'appliances'],
    'Confidentiality': ['confidentiality', 'confidential information', 'non-disclosure', 'trade secrets'],
    'Dispute Resolution': ['dispute resolution', 'arbitration', 'mediation', 'legal fees and disputes', 'jury waiver'],
    'Governing Law': ['governing law', 'jurisdiction', 'venue', 'applicable law'],
    'Force Majeure': ['force majeure', 'acts of god', 'uncontrollable events'],
    'Warranty/Representations': ['warranty', 'warranties', 'representations', 'as-is'],
    'Notice': ['notice', 'notices', 'communications'],
  };

  /**
   * Split a document string into an array of typed, sanitized, and hashed clauses.
   */
  public static split(documentText: string): ParsedClause[] {
    const text = documentText.trim();
    if (!text) return [];

    // Regex to split on major numbered section markers: e.g. "1. ", "Section 1", "Article 1"
    const sectionSplitterRegex = /(?=(?:^|\n\n+)(?:\d+[\.\:]\s+|SECTION\s+\d+|ARTICLE\s+[IVXLCDM\d]+|[A-Z\s]{4,35}\n))/i;
    const rawChunks = text.split(sectionSplitterRegex).map((c) => c.trim()).filter((c) => c.length > 20);

    // If chunking produced too few clauses, split by double newlines
    let workingChunks = rawChunks;
    if (workingChunks.length <= 1) {
      workingChunks = text.split(/\n\s*\n/).map((c) => c.trim()).filter((c) => c.length > 40);
    }

    // Final fallback: single clause
    if (workingChunks.length === 0) {
      workingChunks = [text];
    }

    const parsedClauses: ParsedClause[] = [];

    workingChunks.forEach((chunk, idx) => {
      const clauseType = ClauseSplitter.classifyClause(chunk);
      const sanitized = SecurityGuard.sanitizeInput(chunk);
      const hash = Hasher.sha256(sanitized);

      parsedClauses.push({
        index: idx,
        clauseType,
        originalText: chunk,
        sanitizedText: sanitized,
        hash,
      });
    });

    return parsedClauses;
  }

  /**
   * Classify clause content into a standardized legal category.
   */
  public static classifyClause(clauseText: string): string {
    const firstLine = clauseText.split('\n')[0].toLowerCase();
    const fullLower = clauseText.toLowerCase();

    // Check heading first for high precision
    for (const [category, keywords] of Object.entries(ClauseSplitter.CATEGORY_KEYWORDS)) {
      for (const kw of keywords) {
        if (firstLine.includes(kw)) {
          return category;
        }
      }
    }

    // Check full body text
    for (const [category, keywords] of Object.entries(ClauseSplitter.CATEGORY_KEYWORDS)) {
      for (const kw of keywords) {
        if (fullLower.includes(kw)) {
          return category;
        }
      }
    }

    return 'General';
  }
}
