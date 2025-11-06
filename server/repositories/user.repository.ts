import {
  type User,
  type InsertUser,
  type UpsertUser,
  type UserPreferences,
  type InsertUserPreferences,
  users,
  userPreferences,
} from "@shared/schema";
import { db } from "../db";
import { eq, or, ilike, lt, and, desc } from "drizzle-orm";
import { BaseRepository } from "./base.repository";
import {
  AppError,
  type StorageOptions,
  type PaginationParams,
  type PaginatedResult,
  type CreateResult,
  type UpdateResult,
  createCursor,
  decodeCursor,
} from "../storage-types";
import type { IUserStorage } from "../storage-interfaces/user.interface";

export class UserRepository extends BaseRepository implements IUserStorage {
  // ============================================================================
  // User CRUD Operations
  // ============================================================================

  async getUser(id: string, opts?: StorageOptions): Promise<User | undefined> {
    if (opts?.signal?.aborted) {
      throw AppError.aborted();
    }

    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(
    username: string,
    opts?: StorageOptions,
  ): Promise<User | undefined> {
    if (opts?.signal?.aborted) {
      throw AppError.aborted();
    }

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, username));
    return user || undefined;
  }

  async createUser(
    insertUser: InsertUser,
    opts?: StorageOptions,
  ): Promise<CreateResult<User>> {
    if (opts?.signal?.aborted) {
      throw AppError.aborted();
    }

    // Validate input
    if (!insertUser.email) {
      throw AppError.invalidInput("User must have an email");
    }

    try {
      const [user] = await db.insert(users).values(insertUser).returning();
      return { value: user };
    } catch (error: any) {
      // Handle unique constraint violation
      if (error?.code === "23505") {
        throw AppError.conflict(`User with email ${insertUser.email} already exists`);
      }
      throw error;
    }
  }

  async upsertUser(
    userData: UpsertUser,
    opts?: StorageOptions,
  ): Promise<User> {
    if (opts?.signal?.aborted) {
      throw AppError.aborted();
    }

    if (!userData.email) {
      throw AppError.invalidInput("User must have an email");
    }

    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.email,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUser(
    id: string,
    updates: Partial<InsertUser>,
    opts?: StorageOptions,
  ): Promise<UpdateResult<User>> {
    if (opts?.signal?.aborted) {
      throw AppError.aborted();
    }

    const [updatedUser] = await db
      .update(users)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();

    if (!updatedUser) {
      return { updated: false };
    }

    return { updated: true, value: updatedUser };
  }

  async searchUsers(
    query: string,
    pagination?: PaginationParams,
    opts?: StorageOptions,
  ): Promise<PaginatedResult<User>> {
    if (opts?.signal?.aborted) {
      throw AppError.aborted();
    }

    const limit = Math.min(pagination?.limit || 20, 100);
    const searchPattern = `%${query.toLowerCase()}%`;

    let dbQuery = db
      .select()
      .from(users)
      .where(
        or(
          ilike(users.email, searchPattern),
          ilike(users.firstName, searchPattern),
          ilike(users.lastName, searchPattern),
        ),
      )
      .orderBy(desc(users.createdAt), desc(users.id));

    // Apply cursor if provided
    if (pagination?.cursor) {
      const { sortKey, id } = decodeCursor(pagination.cursor);
      dbQuery = dbQuery.where(
        or(
          lt(users.createdAt, new Date(sortKey as string)),
          and(
            eq(users.createdAt, new Date(sortKey as string)),
            lt(users.id, id),
          ),
        ),
      ) as any;
    }

    // Fetch limit + 1 to check if there are more results
    const items = await dbQuery.limit(limit + 1);

    const hasMore = items.length > limit;
    const results = hasMore ? items.slice(0, limit) : items;

    const nextCursor =
      hasMore && results.length > 0
        ? createCursor(
            results[results.length - 1].createdAt!.toISOString(),
            results[results.length - 1].id,
          )
        : undefined;

    return {
      items: results,
      nextCursor,
    };
  }

  // ============================================================================
  // User Preferences Operations
  // ============================================================================

  async getUserPreferences(
    userId: string,
    opts?: StorageOptions,
  ): Promise<UserPreferences | undefined> {
    if (opts?.signal?.aborted) {
      throw AppError.aborted();
    }

    const [prefs] = await db
      .select()
      .from(userPreferences)
      .where(eq(userPreferences.userId, userId));
    return prefs || undefined;
  }

  async upsertUserPreferences(
    userId: string,
    preferences: Partial<InsertUserPreferences>,
    opts?: StorageOptions,
  ): Promise<UserPreferences> {
    if (opts?.signal?.aborted) {
      throw AppError.aborted();
    }

    const [result] = await db
      .insert(userPreferences)
      .values({ ...preferences, userId })
      .onConflictDoUpdate({
        target: userPreferences.userId,
        set: { ...preferences, updatedAt: new Date() },
      })
      .returning();

    return result;
  }
}
