/**
 * User Storage Interface
 *
 * Manages user accounts and preferences with multi-tenant support.
 *
 * Composite Identity: User operations use userId only (global scope).
 * Tenant Boundaries: Users are global; preferences are user-scoped.
 */

import type {
  User,
  InsertUser,
  UpsertUser,
  UserPreferences,
  InsertUserPreferences,
} from "@shared/schema";
import type {
  StorageOptions,
  PaginationParams,
  PaginatedResult,
  CreateResult,
  UpdateResult,
} from "../storage-types";

export interface IUserStorage {
  // ============================================================================
  // User CRUD Operations
  // ============================================================================

  /**
   * Get a user by ID
   *
   * @param id - User identifier
   * @param opts - Storage options (signal for cancellation)
   * @returns User record or undefined if not found
   */
  getUser(id: string, opts?: StorageOptions): Promise<User | undefined>;

  /**
   * Get a user by username/email
   *
   * @param username - Username or email
   * @param opts - Storage options
   * @returns User record or undefined if not found
   * @deprecated Users are now identified by email with Replit Auth
   */
  getUserByUsername(
    username: string,
    opts?: StorageOptions,
  ): Promise<User | undefined>;

  /**
   * Create a new user
   *
   * @param user - User data to insert
   * @param opts - Storage options
   * @returns Created user wrapped in CreateResult
   * @throws AppError('conflict') if user already exists
   * @throws AppError('invalid_input') if user data is invalid
   */
  createUser(
    user: InsertUser,
    opts?: StorageOptions,
  ): Promise<CreateResult<User>>;

  /**
   * Upsert a user (create or update)
   *
   * Used primarily for OAuth/SSO flows where user may or may not exist.
   *
   * @param user - User data with id for conflict resolution
   * @param opts - Storage options
   * @returns The created or updated user
   */
  upsertUser(user: UpsertUser, opts?: StorageOptions): Promise<User>;

  /**
   * Update a user
   *
   * @param id - User identifier
   * @param updates - Partial user data to update
   * @param opts - Storage options
   * @returns Update result with updated flag and value
   * @throws AppError('not_found') if user doesn't exist
   */
  updateUser(
    id: string,
    updates: Partial<InsertUser>,
    opts?: StorageOptions,
  ): Promise<UpdateResult<User>>;

  /**
   * Search users by query string
   *
   * Searches username, email, and display name fields.
   *
   * @param query - Search query string
   * @param pagination - Pagination parameters (cursor-based)
   * @param opts - Storage options
   * @returns Paginated list of matching users
   */
  searchUsers(
    query: string,
    pagination?: PaginationParams,
    opts?: StorageOptions,
  ): Promise<PaginatedResult<User>>;

  // ============================================================================
  // User Preferences Operations
  // ============================================================================

  /**
   * Get user preferences
   *
   * @param userId - User identifier
   * @param opts - Storage options
   * @returns User preferences or undefined if not set
   */
  getUserPreferences(
    userId: string,
    opts?: StorageOptions,
  ): Promise<UserPreferences | undefined>;

  /**
   * Create or update user preferences
   *
   * This is an upsert operation - creates if doesn't exist, updates if it does.
   *
   * @param userId - User identifier
   * @param preferences - Partial preferences to set/update
   * @param opts - Storage options
   * @returns The updated preferences
   */
  upsertUserPreferences(
    userId: string,
    preferences: Partial<InsertUserPreferences>,
    opts?: StorageOptions,
  ): Promise<UserPreferences>;
}
