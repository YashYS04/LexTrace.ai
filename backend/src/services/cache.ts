export class CacheService {
  private static instance: CacheService;
  private memoryCache: Map<string, { value: any; expiresAt: number }> = new Map();
  private defaultTTL: number = 3600 * 1000; // 1 hour

  private constructor() {}

  public static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService();
    }
    return CacheService.instance;
  }

  public async get<T>(key: string): Promise<T | null> {
    const item = this.memoryCache.get(key);
    if (!item) return null;

    if (Date.now() > item.expiresAt) {
      this.memoryCache.delete(key);
      return null;
    }

    return item.value as T;
  }

  public async set(key: string, value: any, ttlMs: number = this.defaultTTL): Promise<void> {
    this.memoryCache.set(key, {
      value,
      expiresAt: Date.now() + ttlMs,
    });
  }

  public async clear(): Promise<void> {
    this.memoryCache.clear();
  }
}
