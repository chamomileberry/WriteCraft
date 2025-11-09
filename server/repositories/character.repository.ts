import { BaseRepository } from "./base.repository";
import { db } from "../db";
import {
  type Character,
  type InsertCharacter,
  type UpdateCharacter,
  characters,
  savedItems,
} from "@shared/schema";
import { eq, and, or, desc, isNull, isNotNull, inArray } from "drizzle-orm";
import {
  AppError,
  type StorageOptions,
} from "../storage-types";

export class CharacterRepository extends BaseRepository {
  async createCharacter(
    character: InsertCharacter,
    opts?: StorageOptions,
  ): Promise<Character> {
    if (opts?.signal?.aborted) throw AppError.aborted();

    // Ensure description field is included if provided
    const characterData = {
      ...character,
      description: character.description || character.backstory || "", // Fallback to backstory if no description
    };
    const [newCharacter] = await db
      .insert(characters)
      .values(characterData)
      .returning();
    if (!newCharacter) throw AppError.invalidInput("Failed to create character");
    return newCharacter;
  }

  async getCharacter(
    id: string,
    userId: string,
    notebookId: string,
    opts?: StorageOptions,
  ): Promise<Character | undefined> {
    if (opts?.signal?.aborted) throw AppError.aborted();

    const whereClause = and(
      eq(characters.id, id),
      eq(characters.userId, userId),
      eq(characters.notebookId, notebookId),
    );
    const [character] = await db.select().from(characters).where(whereClause);
    return character || undefined;
  }

  async getUserCharacters(
    userId: string,
    notebookId: string,
    opts?: StorageOptions,
  ): Promise<Character[]> {
    if (opts?.signal?.aborted) throw AppError.aborted();

    const whereClause = and(
      eq(characters.userId, userId),
      eq(characters.notebookId, notebookId),
    );
    return await db
      .select()
      .from(characters)
      .where(whereClause)
      .orderBy(desc(characters.createdAt));
  }

  async updateCharacter(
    id: string,
    userId: string,
    updates: UpdateCharacter,
    notebookId: string,
    opts?: StorageOptions,
  ): Promise<Character> {
    if (opts?.signal?.aborted) throw AppError.aborted();

    // Validate ownership (using new explicit error API)
    const [existing] = await db
      .select()
      .from(characters)
      .where(eq(characters.id, id));

    // New pattern: ensureContentOwnership throws typed AppError and narrows type
    this.ensureContentOwnership(existing, userId);
    // TypeScript now knows 'existing' is defined

    const whereClause = and(
      eq(characters.id, id),
      eq(characters.userId, userId),
      eq(characters.notebookId, notebookId),
    );
    const [updatedCharacter] = await db
      .update(characters)
      .set(updates)
      .where(whereClause)
      .returning();
    if (!updatedCharacter) {
      // If update didn't occur, determine reason
      throw AppError.notFound("Character not found for update", id as any);
    }
    return updatedCharacter;
  }

  async deleteCharacter(
    id: string,
    userId: string,
    notebookId: string,
    opts?: StorageOptions,
  ): Promise<void> {
    if (opts?.signal?.aborted) throw AppError.aborted();

    // Validate ownership and notebook association
    const [existing] = await db
      .select()
      .from(characters)
      .where(eq(characters.id, id));
    try {
      this.ensureContentOwnership(existing, userId);
    } catch (err) {
      throw err;
    }
    if (!existing || existing.notebookId !== notebookId) {
      throw AppError.notFound("Character", id);
    }

    const whereClause = and(
      eq(characters.id, id),
      eq(characters.userId, userId),
      eq(characters.notebookId, notebookId),
    );
    await db.delete(characters).where(whereClause);
  }

  async getCharactersWithIssues(
    userId: string,
    notebookId: string,
    opts?: StorageOptions,
  ): Promise<{
    missingFamilyName: Character[];
    missingDescription: Character[];
    missingImage: Character[];
  }> {
    if (opts?.signal?.aborted) throw AppError.aborted();

    const baseQuery = and(
      eq(characters.userId, userId),
      eq(characters.notebookId, notebookId),
    );

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
    notebookId: string,
    opts?: StorageOptions,
  ): Promise<{ deletedCount: number }> {
    if (opts?.signal?.aborted) throw AppError.aborted();
    // Get all characters with issues
    const baseQuery = and(
      eq(characters.userId, userId),
      eq(characters.notebookId, notebookId),
    );

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
    notebookId: string,
  ): Promise<Character[][]> {
    // Helper function to calculate Levenshtein distance
    function levenshteinDistance(str1: string, str2: string): number {
      const len1 = str1.length;
      const len2 = str2.length;

      // Initialize matrix with dimensions (len1+1) x (len2+1)
      const matrix: number[][] = Array.from({ length: len1 + 1 }, (_, i) =>
        Array.from({ length: len2 + 1 }, (_, j) => (j === 0 ? i : 0))
      );
      for (let j = 0; j <= len2; j++) {
        matrix[0]![j] = j;
      }

      for (let i = 1; i <= len1; i++) {
        for (let j = 1; j <= len2; j++) {
          const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
          matrix[i]![j]! = Math.min(
            matrix[i - 1]![j]! + 1,
            matrix[i]![j - 1]! + 1,
            matrix[i - 1]![j - 1]! + cost,
          );
        }
      }

      // matrix[len1][len2] is guaranteed to be a number
      return matrix[len1]![len2]!;
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
    const allCharacters = await db
      .select()
      .from(characters)
      .where(
        and(
          eq(characters.userId, userId),
          eq(characters.notebookId, notebookId),
        ),
      )
      .orderBy(characters.givenName);

    // Filter characters with at least a given name or family name and narrow type
    const validCharacters = allCharacters.filter(
      (c): c is Character => !!c && (!!c.givenName || !!c.familyName),
    );

    // Find similar characters using Levenshtein distance
    const similarityThreshold = 0.8;
    const grouped = new Map<string, Set<string>>(); // Map of character ID to set of similar character IDs
    const processed = new Set<string>();

    for (let i = 0; i < validCharacters.length; i++) {
      const char1 = validCharacters[i];
      if (!char1) continue;
      const name1 = getDisplayName(char1);

      if (!name1) continue;

      for (let j = i + 1; j < validCharacters.length; j++) {
        const char2 = validCharacters[j];
        if (!char2) continue;
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
