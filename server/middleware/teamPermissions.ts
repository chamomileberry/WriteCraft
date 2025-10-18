import { Request, Response, NextFunction, RequestHandler } from 'express';
import { teamService } from '../services/teamService';
import { db } from '../db';
import { teamMemberships, userSubscriptions } from '@shared/schema';
import { eq, and } from 'drizzle-orm';

/**
 * Team role hierarchy:
 * - owner: Full control, can delete team, manage billing
 * - admin: Can manage members, assign roles, access all features
 * - editor: Can create/edit content, cannot manage team settings
 * - viewer: Read-only access to team resources
 */
export type TeamRole = 'owner' | 'admin' | 'editor' | 'viewer';

/**
 * Role permission mappings for Team tier
 */
const ROLE_PERMISSIONS = {
  owner: {
    canManageTeam: true,
    canManageBilling: true,
    canInviteMembers: true,
    canRemoveMembers: true,
    canChangeRoles: true,
    canEdit: true,
    canDelete: true,
    canView: true,
    canAccessAuditLogs: true,
    canAccessAnalytics: true,
    canAccessResourceLibrary: true,
  },
  admin: {
    canManageTeam: true,
    canManageBilling: false,
    canInviteMembers: true,
    canRemoveMembers: true,
    canChangeRoles: true,
    canEdit: true,
    canDelete: true,
    canView: true,
    canAccessAuditLogs: true,
    canAccessAnalytics: true,
    canAccessResourceLibrary: true,
  },
  editor: {
    canManageTeam: false,
    canManageBilling: false,
    canInviteMembers: false,
    canRemoveMembers: false,
    canChangeRoles: false,
    canEdit: true,
    canDelete: false,
    canView: true,
    canAccessAuditLogs: false,
    canAccessAnalytics: false,
    canAccessResourceLibrary: true,
  },
  viewer: {
    canManageTeam: false,
    canManageBilling: false,
    canInviteMembers: false,
    canRemoveMembers: false,
    canChangeRoles: false,
    canEdit: false,
    canDelete: false,
    canView: true,
    canAccessAuditLogs: false,
    canAccessAnalytics: false,
    canAccessResourceLibrary: true,
  },
};

/**
 * Get user's role in a team
 */
export async function getUserTeamRole(userId: string, teamSubscriptionId: string): Promise<TeamRole | null> {
  try {
    const membership = await db
      .select({ role: teamMemberships.role })
      .from(teamMemberships)
      .where(
        and(
          eq(teamMemberships.userId, userId),
          eq(teamMemberships.teamSubscriptionId, teamSubscriptionId)
        )
      )
      .limit(1);

    if (membership.length === 0) {
      return null;
    }

    return membership[0].role as TeamRole;
  } catch (error) {
    console.error('[TEAM PERMISSIONS] Failed to get user role:', error);
    return null;
  }
}

/**
 * Get user's team subscription ID if they are on Team tier
 */
export async function getUserTeamSubscription(userId: string): Promise<string | null> {
  try {
    const subscription = await db
      .select({ id: userSubscriptions.id, tier: userSubscriptions.tier })
      .from(userSubscriptions)
      .where(
        and(
          eq(userSubscriptions.userId, userId),
          eq(userSubscriptions.tier, 'team')
        )
      )
      .limit(1);

    return subscription.length > 0 ? subscription[0].id : null;
  } catch (error) {
    console.error('[TEAM PERMISSIONS] Failed to get team subscription:', error);
    return null;
  }
}

/**
 * Check if user has a specific permission
 */
export async function hasPermission(
  userId: string,
  teamSubscriptionId: string,
  permission: keyof typeof ROLE_PERMISSIONS.owner
): Promise<boolean> {
  const role = await getUserTeamRole(userId, teamSubscriptionId);
  
  if (!role) {
    return false;
  }

  return ROLE_PERMISSIONS[role][permission] || false;
}

/**
 * Middleware: Require user to be on Team tier
 */
export const requireTeamTier: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const userId = req.user.claims.sub;
  const teamSubscriptionId = await getUserTeamSubscription(userId);
  
  if (!teamSubscriptionId) {
    return res.status(403).json({ 
      error: 'Team tier required',
      message: 'This feature is only available on the Team plan. Please upgrade to access team features.'
    });
  }

  // Attach team subscription ID to request for downstream use
  (req as any).teamSubscriptionId = teamSubscriptionId;
  next();
};

/**
 * Middleware: Require specific team role
 */
export function requireTeamRole(minRole: TeamRole): RequestHandler {
  const roleHierarchy: TeamRole[] = ['viewer', 'editor', 'admin', 'owner'];
  const minRoleLevel = roleHierarchy.indexOf(minRole);

  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const userId = req.user.claims.sub;
    const teamSubscriptionId = (req as any).teamSubscriptionId || await getUserTeamSubscription(userId);
    
    if (!teamSubscriptionId) {
      return res.status(403).json({ 
        error: 'Team tier required',
        message: 'This feature is only available on the Team plan.'
      });
    }

    const userRole = await getUserTeamRole(userId, teamSubscriptionId);
    
    if (!userRole) {
      return res.status(403).json({ 
        error: 'Not a team member',
        message: 'You are not a member of this team.'
      });
    }

    const userRoleLevel = roleHierarchy.indexOf(userRole);
    
    if (userRoleLevel < minRoleLevel) {
      return res.status(403).json({ 
        error: 'Insufficient permissions',
        message: `This action requires ${minRole} role or higher. Your role: ${userRole}`
      });
    }

    // Attach role to request for downstream use
    (req as any).teamRole = userRole;
    (req as any).teamSubscriptionId = teamSubscriptionId;
    next();
  };
}

/**
 * Middleware: Require specific permission
 */
export function requirePermission(permission: keyof typeof ROLE_PERMISSIONS.owner): RequestHandler {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const userId = req.user.claims.sub;
    const teamSubscriptionId = (req as any).teamSubscriptionId || await getUserTeamSubscription(userId);
    
    if (!teamSubscriptionId) {
      return res.status(403).json({ 
        error: 'Team tier required',
        message: 'This feature is only available on the Team plan.'
      });
    }

    const hasAccess = await hasPermission(userId, teamSubscriptionId, permission);
    
    if (!hasAccess) {
      return res.status(403).json({ 
        error: 'Insufficient permissions',
        message: `You do not have permission to ${permission.replace('can', '').toLowerCase()}.`
      });
    }

    (req as any).teamSubscriptionId = teamSubscriptionId;
    next();
  };
}

/**
 * Legacy middleware for backward compatibility
 * Usage: teamPermissions('edit') or teamPermissions('comment') or teamPermissions('invite')
 */
export function teamPermissions(permission: 'edit' | 'comment' | 'invite') {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req.user as any)?.claims?.sub || req.user?.id;
      
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
