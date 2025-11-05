import {
  type ImportJob,
  type InsertImportJob,
  type UpdateImportJob,
  importJobs,
} from "@shared/schema";
import { db } from "../db";
import { eq, desc, and } from "drizzle-orm";
import { BaseRepository } from "./base.repository";

export class ImportRepository extends BaseRepository {
  async createImportJob(job: InsertImportJob): Promise<ImportJob> {
    const [newJob] = await db.insert(importJobs).values(job).returning();
    return newJob;
  }

  async getImportJob(
    id: string,
    userId: string,
  ): Promise<ImportJob | undefined> {
    const [job] = await db
      .select()
      .from(importJobs)
      .where(and(eq(importJobs.id, id), eq(importJobs.userId, userId)));
    return job || undefined;
  }

  async getUserImportJobs(userId: string): Promise<ImportJob[]> {
    return await db
      .select()
      .from(importJobs)
      .where(eq(importJobs.userId, userId))
      .orderBy(desc(importJobs.createdAt));
  }

  async updateImportJob(
    id: string,
    updates: UpdateImportJob,
  ): Promise<ImportJob | undefined> {
    const [updatedJob] = await db
      .update(importJobs)
      .set(updates)
      .where(eq(importJobs.id, id))
      .returning();
    return updatedJob || undefined;
  }
}
