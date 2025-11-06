import {
  type Feedback,
  type InsertFeedback,
  type FeedbackStatus,
  feedback,
} from "@shared/schema";
import { db } from "../db";
import { eq, desc, and, lt, or, sql } from "drizzle-orm";
import { BaseRepository } from "./base.repository";
import {
  AppError,
  type StorageOptions,
  type PaginationParams,
  type PaginatedResult,
  type CreateResult,
  type UpdateResult,
  createCursor,
  decodeCursor,
} from "../storage-types";
import type { IFeedbackStorage } from "../storage-interfaces/feedback.interface";

export class FeedbackRepository
  extends BaseRepository
  implements IFeedbackStorage
{
  // ============================================================================
  // Create Operations
  // ============================================================================

  async createFeedback(
    feedbackData: InsertFeedback,
    opts?: StorageOptions,
  ): Promise<CreateResult<Feedback>> {
    if (opts?.signal?.aborted) {
      throw AppError.aborted();
    }

    // Validate input
    if (!feedbackData.userId) {
      throw AppError.invalidInput("Feedback must have a userId");
    }
    if (!feedbackData.type) {
      throw AppError.invalidInput("Feedback must have a type");
    }
    if (!feedbackData.title) {
      throw AppError.invalidInput("Feedback must have a title");
    }
    if (!feedbackData.description) {
      throw AppError.invalidInput("Feedback must have a description");
    }

    const [created] = await db
      .insert(feedback)
      .values(feedbackData)
      .returning();

    if (!created) {
      throw AppError.invalidInput("Failed to create feedback");
    }

    return { value: created };
  }

  // ============================================================================
  // Read Operations
  // ============================================================================

  async getFeedback(
    id: string,
    opts?: StorageOptions,
  ): Promise<Feedback | undefined> {
    if (opts?.signal?.aborted) {
      throw AppError.aborted();
    }

    const [result] = await db
      .select()
      .from(feedback)
      .where(eq(feedback.id, id));

    return result || undefined;
  }

  async getAllFeedback(
    pagination?: PaginationParams,
    opts?: StorageOptions,
  ): Promise<PaginatedResult<Feedback>> {
    if (opts?.signal?.aborted) {
      throw AppError.aborted();
    }

    const limit = Math.min(pagination?.limit || 20, 100);

    // Build query
    let baseQuery = db
      .select()
      .from(feedback)
      .orderBy(desc(feedback.createdAt), desc(feedback.id));

    // Apply cursor if provided
    if (pagination?.cursor) {
      const { sortKey, id } = decodeCursor(pagination.cursor);
      const cursorCondition = or(
        lt(feedback.createdAt, new Date(sortKey as string)),
        and(
          eq(feedback.createdAt, new Date(sortKey as string)),
          lt(feedback.id, id),
        ),
      );
      if (cursorCondition) {
        baseQuery = baseQuery.where(cursorCondition) as typeof baseQuery;
      }
    }

    // Fetch limit + 1 to check if there are more results
    const items = await baseQuery.limit(limit + 1);

    const hasMore = items.length > limit;
    const results = hasMore ? items.slice(0, limit) : items;

    const lastItem = results.length > 0 ? results[results.length - 1] : undefined;
    const nextCursor =
      hasMore && lastItem && lastItem.createdAt
        ? createCursor(lastItem.createdAt.toISOString(), lastItem.id)
        : undefined;

    return {
      items: results,
      nextCursor,
    };
  }

  async getUserFeedback(
    userId: string,
    pagination?: PaginationParams,
    opts?: StorageOptions,
  ): Promise<PaginatedResult<Feedback>> {
    if (opts?.signal?.aborted) {
      throw AppError.aborted();
    }

    const limit = Math.min(pagination?.limit || 20, 100);

    const conditions = [eq(feedback.userId, userId)];

    // Apply cursor if provided
    if (pagination?.cursor) {
      const { sortKey, id } = decodeCursor(pagination.cursor);
      conditions.push(
        or(
          lt(feedback.createdAt, new Date(sortKey as string)),
          and(
            eq(feedback.createdAt, new Date(sortKey as string)),
            lt(feedback.id, id),
          ),
        )!,
      );
    }

    // Fetch limit + 1 to check if there are more results
    const items = await db
      .select()
      .from(feedback)
      .where(and(...conditions))
      .orderBy(desc(feedback.createdAt), desc(feedback.id))
      .limit(limit + 1);

    const hasMore = items.length > limit;
    const results = hasMore ? items.slice(0, limit) : items;

    const lastItem = results.length > 0 ? results[results.length - 1] : undefined;
    const nextCursor =
      hasMore && lastItem && lastItem.createdAt
        ? createCursor(lastItem.createdAt.toISOString(), lastItem.id)
        : undefined;

    return {
      items: results,
      nextCursor,
    };
  }

  async getUnreadReplyCount(
    userId: string,
    opts?: StorageOptions,
  ): Promise<number> {
    if (opts?.signal?.aborted) {
      throw AppError.aborted();
    }

    const [result] = await db
      .select({ count: sql<number>`COUNT(*)::int` })
      .from(feedback)
      .where(
        and(eq(feedback.userId, userId), eq(feedback.hasUnreadReply, true)),
      );

    return result?.count || 0;
  }

  // ============================================================================
  // Update Operations
  // ============================================================================

  async updateFeedbackStatus(
    id: string,
    status: FeedbackStatus,
    opts?: StorageOptions,
  ): Promise<UpdateResult<Feedback>> {
    if (opts?.signal?.aborted) {
      throw AppError.aborted();
    }

    const [updated] = await db
      .update(feedback)
      .set({ status, updatedAt: new Date() })
      .where(eq(feedback.id, id))
      .returning();

    if (!updated) {
      return { updated: false };
    }

    return { updated: true, value: updated };
  }

  async replyToFeedback(
    feedbackId: string,
    reply: string,
    adminUserId: string,
    opts?: StorageOptions,
  ): Promise<UpdateResult<Feedback>> {
    if (opts?.signal?.aborted) {
      throw AppError.aborted();
    }

    if (!reply || reply.trim().length === 0) {
      throw AppError.invalidInput("Reply cannot be empty");
    }

    const [updated] = await db
      .update(feedback)
      .set({
        adminReply: reply,
        adminRepliedAt: new Date(),
        adminRepliedBy: adminUserId,
        hasUnreadReply: true,
        updatedAt: new Date(),
      })
      .where(eq(feedback.id, feedbackId))
      .returning();

    if (!updated) {
      return { updated: false };
    }

    return { updated: true, value: updated };
  }

  async markFeedbackReplyAsRead(
    feedbackId: string,
    userId: string,
    opts?: StorageOptions,
  ): Promise<UpdateResult<Feedback>> {
    if (opts?.signal?.aborted) {
      throw AppError.aborted();
    }

    // First verify ownership
    const existing = await this.getFeedback(feedbackId, opts);
    if (!existing) {
      return { updated: false };
    }

    if (existing.userId !== userId) {
      throw AppError.forbidden(
        "User does not have permission to mark this feedback as read",
      );
    }

    const [updated] = await db
      .update(feedback)
      .set({ hasUnreadReply: false, updatedAt: new Date() })
      .where(and(eq(feedback.id, feedbackId), eq(feedback.userId, userId)))
      .returning();

    if (!updated) {
      return { updated: false };
    }

    return { updated: true, value: updated };
  }
}

// Export singleton instance
export const feedbackRepository = new FeedbackRepository();
