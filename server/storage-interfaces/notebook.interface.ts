/**
 * INotebookStorage - Notebook and Import Job Management
 *
 * This interface handles:
 * - Notebook CRUD operations (workspace management)
 * - Import Job operations (data import tracking)
 *
 * Domain: Workspace Management
 * Complexity: Low
 * Methods: ~12
 *
 * Tenant Boundaries:
 * - Notebooks are owned by users (userId)
 * - Import jobs are scoped to users (userId)
 * - No notebook hierarchy (notebooks don't belong to other notebooks)
 */

import type {
  Notebook,
  InsertNotebook,
  UpdateNotebook,
  ImportJob,
  InsertImportJob,
  UpdateImportJob,
} from "@shared/schema";
import type {
  StorageOptions,
  CreateResult,
  UpdateResult,
  DeleteResult,
  PaginationParams,
  PaginatedResult,
} from "../storage-types";

export interface INotebookStorage {
  // ============================================================================
  // Notebook Operations
  // ============================================================================

  /**
   * Creates a new notebook
   *
   * @param notebook - The notebook data to create
   * @param opts - Optional storage options (AbortSignal, etc.)
   * @returns CreateResult containing the created notebook
   * @throws AppError('invalid_input') if notebook data is invalid
   * @throws AppError('aborted') if operation is cancelled
   */
  createNotebook(
    notebook: InsertNotebook,
    opts?: StorageOptions,
  ): Promise<CreateResult<Notebook>>;

  /**
   * Retrieves a notebook by ID
   *
   * Checks both owned and shared notebooks:
   * - Returns notebook if user owns it
   * - Returns notebook if it's shared with the user
   *
   * @param id - The notebook ID
   * @param userId - The user requesting access
   * @param opts - Optional storage options
   * @returns The notebook if found and accessible, undefined otherwise
   * @throws AppError('aborted') if operation is cancelled
   */
  getNotebook(
    id: string,
    userId: string,
    opts?: StorageOptions,
  ): Promise<Notebook | undefined>;

  /**
   * Retrieves all notebooks for a user
   *
   * Includes:
   * - Notebooks owned by the user
   * - Notebooks shared with the user
   *
   * Returns notebooks with metadata:
   * - isShared: boolean (true if shared with user)
   * - sharedBy: User info (owner if shared)
   * - sharePermission: Permission level (if shared)
   *
   * @param userId - The user ID
   * @param pagination - Optional pagination parameters
   * @param opts - Optional storage options
   * @returns Paginated list of notebooks with sharing metadata
   * @throws AppError('aborted') if operation is cancelled
   */
  getUserNotebooks(
    userId: string,
    pagination?: PaginationParams,
    opts?: StorageOptions,
  ): Promise<PaginatedResult<Notebook>>;

  /**
   * Updates a notebook
   *
   * Only the owner can update their notebook.
   * Shared users cannot update notebooks they don't own.
   *
   * @param id - The notebook ID
   * @param userId - The user ID (must be owner)
   * @param updates - Partial notebook updates
   * @param opts - Optional storage options
   * @returns UpdateResult with updated notebook if successful
   * @throws AppError('forbidden') if user is not the owner
   * @throws AppError('aborted') if operation is cancelled
   */
  updateNotebook(
    id: string,
    userId: string,
    updates: UpdateNotebook,
    opts?: StorageOptions,
  ): Promise<UpdateResult<Notebook>>;

  /**
   * Deletes a notebook
   *
   * Only the owner can delete their notebook.
   * This will cascade delete:
   * - All content within the notebook
   * - All shares of the notebook
   * - All import jobs for the notebook
   *
   * @param id - The notebook ID
   * @param userId - The user ID (must be owner)
   * @param opts - Optional storage options
   * @returns DeleteResult indicating if deletion occurred
   * @throws AppError('forbidden') if user is not the owner
   * @throws AppError('aborted') if operation is cancelled
   */
  deleteNotebook(
    id: string,
    userId: string,
    opts?: StorageOptions,
  ): Promise<DeleteResult>;

  /**
   * Validates that a user owns a notebook
   *
   * Used for checking ownership before allowing operations.
   * Does not check shared access - only ownership.
   *
   * @param notebookId - The notebook ID
   * @param userId - The user ID to check
   * @param opts - Optional storage options
   * @returns true if user owns the notebook, false otherwise
   * @throws AppError('aborted') if operation is cancelled
   */
  validateNotebookOwnership(
    notebookId: string,
    userId: string,
    opts?: StorageOptions,
  ): Promise<boolean>;

  // ============================================================================
  // Import Job Operations
  // ============================================================================

  /**
   * Creates a new import job
   *
   * Import jobs track the progress of data imports (e.g., from World Anvil).
   *
   * @param job - The import job data
   * @param opts - Optional storage options
   * @returns CreateResult containing the created import job
   * @throws AppError('invalid_input') if job data is invalid
   * @throws AppError('aborted') if operation is cancelled
   */
  createImportJob(
    job: InsertImportJob,
    opts?: StorageOptions,
  ): Promise<CreateResult<ImportJob>>;

  /**
   * Retrieves an import job by ID
   *
   * Only returns the job if it belongs to the specified user.
   *
   * @param id - The import job ID
   * @param userId - The user ID (must be owner)
   * @param opts - Optional storage options
   * @returns The import job if found and owned by user, undefined otherwise
   * @throws AppError('aborted') if operation is cancelled
   */
  getImportJob(
    id: string,
    userId: string,
    opts?: StorageOptions,
  ): Promise<ImportJob | undefined>;

  /**
   * Retrieves all import jobs for a user
   *
   * @param userId - The user ID
   * @param pagination - Optional pagination parameters
   * @param opts - Optional storage options
   * @returns Paginated list of import jobs
   * @throws AppError('aborted') if operation is cancelled
   */
  getUserImportJobs(
    userId: string,
    pagination?: PaginationParams,
    opts?: StorageOptions,
  ): Promise<PaginatedResult<ImportJob>>;

  /**
   * Updates an import job
   *
   * Typically used to update status, progress, or error messages.
   *
   * @param id - The import job ID
   * @param updates - Partial import job updates
   * @param opts - Optional storage options
   * @returns UpdateResult with updated job if successful
   * @throws AppError('aborted') if operation is cancelled
   */
  updateImportJob(
    id: string,
    updates: UpdateImportJob,
    opts?: StorageOptions,
  ): Promise<UpdateResult<ImportJob>>;
}
