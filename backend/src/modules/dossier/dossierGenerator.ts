import { LawyerDossier, PersonaType, ScoredClause } from '../../types';
import { GeminiService } from '../../services/gemini';

export class DossierGenerator {
  private geminiService: GeminiService;

  constructor() {
    this.geminiService = GeminiService.getInstance();
  }

  /**
   * Generate an Attorney Consultation Briefing Dossier and Obligation Calendar.
   */
  public async generateDossier(
    documentTitle: string,
    persona: PersonaType,
    scoredClauses: ScoredClause[]
  ): Promise<LawyerDossier> {
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
