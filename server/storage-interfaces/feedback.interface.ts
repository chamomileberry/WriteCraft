/**
 * IFeedbackStorage - User Feedback Management Interface
 *
 * Domain: User feedback and support system
 * Scope: User-scoped (no notebook boundaries)
 * Complexity: Low
 *
 * This interface manages user feedback submissions, admin responses,
 * and notification tracking for the feedback system.
 */

import type {
  Feedback,
  InsertFeedback,
  FeedbackStatus,
} from "@shared/schema";
import type {
  StorageOptions,
  CreateResult,
  UpdateResult,
  PaginatedResult,
  PaginationParams,
} from "../storage-types";

export interface IFeedbackStorage {
  // ========================================================================
  // Create Operations
  // ========================================================================

  /**
   * Create new feedback
   *
   * @param feedbackData - Feedback data to create
   * @param opts - Storage options (cancellation, transactions)
   * @returns Result containing the created feedback
   * @throws AppError('invalid_input') if validation fails
   * @throws AppError('aborted') if operation is cancelled
   */
  createFeedback(
    feedbackData: InsertFeedback,
    opts?: StorageOptions,
  ): Promise<CreateResult<Feedback>>;

  // ========================================================================
  // Read Operations
  // ========================================================================

  /**
   * Get feedback by ID
   *
   * @param id - Feedback ID
   * @param opts - Storage options
   * @returns Feedback if found, undefined otherwise
   * @throws AppError('aborted') if operation is cancelled
   */
  getFeedback(
    id: string,
    opts?: StorageOptions,
  ): Promise<Feedback | undefined>;

  /**
   * Get all feedback (admin only)
   * Returns all feedback sorted by creation date (newest first)
   *
   * @param pagination - Pagination parameters (limit, cursor)
   * @param opts - Storage options
   * @returns Paginated list of all feedback
   * @throws AppError('aborted') if operation is cancelled
   */
  getAllFeedback(
    pagination?: PaginationParams,
    opts?: StorageOptions,
  ): Promise<PaginatedResult<Feedback>>;

  /**
   * Get feedback by user ID
   * Returns user's feedback sorted by creation date (newest first)
   *
   * @param userId - User ID
   * @param pagination - Pagination parameters
   * @param opts - Storage options
   * @returns Paginated list of user's feedback
   * @throws AppError('aborted') if operation is cancelled
   */
  getUserFeedback(
    userId: string,
    pagination?: PaginationParams,
    opts?: StorageOptions,
  ): Promise<PaginatedResult<Feedback>>;

  /**
   * Get count of unread admin replies for user
   *
   * @param userId - User ID
   * @param opts - Storage options
   * @returns Count of unread replies
   * @throws AppError('aborted') if operation is cancelled
   */
  getUnreadReplyCount(userId: string, opts?: StorageOptions): Promise<number>;

  // ========================================================================
  // Update Operations
  // ========================================================================

  /**
   * Update feedback status (admin only)
   *
   * @param id - Feedback ID
   * @param status - New status
   * @param opts - Storage options
   * @returns Update result with updated feedback
   * @throws AppError('aborted') if operation is cancelled
   */
  updateFeedbackStatus(
    id: string,
    status: FeedbackStatus,
    opts?: StorageOptions,
  ): Promise<UpdateResult<Feedback>>;

  /**
   * Reply to feedback (admin only)
   * Sets adminReply, adminRepliedAt, adminRepliedBy, and marks as unread for user
   *
   * @param feedbackId - Feedback ID
   * @param reply - Admin reply text
   * @param adminUserId - ID of admin user making the reply
   * @param opts - Storage options
   * @returns Update result with updated feedback
   * @throws AppError('aborted') if operation is cancelled
   */
  replyToFeedback(
    feedbackId: string,
    reply: string,
    adminUserId: string,
    opts?: StorageOptions,
  ): Promise<UpdateResult<Feedback>>;

  /**
   * Mark admin reply as read by user
   * Clears the hasUnreadReply flag for the specified feedback
   *
   * @param feedbackId - Feedback ID
   * @param userId - User ID (for ownership validation)
   * @param opts - Storage options
   * @returns Update result with updated feedback
   * @throws AppError('forbidden') if user doesn't own the feedback
   * @throws AppError('aborted') if operation is cancelled
   */
  markFeedbackReplyAsRead(
    feedbackId: string,
    userId: string,
    opts?: StorageOptions,
  ): Promise<UpdateResult<Feedback>>;
}
