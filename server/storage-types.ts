/**
 * Storage layer types and utilities
 *
 * This module defines:
 * - Error model for predictable error handling
 * - Pagination types for cursor-based pagination
 * - Mutation result types for consistent update/delete responses
 * - Options types for cancellation and transactions
 */

// ============================================================================
// Error Model
// ============================================================================

export type AppErrorCode =
  | "not_found"
  | "forbidden"
  | "conflict"
  | "invalid_input"
  | "internal_error"
  | "aborted";

export class AppError extends Error {
  constructor(
    public readonly code: AppErrorCode,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = "AppError";
  }

  static notFound(resource: string, id: string): AppError {
    return new AppError("not_found", `${resource} with id ${id} not found`);
  }

  static forbidden(message: string): AppError {
    return new AppError("forbidden", message);
  }

  static conflict(message: string): AppError {
    return new AppError("conflict", message);
  }

  static invalidInput(message: string, details?: unknown): AppError {
    return new AppError("invalid_input", message, details);
  }

  static aborted(message: string = "Operation aborted"): AppError {
    return new AppError("aborted", message);
  }
}

// ============================================================================
// Options Types
// ============================================================================

/**
 * Options for storage operations
 * - signal: AbortSignal for cancellation support
 * - tx: Future support for read-only transactions
 */
export interface StorageOptions {
  signal?: AbortSignal;
  // Future: tx?: Transaction;
}

// ============================================================================
// Pagination Types
// ============================================================================

/**
 * Cursor for keyset pagination
 * Encodes the position for stable pagination without offsets
 */
export interface Cursor {
  /** Base64-encoded cursor position */
  value: string;
}

/**
 * Pagination request parameters
 */
export interface PaginationParams {
  /** Number of items to return (default: 20, max: 100) */
  limit?: number;
  /** Cursor from previous page (omit for first page) */
  cursor?: Cursor;
}

/**
 * Paginated result with next cursor
 */
export interface PaginatedResult<T> {
  /** Items in current page */
  items: T[];
  /** Cursor for next page (undefined if no more items) */
  nextCursor?: Cursor;
  /** Total count (if available, may be expensive to compute) */
  totalCount?: number;
}

/**
 * Helper to create a cursor from a record
 * Implementations should encode stable sort keys (e.g., createdAt + id)
 *
 * Note: Uses Node.js Buffer for base64 encoding. This code is server-only
 * (in server/ directory) and does not run in browsers. For isomorphic code,
 * consider using btoa()/atob() or a universal base64 library.
 */
export function createCursor(sortKey: string | number, id: string): Cursor {
  const payload = JSON.stringify({ sortKey, id });
  return { value: Buffer.from(payload).toString("base64") };
}

/**
 * Helper to decode a cursor
 *
 * Note: Uses Node.js Buffer for base64 decoding. This code is server-only
 * (in server/ directory) and does not run in browsers. For isomorphic code,
 * consider using btoa()/atob() or a universal base64 library.
 */
export function decodeCursor(cursor: Cursor): {
  sortKey: string | number;
  id: string;
} {
  const payload = Buffer.from(cursor.value, "base64").toString();
  return JSON.parse(payload);
}

// ============================================================================
// Mutation Result Types
// ============================================================================

/**
 * Result of an update operation
 */
export interface UpdateResult<T> {
  /** Whether the record was updated */
  updated: boolean;
  /** The updated record (undefined if not found or not updated) */
  value?: T;
}

/**
 * Result of a delete operation
 */
export interface DeleteResult {
  /** Whether the record was deleted */
  deleted: boolean;
}

/**
 * Result of a create operation
 */
export interface CreateResult<T> {
  /** The created record */
  value: T;
}

// ============================================================================
// Search Result Types
// ============================================================================

/**
 * Base search result with discriminated type
 */
export type SearchResultBase = {
  /** Unique identifier */
  id: string;
  /** User who owns this content */
  userId: string;
  /** Notebook this content belongs to (null for global content) */
  notebookId: string | null;
  /** Name/title of the item */
  name: string;
  /** Optional description */
  description?: string | null;
};

/**
 * Discriminated union for search results
 * Each type corresponds to a content aggregate
 */
export type SearchResult =
  | (SearchResultBase & { kind: "character" })
  | (SearchResultBase & { kind: "plot" })
  | (SearchResultBase & { kind: "prompt" })
  | (SearchResultBase & { kind: "location" })
  | (SearchResultBase & { kind: "setting" })
  | (SearchResultBase & { kind: "item" })
  | (SearchResultBase & { kind: "organization" })
  | (SearchResultBase & { kind: "creature" })
  | (SearchResultBase & { kind: "species" })
  | (SearchResultBase & { kind: "culture" })
  | (SearchResultBase & { kind: "document" })
  | (SearchResultBase & { kind: "food" })
  | (SearchResultBase & { kind: "language" })
  | (SearchResultBase & { kind: "religion" })
  | (SearchResultBase & { kind: "technology" })
  | (SearchResultBase & { kind: "weapon" })
  | (SearchResultBase & { kind: "profession" })
  | (SearchResultBase & { kind: "rank" })
  | (SearchResultBase & { kind: "condition" })
  | (SearchResultBase & { kind: "plant" })
  | (SearchResultBase & { kind: "description" })
  | (SearchResultBase & { kind: "ethnicity" })
  | (SearchResultBase & { kind: "drink" })
  | (SearchResultBase & { kind: "armor" })
  | (SearchResultBase & { kind: "accessory" })
  | (SearchResultBase & { kind: "clothing" })
  | (SearchResultBase & { kind: "material" })
  | (SearchResultBase & { kind: "settlement" })
  | (SearchResultBase & { kind: "society" })
  | (SearchResultBase & { kind: "faction" })
  | (SearchResultBase & { kind: "military-unit" })
  | (SearchResultBase & { kind: "myth" })
  | (SearchResultBase & { kind: "legend" })
  | (SearchResultBase & { kind: "event" })
  | (SearchResultBase & { kind: "spell" })
  | (SearchResultBase & { kind: "resource" })
  | (SearchResultBase & { kind: "building" })
  | (SearchResultBase & { kind: "animal" })
  | (SearchResultBase & { kind: "transportation" })
  | (SearchResultBase & { kind: "natural-law" })
  | (SearchResultBase & { kind: "tradition" })
  | (SearchResultBase & { kind: "ritual" })
  | (SearchResultBase & { kind: "ceremony" })
  | (SearchResultBase & { kind: "map" })
  | (SearchResultBase & { kind: "music" })
  | (SearchResultBase & { kind: "dance" })
  | (SearchResultBase & { kind: "law" })
  | (SearchResultBase & { kind: "policy" })
  | (SearchResultBase & { kind: "potion" })
  | (SearchResultBase & { kind: "project" })
  | (SearchResultBase & { kind: "note" })
  | (SearchResultBase & { kind: "guide" });

// ============================================================================
// JSON Types
// ============================================================================

/**
 * Type-safe JSON value
 * Use this instead of 'any' for arbitrary JSON payloads
 */
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[];

/**
 * Helper to validate and narrow unknown to a specific shape
 * Throws AppError if validation fails
 */
export function validateShape<T>(
  value: unknown,
  validator: (v: unknown) => v is T,
  errorMessage: string,
): T {
  if (!validator(value)) {
    throw AppError.invalidInput(errorMessage, value);
  }
  return value;
}

/**
 * Type-safe helper for parsing saved item data
 *
 * Usage:
 * ```typescript
 * import { parseSavedItemData } from './storage-types';
 *
 * // Define a validator for your expected shape
 * interface CharacterData {
 *   name: string;
 *   level: number;
 * }
 *
 * function isCharacterData(value: unknown): value is CharacterData {
 *   return typeof value === 'object' &&
 *          value !== null &&
 *          'name' in value &&
 *          'level' in value &&
 *          typeof (value as any).name === 'string' &&
 *          typeof (value as any).level === 'number';
 * }
 *
 * // Use in your code
 * const savedItem = await storage.getSavedItem(...);
 * const data = parseSavedItemData(savedItem, isCharacterData);
 * console.log(data.name); // TypeScript knows this is a string
 * ```
 *
 * @param item - The saved item containing itemData
 * @param validator - Type guard function to validate the shape
 * @returns Typed item data
 * @throws AppError('invalid_input') if validation fails
 */
export function parseSavedItemData<T>(
  item: { itemData: unknown; itemType: string },
  validator: (v: unknown) => v is T,
): T {
  return validateShape(
    item.itemData,
    validator,
    `Invalid itemData for ${item.itemType}`,
  );
}

// ============================================================================
// Resource Identity Documentation
// ============================================================================

/**
 * Composite Identity Pattern
 *
 * Most content resources in WriteCraft use a composite identity:
 * - userId: The user who owns the content
 * - notebookId: The notebook the content belongs to (null for global/shared content)
 * - id: The unique identifier within the scope of (userId, notebookId)
 *
 * This pattern:
 * - Prevents accidental cross-tenant access
 * - Enables multi-tenant data isolation
 * - Supports both notebook-scoped and global content
 *
 * Example:
 * ```ts
 * getCharacter(id: string, userId: string, notebookId: string | null, opts?: StorageOptions)
 * updateCharacter(id: string, userId: string, notebookId: string | null, updates: UpdateCharacter, opts?: StorageOptions)
 * deleteCharacter(id: string, userId: string, notebookId: string | null, opts?: StorageOptions)
 * ```
 */
