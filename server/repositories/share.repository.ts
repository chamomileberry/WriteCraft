import { db } from "../db";
import { eq, and, or, desc } from "drizzle-orm";
import {
  type Share,
  type InsertShare,
  shares,
  notebooks,
  projects,
  guides,
  users,
} from "@shared/schema";
import { BaseRepository } from "./base.repository";

export class ShareRepository extends BaseRepository {
  // Share methods
  async createShare(share: InsertShare): Promise<Share> {
    const [newShare] = await db.insert(shares).values(share).returning();
    return newShare;
  }

  async getShare(id: string, userId: string): Promise<Share | undefined> {
    const [share] = await db
      .select()
      .from(shares)
      .where(
        and(
          eq(shares.id, id),
          or(eq(shares.userId, userId), eq(shares.ownerId, userId)),
        ),
      );
    return share || undefined;
  }

  async getUserShares(userId: string): Promise<Share[]> {
    // Get shares created by the user (as owner)
    return await db
      .select()
      .from(shares)
      .where(eq(shares.ownerId, userId))
      .orderBy(desc(shares.createdAt));
  }

  async getSharedWithUser(userId: string): Promise<Share[]> {
    // Get shares where user is the recipient
    return await db
      .select()
      .from(shares)
      .where(eq(shares.userId, userId))
      .orderBy(desc(shares.createdAt));
  }

  async updateShare(
    id: string,
    userId: string,
    updates: Partial<InsertShare>,
  ): Promise<Share> {
    // Validate ownership - only the owner can update share permissions
    const [existing] = await db.select().from(shares).where(eq(shares.id, id));

    if (!existing) {
      throw new Error("Share not found");
    }

    if (existing.ownerId !== userId) {
      throw new Error(
        "Unauthorized: Only the owner can modify share permissions",
      );
    }

    const [updatedShare] = await db
      .update(shares)
      .set(updates)
      .where(eq(shares.id, id))
      .returning();

    return updatedShare;
  }

  async deleteShare(id: string, userId: string): Promise<void> {
    // Validate ownership - only the owner can delete shares
    const [existing] = await db.select().from(shares).where(eq(shares.id, id));

    if (!existing) {
      throw new Error("Share not found");
    }

    if (existing.ownerId !== userId) {
      throw new Error("Unauthorized: Only the owner can delete shares");
    }

    await db.delete(shares).where(eq(shares.id, id));
  }

  async validateShareAccess(
    userId: string,
    resourceType: string,
    resourceId: string,
  ): Promise<boolean> {
    // Check if user has access to shared resource
    const [share] = await db
      .select()
      .from(shares)
      .where(
        and(
          eq(shares.userId, userId),
          eq(shares.resourceType, resourceType),
          eq(shares.resourceId, resourceId),
        ),
      )
      .limit(1);

    return !!share;
  }

  async getShareByResource(
    userId: string,
    resourceType: string,
    resourceId: string,
  ): Promise<Share | undefined> {
    const [share] = await db
      .select()
      .from(shares)
      .where(
        and(
          eq(shares.userId, userId),
          eq(shares.resourceType, resourceType),
          eq(shares.resourceId, resourceId),
        ),
      )
      .limit(1);

    return share || undefined;
  }

  async getResourceShares(
    ownerId: string,
    resourceType: string,
    resourceId: string,
  ): Promise<Share[]> {
    // Get all shares for a specific resource by its owner
    return await db
      .select()
      .from(shares)
      .where(
        and(
          eq(shares.ownerId, ownerId),
          eq(shares.resourceType, resourceType),
          eq(shares.resourceId, resourceId),
        ),
      )
      .orderBy(desc(shares.createdAt));
  }
}
