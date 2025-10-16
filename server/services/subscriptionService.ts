import { db } from '../db';
import { 
  users, 
  userSubscriptions, 
  aiUsageLogs, 
  aiUsageDailySummary,
  projects 
} from '@shared/schema';
import { eq, and, sql } from 'drizzle-orm';
import { TIER_LIMITS, type SubscriptionTier } from '@shared/types/subscription';

export class SubscriptionService {
  /**
   * Get user's current subscription with tier limits
   */
  async getUserSubscription(userId: string) {
    const [subscription] = await db
      .select()
      .from(userSubscriptions)
      .where(eq(userSubscriptions.userId, userId))
      .limit(1);
    
    if (!subscription) {
      // Create default free subscription for existing users
      return this.createFreeSubscription(userId);
    }
    
    return {
      ...subscription,
      limits: TIER_LIMITS[subscription.tier as SubscriptionTier]
    };
  }
  
  /**
   * Create free subscription for new/existing users
   * Uses UPSERT to handle conflicts if subscription already exists
   */
  async createFreeSubscription(userId: string) {
    const [subscription] = await db
      .insert(userSubscriptions)
      .values({
        userId,
        tier: 'free',
        status: 'active'
      })
      .onConflictDoUpdate({
        target: userSubscriptions.userId,
        set: {
          updatedAt: new Date()
        }
      })
      .returning();
    
    return {
      ...subscription,
      limits: TIER_LIMITS[subscription.tier as SubscriptionTier]
    };
  }
  
  /**
   * Check if user can perform action (respects tier limits)
   */
  async canPerformAction(userId: string, action: string): Promise<{ allowed: boolean; reason?: string }> {
    const subscription = await this.getUserSubscription(userId);
    
    switch (action) {
      case 'create_project':
        if (subscription.limits.maxProjects === null) return { allowed: true };
        const projectCount = await this.getUserProjectCount(userId);
        return {
          allowed: projectCount < subscription.limits.maxProjects,
          reason: projectCount >= subscription.limits.maxProjects 
            ? `You've reached your limit of ${subscription.limits.maxProjects} projects. Upgrade to create more.`
            : undefined
        };
      
      case 'create_notebook':
        if (subscription.limits.maxNotebooks === null) return { allowed: true };
        const notebookCount = await this.getUserNotebookCount(userId);
        return {
          allowed: notebookCount < subscription.limits.maxNotebooks,
          reason: notebookCount >= subscription.limits.maxNotebooks
            ? `You've reached your limit of ${subscription.limits.maxNotebooks} notebook${subscription.limits.maxNotebooks > 1 ? 's' : ''}. Upgrade to create more.`
            : undefined
        };
      
      case 'ai_generation':
        if (subscription.limits.aiGenerationsPerDay === null) return { allowed: true };
        const todayUsage = await this.getTodayAIUsage(userId);
        return {
          allowed: todayUsage < subscription.limits.aiGenerationsPerDay,
          reason: todayUsage >= subscription.limits.aiGenerationsPerDay
            ? `You've reached your daily limit of ${subscription.limits.aiGenerationsPerDay} AI generations. Upgrade for more.`
            : undefined
        };
      
      default:
        return { allowed: true };
    }
  }
  
  /**
   * Log AI usage for tracking and billing
   */
  async logAIUsage(params: {
    userId: string;
    operationType: string;
    model: string;
    inputTokens: number;
    outputTokens: number;
    cachedTokens?: number;
    projectId?: string;
    notebookId?: string;
  }) {
    // Calculate cost in cents
    const costCents = this.calculateCostCents(
      params.model,
      params.inputTokens,
      params.outputTokens,
      params.cachedTokens
    );
    
    // Log detailed usage
    await db.insert(aiUsageLogs).values({
      userId: params.userId,
      operationType: params.operationType,
      model: params.model,
      inputTokens: params.inputTokens,
      outputTokens: params.outputTokens,
      cachedTokens: params.cachedTokens || 0,
      estimatedCostCents: costCents,
      projectId: params.projectId,
      notebookId: params.notebookId
    });
    
    // Update daily summary
    await this.updateDailySummary(params.userId, {
      operations: 1,
      inputTokens: params.inputTokens,
      outputTokens: params.outputTokens,
      costCents
    });
  }
  
  /**
   * Get today's AI generation count (supports team usage pooling)
   */
  private async getTodayAIUsage(userId: string): Promise<number> {
    const today = new Date().toISOString().split('T')[0];
    
    // Check if user is part of a team
    const { teamService } = await import('./teamService');
    const teamSubscription = await teamService.getUserTeamSubscription(userId);
    
    if (teamSubscription && teamSubscription.tier === 'team') {
      // Use team pooled usage
      return await teamService.getTeamDailyUsage(teamSubscription.id);
    }
    
    // Use individual usage
    const [summary] = await db
      .select()
      .from(aiUsageDailySummary)
      .where(
        and(
          eq(aiUsageDailySummary.userId, userId),
          eq(aiUsageDailySummary.date, today)
        )
      );
    
    return summary?.totalOperations || 0;
  }
  
  /**
   * Calculate cost in cents based on model and tokens
   */
  private calculateCostCents(
    model: string,
    inputTokens: number,
    outputTokens: number,
    cachedTokens: number = 0
  ): number {
    // Claude Sonnet 4 pricing: $3 input, $15 output per 1M tokens
    // Claude Haiku pricing: $0.25 input, $1.25 output per 1M tokens
    // Cached tokens: 90% discount
    
    const pricing = model.includes('haiku') 
      ? { input: 0.25, output: 1.25, cache: 0.025 }
      : { input: 3, output: 15, cache: 0.3 };
    
    const inputCost = (inputTokens / 1_000_000) * pricing.input * 100;
    const outputCost = (outputTokens / 1_000_000) * pricing.output * 100;
    const cacheCost = (cachedTokens / 1_000_000) * pricing.cache * 100;
    
    return Math.ceil(inputCost + outputCost + cacheCost);
  }
  
  /**
   * Get user's project count
   */
  private async getUserProjectCount(userId: string): Promise<number> {
    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(projects)
      .where(eq(projects.userId, userId));
    
    return Number(result[0]?.count) || 0;
  }
  
  /**
   * Get user's notebook count
   */
  private async getUserNotebookCount(userId: string): Promise<number> {
    const { notebooks } = await import('@shared/schema');
    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(notebooks)
      .where(eq(notebooks.userId, userId));
    
    return Number(result[0]?.count) || 0;
  }
  
  /**
   * Update daily summary statistics
   */
  private async updateDailySummary(
    userId: string, 
    delta: { operations: number; inputTokens: number; outputTokens: number; costCents: number }
  ) {
    const today = new Date().toISOString().split('T')[0];
    
    await db
      .insert(aiUsageDailySummary)
      .values({
        userId,
        date: today,
        totalOperations: delta.operations,
        totalInputTokens: delta.inputTokens,
        totalOutputTokens: delta.outputTokens,
        totalCostCents: delta.costCents,
        operationsBreakdown: {}
      })
      .onConflictDoUpdate({
        target: [aiUsageDailySummary.userId, aiUsageDailySummary.date],
        set: {
          totalOperations: sql`${aiUsageDailySummary.totalOperations} + ${delta.operations}`,
          totalInputTokens: sql`${aiUsageDailySummary.totalInputTokens} + ${delta.inputTokens}`,
          totalOutputTokens: sql`${aiUsageDailySummary.totalOutputTokens} + ${delta.outputTokens}`,
          totalCostCents: sql`${aiUsageDailySummary.totalCostCents} + ${delta.costCents}`,
          updatedAt: new Date()
        }
      });
  }
  
  /**
   * Get usage statistics for a user
   */
  async getUsageStatistics(userId: string, days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const startDateStr = startDate.toISOString().split('T')[0];
    
    const summaries = await db
      .select()
      .from(aiUsageDailySummary)
      .where(
        and(
          eq(aiUsageDailySummary.userId, userId),
          sql`${aiUsageDailySummary.date} >= ${startDateStr}`
        )
      )
      .orderBy(aiUsageDailySummary.date);
    
    return summaries;
  }
  
  /**
   * Get comprehensive analytics for dashboard
   */
  async getAnalytics(userId: string, days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const startDateStr = startDate.toISOString().split('T')[0];
    
    // Get daily summaries
    const dailySummaries = await this.getUsageStatistics(userId, days);
    
    // Get feature breakdown from usage logs
    const featureBreakdown = await db
      .select({
        operationType: aiUsageLogs.operationType,
        count: sql<number>`count(*)`,
        totalCost: sql<number>`sum(${aiUsageLogs.estimatedCostCents})`
      })
      .from(aiUsageLogs)
      .where(
        and(
          eq(aiUsageLogs.userId, userId),
          sql`${aiUsageLogs.createdAt} >= ${startDateStr}`
        )
      )
      .groupBy(aiUsageLogs.operationType);
    
    // Calculate totals
    const totals = dailySummaries.reduce(
      (acc, day) => ({
        operations: acc.operations + (day.totalOperations ?? 0),
        inputTokens: acc.inputTokens + (day.totalInputTokens ?? 0),
        outputTokens: acc.outputTokens + (day.totalOutputTokens ?? 0),
        costCents: acc.costCents + (day.totalCostCents ?? 0),
      }),
      { operations: 0, inputTokens: 0, outputTokens: 0, costCents: 0 }
    );
    
    // Get subscription for limits
    const subscription = await this.getUserSubscription(userId);
    
    return {
      dailySummaries,
      featureBreakdown: featureBreakdown.map(f => ({
        feature: f.operationType,
        count: Number(f.count),
        costCents: Number(f.totalCost || 0)
      })),
      totals,
      subscription: {
        tier: subscription.tier,
        limits: subscription.limits
      },
      period: {
        days,
        startDate: startDateStr,
        endDate: new Date().toISOString().split('T')[0]
      }
    };
  }
  
  /**
   * Get usage forecast based on current trends
   */
  async getUsageForecast(userId: string) {
    // Get last 7 days of data
    const last7Days = await this.getUsageStatistics(userId, 7);
    
    if (last7Days.length === 0) {
      return {
        averageDailyUsage: 0,
        projectedMonthlyUsage: 0,
        daysUntilLimit: null,
        recommendation: null
      };
    }
    
    // Calculate average daily usage
    const totalOps = last7Days.reduce((sum, day) => sum + (day.totalOperations ?? 0), 0);
    const averageDailyUsage = totalOps / last7Days.length;
    const projectedMonthlyUsage = Math.ceil(averageDailyUsage * 30);
    
    // Get subscription limits
    const subscription = await this.getUserSubscription(userId);
    const dailyLimit = subscription.limits.aiGenerationsPerDay;
    
    // Calculate days until limit and recommendations  
    let daysUntilLimit = null;
    let recommendation = null;
    
    if (dailyLimit !== null && dailyLimit > 0 && averageDailyUsage > 0) {
      const todayUsage = await this.getTodayAIUsage(userId);
      const remainingToday = dailyLimit - todayUsage;
      const usagePercentage = Math.round((averageDailyUsage / dailyLimit) * 100);
      
      // Check if already hit limit today
      if (remainingToday <= 0) {
        daysUntilLimit = 0;
        recommendation = `You've reached your daily limit of ${dailyLimit} AI generations. Upgrade to Professional for unlimited access.`;
      }
      // High usage - estimate when limit will be hit
      else if (usagePercentage >= 80) {
        recommendation = `You're using ${usagePercentage}% of your daily limit on average. Consider upgrading to Professional for unlimited AI generations.`;
        
        // Calculate usage growth trend from recent 3 days
        const recentDays = last7Days.slice(-3).map(d => d.totalOperations ?? 0);
        if (recentDays.length >= 2) {
          const avgRecentUsage = recentDays.reduce((a, b) => a + b, 0) / recentDays.length;
          const usageGrowthRate = avgRecentUsage - averageDailyUsage;
          
          // If usage is growing and approaching limit
          if (usageGrowthRate > 0 && avgRecentUsage < dailyLimit) {
            const daysToLimit = Math.floor((dailyLimit - avgRecentUsage) / usageGrowthRate);
            if (daysToLimit > 0 && daysToLimit <= 30) {
              daysUntilLimit = daysToLimit;
            }
          }
          // If already at/over limit on average
          else if (avgRecentUsage >= dailyLimit) {
            daysUntilLimit = 0;
          }
        }
      } else if (usagePercentage >= 50) {
        recommendation = `You're using ${usagePercentage}% of your daily limit. Your current plan is sufficient, but watch your usage trends.`;
      }
    }
    
    return {
      averageDailyUsage: Math.round(averageDailyUsage),
      projectedMonthlyUsage,
      daysUntilLimit,
      recommendation
    };
  }
}

// Export singleton instance
export const subscriptionService = new SubscriptionService();
