/**
 * ISearchStorage - Universal search and content validation
 *
 * This interface provides cross-cutting search capabilities across all content types
 * and utilities for validating content ownership within tenant boundaries.
 *
 * @domain Search & Discovery
 * @complexity Low (2 methods)
 * @priority High (cross-cutting concern used everywhere)
 */

import type {
  StorageOptions,
  PaginatedResult,
  PaginationParams,
  SearchResult,
} from '../storage-types';

export interface ISearchStorage {
  /**
   * Search across all content types for a given user.
   *
   * This is a cross-cutting query that searches through all content tables
   * (characters, plots, locations, etc.) and returns a unified result set.
   *
   * @param userId - The user whose content to search
   * @param query - Search query string
   * @param filters - Optional filters
   * @param filters.notebookId - Limit search to specific notebook (null for global content only, undefined for all)
   * @param filters.kinds - Limit search to specific content types (e.g., ["character", "location"])
   * @param pagination - Pagination parameters (limit, cursor)
   * @param opts - Storage options (AbortSignal for cancellation)
   * @returns Paginated search results with discriminated union type
   *
   * @example
   * ```typescript
   * // Search all content
   * const allResults = await storage.searchAllContent(userId, "dragon");
   *
   * // Search only characters and creatures
   * const filtered = await storage.searchAllContent(
   *   userId,
   *   "dragon",
   *   { kinds: ["character", "creature"] }
   * );
   *
   * // Search within a specific notebook
   * const notebookResults = await storage.searchAllContent(
   *   userId,
   *   "dragon",
   *   { notebookId: "notebook123" }
   * );
   *
   * // Type-safe result handling
   * filtered.items.forEach(result => {
   *   switch (result.kind) {
   *     case "character":
   *       console.log(`Character: ${result.name}`);
   *       break;
   *     case "creature":
   *       console.log(`Creature: ${result.name}`);
   *       break;
   *   }
   * });
   * ```
   */
  searchAllContent(
    userId: string,
    query: string,
    filters?: {
      notebookId?: string | null;
      kinds?: SearchResult['kind'][];
    },
    pagination?: PaginationParams,
    opts?: StorageOptions
  ): Promise<PaginatedResult<SearchResult>>;

  /**
   * Validates that content belongs to the specified user and notebook.
   *
   * This is a critical security method that enforces tenant boundaries.
   * It should be called before any mutation or sensitive read operation.
   *
   * **Rules:**
   * - Always checks that content.userId === userId
   * - If notebookId is provided and content.notebookId is not null, they must match
   * - Global content (content.notebookId === null) can be accessed from any notebook
   * - Returns false if content is undefined
   * - Throws AppError with code 'forbidden' if validation fails
   *
   * @param content - The content entity to validate (or undefined if not found)
   * @param userId - The user attempting to access the content
   * @param notebookId - The notebook context (optional, null means global only)
   * @returns true if content passes validation
   * @throws {AppError} with code 'forbidden' if validation fails
   *
   * @example
   * ```typescript
   * // Validate character ownership before update
   * const character = await storage.getCharacter(id, userId, notebookId);
   * if (!storage.validateContentOwnership(character, userId, notebookId)) {
   *   // Returns false if character is undefined
   *   throw new Error('Character not found');
   * }
   * // If we reach here, character is defined and owned by user
   *
   * // Throws AppError('forbidden') if character belongs to different user
   * storage.validateContentOwnership(character, 'otherUserId', notebookId);
   *
   * // Global content (notebookId: null) can be accessed from any notebook
   * const globalPlot = await storage.getPlot(id, userId, null);
   * storage.validateContentOwnership(globalPlot, userId, 'anyNotebook'); // ✅ Allowed
   *
   * // But notebook-scoped content cannot cross boundaries
   * const notebookPlot = await storage.getPlot(id, userId, 'notebook1');
   * storage.validateContentOwnership(notebookPlot, userId, 'notebook2'); // ❌ Throws
   * ```
   */
  validateContentOwnership<T extends { userId?: string | null; notebookId?: string | null }>(
    content: T | undefined,
    userId: string,
    notebookId?: string | null,
  ): boolean;
}
