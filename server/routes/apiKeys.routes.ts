import { Router } from 'express';
import { apiKeyService } from '../services/apiKeyService';
import { insertApiKeySchema } from '@shared/schema';
import { z } from 'zod';
import { readRateLimiter, writeRateLimiter } from '../security/rateLimiters';

const router = Router();

/**
 * Create a new API key
 * POST /api/api-keys
 */
router.post('/', writeRateLimiter, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;

    // Check if user has API access (Professional or Team tier)
    const hasAccess = await apiKeyService.userHasApiAccess(userId);
    if (!hasAccess) {
      return res.status(403).json({
        error: 'Upgrade Required',
        message: 'API access is only available for Professional and Team tier subscribers',
        upgradeUrl: '/pricing',
      });
    }

    // Validate request body
    const schema = insertApiKeySchema.extend({
      monthlyRateLimit: z.number().optional(),
      ipWhitelist: z.array(z.string()).optional(),
      expiresAt: z.string().optional().transform(val => val ? new Date(val) : undefined),
    });

    const validatedData = schema.parse(req.body);

    // Get user's default rate limit if not specified
    const monthlyRateLimit = validatedData.monthlyRateLimit || 
                             await apiKeyService.getUserRateLimit(userId);

    // Create the API key
    const result = await apiKeyService.createApiKey({
      userId,
      name: validatedData.name,
      scope: validatedData.scope || 'read',
      monthlyRateLimit,
      allowedEndpoints: validatedData.allowedEndpoints || undefined,
      ipWhitelist: validatedData.ipWhitelist,
      expiresAt: validatedData.expiresAt,
    });

    // Return the API key (only time the full key is visible)
    res.json({
      apiKey: result.apiKey,
      key: result.key,
      message: 'API key created successfully. Save this key securely - you won\'t be able to see it again!',
    });
  } catch (error) {
    console.error('Error creating API key:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation Error',
        details: error.errors,
      });
    }
    res.status(500).json({
      error: 'Failed to create API key',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * List all API keys for the authenticated user
 * GET /api/api-keys
 */
router.get('/', readRateLimiter, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;

    const apiKeys = await apiKeyService.getUserApiKeys(userId);

    // Redact sensitive fields
    const safeKeys = apiKeys.map(key => ({
      ...key,
      keyHash: undefined, // Never expose hash
    }));

    res.json({ apiKeys: safeKeys });
  } catch (error) {
    console.error('Error fetching API keys:', error);
    res.status(500).json({
      error: 'Failed to fetch API keys',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * Get usage statistics for a specific API key
 * POST /api/api-keys/stats (changed from GET to avoid sensitive data in URL)
 * Body: { apiKeyId: string }
 * 
 * Security Note: Changed from GET with path parameter to POST with body parameter
 * to prevent API key IDs from appearing in URLs, logs, and browser history.
 */
router.post('/stats', readRateLimiter, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const { apiKeyId } = req.body;

    if (!apiKeyId) {
      return res.status(400).json({
        error: 'Missing apiKeyId in request body',
      });
    }

    const stats = await apiKeyService.getUsageStats(apiKeyId, userId);

    if (!stats) {
      return res.status(404).json({
        error: 'API key not found',
      });
    }

    res.json(stats);
  } catch (error) {
    console.error('Error fetching API key stats:', error);
    res.status(500).json({
      error: 'Failed to fetch API key statistics',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * Revoke an API key
 * DELETE /api/api-keys/:id
 */
router.delete('/:id', writeRateLimiter, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const apiKeyId = req.params.id;
    const reason = req.body.reason;

    await apiKeyService.revokeApiKey(apiKeyId, userId, reason);

    res.json({
      message: 'API key revoked successfully',
    });
  } catch (error) {
    console.error('Error revoking API key:', error);
    res.status(500).json({
      error: 'Failed to revoke API key',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * Rotate an API key (create new one, revoke old one)
 * POST /api/api-keys/:id/rotate
 */
router.post('/:id/rotate', writeRateLimiter, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const apiKeyId = req.params.id;

    const result = await apiKeyService.rotateApiKey(apiKeyId, userId);

    if (!result) {
      return res.status(404).json({
        error: 'API key not found',
      });
    }

    res.json({
      apiKey: result.apiKey,
      key: result.key,
      message: 'API key rotated successfully. The old key has been revoked. Save this new key securely!',
    });
  } catch (error) {
    console.error('Error rotating API key:', error);
    res.status(500).json({
      error: 'Failed to rotate API key',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;
