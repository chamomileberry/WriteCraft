/**
 * Entity Detection Cache
 *
 * Caches entity detection results to avoid redundant AI calls
 * Uses in-memory storage with TTL expiration
 */

import crypto from "crypto";

interface CacheEntry {
  data: any;
  expiresAt: number;
}

class EntityCache {
  private cache: Map<string, CacheEntry>;
  private readonly DEFAULT_TTL_MS = 10 * 60 * 1000; // 10 minutes

  constructor() {
    this.cache = new Map();

    // Clean up expired entries every 5 minutes
    setInterval(() => this.cleanup(), 5 * 60 * 1000);
  }

  /**
   * Generate cache key from conversation messages
   */
  private generateKey(messages: any[], userId?: string): string {
    const messageHash = crypto
      .createHash("sha256")
      .update(JSON.stringify(messages))
      .digest("hex");

    return userId ? `${userId}:${messageHash}` : messageHash;
  }

  /**
   * Get cached entity detection result
   */
  get(messages: any[], userId?: string): any | null {
    const key = this.generateKey(messages, userId);
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  /**
   * Set entity detection result in cache
   */
  set(messages: any[], data: any, userId?: string, ttlMs?: number): void {
    const key = this.generateKey(messages, userId);
    const expiresAt = Date.now() + (ttlMs || this.DEFAULT_TTL_MS);

    this.cache.set(key, {
      data,
      expiresAt,
    });
  }

  /**
   * Clear all cached entries
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Remove expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    const entries = Array.from(this.cache.entries());

    for (const [key, entry] of entries) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Get cache statistics
   */
  getStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }
}

export const entityCache = new EntityCache();
