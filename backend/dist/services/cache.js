"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CacheService = void 0;
class CacheService {
    static instance;
    memoryCache = new Map();
    defaultTTL = 3600 * 1000; // 1 hour
    constructor() { }
    static getInstance() {
        if (!CacheService.instance) {
            CacheService.instance = new CacheService();
        }
        return CacheService.instance;
    }
    async get(key) {
        const item = this.memoryCache.get(key);
        if (!item)
            return null;
        if (Date.now() > item.expiresAt) {
            this.memoryCache.delete(key);
            return null;
        }
        return item.value;
    }
    async set(key, value, ttlMs = this.defaultTTL) {
        this.memoryCache.set(key, {
            value,
            expiresAt: Date.now() + ttlMs,
        });
    }
    async clear() {
        this.memoryCache.clear();
    }
}
exports.CacheService = CacheService;
