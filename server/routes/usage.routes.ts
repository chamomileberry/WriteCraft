import { Router } from "express";
import { subscriptionService } from "../services/subscriptionService";
import { z } from "zod";

const router = Router();

/**
 * GET /api/usage/today
 * Returns today's AI usage statistics and tier limits for the authenticated user
 */
router.get("/today", async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    
    const usageStats = await subscriptionService.getTodayUsage(userId);
    
    res.json(usageStats);
  } catch (error) {
    console.error('Error fetching today\'s usage:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    res.status(500).json({ error: errorMessage });
  }
});

/**
 * GET /api/usage/history
 * Returns usage history for the authenticated user with optional filters
 * Query params:
 * - startDate: ISO date string (default: 30 days ago)
 * - endDate: ISO date string (default: today)
 * - limit: number of records (default: 100)
 */
router.get("/history", async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    
    const { startDate, endDate, limit } = z.object({
      startDate: z.coerce.date().optional(),
      endDate: z.coerce.date().optional(),
      limit: z.coerce.number().min(1).max(1000).optional()
    }).parse(req.query);
    
    const usageHistory = await subscriptionService.getUsageHistory(userId, {
      startDate,
      endDate,
      limit
    });
    
    res.json(usageHistory);
  } catch (error) {
    console.error('Error fetching usage history:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request parameters', details: error.errors });
    }
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    res.status(500).json({ error: errorMessage });
  }
});

export default router;
