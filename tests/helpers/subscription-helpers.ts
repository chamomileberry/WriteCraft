import { subscriptionService } from "../../server/services/subscriptionService";
import { userMigrationService } from "../../server/services/userMigrationService";
import { db } from "../../server/db";
import {
  userSubscriptions,
  projects,
  notebooks,
  aiUsageDailySummary,
} from "../../shared/schema";
import { eq, sql } from "drizzle-orm";
import { type SubscriptionTier } from "../../shared/types/subscription";

export async function createTestSubscription(
  userId: string,
  tier: SubscriptionTier = "free",
) {
  await subscriptionService.createFreeSubscription(userId);

  if (tier !== "free") {
    await db
      .update(userSubscriptions)
      .set({ tier, updatedAt: new Date() })
      .where(eq(userSubscriptions.userId, userId));
  }

  return subscriptionService.getUserSubscription(userId);
}

export async function createTestProject(
  userId: string,
  title: string = "Test Project",
) {
  const [project] = await db
    .insert(projects)
    .values({
      title,
      content: "Test project content for subscription testing",
      userId,
    })
    .returning();

  return project;
}

export async function createMultipleProjects(userId: string, count: number) {
  const projectList: Awaited<ReturnType<typeof createTestProject>>[] = [];
  for (let i = 0; i < count; i++) {
    const project = await createTestProject(userId, `Test Project ${i + 1}`);
    projectList.push(project);
  }
  return projectList;
}

export async function deleteProject(projectId: string) {
  await db.delete(projects).where(eq(projects.id, projectId));
}

export async function setGracePeriod(
  userId: string,
  startDate: Date,
  endDate: Date,
) {
  await db
    .update(userSubscriptions)
    .set({
      gracePeriodStart: startDate,
      gracePeriodEnd: endDate,
      updatedAt: new Date(),
    })
    .where(eq(userSubscriptions.userId, userId));
}

export async function clearGracePeriod(userId: string) {
  await db
    .update(userSubscriptions)
    .set({
      gracePeriodStart: null,
      gracePeriodEnd: null,
      updatedAt: new Date(),
    })
    .where(eq(userSubscriptions.userId, userId));
}

export async function simulateAIUsage(
  userId: string,
  operationCount: number,
  date?: Date,
) {
  const usageDate = date || new Date();
  const dateStr = usageDate.toISOString().split("T")[0];

  await db
    .insert(aiUsageDailySummary)
    .values({
      userId,
      date: dateStr,
      totalOperations: operationCount,
      totalInputTokens: operationCount * 1000,
      totalOutputTokens: operationCount * 500,
      totalCostCents: operationCount * 10,
    })
    .onConflictDoUpdate({
      target: [aiUsageDailySummary.userId, aiUsageDailySummary.date],
      set: {
        totalOperations: sql`${aiUsageDailySummary.totalOperations} + ${operationCount}`,
        totalInputTokens: sql`${aiUsageDailySummary.totalInputTokens} + ${operationCount * 1000}`,
        totalOutputTokens: sql`${aiUsageDailySummary.totalOutputTokens} + ${operationCount * 500}`,
        totalCostCents: sql`${aiUsageDailySummary.totalCostCents} + ${operationCount * 10}`,
        updatedAt: new Date(),
      },
    });
}

export async function getGracePeriodStatus(userId: string) {
  return subscriptionService.checkGracePeriodStatus(userId);
}

export async function getUserProjectCount(userId: string) {
  const result = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(projects)
    .where(eq(projects.userId, userId));

  return result[0]?.count || 0;
}

export async function getUserNotebookCount(userId: string) {
  const result = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(notebooks)
    .where(eq(notebooks.userId, userId));

  return result[0]?.count || 0;
}
