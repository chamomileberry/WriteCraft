import { Request, Response, NextFunction } from 'express';
import { subscriptionService } from '../services/subscriptionService';

/**
 * Feature Gate Middleware
 * 
 * Enforces subscription-based feature limits across the application.
 * Checks if a user can perform a specific action based on their subscription tier.
 * 
 * Usage:
 * router.post('/endpoint', secureAuthentication, requireFeature('action_type'), async (req, res) => {
 *   // Your route logic here
 * });
 * 
 * Supported actions:
 * - 'create_project': Check project creation limits (free tier: 3 max)
 * - 'create_notebook': Check notebook creation limits (free tier: 1 max)
 * - 'ai_generation': Check AI generation daily limits (use trackAIUsage instead for AI routes)
 * 
 * @param action The action to check limits for
 * @returns Express middleware function
 */
export function requireFeature(action: string) {
  return async (req: any, res: Response, next: NextFunction) => {
    const userId = req.user?.claims?.sub;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    try {
      // Check if user can perform the action
      const permission = await subscriptionService.canPerformAction(userId, action);
      
      if (!permission.allowed) {
        return res.status(403).json({
          error: 'Feature limit exceeded',
          message: permission.reason,
          action,
          upgradeUrl: '/pricing'
        });
      }
      
      // User has permission, proceed to next middleware/handler
      next();
    } catch (error) {
      console.error(`[Feature Gate] Error checking permission for action '${action}':`, error);
      return res.status(500).json({ 
        error: 'Failed to verify feature access',
        message: 'An error occurred while checking your subscription limits. Please try again.'
      });
    }
  };
}

/**
 * Check if user has access to a boolean feature (doesn't consume a limit)
 * 
 * Usage for features like collaboration, API access, priority support:
 * router.post('/endpoint', secureAuthentication, requireBooleanFeature('collaboration'), async (req, res) => {
 *   // Your route logic here
 * });
 * 
 * @param feature The boolean feature to check
 * @returns Express middleware function
 */
export function requireBooleanFeature(feature: 'collaboration' | 'api_access' | 'priority_support') {
  return async (req: any, res: Response, next: NextFunction) => {
    const userId = req.user?.claims?.sub;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    try {
      const subscription = await subscriptionService.getUserSubscription(userId);
      
      let hasAccess = false;
      let featureName = '';
      
      switch (feature) {
        case 'collaboration':
          hasAccess = subscription.limits.hasCollaboration;
          featureName = 'Collaboration';
          break;
        case 'api_access':
          hasAccess = subscription.limits.hasApiAccess;
          featureName = 'API Access';
          break;
        case 'priority_support':
          hasAccess = subscription.limits.hasPrioritySupport;
          featureName = 'Priority Support';
          break;
      }
      
      if (!hasAccess) {
        return res.status(403).json({
          error: 'Feature not available',
          message: `${featureName} is not available on your current plan. Upgrade to access this feature.`,
          feature,
          upgradeUrl: '/pricing'
        });
      }
      
      next();
    } catch (error) {
      console.error(`[Feature Gate] Error checking feature '${feature}':`, error);
      return res.status(500).json({ 
        error: 'Failed to verify feature access',
        message: 'An error occurred while checking your subscription. Please try again.'
      });
    }
  };
}
