import { db } from "../db";
import { eq, and, desc, isNull, or, lt } from "drizzle-orm";
import {
  type FamilyTree,
  type InsertFamilyTree,
  type FamilyTreeMember,
  type InsertFamilyTreeMember,
  type FamilyTreeRelationship,
  type InsertFamilyTreeRelationship,
  type InsertSavedItem,
  familyTrees,
  familyTreeMembers,
  familyTreeRelationships,
  characters,
  savedItems,
} from "@shared/schema";
import { BaseRepository } from "./base.repository";
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

/**
 * Family tree member with populated character data
 */
export type FamilyTreeMemberWithCharacter = FamilyTreeMember & {
  character: {
    id: string;
    givenName: string | null;
    familyName: string | null;
    middleName: string | null;
    nickname: string | null;
    imageUrl: string | null;
    dateOfBirth: string | null;
    dateOfDeath: string | null;
  } | null;
};

export class FamilyTreeRepository extends BaseRepository {
  // Family Tree methods
  async createFamilyTree(
    familyTree: InsertFamilyTree,
    opts?: StorageOptions,
  ): Promise<CreateResult<FamilyTree>> {
    // Check for cancellation
    if (opts?.signal?.aborted) {
      throw AppError.aborted();
    }

    // Validate input
    if (!familyTree.userId) {
      throw AppError.invalidInput("FamilyTree must have userId");
    }

    const [newFamilyTree] = await db
      .insert(familyTrees)
      .values(familyTree)
      .returning();

    // Automatically save to saved_items for notebook display
    if (newFamilyTree.notebookId && newFamilyTree.userId) {
      try {
        await db.insert(savedItems).values({
          userId: newFamilyTree.userId,
          notebookId: newFamilyTree.notebookId,
          itemType: "familytree",
          itemId: newFamilyTree.id,
          itemData: {
            name: newFamilyTree.name,
            description: newFamilyTree.description,
          },
        });
      } catch (error: any) {
        // Ignore unique constraint violations (item already saved)
        if (error?.code !== "23505" && !error?.message?.includes("unique")) {
          throw error;
        }
      }
    }

    return { value: newFamilyTree };
  }

  async getFamilyTree(
    id: string,
    userId: string,
    notebookId: string | null,
    opts?: StorageOptions,
  ): Promise<FamilyTree | undefined> {
    // Check for cancellation
    if (opts?.signal?.aborted) {
      throw AppError.aborted();
    }

    const conditions = [
      eq(familyTrees.id, id),
      eq(familyTrees.userId, userId),
    ];

    if (notebookId !== undefined) {
      conditions.push(
        notebookId === null
          ? isNull(familyTrees.notebookId)
          : eq(familyTrees.notebookId, notebookId),
      );
    }

    const [familyTree] = await db
      .select()
      .from(familyTrees)
      .where(and(...conditions));

    return familyTree || undefined;
  }

  async getUserFamilyTrees(
    userId: string,
    notebookId: string | null,
    pagination?: PaginationParams,
    opts?: StorageOptions,
  ): Promise<PaginatedResult<FamilyTree>> {
    // Check for cancellation
    if (opts?.signal?.aborted) {
      throw AppError.aborted();
    }

    const limit = Math.min(pagination?.limit || 20, 100);

    const conditions = [eq(familyTrees.userId, userId)];

    if (notebookId !== undefined) {
      conditions.push(
        notebookId === null
          ? isNull(familyTrees.notebookId)
          : eq(familyTrees.notebookId, notebookId),
      );
    }

    // Build cursor conditions if provided
    const cursorConditions = pagination?.cursor
      ? (() => {
          const { sortKey, id } = decodeCursor(pagination.cursor);
          return or(
            lt(familyTrees.createdAt, new Date(sortKey as string)),
            and(
              eq(familyTrees.createdAt, new Date(sortKey as string)),
              lt(familyTrees.id, id),
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
      .from(familyTrees)
      .where(allConditions)
      .orderBy(desc(familyTrees.createdAt), desc(familyTrees.id))
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

  async updateFamilyTree(
    id: string,
    userId: string,
    notebookId: string | null,
    updates: Partial<InsertFamilyTree>,
    opts?: StorageOptions,
  ): Promise<UpdateResult<FamilyTree>> {
    // Check for cancellation
    if (opts?.signal?.aborted) {
      throw AppError.aborted();
    }

    const conditions = [
      eq(familyTrees.id, id),
      eq(familyTrees.userId, userId),
    ];

    if (notebookId !== undefined) {
      conditions.push(
        notebookId === null
          ? isNull(familyTrees.notebookId)
          : eq(familyTrees.notebookId, notebookId),
      );
    }

    const [updatedFamilyTree] = await db
      .update(familyTrees)
      .set(updates)
      .where(and(...conditions))
      .returning();

    if (!updatedFamilyTree) {
      return { updated: false };
    }

    // Update saved_items entry if name or description changed
    if (updates.name !== undefined || updates.description !== undefined) {
      await db
        .update(savedItems)
        .set({
          itemData: {
            name: updatedFamilyTree.name,
            description: updatedFamilyTree.description,
          },
        })
        .where(
          and(eq(savedItems.itemId, id), eq(savedItems.itemType, "familytree")),
        );
    }

    return { updated: true, value: updatedFamilyTree };
  }

  async deleteFamilyTree(
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
      eq(familyTrees.id, id),
      eq(familyTrees.userId, userId),
    ];

    if (notebookId !== undefined) {
      conditions.push(
        notebookId === null
          ? isNull(familyTrees.notebookId)
          : eq(familyTrees.notebookId, notebookId),
      );
    }

    const result = await db
      .delete(familyTrees)
      .where(and(...conditions))
      .returning();

    return { deleted: result.length > 0 };
  }

  // Family Tree Member methods
  async createFamilyTreeMember(
    member: InsertFamilyTreeMember,
    opts?: StorageOptions,
  ): Promise<CreateResult<FamilyTreeMember>> {
    // Check for cancellation
    if (opts?.signal?.aborted) {
      throw AppError.aborted();
    }

    const [newMember] = await db
      .insert(familyTreeMembers)
      .values(member)
      .returning();

    return { value: newMember };
  }

  async getFamilyTreeMembers(
    treeId: string,
    userId: string,
    opts?: StorageOptions,
  ): Promise<FamilyTreeMemberWithCharacter[]> {
    // Check for cancellation
    if (opts?.signal?.aborted) {
      throw AppError.aborted();
    }

    // Validate tree ownership
    const [tree] = await db
      .select()
      .from(familyTrees)
      .where(eq(familyTrees.id, treeId));

    this.ensureContentOwnership(tree, userId);

    // Fetch members with character data using LEFT JOIN
    const rows = await db
      .select()
      .from(familyTreeMembers)
      .leftJoin(characters, eq(familyTreeMembers.characterId, characters.id))
      .where(eq(familyTreeMembers.treeId, treeId))
      .orderBy(desc(familyTreeMembers.createdAt));

    // Reshape the data to nest character inside member
    const members: FamilyTreeMemberWithCharacter[] = rows.map((row) => ({
      ...row.family_tree_members,
      character: row.characters
        ? {
            id: row.characters.id,
            givenName: row.characters.givenName,
            familyName: row.characters.familyName,
            middleName: row.characters.middleName,
            nickname: row.characters.nickname,
            imageUrl: row.characters.imageUrl,
            dateOfBirth: row.characters.dateOfBirth,
            dateOfDeath: row.characters.dateOfDeath,
          }
        : null,
    }));

    return members;
  }

  async updateFamilyTreeMember(
    id: string,
    userId: string,
    updates: Partial<InsertFamilyTreeMember>,
    opts?: StorageOptions,
  ): Promise<UpdateResult<FamilyTreeMember>> {
    // Check for cancellation
    if (opts?.signal?.aborted) {
      throw AppError.aborted();
    }

    // Validate ownership via tree
    const [existing] = await db
      .select()
      .from(familyTreeMembers)
      .where(eq(familyTreeMembers.id, id));

    if (!existing) {
      return { updated: false };
    }

    const [tree] = await db
      .select()
      .from(familyTrees)
      .where(eq(familyTrees.id, existing.treeId));

    this.ensureContentOwnership(tree, userId);

    const [updated] = await db
      .update(familyTreeMembers)
      .set(updates)
      .where(eq(familyTreeMembers.id, id))
      .returning();

    if (!updated) {
      return { updated: false };
    }

    return { updated: true, value: updated };
  }

  async deleteFamilyTreeMember(
    id: string,
    userId: string,
    treeId: string,
    opts?: StorageOptions,
  ): Promise<DeleteResult> {
    // Check for cancellation
    if (opts?.signal?.aborted) {
      throw AppError.aborted();
    }

    // Validate ownership via tree
    const [tree] = await db
      .select()
      .from(familyTrees)
      .where(eq(familyTrees.id, treeId));

    this.ensureContentOwnership(tree, userId);

    const result = await db
      .delete(familyTreeMembers)
      .where(
        and(eq(familyTreeMembers.id, id), eq(familyTreeMembers.treeId, treeId)),
      )
      .returning();

    return { deleted: result.length > 0 };
  }

  // Family Tree Relationship methods
  async createFamilyTreeRelationship(
    relationship: InsertFamilyTreeRelationship,
    opts?: StorageOptions,
  ): Promise<CreateResult<FamilyTreeRelationship>> {
    // Check for cancellation
    if (opts?.signal?.aborted) {
      throw AppError.aborted();
    }

    const [newRelationship] = await db
      .insert(familyTreeRelationships)
      .values(relationship)
      .returning();

    return { value: newRelationship };
  }

  async getFamilyTreeRelationships(
    treeId: string,
    userId: string,
    opts?: StorageOptions,
  ): Promise<FamilyTreeRelationship[]> {
    // Check for cancellation
    if (opts?.signal?.aborted) {
      throw AppError.aborted();
    }

    // Validate tree ownership
    const [tree] = await db
      .select()
      .from(familyTrees)
      .where(eq(familyTrees.id, treeId));

    this.ensureContentOwnership(tree, userId);

    return await db
      .select()
      .from(familyTreeRelationships)
      .where(eq(familyTreeRelationships.treeId, treeId))
      .orderBy(desc(familyTreeRelationships.createdAt));
  }

  async updateFamilyTreeRelationship(
    id: string,
    userId: string,
    updates: Partial<InsertFamilyTreeRelationship>,
    opts?: StorageOptions,
  ): Promise<UpdateResult<FamilyTreeRelationship>> {
    // Check for cancellation
    if (opts?.signal?.aborted) {
      throw AppError.aborted();
    }

    // Validate ownership via tree
    const [existing] = await db
      .select()
      .from(familyTreeRelationships)
      .where(eq(familyTreeRelationships.id, id));

    if (!existing) {
      return { updated: false };
    }

    const [tree] = await db
      .select()
      .from(familyTrees)
      .where(eq(familyTrees.id, existing.treeId));

    this.ensureContentOwnership(tree, userId);

    const [updated] = await db
      .update(familyTreeRelationships)
      .set(updates)
      .where(eq(familyTreeRelationships.id, id))
      .returning();

    if (!updated) {
      return { updated: false };
    }

    return { updated: true, value: updated };
  }

  async deleteFamilyTreeRelationship(
    id: string,
    userId: string,
    treeId: string,
    opts?: StorageOptions,
  ): Promise<DeleteResult> {
    // Check for cancellation
    if (opts?.signal?.aborted) {
      throw AppError.aborted();
    }

    // Validate ownership via tree
    const [tree] = await db
      .select()
      .from(familyTrees)
      .where(eq(familyTrees.id, treeId));

    this.ensureContentOwnership(tree, userId);

    const result = await db
      .delete(familyTreeRelationships)
      .where(
        and(
          eq(familyTreeRelationships.id, id),
          eq(familyTreeRelationships.treeId, treeId),
        ),
      )
      .returning();

    return { deleted: result.length > 0 };
  }
}
