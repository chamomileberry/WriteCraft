/**
 * User Migration Service - Phase 7
 *
 * Handles the migration of existing users to the new tiered subscription system.
 * Analyzes historical usage patterns and auto-assigns appropriate tiers.
 */

import { db } from "../db";
import {
  userSubscriptions,
  aiUsageLogs,
  aiUsageDailySummary,
  notebooks,
  projects,
  shares,
} from "@shared/schema";
import { eq, and, gte, sql, desc } from "drizzle-orm";
import { subscriptionService } from "./subscriptionService";

export interface UserUsageAnalysis {
  userId: string;
  totalProjects: number;
  totalNotebooks: number;
  totalCollaborators: number;
  avgDailyAIGenerations: number;
  maxDailyAIGenerations: number;
  totalAIGenerations: number;
  daysActive: number;
  recommendedTier: "free" | "author" | "professional";
  confidence: "high" | "medium" | "low";
  reasoning: string[];
}

export interface MigrationStats {
  totalUsers: number;
  usersAnalyzed: number;
  tierDistribution: {
    free: number;
    author: number;
    professional: number;
  };
  migrationDate: Date;
}

class UserMigrationService {
  /**
   * Analyze a user's historical usage to recommend a tier
   */
  async analyzeUserUsage(userId: string): Promise<UserUsageAnalysis> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Get project count
    const projectResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(projects)
      .where(eq(projects.userId, userId));
    const totalProjects = Number(projectResult[0]?.count) || 0;

    // Get notebook count
    const notebookResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(notebooks)
      .where(eq(notebooks.userId, userId));
    const totalNotebooks = Number(notebookResult[0]?.count) || 0;

    // Get collaborator count across all user's projects
    const collaboratorResult = await db
      .select({ count: sql<number>`count(DISTINCT ${shares.userId})` })
      .from(shares)
      .innerJoin(
        projects,
        and(
          eq(shares.resourceId, projects.id),
          eq(shares.resourceType, "project"),
        ),
      )
      .where(eq(projects.userId, userId));
    const totalCollaborators = Number(collaboratorResult[0]?.count) || 0;

    // Get AI usage statistics from last 30 days
    const usageSummaries = await db
      .select()
      .from(aiUsageDailySummary)
      .where(
        and(
          eq(aiUsageDailySummary.userId, userId),
          gte(
            aiUsageDailySummary.date,
            thirtyDaysAgo.toISOString().split("T")[0],
          ),
        ),
      )
      .orderBy(desc(aiUsageDailySummary.date));

    const daysActive = usageSummaries.length;
    const totalAIGenerations = usageSummaries.reduce(
      (sum, day) => sum + (day.totalOperations || 0),
      0,
    );
    const avgDailyAIGenerations =
      daysActive > 0 ? Math.round(totalAIGenerations / daysActive) : 0;
    const maxDailyAIGenerations =
      usageSummaries.length > 0
        ? Math.max(...usageSummaries.map((day) => day.totalOperations || 0))
        : 0;

    // Determine recommended tier
    const analysis = this.recommendTier({
      totalProjects,
      totalNotebooks,
      totalCollaborators,
      avgDailyAIGenerations,
      maxDailyAIGenerations,
      totalAIGenerations,
      daysActive,
    });

    return {
      userId,
      totalProjects,
      totalNotebooks,
      totalCollaborators,
      avgDailyAIGenerations,
      maxDailyAIGenerations,
      totalAIGenerations,
      daysActive,
      ...analysis,
    };
  }

  /**
   * Recommend a tier based on usage patterns
   */
  private recommendTier(usage: {
    totalProjects: number;
    totalNotebooks: number;
    totalCollaborators: number;
    avgDailyAIGenerations: number;
    maxDailyAIGenerations: number;
    totalAIGenerations: number;
    daysActive: number;
  }): {
    recommendedTier: "free" | "author" | "professional";
    confidence: "high" | "medium" | "low";
    reasoning: string[];
  } {
    const reasoning: string[] = [];

    // Professional tier indicators
    const professionalIndicators = [
      usage.totalProjects > 5,
      usage.totalNotebooks > 10,
      usage.totalCollaborators > 2, // Collaboration is a pro feature
      usage.avgDailyAIGenerations > 50,
      usage.maxDailyAIGenerations > 80,
      usage.daysActive >= 20, // Active most days
    ];

    const professionalScore = professionalIndicators.filter(Boolean).length;

    // Author tier indicators
    const authorIndicators = [
      usage.totalProjects > 1,
      usage.totalNotebooks > 3,
      usage.totalCollaborators > 0, // Has collaborators
      usage.avgDailyAIGenerations > 15,
      usage.maxDailyAIGenerations > 25,
      usage.daysActive >= 10, // Active regularly
    ];

    const authorScore = authorIndicators.filter(Boolean).length;

    // Determine tier
    if (professionalScore >= 3) {
      reasoning.push(`High project count: ${usage.totalProjects} projects`);
      reasoning.push(`High notebook count: ${usage.totalNotebooks} notebooks`);
      if (usage.totalCollaborators > 0) {
        reasoning.push(
          `Active collaboration: ${usage.totalCollaborators} collaborators`,
        );
      }
      reasoning.push(
        `Heavy AI usage: ${usage.avgDailyAIGenerations} avg generations/day`,
      );
      reasoning.push(`Power user: Active ${usage.daysActive} of last 30 days`);

      return {
        recommendedTier: "professional",
        confidence: professionalScore >= 4 ? "high" : "medium",
        reasoning,
      };
    }

    if (authorScore >= 3) {
      reasoning.push(`Moderate project usage: ${usage.totalProjects} projects`);
      reasoning.push(
        `Regular notebook usage: ${usage.totalNotebooks} notebooks`,
      );
      if (usage.totalCollaborators > 0) {
        reasoning.push(`Collaborates with ${usage.totalCollaborators} users`);
      }
      reasoning.push(
        `Regular AI usage: ${usage.avgDailyAIGenerations} avg generations/day`,
      );
      reasoning.push(
        `Consistent activity: Active ${usage.daysActive} of last 30 days`,
      );

      return {
        recommendedTier: "author",
        confidence: authorScore >= 4 ? "high" : "medium",
        reasoning,
      };
    }

    // Free tier
    const hasAnyUsage =
      usage.totalProjects > 0 ||
      usage.totalNotebooks > 0 ||
      usage.totalAIGenerations > 0;

    if (!hasAnyUsage) {
      reasoning.push("No significant usage detected");
      reasoning.push("New or inactive user");
    } else {
      reasoning.push(
        `Light usage: ${usage.totalProjects} projects, ${usage.totalNotebooks} notebooks`,
      );
      reasoning.push(
        `Low AI usage: ${usage.avgDailyAIGenerations} avg generations/day`,
      );
    }

    return {
      recommendedTier: "free",
      confidence: hasAnyUsage ? "high" : "low",
      reasoning,
    };
  }

  /**
   * Migrate a user to their recommended tier
   */
  async migrateUser(
    userId: string,
    analysis?: UserUsageAnalysis,
  ): Promise<void> {
    // Analyze if not provided
    if (!analysis) {
      analysis = await this.analyzeUserUsage(userId);
    }

    // Check if user already has a subscription
    const existingSub = await subscriptionService.getUserSubscription(userId);

    if (existingSub && existingSub.tier !== "free") {
      // User already has a paid subscription - don't downgrade
      console.log(
        `[Migration] User ${userId} already has ${existingSub.tier} tier - skipping`,
      );
      return;
    }

    // Create or update subscription to recommended tier
    await db
      .insert(userSubscriptions)
      .values({
        userId,
        tier: analysis.recommendedTier,
        status: "active",
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        cancelAtPeriodEnd: false,
      })
      .onConflictDoUpdate({
        target: userSubscriptions.userId,
        set: {
          tier: analysis.recommendedTier,
          updatedAt: new Date(),
        },
      });

    console.log(
      `[Migration] Assigned user ${userId} to ${analysis.recommendedTier} tier (${analysis.confidence} confidence)`,
    );
  }

  /**
   * Migrate all users in the system
   */
  async migrateAllUsers(): Promise<MigrationStats> {
    // Get all users who have created content (projects, notebooks, or AI usage)
    const usersQuery = await db
      .selectDistinct({ userId: projects.userId })
      .from(projects);

    const notebookUsersQuery = await db
      .selectDistinct({ userId: notebooks.userId })
      .from(notebooks);

    const aiUsersQuery = await db
      .selectDistinct({ userId: aiUsageDailySummary.userId })
      .from(aiUsageDailySummary);

    // Combine and deduplicate
    const allUserIds = new Set([
      ...usersQuery.map((u) => u.userId),
      ...notebookUsersQuery.map((u) => u.userId),
      ...aiUsersQuery.map((u) => u.userId),
    ]);

    const stats: MigrationStats = {
      totalUsers: allUserIds.size,
      usersAnalyzed: 0,
      tierDistribution: {
        free: 0,
        author: 0,
        professional: 0,
      },
      migrationDate: new Date(),
    };

    // Analyze and migrate each user
    for (const userId of Array.from(allUserIds)) {
      try {
        const analysis = await this.analyzeUserUsage(userId);
        await this.migrateUser(userId, analysis);

        stats.usersAnalyzed++;
        stats.tierDistribution[analysis.recommendedTier]++;

        // Log progress every 10 users
        if (stats.usersAnalyzed % 10 === 0) {
          console.log(
            `[Migration] Progress: ${stats.usersAnalyzed}/${stats.totalUsers} users migrated`,
          );
        }
      } catch (error) {
        console.error(`[Migration] Failed to migrate user ${userId}:`, error);
      }
    }

    console.log(
      `[Migration] Complete! Migrated ${stats.usersAnalyzed}/${stats.totalUsers} users`,
    );
    console.log(`[Migration] Tier distribution:`, stats.tierDistribution);

    return stats;
  }

  /**
   * Get migration preview without applying changes
   */
  async previewMigration(): Promise<{
    totalUsers: number;
    recommendations: UserUsageAnalysis[];
    tierDistribution: {
      free: number;
      author: number;
      professional: number;
    };
  }> {
    const usersQuery = await db
      .selectDistinct({ userId: projects.userId })
      .from(projects);

    const notebookUsersQuery = await db
      .selectDistinct({ userId: notebooks.userId })
      .from(notebooks);

    const aiUsersQuery = await db
      .selectDistinct({ userId: aiUsageDailySummary.userId })
      .from(aiUsageDailySummary);

    const allUserIds = new Set([
      ...usersQuery.map((u) => u.userId),
      ...notebookUsersQuery.map((u) => u.userId),
      ...aiUsersQuery.map((u) => u.userId),
    ]);

    const recommendations: UserUsageAnalysis[] = [];
    const tierDistribution = {
      free: 0,
      author: 0,
      professional: 0,
    };

    for (const userId of Array.from(allUserIds)) {
      try {
        const analysis = await this.analyzeUserUsage(userId);
        recommendations.push(analysis);
        tierDistribution[analysis.recommendedTier]++;
      } catch (error) {
        console.error(
          `[Migration Preview] Failed to analyze user ${userId}:`,
          error,
        );
      }
    }

    return {
      totalUsers: allUserIds.size,
      recommendations: recommendations.sort(
        (a, b) => b.totalAIGenerations - a.totalAIGenerations,
      ),
      tierDistribution,
    };
  }
}

export const userMigrationService = new UserMigrationService();
