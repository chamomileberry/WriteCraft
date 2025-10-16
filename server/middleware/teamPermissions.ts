import { Request, Response, NextFunction } from 'express';
import { teamService } from '../services/teamService';

/**
 * Middleware to check team permissions
 * Usage: teamPermissions('edit') or teamPermissions('comment') or teamPermissions('invite')
 */
export function teamPermissions(permission: 'edit' | 'comment' | 'invite') {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req.user as any)?.claims?.sub;
      
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      // Get user's team subscription
      const teamSubscription = await teamService.getUserTeamSubscription(userId);
      
      if (!teamSubscription) {
        // User is not part of a team - allow action
        return next();
      }

      // Check if user has the required permission
      const hasPermission = await teamService.checkPermission(
        userId,
        teamSubscription.id,
        permission
      );

      if (!hasPermission) {
        return res.status(403).json({ 
          message: `You do not have permission to ${permission} content in this team` 
        });
      }

      next();
    } catch (error) {
      console.error('Team permissions error:', error);
      res.status(500).json({ message: 'Failed to check permissions' });
    }
  };
}

/**
 * Add team context to request
 * Allows routes to access team information easily
 */
export async function addTeamContext(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req.user as any)?.claims?.sub;
    
    if (userId) {
      const teamSubscription = await teamService.getUserTeamSubscription(userId);
      (req as any).teamSubscription = teamSubscription;
    }
    
    next();
  } catch (error) {
    console.error('Add team context error:', error);
    next(); // Continue even if there's an error
  }
}

/**
 * Log team activity for tracked actions
 * Usage: logTeamActivity('content_created', 'character', resourceId, resourceName)
 */
export function logTeamActivity(
  activityType: string,
  resourceType?: string,
  resourceId?: string,
  resourceName?: string,
  metadata?: any
) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req.user as any)?.claims?.sub;
      const teamSubscription = (req as any).teamSubscription;
      
      if (teamSubscription && userId) {
        // Extract resource info from request if not provided
        const finalResourceId = resourceId || req.params.id;
        const finalResourceName = resourceName || req.body?.name;
        
        await teamService.logActivity({
          teamSubscriptionId: teamSubscription.id,
          userId,
          activityType,
          resourceType,
          resourceId: finalResourceId,
          resourceName: finalResourceName,
          metadata: metadata || {},
        });
      }
      
      next();
    } catch (error) {
      console.error('Log team activity error:', error);
      next(); // Continue even if logging fails
    }
  };
}
