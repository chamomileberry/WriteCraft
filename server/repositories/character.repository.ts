import { BaseRepository } from "./base.repository";
import { db } from "../db";
import {
  type Character,
  type InsertCharacter,
  type UpdateCharacter,
  characters,
  savedItems,
} from "@shared/schema";
import { eq, and, or, desc, isNull, isNotNull, inArray, lt } from "drizzle-orm";
import {
  AppError,
  type StorageOptions,
  type PaginationParams,
  type PaginatedResult,
  type CreateResult,
  type UpdateResult,
  type DeleteResult,
  createCursor,
  decodeCursor,
} from "../storage-types";

export class CharacterRepository extends BaseRepository {
  async createCharacter(
    character: InsertCharacter,
    opts?: StorageOptions,
  ): Promise<CreateResult<Character>> {
    // Check for cancellation
    if (opts?.signal?.aborted) {
      throw AppError.aborted();
    }

    // Validate input
    if (!character.userId) {
      throw AppError.invalidInput("Character must have userId");
    }

    // Ensure description field is included if provided
    const characterData = {
      ...character,
      description: character.description || character.backstory || "", // Fallback to backstory if no description
    };

    const [newCharacter] = await db
      .insert(characters)
      .values(characterData)
      .returning();

    return { value: newCharacter };
  }

  async getCharacter(
    id: string,
    userId: string,
    notebookId: string | null,
    opts?: StorageOptions,
  ): Promise<Character | undefined> {
    // Check for cancellation
    if (opts?.signal?.aborted) {
      throw AppError.aborted();
    }

    const conditions = [
      eq(characters.id, id),
      eq(characters.userId, userId),
    ];

    // If notebookId is specified, filter by it
    // If null, only return global characters (notebookId IS NULL)
    if (notebookId !== undefined) {
      conditions.push(
        notebookId === null
          ? isNull(characters.notebookId)
          : eq(characters.notebookId, notebookId),
      );
    }

    const [character] = await db
      .select()
      .from(characters)
      .where(and(...conditions));

    return character || undefined;
  }

  async getUserCharacters(
    userId: string,
    notebookId: string | null,
    pagination?: PaginationParams,
    opts?: StorageOptions,
  ): Promise<PaginatedResult<Character>> {
    // Check for cancellation
    if (opts?.signal?.aborted) {
      throw AppError.aborted();
    }

    const limit = Math.min(pagination?.limit || 20, 100);

    const conditions = [eq(characters.userId, userId)];

    // If notebookId is specified, filter by it
    if (notebookId !== undefined) {
      conditions.push(
        notebookId === null
          ? isNull(characters.notebookId)
          : eq(characters.notebookId, notebookId),
      );
    }

    // Build cursor conditions if provided
    const cursorConditions = pagination?.cursor
      ? (() => {
          const { sortKey, id } = decodeCursor(pagination.cursor);
          return or(
            lt(characters.createdAt, new Date(sortKey as string)),
            and(
              eq(characters.createdAt, new Date(sortKey as string)),
              lt(characters.id, id),
            ),
          );
        })()
      : undefined;

    // Combine ownership conditions with cursor conditions
    const allConditions = cursorConditions
      ? and(...conditions, cursorConditions)
      : and(...conditions);

    // Fetch limit + 1 to check if there are more results
    const items = await db
      .select()
      .from(characters)
      .where(allConditions)
      .orderBy(desc(characters.createdAt), desc(characters.id))
      .limit(limit + 1);

    const hasMore = items.length > limit;
    const results = hasMore ? items.slice(0, limit) : items;

    const nextCursor =
      hasMore && results.length > 0
        ? createCursor(
            results[results.length - 1].createdAt.toISOString(),
            results[results.length - 1].id,
          )
        : undefined;

    return {
      items: results,
      nextCursor,
    };
  }

  async updateCharacter(
    id: string,
    userId: string,
    notebookId: string | null,
    updates: UpdateCharacter,
    opts?: StorageOptions,
  ): Promise<UpdateResult<Character>> {
    // Check for cancellation
    if (opts?.signal?.aborted) {
      throw AppError.aborted();
    }

    const conditions = [
      eq(characters.id, id),
      eq(characters.userId, userId),
    ];

    // If notebookId is specified, filter by it
    if (notebookId !== undefined) {
      conditions.push(
        notebookId === null
          ? isNull(characters.notebookId)
          : eq(characters.notebookId, notebookId),
      );
    }

    const [updatedCharacter] = await db
      .update(characters)
      .set(updates)
      .where(and(...conditions))
      .returning();

    if (!updatedCharacter) {
      return { updated: false };
    }

    return { updated: true, value: updatedCharacter };
  }

  async deleteCharacter(
    id: string,
    userId: string,
    notebookId: string | null,
    opts?: StorageOptions,
  ): Promise<DeleteResult> {
    // Check for cancellation
    if (opts?.signal?.aborted) {
      throw AppError.aborted();
    }

    const conditions = [
      eq(characters.id, id),
      eq(characters.userId, userId),
    ];

    // If notebookId is specified, filter by it
    if (notebookId !== undefined) {
      conditions.push(
        notebookId === null
          ? isNull(characters.notebookId)
          : eq(characters.notebookId, notebookId),
      );
    }

    const result = await db
      .delete(characters)
      .where(and(...conditions))
      .returning();

    return { deleted: result.length > 0 };
  }

  async getCharactersWithIssues(
    userId: string,
    notebookId: string | null,
    opts?: StorageOptions,
  ): Promise<{
    missingFamilyName: Character[];
    missingDescription: Character[];
    missingImage: Character[];
  }> {
    // Check for cancellation
    if (opts?.signal?.aborted) {
      throw AppError.aborted();
    }

    const conditions = [eq(characters.userId, userId)];

    if (notebookId !== undefined) {
      conditions.push(
        notebookId === null
          ? isNull(characters.notebookId)
          : eq(characters.notebookId, notebookId),
      );
    }

    const baseQuery = and(...conditions);

    // Characters with given name but missing family name
    const missingFamilyName = await db
      .select()
      .from(characters)
      .where(
        and(
          baseQuery,
          isNotNull(characters.givenName),
          or(isNull(characters.familyName), eq(characters.familyName, "")),
        ),
      )
      .orderBy(desc(characters.createdAt));

    // Characters missing description
    const missingDescription = await db
      .select()
      .from(characters)
      .where(
        and(
          baseQuery,
          or(isNull(characters.description), eq(characters.description, "")),
        ),
      )
      .orderBy(desc(characters.createdAt));

    // Characters missing image
    const missingImage = await db
      .select()
      .from(characters)
      .where(
        and(
          baseQuery,
          or(isNull(characters.imageUrl), eq(characters.imageUrl, "")),
        ),
      )
      .orderBy(desc(characters.createdAt));

    return {
      missingFamilyName,
      missingDescription,
      missingImage,
    };
  }

  async bulkDeleteCharactersWithIssues(
    userId: string,
    notebookId: string | null,
    opts?: StorageOptions,
  ): Promise<{ deletedCount: number }> {
    // Check for cancellation
    if (opts?.signal?.aborted) {
      throw AppError.aborted();
    }

    // Get all characters with issues
    const conditions = [eq(characters.userId, userId)];

    if (notebookId !== undefined) {
      conditions.push(
        notebookId === null
          ? isNull(characters.notebookId)
          : eq(characters.notebookId, notebookId),
      );
    }

    const baseQuery = and(...conditions);

    // Build condition for characters with any issue
    const issuesCondition = or(
      // Missing family name (has given name but no family name)
      and(
        isNotNull(characters.givenName),
        or(isNull(characters.familyName), eq(characters.familyName, "")),
      ),
      // Missing description
      or(isNull(characters.description), eq(characters.description, "")),
      // Missing image
      or(isNull(characters.imageUrl), eq(characters.imageUrl, "")),
    );

    // Delete characters with issues
    const deleted = await db
      .delete(characters)
      .where(and(baseQuery, issuesCondition))
      .returning({ id: characters.id });

    // Also delete saved_items entries for these characters
    if (deleted.length > 0) {
      const characterIds = deleted.map((c) => c.id);
      await db
        .delete(savedItems)
        .where(
          and(
            eq(savedItems.itemType, "character"),
            inArray(savedItems.itemId, characterIds),
          ),
        );
    }

    return { deletedCount: deleted.length };
  }

  async getPotentialDuplicates(
    userId: string,
    notebookId: string | null,
    opts?: StorageOptions,
  ): Promise<Character[][]> {
    // Check for cancellation
    if (opts?.signal?.aborted) {
      throw AppError.aborted();
    }
    // Helper function to calculate Levenshtein distance
    function levenshteinDistance(str1: string, str2: string): number {
      const len1 = str1.length;
      const len2 = str2.length;
      const matrix: number[][] = [];

      for (let i = 0; i <= len1; i++) {
        matrix[i] = [i];
      }
      for (let j = 0; j <= len2; j++) {
        matrix[0][j] = j;
      }

      for (let i = 1; i <= len1; i++) {
        for (let j = 1; j <= len2; j++) {
          const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
          matrix[i][j] = Math.min(
            matrix[i - 1][j] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j - 1] + cost,
          );
        }
      }

      return matrix[len1][len2];
    }

    // Helper function to calculate similarity score
    function calculateSimilarity(str1: string, str2: string): number {
      const distance = levenshteinDistance(
        str1.toLowerCase(),
        str2.toLowerCase(),
      );
      const maxLen = Math.max(str1.length, str2.length);
      if (maxLen === 0) return 1;
      return 1 - distance / maxLen;
    }

    // Helper function to get full display name
    function getDisplayName(character: Character): string {
      const parts = [];
      if (character.givenName) parts.push(character.givenName);
      if (character.familyName) parts.push(character.familyName);
      return parts.join(" ").trim();
    }

    // Get all characters for the user's notebook
    const conditions = [eq(characters.userId, userId)];

    if (notebookId !== undefined) {
      conditions.push(
        notebookId === null
          ? isNull(characters.notebookId)
          : eq(characters.notebookId, notebookId),
      );
    }

    const allCharacters = await db
      .select()
      .from(characters)
      .where(and(...conditions))
      .orderBy(characters.givenName);

    // Filter characters with at least a given name or family name
    const validCharacters = allCharacters.filter(
      (c) => c.givenName || c.familyName,
    );

    // Find similar characters using Levenshtein distance
    const similarityThreshold = 0.8;
    const grouped = new Map<string, Set<string>>(); // Map of character ID to set of similar character IDs
    const processed = new Set<string>();

    for (let i = 0; i < validCharacters.length; i++) {
      const char1 = validCharacters[i];
      const name1 = getDisplayName(char1);

      if (!name1) continue;

      for (let j = i + 1; j < validCharacters.length; j++) {
        const char2 = validCharacters[j];
        const name2 = getDisplayName(char2);

        if (!name2) continue;

        const similarity = calculateSimilarity(name1, name2);

        if (similarity >= similarityThreshold) {
          // Add both characters to the same group
          if (!grouped.has(char1.id)) {
            grouped.set(char1.id, new Set([char1.id]));
          }
          if (!grouped.has(char2.id)) {
            grouped.set(char2.id, new Set([char2.id]));
          }

          // Merge the groups
          const group1 = grouped.get(char1.id)!;
          const group2 = grouped.get(char2.id)!;

          const group2Array = Array.from(group2);
          for (const id of group2Array) {
            group1.add(id);
          }

          // Update all members of group2 to point to group1
          for (const id of group2Array) {
            grouped.set(id, group1);
          }
        }
      }
    }

    // Convert groups to character arrays
    const duplicateGroups: Character[][] = [];
    const seenGroups = new Set<Set<string>>();

    const groupsArray = Array.from(grouped.values());
    for (const group of groupsArray) {
      if (seenGroups.has(group)) continue;
      if (group.size <= 1) continue;

      seenGroups.add(group);

      const groupCharacters = validCharacters.filter((c) => group.has(c.id));
      if (groupCharacters.length > 1) {
        duplicateGroups.push(groupCharacters);
      }
    }

    return duplicateGroups;
  }
}
