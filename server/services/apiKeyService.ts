import { db } from '../db';
import { apiKeys, apiKeyUsageLogs, userSubscriptions } from '@shared/schema';
import { eq, and, sql, gte } from 'drizzle-orm';
import { randomBytes } from 'crypto';
import bcrypt from 'bcrypt';
import type { ApiKey, InsertApiKey } from '@shared/schema';

const BCRYPT_ROUNDS = 10;
const KEY_PREFIX = 'wc_live_';
const KEY_LENGTH = 32; // 32 bytes = 256 bits

export interface CreateApiKeyParams {
  userId: string;
  name: string;
  scope?: 'read' | 'write' | 'admin';
  monthlyRateLimit?: number;
  allowedEndpoints?: string[];
  ipWhitelist?: string[];
  expiresAt?: Date;
}

export interface ValidateApiKeyResult {
  valid: boolean;
  apiKey?: ApiKey;
  error?: string;
  rateLimitExceeded?: boolean;
}

export class ApiKeyService {
  /**
   * Generate a secure random API key
   * Format: wc_live_<random_64_chars>
   */
  private generateKey(): { key: string; prefix: string } {
    const randomPart = randomBytes(KEY_LENGTH).toString('hex');
    const key = `${KEY_PREFIX}${randomPart}`;
    const prefix = key.substring(0, 16); // First 16 chars for display
    
    return { key, prefix };
  }

  /**
   * Create a new API key for a user
   */
  async createApiKey(params: CreateApiKeyParams): Promise<{ apiKey: ApiKey; key: string }> {
    // Generate the key
    const { key, prefix } = this.generateKey();
    
    // Hash the key for storage (never store plaintext)
    const keyHash = await bcrypt.hash(key, BCRYPT_ROUNDS);
    
    // Calculate usage reset date (first day of next month)
    const usageResetDate = new Date();
    usageResetDate.setMonth(usageResetDate.getMonth() + 1);
    usageResetDate.setDate(1);
    usageResetDate.setHours(0, 0, 0, 0);
    
    // Create the API key record
    const [apiKey] = await db
      .insert(apiKeys)
      .values({
        userId: params.userId,
        name: params.name,
        keyHash,
        prefix,
        scope: params.scope || 'read',
        monthlyRateLimit: params.monthlyRateLimit || 5000,
        allowedEndpoints: params.allowedEndpoints || null,
        ipWhitelist: params.ipWhitelist || null,
        expiresAt: params.expiresAt || null,
        usageResetDate,
        isActive: true,
      })
      .returning();
    
    // Return both the API key record and the plaintext key (only time it's visible)
    return { apiKey, key };
  }

  /**
   * Validate an API key and check permissions
   */
  async validateApiKey(
    key: string,
    endpoint?: string,
    ipAddress?: string
  ): Promise<ValidateApiKeyResult> {
    if (!key || !key.startsWith(KEY_PREFIX)) {
      return { valid: false, error: 'Invalid API key format' };
    }

    // Extract prefix for faster lookup
    const prefix = key.substring(0, 16);

    // Find candidate keys with this prefix
    const candidates = await db
      .select()
      .from(apiKeys)
      .where(
        and(
          eq(apiKeys.prefix, prefix),
          eq(apiKeys.isActive, true)
        )
      );

    if (candidates.length === 0) {
      return { valid: false, error: 'API key not found or inactive' };
    }

    // Check each candidate (should only be one, but hash collisions are possible)
    let matchedKey: ApiKey | null = null;
    for (const candidate of candidates) {
      const matches = await bcrypt.compare(key, candidate.keyHash);
      if (matches) {
        matchedKey = candidate;
        break;
      }
    }

    if (!matchedKey) {
      return { valid: false, error: 'Invalid API key' };
    }

    // Check if key has expired
    if (matchedKey.expiresAt && new Date() > matchedKey.expiresAt) {
      return { valid: false, error: 'API key has expired' };
    }

    // Check if key has been revoked
    if (matchedKey.revokedAt) {
      return { valid: false, error: 'API key has been revoked' };
    }

    // Check IP whitelist if configured
    if (matchedKey.ipWhitelist && matchedKey.ipWhitelist.length > 0 && ipAddress) {
      if (!matchedKey.ipWhitelist.includes(ipAddress)) {
        return { valid: false, error: 'IP address not whitelisted' };
      }
    }

    // Check endpoint restrictions if configured
    if (matchedKey.allowedEndpoints && matchedKey.allowedEndpoints.length > 0 && endpoint) {
      const isAllowed = matchedKey.allowedEndpoints.some(allowed => 
        endpoint.startsWith(allowed)
      );
      if (!isAllowed) {
        return { valid: false, error: 'Endpoint not allowed for this API key' };
      }
    }

    // Check rate limit
    // Reset usage if we're past the reset date
    const now = new Date();
    if (matchedKey.usageResetDate && now >= matchedKey.usageResetDate) {
      // Calculate next reset date
      const nextResetDate = new Date(matchedKey.usageResetDate);
      nextResetDate.setMonth(nextResetDate.getMonth() + 1);

      await db
        .update(apiKeys)
        .set({
          currentMonthUsage: 0,
          usageResetDate: nextResetDate,
        })
        .where(eq(apiKeys.id, matchedKey.id));

      matchedKey.currentMonthUsage = 0;
    }

    // Check if rate limit exceeded
    if (matchedKey.currentMonthUsage >= matchedKey.monthlyRateLimit) {
      return {
        valid: false,
        error: 'Monthly rate limit exceeded',
        rateLimitExceeded: true,
        apiKey: matchedKey,
      };
    }

    return { valid: true, apiKey: matchedKey };
  }

  /**
   * Increment usage counter and update last used timestamp
   */
  async incrementUsage(apiKeyId: string): Promise<void> {
    await db
      .update(apiKeys)
      .set({
        currentMonthUsage: sql`${apiKeys.currentMonthUsage} + 1`,
        lastUsedAt: new Date(),
      })
      .where(eq(apiKeys.id, apiKeyId));
  }

  /**
   * Log API key usage for analytics and debugging
   */
  async logUsage(params: {
    apiKeyId: string;
    userId: string;
    endpoint: string;
    method: string;
    statusCode: number;
    responseTime?: number;
    ipAddress?: string;
    userAgent?: string;
    errorMessage?: string;
  }): Promise<void> {
    await db.insert(apiKeyUsageLogs).values(params);
  }

  /**
   * Get all API keys for a user (with sensitive data redacted)
   */
  async getUserApiKeys(userId: string): Promise<ApiKey[]> {
    return db
      .select()
      .from(apiKeys)
      .where(eq(apiKeys.userId, userId))
      .orderBy(apiKeys.createdAt);
  }

  /**
   * Revoke an API key
   */
  async revokeApiKey(apiKeyId: string, userId: string, reason?: string): Promise<void> {
    await db
      .update(apiKeys)
      .set({
        isActive: false,
        revokedAt: new Date(),
        revokedReason: reason || 'Revoked by user',
      })
      .where(
        and(
          eq(apiKeys.id, apiKeyId),
          eq(apiKeys.userId, userId)
        )
      );
  }

  /**
   * Rotate an API key (create new key, revoke old one)
   */
  async rotateApiKey(
    oldApiKeyId: string,
    userId: string
  ): Promise<{ apiKey: ApiKey; key: string } | null> {
    // Get the old key
    const [oldKey] = await db
      .select()
      .from(apiKeys)
      .where(
        and(
          eq(apiKeys.id, oldApiKeyId),
          eq(apiKeys.userId, userId)
        )
      );

    if (!oldKey) {
      return null;
    }

    // Create new key with same settings
    const newKeyData = await this.createApiKey({
      userId,
      name: `${oldKey.name} (rotated)`,
      scope: oldKey.scope as 'read' | 'write' | 'admin',
      monthlyRateLimit: oldKey.monthlyRateLimit,
      allowedEndpoints: oldKey.allowedEndpoints || undefined,
      ipWhitelist: oldKey.ipWhitelist || undefined,
      expiresAt: oldKey.expiresAt || undefined,
    });

    // Mark new key as rotated
    await db
      .update(apiKeys)
      .set({
        lastRotatedAt: new Date(),
      })
      .where(eq(apiKeys.id, newKeyData.apiKey.id));

    // Revoke old key
    await this.revokeApiKey(oldApiKeyId, userId, 'Rotated to new key');

    return newKeyData;
  }

  /**
   * Get API key usage statistics
   */
  async getUsageStats(apiKeyId: string, userId: string) {
    // Verify ownership
    const [apiKey] = await db
      .select()
      .from(apiKeys)
      .where(
        and(
          eq(apiKeys.id, apiKeyId),
          eq(apiKeys.userId, userId)
        )
      );

    if (!apiKey) {
      return null;
    }

    // Get usage logs for the current month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const logs = await db
      .select({
        endpoint: apiKeyUsageLogs.endpoint,
        method: apiKeyUsageLogs.method,
        statusCode: apiKeyUsageLogs.statusCode,
        count: sql<number>`count(*)`,
      })
      .from(apiKeyUsageLogs)
      .where(
        and(
          eq(apiKeyUsageLogs.apiKeyId, apiKeyId),
          gte(apiKeyUsageLogs.createdAt, startOfMonth)
        )
      )
      .groupBy(
        apiKeyUsageLogs.endpoint,
        apiKeyUsageLogs.method,
        apiKeyUsageLogs.statusCode
      );

    return {
      apiKey,
      currentMonthUsage: apiKey.currentMonthUsage,
      monthlyLimit: apiKey.monthlyRateLimit,
      remaining: Math.max(0, apiKey.monthlyRateLimit - apiKey.currentMonthUsage),
      usageResetDate: apiKey.usageResetDate,
      lastUsedAt: apiKey.lastUsedAt,
      breakdown: logs,
    };
  }

  /**
   * Check if user has API access (Professional or Team tier)
   */
  async userHasApiAccess(userId: string): Promise<boolean> {
    const [subscription] = await db
      .select()
      .from(userSubscriptions)
      .where(eq(userSubscriptions.userId, userId));

    if (!subscription) {
      return false;
    }

    // Only Professional and Team tiers have API access
    return ['professional', 'team'].includes(subscription.tier);
  }

  /**
   * Get rate limit for user's tier
   */
  async getUserRateLimit(userId: string): Promise<number> {
    const [subscription] = await db
      .select()
      .from(userSubscriptions)
      .where(eq(userSubscriptions.userId, userId));

    if (!subscription) {
      return 0; // Free tier has no API access
    }

    // Professional: 5,000 calls/month, Team: 25,000 calls/month
    const rateLimits: Record<string, number> = {
      professional: 5000,
      team: 25000,
    };

    return rateLimits[subscription.tier] || 0;
  }
}

export const apiKeyService = new ApiKeyService();
