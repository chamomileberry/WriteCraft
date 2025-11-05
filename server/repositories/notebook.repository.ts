import {
  type Notebook,
  type InsertNotebook,
  type UpdateNotebook,
  notebooks,
  shares,
  users,
} from "@shared/schema";
import { db } from "../db";
import { eq, desc, and } from "drizzle-orm";
import { BaseRepository } from "./base.repository";

export class NotebookRepository extends BaseRepository {
  async createNotebook(notebook: InsertNotebook): Promise<Notebook> {
    const [newNotebook] = await db
      .insert(notebooks)
      .values(notebook)
      .returning();
    return newNotebook;
  }

  async getNotebook(id: string, userId: string): Promise<Notebook | undefined> {
    const [notebook] = await db
      .select()
      .from(notebooks)
      .where(and(eq(notebooks.id, id), eq(notebooks.userId, userId)));

    if (notebook) {
      return notebook;
    }

    const [sharedNotebook] = await db
      .select({
        notebook: notebooks,
      })
      .from(shares)
      .innerJoin(notebooks, eq(shares.resourceId, notebooks.id))
      .where(
        and(
          eq(shares.userId, userId),
          eq(shares.resourceType, "notebook"),
          eq(shares.resourceId, id),
        ),
      );

    return sharedNotebook?.notebook || undefined;
  }

  async getUserNotebooks(userId: string): Promise<Notebook[]> {
    const ownedNotebooks = await db
      .select()
      .from(notebooks)
      .where(eq(notebooks.userId, userId))
      .orderBy(desc(notebooks.createdAt));

    const sharedNotebooks = await db
      .select({
        notebook: notebooks,
        share: shares,
        owner: users,
      })
      .from(shares)
      .innerJoin(notebooks, eq(shares.resourceId, notebooks.id))
      .innerJoin(users, eq(notebooks.userId, users.id))
      .where(
        and(eq(shares.userId, userId), eq(shares.resourceType, "notebook")),
      );

    const ownedWithMetadata = ownedNotebooks.map((n) => ({
      ...n,
      isShared: false,
      sharedBy: null,
      sharePermission: null,
    }));

    const sharedWithMetadata = sharedNotebooks.map((s) => ({
      ...s.notebook,
      isShared: true,
      sharedBy: {
        id: s.owner.id,
        email: s.owner.email,
        firstName: s.owner.firstName,
        lastName: s.owner.lastName,
        profileImageUrl: s.owner.profileImageUrl,
      },
      sharePermission: s.share.permission,
    }));

    const allNotebooks = [...ownedWithMetadata, ...sharedWithMetadata];

    const uniqueNotebooks = Array.from(
      new Map(allNotebooks.map((n) => [n.id, n])).values(),
    ).sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });

    return uniqueNotebooks;
  }

  async updateNotebook(
    id: string,
    userId: string,
    updates: UpdateNotebook,
  ): Promise<Notebook | undefined> {
    const [updatedNotebook] = await db
      .update(notebooks)
      .set(updates)
      .where(and(eq(notebooks.id, id), eq(notebooks.userId, userId)))
      .returning();
    return updatedNotebook || undefined;
  }

  async deleteNotebook(id: string, userId: string): Promise<void> {
    const [existing] = await db
      .select()
      .from(notebooks)
      .where(eq(notebooks.id, id));
    if (!existing) {
      throw new Error("Notebook not found");
    }
    if (existing.userId !== userId) {
      throw new Error("Unauthorized: You do not own this notebook");
    }

    await db
      .delete(notebooks)
      .where(and(eq(notebooks.id, id), eq(notebooks.userId, userId)));
  }

  async validateNotebookOwnership(
    notebookId: string,
    userId: string,
  ): Promise<boolean> {
    const [notebook] = await db
      .select()
      .from(notebooks)
      .where(and(eq(notebooks.id, notebookId), eq(notebooks.userId, userId)))
      .limit(1);

    if (notebook) {
      return true;
    }

    return false;
  }
}
