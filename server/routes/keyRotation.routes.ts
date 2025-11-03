import { Router } from 'express';
import { requireAdmin } from '../security/middleware';
import * as keyRotationService from '../services/apiKeyRotationService';
import { z } from 'zod';
import { readRateLimiter, writeRateLimiter } from '../security/rateLimiters';

const router = Router();

// Validation schemas
const registerKeySchema = z.object({
  keyName: z.string().min(1),
  keyType: z.enum(['external_api', 'encryption', 'signing', 'database']),
  description: z.string().min(1),
  rotationIntervalDays: z.number().int().min(1).max(365).optional(),
});

const markRotatedSchema = z.object({
  keyName: z.string().min(1),
});

/**
 * GET /api/admin/key-rotations
 * Get all API key rotation status (Admin only)
 */
router.get('/', isAuthenticated, requireAdmin, readRateLimiter, async (req, res) => {
  try {
    const rotations = await keyRotationService.getAllKeyRotations();
    res.json(rotations);
  } catch (error) {
    console.error('[Key Rotation] Error fetching rotations:', error);
    res.status(500).json({ error: 'Failed to fetch key rotations' });
  }
});

/**
 * GET /api/admin/key-rotations/:keyName/history
 * Get rotation history for a specific key (Admin only)
 */
router.get('/:keyName/history', isAuthenticated, requireAdmin, readRateLimiter, async (req, res) => {
  try {
    const { keyName } = req.params;
    const history = await keyRotationService.getKeyRotationHistory(keyName);
    
    if (!history) {
      return res.status(404).json({ error: 'Key not found' });
    }
    
    res.json(history);
  } catch (error) {
    console.error('[Key Rotation] Error fetching history:', error);
    res.status(500).json({ error: 'Failed to fetch rotation history' });
  }
});

/**
 * POST /api/admin/key-rotations/register
 * Register a new API key for rotation tracking (Admin only)
 */
router.post('/register', isAuthenticated, requireAdmin, writeRateLimiter, async (req, res) => {
  try {
    const userId = (req.user as any).claims.sub;
    const parseResult = registerKeySchema.safeParse(req.body);

    if (!parseResult.success) {
      return res.status(400).json({
        error: 'Invalid request data',
        details: parseResult.error.issues,
      });
    }

    await keyRotationService.registerApiKey(parseResult.data, userId);
    res.json({ success: true, message: 'API key registered for rotation tracking' });
  } catch (error) {
    console.error('[Key Rotation] Error registering key:', error);
    res.status(500).json({ error: 'Failed to register key' });
  }
});

/**
 * POST /api/admin/key-rotations/mark-rotated
 * Mark an API key as rotated (Admin only)
 */
router.post('/mark-rotated', isAuthenticated, requireAdmin, writeRateLimiter, async (req, res) => {
  try {
    const userId = (req.user as any).claims.sub;
    const parseResult = markRotatedSchema.safeParse(req.body);

    if (!parseResult.success) {
      return res.status(400).json({
        error: 'Invalid request data',
        details: parseResult.error.issues,
      });
    }

    await keyRotationService.markKeyRotated(parseResult.data.keyName, userId);
    res.json({ success: true, message: 'Key marked as rotated successfully' });
  } catch (error) {
    console.error('[Key Rotation] Error marking key as rotated:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to mark key as rotated' });
  }
});

/**
 * POST /api/admin/key-rotations/check
 * Manually trigger rotation status check (Admin only)
 */
router.post('/check', isAuthenticated, requireAdmin, writeRateLimiter, async (req, res) => {
  try {
    await keyRotationService.checkRotationStatus();
    res.json({ success: true, message: 'Rotation status check completed' });
  } catch (error) {
    console.error('[Key Rotation] Error checking status:', error);
    res.status(500).json({ error: 'Failed to check rotation status' });
  }
});

export default router;
