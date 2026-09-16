import pdfParse from 'pdf-parse';
import { SecurityGuard } from '../../utils/security';

export class TextExtractor {
  /**
   * Extract raw text from text or PDF buffer.
   */
  public static async extractText(buffer: Buffer, mimeType: string): Promise<string> {
    if (mimeType === 'application/pdf') {
      try {
        const data = await pdfParse(buffer);
        return SecurityGuard.sanitizeInput(data.text);
      } catch (err) {
        throw new Error(`Failed to parse PDF document: ${(err as Error).message}`);
      }
    }

    // Default to utf-8 text
    const text = buffer.toString('utf-8');
    return SecurityGuard.sanitizeInput(text);
  }
}
