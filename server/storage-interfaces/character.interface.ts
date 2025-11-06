/**
 * Character Storage Interface
 *
 * Manages characters and their family relationships.
 *
 * Composite Identity: (id, userId, notebookId)
 * - userId: The user who owns the content
 * - notebookId: The notebook the content belongs to (null for global/shared)
 * - id: Unique identifier within the scope of (userId, notebookId)
 *
 * This interface demonstrates the aggregate pattern:
 * - Character (root entity)
 * - FamilyTree (contains members and relationships)
 * - FamilyTreeMember (nodes in the tree)
 * - FamilyTreeRelationship (edges in the tree)
 */

import type {
  Character,
  InsertCharacter,
  UpdateCharacter,
  FamilyTree,
  InsertFamilyTree,
  FamilyTreeMember,
  InsertFamilyTreeMember,
  FamilyTreeRelationship,
  InsertFamilyTreeRelationship,
} from "@shared/schema";
import type {
  StorageOptions,
  PaginationParams,
  PaginatedResult,
  CreateResult,
  UpdateResult,
  DeleteResult,
} from "../storage-types";

export interface ICharacterStorage {
  // ============================================================================
  // Character CRUD Operations
  // ============================================================================

  /**
   * Create a new character
   *
   * @param character - Character data to insert
   * @param opts - Storage options
   * @returns Created character wrapped in CreateResult
   * @throws AppError('invalid_input') if character data is invalid
   * @throws AppError('forbidden') if user doesn't own the notebook
   */
  createCharacter(
    character: InsertCharacter,
    opts?: StorageOptions,
  ): Promise<CreateResult<Character>>;

  /**
   * Get a character by ID
   *
   * Enforces tenant boundaries: character must belong to (userId, notebookId).
   *
   * @param id - Character identifier
   * @param userId - User who owns the character
   * @param notebookId - Notebook containing the character (null for global)
   * @param opts - Storage options
   * @returns Character record or undefined if not found/forbidden
   */
  getCharacter(
    id: string,
    userId: string,
    notebookId: string | null,
    opts?: StorageOptions,
  ): Promise<Character | undefined>;

  /**
   * Get all characters for a user's notebook
   *
   * @param userId - User identifier
   * @param notebookId - Notebook identifier (null for global characters)
   * @param pagination - Pagination parameters (cursor-based)
   * @param opts - Storage options
   * @returns Paginated list of characters
   */
  getUserCharacters(
    userId: string,
    notebookId: string | null,
    pagination?: PaginationParams,
    opts?: StorageOptions,
  ): Promise<PaginatedResult<Character>>;

  /**
   * Update a character
   *
   * Enforces tenant boundaries: only owner can update.
   *
   * @param id - Character identifier
   * @param userId - User who owns the character
   * @param notebookId - Notebook containing the character
   * @param updates - Partial character data to update
   * @param opts - Storage options
   * @returns Update result with updated flag and value
   * @throws AppError('not_found') if character doesn't exist
   * @throws AppError('forbidden') if user doesn't own the character
   */
  updateCharacter(
    id: string,
    userId: string,
    notebookId: string | null,
    updates: UpdateCharacter,
    opts?: StorageOptions,
  ): Promise<UpdateResult<Character>>;

  /**
   * Delete a character
   *
   * Also deletes associated family tree relationships.
   *
   * @param id - Character identifier
   * @param userId - User who owns the character
   * @param notebookId - Notebook containing the character
   * @param opts - Storage options
   * @returns Delete result with deleted flag
   * @throws AppError('forbidden') if user doesn't own the character
   */
  deleteCharacter(
    id: string,
    userId: string,
    notebookId: string | null,
    opts?: StorageOptions,
  ): Promise<DeleteResult>;

  // ============================================================================
  // Character Specialized Queries
  // ============================================================================

  /**
   * Get characters with incomplete data
   *
   * Useful for showing users what needs attention.
   *
   * @param userId - User identifier
   * @param notebookId - Notebook identifier
   * @param opts - Storage options
   * @returns Characters grouped by issue type
   */
  getCharactersWithIssues(
    userId: string,
    notebookId: string | null,
    opts?: StorageOptions,
  ): Promise<{
    missingFamilyName: Character[];
    missingDescription: Character[];
    missingImage: Character[];
  }>;

  /**
   * Get potential duplicate characters
   *
   * Finds characters with similar names that might be duplicates.
   *
   * @param userId - User identifier
   * @param notebookId - Notebook identifier
   * @param opts - Storage options
   * @returns Arrays of potentially duplicate character groups
   */
  getPotentialDuplicates(
    userId: string,
    notebookId: string | null,
    opts?: StorageOptions,
  ): Promise<Character[][]>;

  // ============================================================================
  // Family Tree CRUD Operations
  // ============================================================================

  /**
   * Create a new family tree
   *
   * @param familyTree - Family tree data to insert
   * @param opts - Storage options
   * @returns Created family tree wrapped in CreateResult
   */
  createFamilyTree(
    familyTree: InsertFamilyTree,
    opts?: StorageOptions,
  ): Promise<CreateResult<FamilyTree>>;

  /**
   * Get a family tree by ID
   *
   * @param id - Family tree identifier
   * @param userId - User who owns the tree
   * @param notebookId - Notebook containing the tree
   * @param opts - Storage options
   * @returns Family tree record or undefined
   */
  getFamilyTree(
    id: string,
    userId: string,
    notebookId: string | null,
    opts?: StorageOptions,
  ): Promise<FamilyTree | undefined>;

  /**
   * Get all family trees for a user's notebook
   *
   * @param userId - User identifier
   * @param notebookId - Notebook identifier
   * @param pagination - Pagination parameters
   * @param opts - Storage options
   * @returns Paginated list of family trees
   */
  getUserFamilyTrees(
    userId: string,
    notebookId: string | null,
    pagination?: PaginationParams,
    opts?: StorageOptions,
  ): Promise<PaginatedResult<FamilyTree>>;

  /**
   * Update a family tree
   *
   * @param id - Family tree identifier
   * @param userId - User who owns the tree
   * @param notebookId - Notebook containing the tree
   * @param updates - Partial family tree data
   * @param opts - Storage options
   * @returns Update result
   */
  updateFamilyTree(
    id: string,
    userId: string,
    notebookId: string | null,
    updates: Partial<InsertFamilyTree>,
    opts?: StorageOptions,
  ): Promise<UpdateResult<FamilyTree>>;

  /**
   * Delete a family tree
   *
   * Also deletes all members and relationships.
   *
   * @param id - Family tree identifier
   * @param userId - User who owns the tree
   * @param notebookId - Notebook containing the tree
   * @param opts - Storage options
   * @returns Delete result
   */
  deleteFamilyTree(
    id: string,
    userId: string,
    notebookId: string | null,
    opts?: StorageOptions,
  ): Promise<DeleteResult>;

  // ============================================================================
  // Family Tree Member Operations
  // ============================================================================

  /**
   * Create a family tree member
   *
   * @param member - Member data to insert (includes treeId)
   * @param opts - Storage options
   * @returns Created member wrapped in CreateResult
   * @throws AppError('forbidden') if user doesn't own the family tree
   */
  createFamilyTreeMember(
    member: InsertFamilyTreeMember,
    opts?: StorageOptions,
  ): Promise<CreateResult<FamilyTreeMember>>;

  /**
   * Get all members of a family tree
   *
   * @param treeId - Family tree identifier
   * @param userId - User who owns the tree
   * @param opts - Storage options
   * @returns Array of family tree members
   */
  getFamilyTreeMembers(
    treeId: string,
    userId: string,
    opts?: StorageOptions,
  ): Promise<FamilyTreeMember[]>;

  /**
   * Update a family tree member
   *
   * @param id - Member identifier
   * @param userId - User who owns the tree
   * @param updates - Partial member data
   * @param opts - Storage options
   * @returns Update result
   */
  updateFamilyTreeMember(
    id: string,
    userId: string,
    updates: Partial<InsertFamilyTreeMember>,
    opts?: StorageOptions,
  ): Promise<UpdateResult<FamilyTreeMember>>;

  /**
   * Delete a family tree member
   *
   * Also deletes relationships involving this member.
   *
   * @param id - Member identifier
   * @param userId - User who owns the tree
   * @param treeId - Family tree identifier (for validation)
   * @param opts - Storage options
   * @returns Delete result
   */
  deleteFamilyTreeMember(
    id: string,
    userId: string,
    treeId: string,
    opts?: StorageOptions,
  ): Promise<DeleteResult>;

  // ============================================================================
  // Family Tree Relationship Operations
  // ============================================================================

  /**
   * Create a relationship between two family members
   *
   * Implementation Requirements:
   * - MUST validate that fromMemberId and toMemberId exist in the same family tree
   * - MUST validate that the relationship doesn't create a cycle (e.g., person can't be their own ancestor)
   * - MUST validate that relationship type is valid for the context
   * - SHOULD check for duplicate relationships
   *
   * @param relationship - Relationship data (fromMemberId, toMemberId, type)
   * @param opts - Storage options
   * @returns Created relationship wrapped in CreateResult
   * @throws AppError('invalid_input') if relationship creates a cycle or is invalid
   * @throws AppError('not_found') if either member doesn't exist
   * @throws AppError('conflict') if relationship already exists
   */
  createFamilyTreeRelationship(
    relationship: InsertFamilyTreeRelationship,
    opts?: StorageOptions,
  ): Promise<CreateResult<FamilyTreeRelationship>>;

  /**
   * Get all relationships in a family tree
   *
   * @param treeId - Family tree identifier
   * @param userId - User who owns the tree
   * @param opts - Storage options
   * @returns Array of relationships
   */
  getFamilyTreeRelationships(
    treeId: string,
    userId: string,
    opts?: StorageOptions,
  ): Promise<FamilyTreeRelationship[]>;

  /**
   * Update a family tree relationship
   *
   * @param id - Relationship identifier
   * @param userId - User who owns the tree
   * @param updates - Partial relationship data
   * @param opts - Storage options
   * @returns Update result
   */
  updateFamilyTreeRelationship(
    id: string,
    userId: string,
    updates: Partial<InsertFamilyTreeRelationship>,
    opts?: StorageOptions,
  ): Promise<UpdateResult<FamilyTreeRelationship>>;

  /**
   * Delete a family tree relationship
   *
   * @param id - Relationship identifier
   * @param userId - User who owns the tree
   * @param treeId - Family tree identifier (for validation)
   * @param opts - Storage options
   * @returns Delete result
   */
  deleteFamilyTreeRelationship(
    id: string,
    userId: string,
    treeId: string,
    opts?: StorageOptions,
  ): Promise<DeleteResult>;
}
