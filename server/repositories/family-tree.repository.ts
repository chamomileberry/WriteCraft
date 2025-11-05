import { db } from "../db";
import { eq, and, desc } from "drizzle-orm";
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

export class FamilyTreeRepository extends BaseRepository {
  // Family Tree methods
  async createFamilyTree(familyTree: InsertFamilyTree): Promise<FamilyTree> {
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

    return newFamilyTree;
  }

  async getFamilyTree(
    id: string,
    userId: string,
    notebookId: string,
  ): Promise<FamilyTree | undefined> {
    const [familyTree] = await db
      .select()
      .from(familyTrees)
      .where(
        and(
          eq(familyTrees.id, id),
          eq(familyTrees.userId, userId),
          eq(familyTrees.notebookId, notebookId),
        ),
      );
    return familyTree || undefined;
  }

  async getUserFamilyTrees(
    userId: string,
    notebookId: string,
  ): Promise<FamilyTree[]> {
    return await db
      .select()
      .from(familyTrees)
      .where(
        and(
          eq(familyTrees.userId, userId),
          eq(familyTrees.notebookId, notebookId),
        ),
      )
      .orderBy(desc(familyTrees.createdAt));
  }

  async updateFamilyTree(
    id: string,
    userId: string,
    updates: Partial<InsertFamilyTree>,
  ): Promise<FamilyTree> {
    // Validate ownership
    const [existing] = await db
      .select()
      .from(familyTrees)
      .where(eq(familyTrees.id, id));
    if (!this.validateContentOwnership(existing, userId)) {
      throw new Error("Unauthorized: You do not own this content");
    }

    const [updatedFamilyTree] = await db
      .update(familyTrees)
      .set(updates)
      .where(eq(familyTrees.id, id))
      .returning();

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

    return updatedFamilyTree;
  }

  async deleteFamilyTree(id: string, userId: string): Promise<void> {
    // Validate ownership
    const [existing] = await db
      .select()
      .from(familyTrees)
      .where(eq(familyTrees.id, id));
    if (!this.validateContentOwnership(existing, userId)) {
      throw new Error("Unauthorized: You do not own this content");
    }

    await db.delete(familyTrees).where(eq(familyTrees.id, id));
  }

  // Family Tree Member methods
  async createFamilyTreeMember(
    member: InsertFamilyTreeMember,
  ): Promise<FamilyTreeMember> {
    const [newMember] = await db
      .insert(familyTreeMembers)
      .values(member)
      .returning();
    return newMember;
  }

  async getFamilyTreeMembers(treeId: string, userId: string): Promise<any[]> {
    // Validate tree ownership
    const [tree] = await db
      .select()
      .from(familyTrees)
      .where(eq(familyTrees.id, treeId));
    if (!this.validateContentOwnership(tree, userId)) {
      throw new Error("Unauthorized: You do not own this content");
    }

    // Fetch members with character data using LEFT JOIN
    const rows = await db
      .select()
      .from(familyTreeMembers)
      .leftJoin(characters, eq(familyTreeMembers.characterId, characters.id))
      .where(eq(familyTreeMembers.treeId, treeId))
      .orderBy(desc(familyTreeMembers.createdAt));

    // Reshape the data to nest character inside member
    const members = rows.map((row) => ({
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
  ): Promise<FamilyTreeMember> {
    // Validate ownership via tree
    const [existing] = await db
      .select()
      .from(familyTreeMembers)
      .where(eq(familyTreeMembers.id, id));
    if (!existing) {
      throw new Error("Member not found");
    }

    const [tree] = await db
      .select()
      .from(familyTrees)
      .where(eq(familyTrees.id, existing.treeId));
    if (!this.validateContentOwnership(tree, userId)) {
      throw new Error("Unauthorized: You do not own this content");
    }

    const [updated] = await db
      .update(familyTreeMembers)
      .set(updates)
      .where(eq(familyTreeMembers.id, id))
      .returning();

    return updated;
  }

  async deleteFamilyTreeMember(
    id: string,
    userId: string,
    treeId: string,
  ): Promise<void> {
    // Validate ownership via tree
    const [tree] = await db
      .select()
      .from(familyTrees)
      .where(eq(familyTrees.id, treeId));
    if (!this.validateContentOwnership(tree, userId)) {
      throw new Error("Unauthorized: You do not own this content");
    }

    await db
      .delete(familyTreeMembers)
      .where(
        and(eq(familyTreeMembers.id, id), eq(familyTreeMembers.treeId, treeId)),
      );
  }

  // Family Tree Relationship methods
  async createFamilyTreeRelationship(
    relationship: InsertFamilyTreeRelationship,
  ): Promise<FamilyTreeRelationship> {
    const [newRelationship] = await db
      .insert(familyTreeRelationships)
      .values(relationship)
      .returning();
    return newRelationship;
  }

  async getFamilyTreeRelationships(
    treeId: string,
    userId: string,
  ): Promise<FamilyTreeRelationship[]> {
    // Validate tree ownership
    const [tree] = await db
      .select()
      .from(familyTrees)
      .where(eq(familyTrees.id, treeId));
    if (!this.validateContentOwnership(tree, userId)) {
      throw new Error("Unauthorized: You do not own this content");
    }

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
  ): Promise<FamilyTreeRelationship> {
    // Validate ownership via tree
    const [existing] = await db
      .select()
      .from(familyTreeRelationships)
      .where(eq(familyTreeRelationships.id, id));
    if (!existing) {
      throw new Error("Relationship not found");
    }

    const [tree] = await db
      .select()
      .from(familyTrees)
      .where(eq(familyTrees.id, existing.treeId));
    if (!this.validateContentOwnership(tree, userId)) {
      throw new Error("Unauthorized: You do not own this content");
    }

    const [updated] = await db
      .update(familyTreeRelationships)
      .set(updates)
      .where(eq(familyTreeRelationships.id, id))
      .returning();

    return updated;
  }

  async deleteFamilyTreeRelationship(
    id: string,
    userId: string,
    treeId: string,
  ): Promise<void> {
    // Validate ownership via tree
    const [tree] = await db
      .select()
      .from(familyTrees)
      .where(eq(familyTrees.id, treeId));
    if (!this.validateContentOwnership(tree, userId)) {
      throw new Error("Unauthorized: You do not own this content");
    }

    await db
      .delete(familyTreeRelationships)
      .where(
        and(
          eq(familyTreeRelationships.id, id),
          eq(familyTreeRelationships.treeId, treeId),
        ),
      );
  }
}
