import {
  type ImportJob,
  type InsertImportJob,
  type UpdateImportJob,
  importJobs,
} from "@shared/schema";
import { db } from "../db";
import { eq, desc, and, lt, or } from "drizzle-orm";
import { BaseRepository } from "./base.repository";
import {
  type StorageOptions,
  type CreateResult,
  type UpdateResult,
  type PaginationParams,
  type PaginatedResult,
  AppError,
  createCursor,
  decodeCursor,
} from "../storage-types";
import type { INotebookStorage } from "../storage-interfaces/notebook.interface";

export class ImportRepository extends BaseRepository implements Partial<INotebookStorage> {
  async createImportJob(
    job: InsertImportJob,
    opts?: StorageOptions,
  ): Promise<CreateResult<ImportJob>> {
    // Check for cancellation
    if (opts?.signal?.aborted) {
      throw AppError.aborted();
    }

    // Validate input
    if (!job.userId) {
      throw AppError.invalidInput('Import job must have userId');
    }

    const [newJob] = await db.insert(importJobs).values(job).returning();
    return { value: newJob };
  }

  async getImportJob(
    id: string,
    userId: string,
    opts?: StorageOptions,
  ): Promise<ImportJob | undefined> {
    // Check for cancellation
    if (opts?.signal?.aborted) {
      throw AppError.aborted();
    }

    const [job] = await db
      .select()
      .from(importJobs)
      .where(and(eq(importJobs.id, id), eq(importJobs.userId, userId)));
    return job || undefined;
  }

  async getUserImportJobs(
    userId: string,
    pagination?: PaginationParams,
    opts?: StorageOptions,
  ): Promise<PaginatedResult<ImportJob>> {
    // Check for cancellation
    if (opts?.signal?.aborted) {
      throw AppError.aborted();
    }

    const limit = Math.min(pagination?.limit || 20, 100);

    let query = db
      .select()
      .from(importJobs)
      .where(eq(importJobs.userId, userId))
      .orderBy(desc(importJobs.createdAt), desc(importJobs.id));

    // Apply cursor if provided
    if (pagination?.cursor) {
      const { sortKey, id } = decodeCursor(pagination.cursor);
      query = query.where(
        or(
          lt(importJobs.createdAt, new Date(sortKey as string)),
          and(
            eq(importJobs.createdAt, new Date(sortKey as string)),
            lt(importJobs.id, id)
          )
        )
      );
    }

    // Fetch limit + 1 to check if there are more results
    const items = await query.limit(limit + 1);

    const hasMore = items.length > limit;
    const results = hasMore ? items.slice(0, limit) : items;

    const nextCursor = hasMore && results.length > 0
      ? createCursor(
          results[results.length - 1].createdAt?.toISOString() || new Date().toISOString(),
          results[results.length - 1].id
        )
      : undefined;

    return {
      items: results,
      nextCursor,
    };
  }

  async updateImportJob(
    id: string,
    updates: UpdateImportJob,
    opts?: StorageOptions,
  ): Promise<UpdateResult<ImportJob>> {
    // Check for cancellation
    if (opts?.signal?.aborted) {
      throw AppError.aborted();
    }

    const [updatedJob] = await db
      .update(importJobs)
      .set(updates)
      .where(eq(importJobs.id, id))
      .returning();

    if (!updatedJob) {
      return { updated: false };
    }

    return { updated: true, value: updatedJob };
  }
}
