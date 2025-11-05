import { db } from '../db';
import { auditLogs, userSubscriptions, users } from '@shared/schema';
import type { InsertAuditLog } from '@shared/schema';
import { eq, and, desc, sql, inArray } from 'drizzle-orm';
import type { Request } from 'express';

/**
 * Audit Log Service - Team tier exclusive feature
 * Tracks all changes made by team members for compliance and accountability
 */
export class AuditLogService {
  /**
   * Check if audit logging is enabled for a team subscription
   */
  static async isAuditingEnabled(teamSubscriptionId: string): Promise<boolean> {
    try {
      const subscription = await db
        .select({ tier: userSubscriptions.tier })
        .from(userSubscriptions)
        .where(eq(userSubscriptions.id, teamSubscriptionId))
        .limit(1);

      return subscription.length > 0 && subscription[0].tier === 'team';
    } catch (error) {
      console.error('[AUDIT] Failed to check audit status:', error);
      return false;
    }
  }

  /**
   * Log an action in the audit trail
   * Only logs if the user's team subscription is on the Team tier
   */
  static async logAction(params: {
    userId: string;
    teamSubscriptionId: string;
    action: 'create' | 'update' | 'delete' | 'share' | 'invite' | 'role_change';
    resourceType: string;
    resourceId?: string;
    resourceName?: string;
    changesBefore?: any;
    changesAfter?: any;
    req?: Request;
  }): Promise<void> {
    try {
      // Check if auditing is enabled for this team subscription
      const isEnabled = await this.isAuditingEnabled(params.teamSubscriptionId);
      if (!isEnabled) {
        return; // Skip logging if not on Team tier
      }

      const auditLog: InsertAuditLog = {
        teamSubscriptionId: params.teamSubscriptionId,
        userId: params.userId,
        action: params.action,
        resourceType: params.resourceType,
        resourceId: params.resourceId || null,
        resourceName: params.resourceName || null,
        changesBefore: params.changesBefore || null,
        changesAfter: params.changesAfter || null,
        ipAddress: params.req ? this.getClientIp(params.req) : null,
        userAgent: params.req?.headers['user-agent'] || null,
      };

      await db.insert(auditLogs).values(auditLog);
    } catch (error) {
      // Don't throw - audit logging failure shouldn't break the application
      console.error('[AUDIT] Failed to log action:', error);
    }
  }

  /**
   * Get audit logs for a team with optional filtering
   */
  static async getTeamAuditLogs(params: {
    teamSubscriptionId: string;
    limit?: number;
    offset?: number;
    action?: string;
    resourceType?: string;
    userId?: string;
  }) {
    try {
      const conditions = [
        eq(auditLogs.teamSubscriptionId, params.teamSubscriptionId),
      ];

      if (params.action) {
        conditions.push(eq(auditLogs.action, params.action));
      }
      if (params.resourceType) {
        conditions.push(eq(auditLogs.resourceType, params.resourceType));
      }
      if (params.userId) {
        conditions.push(eq(auditLogs.userId, params.userId));
      }

      const logs = await db
        .select()
        .from(auditLogs)
        .where(and(...conditions))
        .orderBy(desc(auditLogs.createdAt))
        .limit(params.limit || 100)
        .offset(params.offset || 0);

      const userIds = Array.from(
        new Set(
          logs
            .map(log => log.userId)
            .filter((id): id is string => typeof id === 'string' && id.length > 0),
        ),
      );

      const usersById = new Map<string, { id: string; email: string | null; name: string | null }>();

      if (userIds.length > 0) {
        const userRecords = await db
          .select({
            id: users.id,
            email: users.email,
            name: sql<string | null>`concat_ws(' ', ${users.firstName}, ${users.lastName})`.as('name'),
          })
          .from(users)
          .where(inArray(users.id, userIds as [string, ...string[]]));

        for (const user of userRecords) {
          usersById.set(user.id, user);
        }
      }

      const logsWithUsers = logs.map(log => ({
        ...log,
        user: log.userId ? usersById.get(log.userId) ?? null : null,
      }));

      // Get total count for pagination
      const totalResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(auditLogs)
        .where(and(...conditions));

      return {
        logs: logsWithUsers,
        total: totalResult[0]?.count || 0,
        limit: params.limit || 100,
        offset: params.offset || 0,
      };
    } catch (error) {
      console.error('[AUDIT] Failed to get audit logs:', error);
      throw error;
    }
  }

  /**
   * Get client IP address from request
   */
  private static getClientIp(req: Request): string {
    const forwarded = req.headers['x-forwarded-for'];
    
    if (forwarded) {
      const ips = Array.isArray(forwarded) ? forwarded[0] : forwarded;
      return ips.split(',')[0].trim();
    }
    
    return req.headers['x-real-ip'] as string || 
           req.socket.remoteAddress || 
           'unknown';
  }

  /**
   * Helper to create a snapshot of data for audit logging
   */
  static createSnapshot(data: any): any {
    // Remove sensitive fields before logging
    const snapshot = { ...data };
    const sensitiveFields = ['password', 'passwordHash', 'apiKey', 'secret', 'token'];
    
    for (const field of sensitiveFields) {
      if (snapshot[field]) {
        snapshot[field] = '[REDACTED]';
      }
    }
    
    return snapshot;
  }
}
