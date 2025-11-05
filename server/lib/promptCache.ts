/**
 * PromptCacheManager - Manages cached prompts for cost optimization
 *
 * Anthropic's prompt caching reduces costs by 90% for cached tokens.
 * This manager handles:
 * - User-specific context caching (world details, character profiles)
 * - Time-to-live (TTL) management
 * - Cache invalidation
 */

interface CachedPrompt {
  prompt: string;
  timestamp: number;
}

export class PromptCacheManager {
  private cache = new Map<string, CachedPrompt>();
  private readonly TTL = 5 * 60 * 1000; // 5 minutes (Anthropic cache TTL)

  /**
   * Get cached prompt if it exists and hasn't expired
   */
  getCachedPrompt(userId: string, type: string): string | null {
    const key = `${userId}:${type}`;
    const cached = this.cache.get(key);

    if (!cached) return null;

    // Check if expired (Anthropic caches for 5 minutes)
    if (Date.now() - cached.timestamp > this.TTL) {
      this.cache.delete(key);
      return null;
    }

    return cached.prompt;
  }

  /**
   * Cache a prompt for a user and type
   */
  setCachedPrompt(userId: string, type: string, prompt: string): void {
    const key = `${userId}:${type}`;
    this.cache.set(key, {
      prompt,
      timestamp: Date.now(),
    });
  }

  /**
   * Invalidate cached prompt for a user and type
   */
  invalidateCache(userId: string, type: string): void {
    const key = `${userId}:${type}`;
    this.cache.delete(key);
  }

  /**
   * Invalidate all cached prompts for a user
   */
  invalidateUserCache(userId: string): void {
    const keysToDelete: string[] = [];

    this.cache.forEach((_, key) => {
      if (key.startsWith(`${userId}:`)) {
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach((key) => this.cache.delete(key));
  }

  /**
   * Clean up expired entries (run periodically)
   */
  cleanupExpired(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    this.cache.forEach((value, key) => {
      if (now - value.timestamp > this.TTL) {
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach((key) => this.cache.delete(key));
  }

  /**
   * Get cache statistics
   */
  getStats() {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.keys()).map((key) => {
        const cached = this.cache.get(key)!;
        return {
          key,
          age: Date.now() - cached.timestamp,
          promptLength: cached.prompt.length,
        };
      }),
    };
  }
}

export const promptCache = new PromptCacheManager();

// Run cleanup every minute
setInterval(() => {
  promptCache.cleanupExpired();
}, 60 * 1000);
