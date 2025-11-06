# IStorage Interface Improvements

This document demonstrates the high-impact improvements to the IStorage interface.

## Principles Applied

1. **Tenant boundaries in signatures**: Consistent (id, userId, notebookId?, updates?, opts?)
2. **Cancellation support**: All methods accept `opts?: StorageOptions` with AbortSignal
3. **No 'any' types**: Use Json, unknown, or discriminated unions
4. **Cursor-based pagination**: List methods return `PaginatedResult<T>`
5. **Consistent mutation results**: Updates/deletes return structured results
6. **Domain separation**: Split into focused interfaces that compose

## Example: Character Aggregate

### Before
```typescript
// Inconsistent parameter order, no cancellation, void returns
createCharacter(character: InsertCharacter): Promise<Character>;
getCharacter(id: string, userId: string, notebookId: string): Promise<Character | undefined>;
getUserCharacters(userId: string, notebookId: string): Promise<Character[]>;
updateCharacter(id: string, userId: string, updates: UpdateCharacter, notebookId: string): Promise<Character>;
deleteCharacter(id: string, userId: string, notebookId: string): Promise<void>;
```

### After
```typescript
// Consistent order, AbortSignal, structured returns, pagination
createCharacter(
  character: InsertCharacter,
  opts?: StorageOptions
): Promise<CreateResult<Character>>;

getCharacter(
  id: string,
  userId: string,
  notebookId: string | null,
  opts?: StorageOptions
): Promise<Character | undefined>;

getUserCharacters(
  userId: string,
  notebookId: string | null,
  pagination?: PaginationParams,
  opts?: StorageOptions
): Promise<PaginatedResult<Character>>;

updateCharacter(
  id: string,
  userId: string,
  notebookId: string | null,
  updates: UpdateCharacter,
  opts?: StorageOptions
): Promise<UpdateResult<Character>>;

deleteCharacter(
  id: string,
  userId: string,
  notebookId: string | null,
  opts?: StorageOptions
): Promise<DeleteResult>;

// Specialized queries remain but follow pattern
getCharactersWithIssues(
  userId: string,
  notebookId: string | null,
  opts?: StorageOptions
): Promise<{
  missingFamilyName: Character[];
  missingDescription: Character[];
  missingImage: Character[];
}>;

getPotentialDuplicates(
  userId: string,
  notebookId: string | null,
  opts?: StorageOptions
): Promise<Character[][]>;
```

## Fixing 'any' Types

### 1. Magic System (if not implemented)

**Before:**
```typescript
createMagic(): Promise<any>;
getMagic(id: string): Promise<any | undefined>;
getUserMagic(userId: string, notebookId: string): Promise<any[]>;
updateMagic(id: string, userId: string, updates: any): Promise<any>;
```

**Option A - Remove if not implemented:**
```typescript
// Remove these methods entirely
```

**Option B - Implement with proper types:**
```typescript
// Add to schema first
type MagicSystem = {
  id: string;
  userId: string;
  notebookId: string | null;
  name: string;
  description: string | null;
  rules: Json;
  createdAt: Date;
  updatedAt: Date;
};

type InsertMagicSystem = Omit<MagicSystem, 'id' | 'createdAt' | 'updatedAt'>;

createMagicSystem(
  magic: InsertMagicSystem,
  opts?: StorageOptions
): Promise<CreateResult<MagicSystem>>;

getMagicSystem(
  id: string,
  userId: string,
  notebookId: string | null,
  opts?: StorageOptions
): Promise<MagicSystem | undefined>;

getUserMagicSystems(
  userId: string,
  notebookId: string | null,
  pagination?: PaginationParams,
  opts?: StorageOptions
): Promise<PaginatedResult<MagicSystem>>;

updateMagicSystem(
  id: string,
  userId: string,
  notebookId: string | null,
  updates: Partial<InsertMagicSystem>,
  opts?: StorageOptions
): Promise<UpdateResult<MagicSystem>>;
```

### 2. Saved Items itemData

**Before:**
```typescript
updateSavedItemData(
  savedItemId: string,
  userId: string,
  itemData: any,
): Promise<SavedItem | undefined>;
```

**After:**
```typescript
import { Json } from './storage-types';

updateSavedItemData(
  savedItemId: string,
  userId: string,
  itemData: Json,
  opts?: StorageOptions
): Promise<UpdateResult<SavedItem>>;

// Helper for type-safe item data access
function parseSavedItemData<T>(
  item: SavedItem,
  validator: (v: unknown) => v is T
): T {
  return validateShape(item.itemData, validator, `Invalid itemData for ${item.itemType}`);
}
```

### 3. Universal Search

**Before:**
```typescript
searchAllContent(userId: string, query: string): Promise<any[]>;
```

**After:**
```typescript
import { SearchResult, PaginatedResult, PaginationParams, StorageOptions } from './storage-types';

searchAllContent(
  userId: string,
  query: string,
  filters?: {
    notebookId?: string | null;
    kinds?: SearchResult['kind'][];
  },
  pagination?: PaginationParams,
  opts?: StorageOptions
): Promise<PaginatedResult<SearchResult>>;
```

**Usage example:**
```typescript
const results = await storage.searchAllContent(userId, "dragon", { kinds: ["creature", "character"] });

results.items.forEach(result => {
  switch (result.kind) {
    case "creature":
      // TypeScript knows this is a creature
      console.log(`Creature: ${result.name}`);
      break;
    case "character":
      // TypeScript knows this is a character
      console.log(`Character: ${result.name}`);
      break;
  }
});
```

## Random Selection Pattern

### Before
```typescript
interface IStorage {
  getRandomPrompts(count?: number): Promise<Prompt[]>;
}
```

### After

**Storage layer (deterministic only):**
```typescript
interface IPromptStorage {
  // Remove getRandomPrompts entirely from storage
  // Add count method for service layer
  getPromptCount(
    filters?: { userId?: string; notebookId?: string | null },
    opts?: StorageOptions
  ): Promise<number>;

  getUserPrompts(
    userId: string,
    notebookId: string | null,
    pagination?: PaginationParams,
    opts?: StorageOptions
  ): Promise<PaginatedResult<Prompt>>;
}
```

**Service layer (business logic):**
```typescript
// server/services/prompt.service.ts
export class PromptService {
  constructor(private storage: IStorage) {}

  async getRandomPrompts(
    count: number = 5,
    filters?: { userId?: string; notebookId?: string | null }
  ): Promise<Prompt[]> {
    // Strategy 1: Reservoir sampling
    // Strategy 2: Pre-selected pools
    // Strategy 3: Random offset (simple but not ideal for large sets)

    const total = await this.storage.getPromptCount(filters);
    if (total === 0) return [];

    const randomOffsets = Array.from(
      { length: Math.min(count, total) },
      () => Math.floor(Math.random() * total)
    ).sort((a, b) => a - b);

    // Fetch specific items by offset
    // (This is simplified; real implementation would batch)
    const prompts: Prompt[] = [];
    for (const offset of randomOffsets) {
      // Use cursor-based pagination with calculated position
      // This is a placeholder - actual implementation depends on your needs
    }

    return prompts;
  }
}
```

## Content Ownership Validation

### Before
```typescript
validateContentOwnership<T extends { userId?: string | null; notebookId?: string | null }>(
  content: T | undefined,
  userId: string,
): boolean;
```

### After
```typescript
/**
 * Validates that content belongs to the specified user and notebook.
 *
 * Rules:
 * - Always checks userId
 * - If notebookId is provided and content.notebookId is not null, they must match
 * - Global content (content.notebookId === null) can be accessed from any notebook
 * - Returns false if content is undefined
 *
 * @throws AppError with code 'forbidden' if validation fails
 */
validateContentOwnership<T extends { userId?: string | null; notebookId?: string | null }>(
  content: T | undefined,
  userId: string,
  notebookId?: string | null,
): boolean;
```

**Implementation:**
```typescript
validateContentOwnership<T extends { userId?: string | null; notebookId?: string | null }>(
  content: T | undefined,
  userId: string,
  notebookId?: string | null,
): boolean {
  if (!content) return false;

  // Check user ownership
  if (content.userId !== userId) {
    throw AppError.forbidden(`Content does not belong to user ${userId}`);
  }

  // Check notebook scope if both are specified and content is notebook-scoped
  if (
    notebookId !== undefined &&
    content.notebookId !== null &&
    content.notebookId !== notebookId
  ) {
    throw AppError.forbidden(
      `Content belongs to notebook ${content.notebookId}, not ${notebookId}`
    );
  }

  return true;
}
```

## Domain Interface Split

Instead of one massive IStorage interface, compose from focused interfaces:

```typescript
// server/storage-interfaces/user.interface.ts
export interface IUserStorage {
  getUser(id: string, opts?: StorageOptions): Promise<User | undefined>;
  getUserByUsername(username: string, opts?: StorageOptions): Promise<User | undefined>;
  createUser(insertUser: InsertUser, opts?: StorageOptions): Promise<CreateResult<User>>;
  upsertUser(user: UpsertUser, opts?: StorageOptions): Promise<User>;
  updateUser(id: string, updates: Partial<InsertUser>, opts?: StorageOptions): Promise<UpdateResult<User>>;
  searchUsers(query: string, pagination?: PaginationParams, opts?: StorageOptions): Promise<PaginatedResult<User>>;
}

// server/storage-interfaces/character.interface.ts
export interface ICharacterStorage {
  createCharacter(character: InsertCharacter, opts?: StorageOptions): Promise<CreateResult<Character>>;
  getCharacter(id: string, userId: string, notebookId: string | null, opts?: StorageOptions): Promise<Character | undefined>;
  getUserCharacters(userId: string, notebookId: string | null, pagination?: PaginationParams, opts?: StorageOptions): Promise<PaginatedResult<Character>>;
  updateCharacter(id: string, userId: string, notebookId: string | null, updates: UpdateCharacter, opts?: StorageOptions): Promise<UpdateResult<Character>>;
  deleteCharacter(id: string, userId: string, notebookId: string | null, opts?: StorageOptions): Promise<DeleteResult>;
  getCharactersWithIssues(userId: string, notebookId: string | null, opts?: StorageOptions): Promise<{
    missingFamilyName: Character[];
    missingDescription: Character[];
    missingImage: Character[];
  }>;
  getPotentialDuplicates(userId: string, notebookId: string | null, opts?: StorageOptions): Promise<Character[][]>;
}

// Compose main interface
export interface IStorage extends
  IUserStorage,
  INotebookStorage,
  ICharacterStorage,
  IPlotStorage,
  IPromptStorage,
  ILocationStorage,
  // ... other domain interfaces
  ISearchStorage {
  // Only methods that don't fit a specific domain go here
  validateContentOwnership<T extends { userId?: string | null; notebookId?: string | null }>(
    content: T | undefined,
    userId: string,
    notebookId?: string | null,
  ): boolean;
}
```

## Migration Strategy

Given the scope of these changes, here's a phased approach:

### Phase 1: Add types (non-breaking)
1. Create `storage-types.ts` ✅
2. Export new types from `storage.ts`
3. Add new types to existing methods as optional

### Phase 2: Update interface signatures
1. Update method signatures one domain at a time
2. Keep old signatures as deprecated overloads temporarily
3. Update StorageFacade to match new signatures

### Phase 3: Update repositories
1. Update each repository to implement new signatures
2. Add AbortSignal checking
3. Add pagination support
4. Return structured results

### Phase 4: Update callers
1. Update routes to use new result types
2. Add cancellation signals in long operations
3. Use pagination in list endpoints
4. Handle AppError in error middleware

### Phase 5: Remove deprecated code
1. Remove old signatures
2. Remove any type assertions
3. Celebrate! 🎉

## Testing Checklist

- [ ] Compilation fails if signal is omitted from implementation
- [ ] Deleting character in notebook A doesn't affect notebook B
- [ ] searchAllContent narrows on `kind` without type assertions
- [ ] Chat list can paginate with cursor
- [ ] PromptService handles random selection, not storage
- [ ] Cross-notebook mutation throws AppError("forbidden")
- [ ] AbortController.abort() cancels in-flight queries
- [ ] UpdateResult.updated === false for no-op updates
- [ ] DeleteResult.deleted === false for already-deleted items
