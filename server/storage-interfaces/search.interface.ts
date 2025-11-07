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
   * Asserts that content belongs to the specified user and notebook context.
   * Throws typed AppError with specific reason if validation fails.
   *
   * **Recommended**: Use this method for explicit error handling and type narrowing.
   *
   * **Notebook Boundary Rules:**
   * - `notebookId` is a string: Allow content in that notebook OR global content (null)
   * - `notebookId` is `null`: Only allow global content (content.notebookId must be null)
   * - `notebookId` is `undefined`: Allow any content the user owns (no notebook filtering)
   *
   * @param content - The content entity to validate (or undefined if not found)
   * @param userId - The user attempting to access the content
   * @param notebookId - The notebook context (string = specific notebook, null = global only, undefined = any)
   * @throws {AppError} with code 'not_found' if content is undefined
   * @throws {AppError} with code 'forbidden' if user doesn't own content
   * @throws {AppError} with code 'forbidden' if content is in wrong notebook
   *
   * @example
   * ```typescript
   * // In a notebook context - allows notebook content OR global content
   * const character = await storage.getCharacter(id, userId, notebookId);
   * storage.ensureContentOwnership(character, userId, 'notebook123');
   * // TypeScript now knows character is defined (assertion signature)
   * console.log(character.name);
   *
   * // Global context only - rejects notebook-scoped content
   * const prompt = await storage.getPrompt(id, userId);
   * storage.ensureContentOwnership(prompt, userId, null);
   *
   * // No notebook filtering - allows any user content
   * storage.ensureContentOwnership(user, userId, undefined);
   * ```
   */
  ensureContentOwnership<T extends { userId?: string | null; notebookId?: string | null }>(
    content: T | undefined,
    userId: string,
    notebookId?: string | null,
  ): asserts content is T;

  /**
   * Validates that content belongs to the specified user and notebook.
   * Returns boolean for backward compatibility with existing code.
   *
   * **Deprecated**: Use `ensureContentOwnership` for explicit error handling.
   * This method will be removed once all call sites are migrated.
   *
   * @param content - The content entity to validate (or undefined if not found)
   * @param userId - The user attempting to access the content
   * @param notebookId - The notebook context (optional, null means global only)
   * @returns true if content passes validation, false if content is undefined or doesn't belong to user
   *
   * @example
   * ```typescript
   * // Backward compatible usage
   * const character = await storage.getCharacter(id, userId, notebookId);
   * if (!storage.validateContentOwnership(character, userId, notebookId)) {
   *   throw new AppError.forbidden('Unauthorized');
   * }
   * // character might still be undefined here (not narrowed)
   * ```
   */
  validateContentOwnership<T extends { userId?: string | null; notebookId?: string | null }>(
    content: T | undefined,
    userId: string,
    notebookId?: string | null,
  ): boolean;
}
