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
    
    // If subscription is paused, treat as free tier for feature access
    const effectiveTier = (subscription.pausedAt && subscription.tier !== 'free') 
      ? 'free' 
      : subscription.tier as SubscriptionTier;
    
    return {
      ...subscription,
      effectiveTier,
      limits: TIER_LIMITS[effectiveTier]
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
   * Check if user can perform action (respects tier limits, grace period, and pause status)
   * Paused subscriptions are automatically downgraded to free tier limits via effectiveTier
   * Grace Period: 7-day warning before strict enforcement when limits are exceeded
   */
  async canPerformAction(userId: string, action: string): Promise<{ 
    allowed: boolean; 
    reason?: string;
    gracePeriodWarning?: string;
    inGracePeriod?: boolean;
    daysRemaining?: number;
  }> {
    const subscription = await this.getUserSubscription(userId);
    const graceStatus = await this.checkGracePeriodStatus(userId);
    
    switch (action) {
      case 'create_project':
        if (subscription.limits.maxProjects === null) return { allowed: true };
        const projectCount = await this.getUserProjectCount(userId);
        const projectLimitExceeded = projectCount >= subscription.limits.maxProjects;
        
        if (!projectLimitExceeded) {
          // Under limit - clear grace period (active or expired) if ALL limits are under quota
          if ((graceStatus.inGracePeriod || graceStatus.expired) && await this.isUnderAllLimits(userId)) {
            await this.clearGracePeriod(userId);
          }
          return { allowed: true };
        }
        
        // Limit exceeded - check grace period
        if (graceStatus.expired) {
          // Grace period has expired - strictly block
          return {
            allowed: false,
            reason: `You've reached your limit of ${subscription.limits.maxProjects} projects. Your grace period has expired. Please upgrade to continue.`
          };
        } else if (!graceStatus.inGracePeriod) {
          // Start grace period
          await this.startGracePeriod(userId);
          return {
            allowed: true,
            inGracePeriod: true,
            daysRemaining: 7,
            gracePeriodWarning: `You've reached your limit of ${subscription.limits.maxProjects} projects. You have 7 days to upgrade before this limit is strictly enforced.`
          };
        } else {
          // In grace period - allow with warning
          return {
            allowed: true,
            inGracePeriod: true,
            daysRemaining: graceStatus.daysRemaining,
            gracePeriodWarning: `You've reached your limit of ${subscription.limits.maxProjects} projects. ${graceStatus.daysRemaining} day${graceStatus.daysRemaining !== 1 ? 's' : ''} remaining to upgrade.`
          };
        }
      
      case 'create_notebook':
        if (subscription.limits.maxNotebooks === null) return { allowed: true };
        const notebookCount = await this.getUserNotebookCount(userId);
        const notebookLimitExceeded = notebookCount >= subscription.limits.maxNotebooks;
        
        if (!notebookLimitExceeded) {
          // Under limit - clear grace period (active or expired) if ALL limits are under quota
          if ((graceStatus.inGracePeriod || graceStatus.expired) && await this.isUnderAllLimits(userId)) {
            await this.clearGracePeriod(userId);
          }
          return { allowed: true };
        }
        
        if (graceStatus.expired) {
          return {
            allowed: false,
            reason: `You've reached your limit of ${subscription.limits.maxNotebooks} notebook${subscription.limits.maxNotebooks > 1 ? 's' : ''}. Your grace period has expired. Please upgrade to continue.`
          };
        } else if (!graceStatus.inGracePeriod) {
          await this.startGracePeriod(userId);
          return {
            allowed: true,
            inGracePeriod: true,
            daysRemaining: 7,
            gracePeriodWarning: `You've reached your limit of ${subscription.limits.maxNotebooks} notebook${subscription.limits.maxNotebooks > 1 ? 's' : ''}. You have 7 days to upgrade before this limit is strictly enforced.`
          };
        } else {
          return {
            allowed: true,
            inGracePeriod: true,
            daysRemaining: graceStatus.daysRemaining,
            gracePeriodWarning: `You've reached your limit of ${subscription.limits.maxNotebooks} notebook${subscription.limits.maxNotebooks > 1 ? 's' : ''}. ${graceStatus.daysRemaining} day${graceStatus.daysRemaining !== 1 ? 's' : ''} remaining to upgrade.`
          };
        }
      
      case 'ai_generation':
        if (subscription.limits.aiGenerationsPerDay === null) return { allowed: true };
        const todayUsage = await this.getTodayAIUsage(userId);
        const aiLimitExceeded = todayUsage >= subscription.limits.aiGenerationsPerDay;
        
        if (!aiLimitExceeded) {
          // Under limit - clear grace period (active or expired) if ALL limits are under quota
          if ((graceStatus.inGracePeriod || graceStatus.expired) && await this.isUnderAllLimits(userId)) {
            await this.clearGracePeriod(userId);
          }
          return { allowed: true };
        }
        
        if (graceStatus.expired) {
          return {
            allowed: false,
            reason: `You've reached your daily limit of ${subscription.limits.aiGenerationsPerDay} AI generations. Your grace period has expired. Please upgrade to continue.`
          };
        } else if (!graceStatus.inGracePeriod) {
          await this.startGracePeriod(userId);
          return {
            allowed: true,
            inGracePeriod: true,
            daysRemaining: 7,
            gracePeriodWarning: `You've reached your daily limit of ${subscription.limits.aiGenerationsPerDay} AI generations. You have 7 days to upgrade before this limit is strictly enforced.`
          };
        } else {
          return {
            allowed: true,
            inGracePeriod: true,
            daysRemaining: graceStatus.daysRemaining,
            gracePeriodWarning: `You've reached your daily limit of ${subscription.limits.aiGenerationsPerDay} AI generations. ${graceStatus.daysRemaining} day${graceStatus.daysRemaining !== 1 ? 's' : ''} remaining to upgrade.`
          };
        }
      
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
   * Get this month's premium operation usage (polish or extended_thinking)
   */
  async getMonthlyPremiumUsage(userId: string, operationType: 'polish' | 'extended_thinking'): Promise<number> {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    
    // Check if user is part of a team
    const { teamService } = await import('./teamService');
    const teamSubscription = await teamService.getUserTeamSubscription(userId);
    
    // If team tier, get team pooled usage
    if (teamSubscription && teamSubscription.tier === 'team') {
      const teamMembers = await teamService.getTeamMembers(teamSubscription.id);
      const memberIds = teamMembers.map(m => m.userId);
      
      const result = await db
        .select({ count: sql<number>`count(*)` })
        .from(aiUsageLogs)
        .where(
          and(
            sql`${aiUsageLogs.userId} = ANY(${memberIds})`,
            eq(aiUsageLogs.operationType, operationType),
            sql`${aiUsageLogs.createdAt} >= ${startOfMonth}`
          )
        );
      
      return Number(result[0]?.count) || 0;
    }
    
    // Individual usage
    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(aiUsageLogs)
      .where(
        and(
          eq(aiUsageLogs.userId, userId),
          eq(aiUsageLogs.operationType, operationType),
          sql`${aiUsageLogs.createdAt} >= ${startOfMonth}`
        )
      );
    
    return Number(result[0]?.count) || 0;
  }
  
  /**
   * Check if user can use premium operation (polish or extended_thinking)
   */
  async canUsePremiumOperation(userId: string, operationType: 'polish' | 'extended_thinking'): Promise<{
    allowed: boolean;
    reason?: string;
    remaining?: number;
    limit?: number;
  }> {
    const subscription = await this.getUserSubscription(userId);
    
    // Check tier access
    const isProfessionalOrTeam = subscription.effectiveTier === 'professional' || subscription.effectiveTier === 'team';
    if (!isProfessionalOrTeam) {
      return {
        allowed: false,
        reason: `This premium feature is only available on Professional and Team plans. Please upgrade to access ${operationType === 'polish' ? 'Polish' : 'Extended Thinking'}.`
      };
    }
    
    // Get monthly limit for this operation
    const limit = operationType === 'polish' 
      ? subscription.limits.polishUsesPerMonth
      : subscription.limits.extendedThinkingPerMonth;
    
    // Get current usage
    const usage = await this.getMonthlyPremiumUsage(userId, operationType);
    
    if (usage >= limit) {
      return {
        allowed: false,
        reason: `You've reached your monthly limit of ${limit} ${operationType === 'polish' ? 'Polish' : 'Extended Thinking'} uses. Resets at the start of next month.`,
        remaining: 0,
        limit
      };
    }
    
    return {
      allowed: true,
      remaining: limit - usage,
      limit
    };
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
    // Pricing per 1M tokens:
    // Claude Opus 4.1: $15 input, $75 output
    // Claude Sonnet 4.5: $3 input, $15 output
    // Claude Haiku 4.5: $1 input, $5 output
    // Cached tokens: 90% discount
    
    let pricing;
    if (model.includes('opus')) {
      pricing = { input: 15, output: 75, cache: 1.5 };
    } else if (model.includes('haiku')) {
      pricing = { input: 1, output: 5, cache: 0.1 };
    } else {
      // Sonnet
      pricing = { input: 3, output: 15, cache: 0.3 };
    }
    
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
   * Update user subscription fields
   */
  async updateSubscription(userId: string, updates: Partial<{
    tier: SubscriptionTier;
    status: 'active' | 'past_due' | 'canceled' | 'trialing';
    stripeCustomerId: string;
    stripeSubscriptionId: string;
    stripePriceId: string;
    currentPeriodStart: Date;
    currentPeriodEnd: Date;
    cancelAtPeriodEnd: boolean;
    trialStart: Date | null;
    trialEnd: Date | null;
  }>) {
    const [updated] = await db
      .update(userSubscriptions)
      .set({
        ...updates,
        updatedAt: new Date()
      })
      .where(eq(userSubscriptions.userId, userId))
      .returning();
    
    return updated;
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
  
  /**
   * Get today's AI usage statistics with tier limits
   */
  async getTodayUsage(userId: string) {
    const today = new Date().toISOString().split('T')[0];
    
    // Get today's summary
    const [todaySummary] = await db
      .select()
      .from(aiUsageDailySummary)
      .where(
        and(
          eq(aiUsageDailySummary.userId, userId),
          eq(aiUsageDailySummary.date, today)
        )
      );
    
    // Get subscription for limits
    const subscription = await this.getUserSubscription(userId);
    const dailyLimit = subscription.limits.aiGenerationsPerDay ?? -1;
    const currentUsage = todaySummary?.totalOperations ?? 0;
    const remaining = dailyLimit === -1 ? -1 : Math.max(0, dailyLimit - currentUsage);
    
    return {
      date: today,
      currentUsage,
      dailyLimit,
      remaining,
      tier: subscription.tier,
      usagePercentage: dailyLimit === -1 ? 0 : Math.round((currentUsage / dailyLimit) * 100),
      details: {
        totalInputTokens: todaySummary?.totalInputTokens ?? 0,
        totalOutputTokens: todaySummary?.totalOutputTokens ?? 0,
        totalCostCents: todaySummary?.totalCostCents ?? 0
      }
    };
  }
  
  /**
   * Get usage history with optional date range filters
   */
  async getUsageHistory(
    userId: string,
    options?: {
      startDate?: Date;
      endDate?: Date;
      limit?: number;
    }
  ) {
    const { startDate, endDate, limit = 100 } = options || {};
    
    // Default to last 30 days if no dates provided
    const defaultStart = new Date();
    defaultStart.setDate(defaultStart.getDate() - 30);
    const effectiveStartDate = startDate || defaultStart;
    const effectiveEndDate = endDate || new Date();
    
    const startDateStr = effectiveStartDate.toISOString().split('T')[0];
    const endDateStr = effectiveEndDate.toISOString().split('T')[0];
    
    // Get daily summaries
    const summaries = await db
      .select()
      .from(aiUsageDailySummary)
      .where(
        and(
          eq(aiUsageDailySummary.userId, userId),
          sql`${aiUsageDailySummary.date} >= ${startDateStr}`,
          sql`${aiUsageDailySummary.date} <= ${endDateStr}`
        )
      )
      .orderBy(sql`${aiUsageDailySummary.date} DESC`)
      .limit(limit);
    
    // Get individual logs for detailed breakdown (limited to avoid overwhelming response)
    const logs = await db
      .select({
        id: aiUsageLogs.id,
        operationType: aiUsageLogs.operationType,
        model: aiUsageLogs.model,
        inputTokens: aiUsageLogs.inputTokens,
        outputTokens: aiUsageLogs.outputTokens,
        estimatedCostCents: aiUsageLogs.estimatedCostCents,
        createdAt: aiUsageLogs.createdAt
      })
      .from(aiUsageLogs)
      .where(
        and(
          eq(aiUsageLogs.userId, userId),
          sql`${aiUsageLogs.createdAt} >= ${startDateStr}`,
          sql`${aiUsageLogs.createdAt} <= ${endDateStr}`
        )
      )
      .orderBy(sql`${aiUsageLogs.createdAt} DESC`)
      .limit(Math.min(limit, 500)); // Cap individual logs at 500
    
    // Get subscription for context
    const subscription = await this.getUserSubscription(userId);
    
    return {
      summaries: summaries.map(s => ({
        date: s.date,
        totalOperations: s.totalOperations ?? 0,
        totalInputTokens: s.totalInputTokens ?? 0,
        totalOutputTokens: s.totalOutputTokens ?? 0,
        totalCostCents: s.totalCostCents ?? 0
      })),
      recentLogs: logs,
      subscription: {
        tier: subscription.tier,
        dailyLimit: subscription.limits.aiGenerationsPerDay
      },
      period: {
        startDate: startDateStr,
        endDate: endDateStr
      }
    };
  }
  
  /**
   * Check if user is currently in a grace period
   * Returns grace period info including whether it's expired
   */
  async checkGracePeriodStatus(userId: string): Promise<{
    inGracePeriod: boolean;
    expired: boolean;
    daysRemaining: number | null;
    gracePeriodEnd: Date | null;
  }> {
    const subscription = await this.getUserSubscription(userId);
    
    if (!subscription.gracePeriodStart || !subscription.gracePeriodEnd) {
      return { 
        inGracePeriod: false, 
        expired: false,
        daysRemaining: null,
        gracePeriodEnd: null
      };
    }
    
    const now = new Date();
    const gracePeriodEnd = new Date(subscription.gracePeriodEnd);
    
    if (now > gracePeriodEnd) {
      // Grace period expired - do NOT clear it yet (need to track that it was used)
      return { 
        inGracePeriod: false, 
        expired: true,
        daysRemaining: 0,
        gracePeriodEnd
      };
    }
    
    const daysRemaining = Math.ceil((gracePeriodEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    return {
      inGracePeriod: true,
      expired: false,
      daysRemaining,
      gracePeriodEnd
    };
  }
  
  /**
   * Start a 7-day grace period for a user who exceeded limits
   * Only starts if not already in grace period
   */
  async startGracePeriod(userId: string): Promise<void> {
    const graceStatus = await this.checkGracePeriodStatus(userId);
    
    // Don't restart if already in grace period
    if (graceStatus.inGracePeriod) {
      return;
    }
    
    const now = new Date();
    const gracePeriodEnd = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days
    
    await db
      .update(userSubscriptions)
      .set({
        gracePeriodStart: now,
        gracePeriodEnd,
        updatedAt: new Date()
      })
      .where(eq(userSubscriptions.userId, userId));
    
    console.log(`[Grace Period] Started for user ${userId}, expires ${gracePeriodEnd.toISOString()}`);
  }
  
  /**
   * Clear grace period (when user upgrades or stops exceeding limits)
   */
  async clearGracePeriod(userId: string): Promise<void> {
    await db
      .update(userSubscriptions)
      .set({
        gracePeriodStart: null,
        gracePeriodEnd: null,
        updatedAt: new Date()
      })
      .where(eq(userSubscriptions.userId, userId));
    
    console.log(`[Grace Period] Cleared for user ${userId}`);
  }
  
  /**
   * Check if user is under ALL limits (used to determine if grace period should be cleared)
   */
  private async isUnderAllLimits(userId: string): Promise<boolean> {
    const subscription = await this.getUserSubscription(userId);
    
    // Check project limit
    if (subscription.limits.maxProjects !== null) {
      const projectCount = await this.getUserProjectCount(userId);
      if (projectCount >= subscription.limits.maxProjects) {
        return false;
      }
    }
    
    // Check notebook limit
    if (subscription.limits.maxNotebooks !== null) {
      const notebookCount = await this.getUserNotebookCount(userId);
      if (notebookCount >= subscription.limits.maxNotebooks) {
        return false;
      }
    }
    
    // Check AI generation limit
    if (subscription.limits.aiGenerationsPerDay !== null) {
      const todayUsage = await this.getTodayAIUsage(userId);
      if (todayUsage >= subscription.limits.aiGenerationsPerDay) {
        return false;
      }
    }
    
    // All limits are under quota
    return true;
  }
  
  /**
   * Get comprehensive subscription status for frontend display
   * Includes tier, limits, current usage, grace period status, and warnings
   */
  async getSubscriptionStatus(userId: string) {
    const subscription = await this.getUserSubscription(userId);
    const graceStatus = await this.checkGracePeriodStatus(userId);
    
    // Get current usage
    const projectCount = await this.getUserProjectCount(userId);
    const notebookCount = await this.getUserNotebookCount(userId);
    const todayAIUsage = await this.getTodayAIUsage(userId);
    
    // Check if limits are exceeded
    const projectLimitExceeded = subscription.limits.maxProjects !== null 
      && projectCount >= subscription.limits.maxProjects;
    const notebookLimitExceeded = subscription.limits.maxNotebooks !== null 
      && notebookCount >= subscription.limits.maxNotebooks;
    const aiLimitExceeded = subscription.limits.aiGenerationsPerDay !== null 
      && todayAIUsage >= subscription.limits.aiGenerationsPerDay;
    
    // Build warnings array
    const warnings: string[] = [];
    
    if (graceStatus.inGracePeriod) {
      warnings.push(`Grace period active: ${graceStatus.daysRemaining} days remaining to upgrade or reduce usage`);
      
      if (projectLimitExceeded) {
        warnings.push(`Project limit exceeded: ${projectCount}/${subscription.limits.maxProjects} projects`);
      }
      if (notebookLimitExceeded) {
        warnings.push(`Notebook limit exceeded: ${notebookCount}/${subscription.limits.maxNotebooks} notebooks`);
      }
      if (aiLimitExceeded) {
        warnings.push(`AI generation limit exceeded: ${todayAIUsage}/${subscription.limits.aiGenerationsPerDay} generations today`);
      }
    }
    
    if (graceStatus.expired) {
      warnings.push('Grace period expired: Please upgrade or reduce usage to continue');
    }
    
    return {
      tier: subscription.tier,
      effectiveTier: subscription.effectiveTier,
      status: subscription.status,
      limits: subscription.limits,
      usage: {
        projects: projectCount,
        notebooks: notebookCount,
        aiGenerationsToday: todayAIUsage
      },
      gracePeriod: {
        inGracePeriod: graceStatus.inGracePeriod,
        expired: graceStatus.expired,
        daysRemaining: graceStatus.daysRemaining,
        gracePeriodEnd: graceStatus.gracePeriodEnd
      },
      limitsExceeded: {
        projects: projectLimitExceeded,
        notebooks: notebookLimitExceeded,
        aiGenerations: aiLimitExceeded
      },
      warnings,
      isPaused: !!subscription.pausedAt
    };
  }
}

// Export singleton instance
export const subscriptionService = new SubscriptionService();
