import { BaseRepository } from "./base.repository";
import { db } from "../db";
import { projects, savedItems, notebooks, type Project } from "@shared/schema";
import { eq, and, sql, inArray, desc, or, lt } from "drizzle-orm";
import type { ISearchStorage } from "../storage-interfaces/search.interface";
import {
  type SearchResult,
  type PaginatedResult,
  type PaginationParams,
  type StorageOptions,
  createCursor,
  decodeCursor,
  AppError,
} from "../storage-types";

export class SearchRepository extends BaseRepository implements ISearchStorage {
  async searchProjects(userId: string, query: string): Promise<Project[]> {
    const trimmedQuery = query.trim();
    if (!trimmedQuery) {
      return await db
        .select()
        .from(projects)
        .where(eq(projects.userId, userId))
        .orderBy(desc(projects.updatedAt));
    }

    const searchQuery = sql`plainto_tsquery('english', ${trimmedQuery})`;
    return await db
      .select({
        id: projects.id,
        title: projects.title,
        content: projects.content,
        excerpt: projects.excerpt,
        wordCount: projects.wordCount,
        tags: projects.tags,
        status: projects.status,
        searchVector: projects.searchVector,
        folderId: projects.folderId,
        userId: projects.userId,
        createdAt: projects.createdAt,
        updatedAt: projects.updatedAt,
        rank: sql<number>`ts_rank(${projects.searchVector}, ${searchQuery})`.as(
          "rank",
        ),
      })
      .from(projects)
      .where(
        and(
          eq(projects.userId, userId),
          sql`${projects.searchVector} @@ ${searchQuery}`,
        ),
      )
      .orderBy(desc(sql`ts_rank(${projects.searchVector}, ${searchQuery})`));
  }

  async searchAllContent(
    userId: string,
    query: string,
    filters?: {
      notebookId?: string | null;
      kinds?: SearchResult['kind'][];
    },
    pagination?: PaginationParams,
    opts?: StorageOptions
  ): Promise<PaginatedResult<SearchResult>> {
    // Check for cancellation
    if (opts?.signal?.aborted) {
      throw AppError.aborted();
    }

    const trimmedQuery = query.trim();
    if (!trimmedQuery) {
      return {
        items: [],
        nextCursor: undefined,
      };
    }

    // Determine pagination settings
    const limit = Math.min(pagination?.limit || 20, 100);
    const results: SearchResult[] = [];

    try {
      // Search projects if not filtered out
      if (!filters?.kinds || filters.kinds.includes("project")) {
        const projectResults = await this.searchProjects(userId, trimmedQuery);

        for (const item of projectResults) {
          // Apply notebook filter
          if (filters?.notebookId !== undefined) {
            // If looking for global content only (null), skip
            // If looking for specific notebook, skip (projects don't have notebookId yet)
            continue;
          }

          results.push({
            id: item.id,
            userId: userId,
            notebookId: null, // Projects are currently global
            name: item.title,
            description: item.excerpt || item.content?.substring(0, 100) || null,
            kind: "project",
          });
        }
      }

      // Check for cancellation
      if (opts?.signal?.aborted) {
        throw AppError.aborted();
      }

      // Search saved items
      const conditions = [
        eq(savedItems.userId, userId),
        sql`${savedItems.itemData}::text ILIKE ${"%" + trimmedQuery + "%"}`,
      ];

      // Apply notebook filter
      if (filters?.notebookId !== undefined) {
        if (filters.notebookId === null) {
          conditions.push(sql`${savedItems.notebookId} IS NULL`);
        } else {
          conditions.push(eq(savedItems.notebookId, filters.notebookId));
        }
      }

      const savedItemResults = await db
        .select()
        .from(savedItems)
        .where(and(...conditions))
        .limit(100); // Get more than needed for filtering

      for (const savedItem of savedItemResults) {
        // Apply kind filter
        if (filters?.kinds && !filters.kinds.includes(savedItem.itemType as SearchResult['kind'])) {
          continue;
        }

        const itemData = savedItem.itemData as any;
        let name = "Untitled";
        let description = "";

        // Extract name
        if (itemData.name) {
          name = itemData.name;
        } else if (itemData.givenName || itemData.familyName) {
          name =
            [itemData.givenName, itemData.familyName]
              .filter(Boolean)
              .join(" ") || "Untitled";
        } else if (itemData.title) {
          name = itemData.title;
        }

        // Extract description based on type
        switch (savedItem.itemType) {
          case "character":
            description = itemData.occupation || "";
            if (itemData.backstory) {
              description += (description ? " • " : "") + itemData.backstory.substring(0, 100);
            }
            break;
          case "location":
            description = itemData.locationType || "";
            if (itemData.description) {
              description += (description ? " • " : "") + itemData.description.substring(0, 100);
            }
            break;
          case "weapon":
            description = itemData.weaponType || "";
            if (itemData.description) {
              description += (description ? " • " : "") + itemData.description.substring(0, 100);
            }
            break;
          case "organization":
            description = itemData.organizationType || "";
            if (itemData.purpose) {
              description += (description ? " • " : "") + itemData.purpose.substring(0, 100);
            }
            break;
          case "species":
            description = itemData.classification || "";
            if (itemData.physicalDescription) {
              description += (description ? " • " : "") + itemData.physicalDescription.substring(0, 100);
            }
            break;
          default:
            if (itemData.description) {
              description = itemData.description.substring(0, 100);
            }
        }

        results.push({
          id: savedItem.itemId,
          userId: userId,
          notebookId: savedItem.notebookId,
          name: name,
          description: description || null,
          kind: savedItem.itemType,
        } as SearchResult);
      }
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      console.error("Error in universal search:", error);
      throw AppError.invalidInput("Search query failed", error);
    }

    // Remove duplicates (same id and kind)
    const uniqueResults = results.filter(
      (result, index, self) =>
        index ===
        self.findIndex((r) => r.id === result.id && r.kind === result.kind),
    );

    // Apply cursor pagination
    let filteredResults = uniqueResults;

    if (pagination?.cursor) {
      try {
        const { sortKey, id } = decodeCursor(pagination.cursor);
        // For search results, we use name as sortKey
        const cursorIndex = filteredResults.findIndex(
          r => r.name === sortKey && r.id === id
        );
        if (cursorIndex !== -1) {
          filteredResults = filteredResults.slice(cursorIndex + 1);
        }
      } catch (error) {
        // Invalid cursor, ignore and start from beginning
        console.warn("Invalid cursor provided to search:", error);
      }
    }

    // Take limit + 1 to determine if there are more results
    const hasMore = filteredResults.length > limit;
    const items = filteredResults.slice(0, limit);

    // Generate next cursor if there are more results
    const nextCursor = hasMore && items.length > 0
      ? createCursor(items[items.length - 1].name, items[items.length - 1].id)
      : undefined;

    return {
      items,
      nextCursor,
    };
  }

  /**
   * Asserts that content belongs to the specified user and notebook context.
   * Throws typed AppError with specific reason if validation fails.
   *
   * **Notebook Boundary Rules:**
   * - `notebookId` is a string: Allow content in that notebook OR global content (null)
   * - `notebookId` is `null`: Only allow global content (content.notebookId must be null)
   * - `notebookId` is `undefined`: Allow any content the user owns (no notebook filtering)
   *
   * @throws {AppError} with code 'not_found' if content is undefined
   * @throws {AppError} with code 'forbidden' if user doesn't own content
   * @throws {AppError} with code 'forbidden' if content is in wrong notebook
   *
   * @example
   * ```typescript
   * // In a notebook context - allows notebook content OR global content
   * ensureContentOwnership(character, userId, 'notebook123');
   *
   * // Global context only - rejects notebook-scoped content
   * ensureContentOwnership(prompt, userId, null);
   *
   * // No notebook filtering - allows any user content
   * ensureContentOwnership(user, userId, undefined);
   * ```
   */
  ensureContentOwnership<T extends { userId?: string | null; notebookId?: string | null }>(
    content: T | undefined,
    userId: string,
    notebookId?: string | null,
  ): asserts content is T {
    if (!content) {
      throw AppError.notFound('Content not found');
    }

    // Check user ownership
    if (content.userId !== userId) {
      throw AppError.forbidden(`Content does not belong to user ${userId}`);
    }

    // Check notebook boundaries
    if (notebookId !== undefined) {
      const contentNotebookId = content.notebookId;

      if (notebookId === null) {
        // Requesting global content only
        if (contentNotebookId != null) {
          throw AppError.forbidden(
            `Content belongs to notebook ${contentNotebookId}, but global content was requested`
          );
        }
      } else {
        // Requesting specific notebook content
        // Allow content from the specified notebook OR global content
        if (contentNotebookId != null && contentNotebookId !== notebookId) {
          throw AppError.forbidden(
            `Content belongs to notebook ${contentNotebookId}, not ${notebookId}`
          );
        }
      }
    }
  }

  /**
   * Validates that content belongs to the specified user and notebook.
   * Returns boolean for backward compatibility with existing code.
   *
   * **Deprecated**: Use `ensureContentOwnership` for explicit error handling.
   * This method will be removed once all call sites are migrated.
   *
   * @returns true if content passes validation, false if content is undefined or doesn't belong to user
   */
  validateContentOwnership<T extends { userId?: string | null; notebookId?: string | null }>(
    content: T | undefined,
    userId: string,
    notebookId?: string | null,
  ): boolean {
    try {
      this.ensureContentOwnership(content, userId, notebookId);
      return true;
    } catch (error) {
      // Only return false for ownership failures
      // Re-throw unexpected errors
      if (error instanceof AppError &&
          (error.code === 'not_found' || error.code === 'forbidden')) {
        return false;
      }
      throw error;
    }
  }
}

export const searchRepository = new SearchRepository();
