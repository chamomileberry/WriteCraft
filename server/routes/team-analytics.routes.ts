import { Router } from 'express';
import { secureAuthentication } from '../security/middleware';
import { requireTeamTier, requirePermission } from '../middleware/teamPermissions';
import { AuditLogService } from '../services/auditLogService';
import { db } from '../db';
import { auditLogs, teamMemberships, aiUsageLogs, aiUsageDailySummary, teamActivity, users } from '@shared/schema';
import { eq, and, desc, sql, gte } from 'drizzle-orm';
import { teamRateLimiter, readRateLimiter } from '../security/rateLimiters';

const router = Router();

/**
 * GET /api/team/audit-logs
 * Get audit logs for the team with filtering and pagination
 * Team tier exclusive - requires canAccessAuditLogs permission
 */
router.get('/audit-logs', 
  secureAuthentication, 
  readRateLimiter,
  requireTeamTier,
  requirePermission('canAccessAuditLogs'),
  async (req: any, res) => {
    try {
      const teamSubscriptionId = req.teamSubscriptionId;
      const { 
        action, 
        resourceType, 
        userId, 
        limit = 50, 
        offset = 0 
      } = req.query;

      const result = await AuditLogService.getTeamAuditLogs({
        teamSubscriptionId,
        action: action as string | undefined,
        resourceType: resourceType as string | undefined,
        userId: userId as string | undefined,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
      });

      // Fetch user details for audit logs
      const logsWithUsers = await Promise.all(
        result.logs.map(async (log) => {
          if (!log.userId) {
            return { ...log, user: null };
          }
          
          const [user] = await db
            .select({ id: users.id, email: users.email, name: users.name })
            .from(users)
            .where(eq(users.id, log.userId))
            .limit(1);
          
          return { ...log, user };
        })
      );

      res.json({
        logs: logsWithUsers,
        total: result.total,
        limit: result.limit,
        offset: result.offset,
      });
    } catch (error) {
      console.error('[AUDIT LOGS API] Error fetching audit logs:', error);
      res.status(500).json({ error: 'Failed to fetch audit logs' });
    }
  }
);

/**
 * GET /api/team/analytics
 * Get team analytics including AI usage, member activity, and collaboration metrics
 * Team tier exclusive - requires canAccessAnalytics permission
 */
router.get('/analytics',
  secureAuthentication,
  readRateLimiter,
  requireTeamTier,
  requirePermission('canAccessAnalytics'),
  async (req: any, res) => {
    try {
      const teamSubscriptionId = req.teamSubscriptionId;
      const { days = 30 } = req.query;
      const daysNum = parseInt(days as string);

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysNum);
      const startDateStr = startDate.toISOString().split('T')[0];

      // Get all team members
      const members = await db
        .select({
          id: teamMemberships.id,
          userId: teamMemberships.userId,
          role: teamMemberships.role,
          joinedAt: teamMemberships.createdAt,
          user: {
            id: users.id,
            name: users.name,
            email: users.email,
          },
        })
        .from(teamMemberships)
        .leftJoin(users, eq(teamMemberships.userId, users.id))
        .where(eq(teamMemberships.teamSubscriptionId, teamSubscriptionId));

      const memberIds = members.map(m => m.userId);

      // Get AI usage statistics for team members
      const aiUsageStats = await db
        .select({
          userId: aiUsageLogs.userId,
          operationType: aiUsageLogs.operationType,
          count: sql<number>`count(*)`,
          totalInputTokens: sql<number>`sum(${aiUsageLogs.inputTokens})`,
          totalOutputTokens: sql<number>`sum(${aiUsageLogs.outputTokens})`,
          totalCost: sql<number>`sum(${aiUsageLogs.estimatedCostCents})`,
        })
        .from(aiUsageLogs)
        .where(
          and(
            sql`${aiUsageLogs.userId} = ANY(${memberIds})`,
            gte(aiUsageLogs.createdAt, startDate)
          )
        )
        .groupBy(aiUsageLogs.userId, aiUsageLogs.operationType);

      // Get daily AI usage summaries for trend analysis
      const dailyUsage = await db
        .select({
          date: aiUsageDailySummary.date,
          totalOperations: sql<number>`sum(${aiUsageDailySummary.totalOperations})`,
          totalInputTokens: sql<number>`sum(${aiUsageDailySummary.totalInputTokens})`,
          totalOutputTokens: sql<number>`sum(${aiUsageDailySummary.totalOutputTokens})`,
          totalCost: sql<number>`sum(${aiUsageDailySummary.totalCostCents})`,
        })
        .from(aiUsageDailySummary)
        .where(
          and(
            sql`${aiUsageDailySummary.userId} = ANY(${memberIds})`,
            gte(aiUsageDailySummary.date, startDateStr)
          )
        )
        .groupBy(aiUsageDailySummary.date)
        .orderBy(aiUsageDailySummary.date);

      // Get team activity statistics
      const activityStats = await db
        .select({
          userId: teamActivity.userId,
          activityType: teamActivity.activityType,
          count: sql<number>`count(*)`,
        })
        .from(teamActivity)
        .where(
          and(
            eq(teamActivity.teamSubscriptionId, teamSubscriptionId),
            gte(teamActivity.createdAt, startDate)
          )
        )
        .groupBy(teamActivity.userId, teamActivity.activityType);

      // Calculate aggregates
      const totalAIOperations = aiUsageStats.reduce((sum, stat) => sum + Number(stat.count), 0);
      const totalAICost = aiUsageStats.reduce((sum, stat) => sum + Number(stat.totalCost), 0);
      const totalTokens = aiUsageStats.reduce(
        (sum, stat) => sum + Number(stat.totalInputTokens) + Number(stat.totalOutputTokens),
        0
      );

      // Group AI usage by operation type
      const usageByOperation = aiUsageStats.reduce((acc, stat) => {
        const type = stat.operationType || 'unknown';
        if (!acc[type]) {
          acc[type] = { count: 0, cost: 0 };
        }
        acc[type].count += Number(stat.count);
        acc[type].cost += Number(stat.totalCost);
        return acc;
      }, {} as Record<string, { count: number; cost: number }>);

      // Group activity by member
      const memberActivityMap = members.map(member => {
        const memberAIUsage = aiUsageStats.filter(s => s.userId === member.userId);
        const memberActivity = activityStats.filter(s => s.userId === member.userId);
        
        return {
          userId: member.userId,
          name: member.user?.name || member.user?.email || 'Unknown',
          role: member.role,
          aiOperations: memberAIUsage.reduce((sum, s) => sum + Number(s.count), 0),
          activities: memberActivity.reduce((sum, s) => sum + Number(s.count), 0),
          joinedAt: member.joinedAt,
        };
      });

      res.json({
        summary: {
          memberCount: members.length,
          totalAIOperations,
          totalAICost: totalAICost / 100, // Convert cents to dollars
          totalTokens,
          dateRange: {
            start: startDateStr,
            end: new Date().toISOString().split('T')[0],
            days: daysNum,
          },
        },
        usageByOperation: Object.entries(usageByOperation).map(([type, data]) => ({
          operationType: type,
          count: data.count,
          costDollars: data.cost / 100,
        })),
        dailyUsage: dailyUsage.map(day => ({
          date: day.date,
          operations: Number(day.totalOperations),
          tokens: Number(day.totalInputTokens) + Number(day.totalOutputTokens),
          costDollars: Number(day.totalCost) / 100,
        })),
        memberActivity: memberActivityMap,
      });
    } catch (error) {
      console.error('[TEAM ANALYTICS API] Error fetching analytics:', error);
      res.status(500).json({ error: 'Failed to fetch team analytics' });
    }
  }
);

/**
 * GET /api/team/members
 * Get team members with their roles
 */
router.get('/members',
  secureAuthentication,
  requireTeamTier,
  async (req: any, res) => {
    try {
      const teamSubscriptionId = req.teamSubscriptionId;

      const members = await db
        .select({
          id: teamMemberships.id,
          userId: teamMemberships.userId,
          role: teamMemberships.role,
          canEdit: teamMemberships.canEdit,
          canComment: teamMemberships.canComment,
          canInvite: teamMemberships.canInvite,
          joinedAt: teamMemberships.createdAt,
          user: {
            id: users.id,
            name: users.name,
            email: users.email,
          },
        })
        .from(teamMemberships)
        .leftJoin(users, eq(teamMemberships.userId, users.id))
        .where(eq(teamMemberships.teamSubscriptionId, teamSubscriptionId));

      res.json({ members });
    } catch (error) {
      console.error('[TEAM MEMBERS API] Error fetching members:', error);
      res.status(500).json({ error: 'Failed to fetch team members' });
    }
  }
);

/**
 * PATCH /api/team/members/:memberId/role
 * Update a team member's role
 * Requires canChangeRoles permission
 */
router.patch('/members/:memberId/role',
  secureAuthentication,
  requireTeamTier,
  requirePermission('canChangeRoles'),
  async (req: any, res) => {
    try {
      const { memberId } = req.params;
      const { role } = req.body;
      const teamSubscriptionId = req.teamSubscriptionId;
      const userId = req.user.claims.sub;

      // Validate role
      const validRoles = ['owner', 'admin', 'editor', 'viewer'];
      if (!validRoles.includes(role)) {
        return res.status(400).json({ error: 'Invalid role' });
      }

      // Check if membership exists and belongs to this team
      const [membership] = await db
        .select()
        .from(teamMemberships)
        .where(
          and(
            eq(teamMemberships.id, memberId),
            eq(teamMemberships.teamSubscriptionId, teamSubscriptionId)
          )
        )
        .limit(1);

      if (!membership) {
        return res.status(404).json({ error: 'Team member not found' });
      }

      // Update role
      await db
        .update(teamMemberships)
        .set({ role })
        .where(eq(teamMemberships.id, memberId));

      // Log the role change in audit logs
      await AuditLogService.logAction({
        userId,
        teamSubscriptionId,
        action: 'role_change',
        resourceType: 'team_member',
        resourceId: memberId,
        resourceName: membership.userId,
        changesBefore: { role: membership.role },
        changesAfter: { role },
        req,
      });

      res.json({ success: true, message: 'Role updated successfully' });
    } catch (error) {
      console.error('[TEAM MEMBERS API] Error updating role:', error);
      res.status(500).json({ error: 'Failed to update role' });
    }
  }
);

export default router;
