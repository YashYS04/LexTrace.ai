import crypto from 'crypto';

export class Hasher {
  public static sha256(content: string): string {
    return crypto.createHash('sha256').update(content.trim().toLowerCase()).digest('hex');
  }

  public static generateId(prefix: string = 'doc'): string {
    return `${prefix}_${crypto.randomBytes(8).toString('hex')}`;
  }
}
