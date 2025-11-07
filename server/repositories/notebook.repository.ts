import {
  type Notebook,
  type InsertNotebook,
  type UpdateNotebook,
  notebooks,
  shares,
  users,
} from "@shared/schema";
import { db } from "../db";
import { eq, desc, and, lt, or } from "drizzle-orm";
import { BaseRepository } from "./base.repository";
import {
  type StorageOptions,
  type CreateResult,
  type UpdateResult,
  type DeleteResult,
  type PaginationParams,
  type PaginatedResult,
  AppError,
  createCursor,
  decodeCursor,
} from "../storage-types";
import type { INotebookStorage } from "../storage-interfaces/notebook.interface";

export class NotebookRepository extends BaseRepository implements Partial<INotebookStorage> {
  async createNotebook(
    notebook: InsertNotebook,
    opts?: StorageOptions,
  ): Promise<CreateResult<Notebook>> {
    // Check for cancellation
    if (opts?.signal?.aborted) {
      throw AppError.aborted();
    }

    // Validate input
    if (!notebook.userId || !notebook.name) {
      throw AppError.invalidInput('Notebook must have userId and name');
    }

    const [newNotebook] = await db
      .insert(notebooks)
      .values(notebook)
      .returning();

    return { value: newNotebook };
  }

  async getNotebook(
    id: string,
    userId: string,
    opts?: StorageOptions,
  ): Promise<Notebook | undefined> {
    // Check for cancellation
    if (opts?.signal?.aborted) {
      throw AppError.aborted();
    }

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

  async getUserNotebooks(
    userId: string,
    pagination?: PaginationParams,
    opts?: StorageOptions,
  ): Promise<PaginatedResult<Notebook>> {
    // Check for cancellation
    if (opts?.signal?.aborted) {
      throw AppError.aborted();
    }

    const limit = Math.min(pagination?.limit || 20, 100);

    // Build owned notebooks query
    let ownedQuery = db
      .select()
      .from(notebooks)
      .where(eq(notebooks.userId, userId))
      .orderBy(desc(notebooks.createdAt), desc(notebooks.id));

    // Apply cursor if provided
    if (pagination?.cursor) {
      const { sortKey, id } = decodeCursor(pagination.cursor);
      ownedQuery = ownedQuery.where(
        or(
          lt(notebooks.createdAt, new Date(sortKey as string)),
          and(
            eq(notebooks.createdAt, new Date(sortKey as string)),
            lt(notebooks.id, id)
          )
        )
      );
    }

    const ownedNotebooks = await ownedQuery.limit(limit + 1);

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

    // Check if there are more results
    const hasMore = uniqueNotebooks.length > limit;
    const items = hasMore ? uniqueNotebooks.slice(0, limit) : uniqueNotebooks;

    // Only generate cursor if there are more items AND the last item has a valid createdAt
    let nextCursor: { value: string } | undefined = undefined;
    if (hasMore && items.length > 0) {
      const lastItem = items[items.length - 1];
      if (lastItem.createdAt) {
        nextCursor = createCursor(
          lastItem.createdAt.toISOString(),
          lastItem.id
        );
      } else {
        // Log warning if createdAt is missing - this shouldn't happen in normal operation
        console.warn(
          `[NotebookRepository] Cannot generate cursor: last item has null createdAt (id: ${lastItem.id})`
        );
      }
    }

    return {
      items,
      nextCursor,
    };
  }

  async updateNotebook(
    id: string,
    userId: string,
    updates: UpdateNotebook,
    opts?: StorageOptions,
  ): Promise<UpdateResult<Notebook>> {
    // Check for cancellation
    if (opts?.signal?.aborted) {
      throw AppError.aborted();
    }

    const [updatedNotebook] = await db
      .update(notebooks)
      .set(updates)
      .where(and(eq(notebooks.id, id), eq(notebooks.userId, userId)))
      .returning();

    if (!updatedNotebook) {
      return { updated: false };
    }

    return { updated: true, value: updatedNotebook };
  }

  async deleteNotebook(
    id: string,
    userId: string,
    opts?: StorageOptions,
  ): Promise<DeleteResult> {
    // Check for cancellation
    if (opts?.signal?.aborted) {
      throw AppError.aborted();
    }

    const [existing] = await db
      .select()
      .from(notebooks)
      .where(eq(notebooks.id, id));

    if (!existing) {
      return { deleted: false };
    }

    if (existing.userId !== userId) {
      throw AppError.forbidden("You do not own this notebook");
    }

    const result = await db
      .delete(notebooks)
      .where(and(eq(notebooks.id, id), eq(notebooks.userId, userId)))
      .returning();

    return { deleted: result.length > 0 };
  }

  async validateNotebookOwnership(
    notebookId: string,
    userId: string,
    opts?: StorageOptions,
  ): Promise<boolean> {
    // Check for cancellation
    if (opts?.signal?.aborted) {
      throw AppError.aborted();
    }

    const [notebook] = await db
      .select()
      .from(notebooks)
      .where(and(eq(notebooks.id, notebookId), eq(notebooks.userId, userId)))
      .limit(1);

    return !!notebook;
  }
}
