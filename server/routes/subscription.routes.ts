import { Router } from "express";
import { subscriptionService } from "../services/subscriptionService";
import { TIER_LIMITS } from "@shared/types/subscription";

const router = Router();

/**
 * GET /api/subscription
 * Get user's current subscription status and limits
 */
router.get("/", async (req: any, res) => {
  try {
    const userId = req.user?.claims?.sub;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const subscription = await subscriptionService.getUserSubscription(userId);
    
    res.json(subscription);
  } catch (error) {
    console.error('Error fetching subscription:', error);
    res.status(500).json({ error: 'Failed to fetch subscription' });
  }
});

/**
 * GET /api/subscription/tiers
 * Get all available subscription tiers and their limits
 */
router.get("/tiers", async (req: any, res) => {
  try {
    res.json(TIER_LIMITS);
  } catch (error) {
    console.error('Error fetching tiers:', error);
    res.status(500).json({ error: 'Failed to fetch tiers' });
  }
});

/**
 * GET /api/subscription/usage
 * Get AI usage statistics for the current user
 */
router.get("/usage", async (req: any, res) => {
  try {
    const userId = req.user?.claims?.sub;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const days = parseInt(req.query.days as string) || 30;
    const statistics = await subscriptionService.getUsageStatistics(userId, days);
    
    res.json(statistics);
  } catch (error) {
    console.error('Error fetching usage statistics:', error);
    res.status(500).json({ error: 'Failed to fetch usage statistics' });
  }
});

/**
 * GET /api/subscription/premium-quota
 * Get remaining premium operation quota (Polish and Extended Thinking)
 */
router.get("/premium-quota", async (req: any, res) => {
  try {
    const userId = req.user?.claims?.sub;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const subscription = await subscriptionService.getUserSubscription(userId);
    
    // Get usage for both premium operations
    const [polishUsage, extendedThinkingUsage] = await Promise.all([
      subscriptionService.getMonthlyPremiumUsage(userId, 'polish'),
      subscriptionService.getMonthlyPremiumUsage(userId, 'extended_thinking')
    ]);
    
    res.json({
      polish: {
        used: polishUsage,
        limit: subscription.limits.polishUsesPerMonth,
        remaining: Math.max(0, subscription.limits.polishUsesPerMonth - polishUsage)
      },
      extendedThinking: {
        used: extendedThinkingUsage,
        limit: subscription.limits.extendedThinkingPerMonth,
        remaining: Math.max(0, subscription.limits.extendedThinkingPerMonth - extendedThinkingUsage)
      },
      tier: subscription.effectiveTier
    });
  } catch (error) {
    console.error('Error fetching premium quota:', error);
    res.status(500).json({ error: 'Failed to fetch premium quota' });
  }
});

/**
 * POST /api/subscription/check-limit
 * Check if user can perform a specific action
 */
router.post("/check-limit", async (req: any, res) => {
  try {
    const userId = req.user?.claims?.sub;
    const { action } = req.body;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!action) {
      return res.status(400).json({ error: 'Action is required' });
    }

    const result = await subscriptionService.canPerformAction(userId, action);
    
    res.json(result);
  } catch (error) {
    console.error('Error checking limit:', error);
    res.status(500).json({ error: 'Failed to check limit' });
  }
});

/**
 * GET /api/subscription/analytics
 * Get comprehensive usage analytics for dashboard
 */
router.get("/analytics", async (req: any, res) => {
  try {
    const userId = req.user?.claims?.sub;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const days = parseInt(req.query.days as string) || 30;
    const analytics = await subscriptionService.getAnalytics(userId, days);
    
    res.json(analytics);
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

/**
 * GET /api/subscription/forecast
 * Get usage forecast and recommendations
 */
router.get("/forecast", async (req: any, res) => {
  try {
    const userId = req.user?.claims?.sub;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const forecast = await subscriptionService.getUsageForecast(userId);
    
    res.json(forecast);
  } catch (error) {
    console.error('Error fetching forecast:', error);
    res.status(500).json({ error: 'Failed to fetch forecast' });
  }
});

/**
 * GET /api/subscription/status
 * Get comprehensive subscription status including grace period, limits, and usage
 */
router.get("/status", async (req: any, res) => {
  try {
    const userId = req.user?.claims?.sub;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const status = await subscriptionService.getSubscriptionStatus(userId);
    
    res.json(status);
  } catch (error) {
    console.error('Error fetching subscription status:', error);
    res.status(500).json({ error: 'Failed to fetch subscription status' });
  }
});

export default router;
