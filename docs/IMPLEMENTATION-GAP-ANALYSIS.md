# Implementation Gap Analysis

This document identifies the gaps between the new storage interface patterns and the current implementations in `storage.facade.ts` and repository files.

## Status: ⚠️ Patterns Defined, Implementation Pending

The refactoring has completed **Phase 1: Foundation** successfully. However, the actual repository implementations have **not yet been updated** to follow the new patterns. This was intentional to avoid breaking changes, but it means there's work to be done to realize the benefits.

---

## Current State vs. Target State

### ✅ What's Complete (Phase 1)

1. **Type System**: All new types defined in `storage-types.ts`
2. **Documentation**: Complete migration guide with examples
3. **Domain Strategy**: 19 focused interfaces planned
4. **Example Interfaces**: `IUserStorage` and `ICharacterStorage` show target patterns
5. **No Breaking Changes**: Existing code continues to work

### ❌ What's Missing (Phases 2-4)

1. **Repository Implementations**: Repositories don't implement new patterns
2. **Structured Results**: Methods return raw entities, not `CreateResult`/`UpdateResult`/`DeleteResult`
3. **AbortSignal Support**: No cancellation checking in repositories
4. **Pagination**: No cursor-based pagination implementation
5. **Error Handling**: Throws generic `Error`, not `AppError` with codes
6. **Tenant Boundaries**: Inconsistent parameter order, some missing `notebookId`

---

## Detailed Gap Analysis

### 1. Character Repository Gaps

**File:** `server/repositories/character.repository.ts`

#### Gap 1.1: Method Signatures Don't Match New Interface

**Current:**
```typescript
async createCharacter(character: InsertCharacter): Promise<Character> {
  const [created] = await db.insert(characters).values(character).returning();
  return created;
}
```

**Target (from character.interface.ts):**
```typescript
createCharacter(
  character: InsertCharacter,
  opts?: StorageOptions
): Promise<CreateResult<Character>>;
```

**What's Missing:**
- ❌ No `opts?: StorageOptions` parameter
- ❌ Returns `Character` instead of `CreateResult<Character>`
- ❌ No AbortSignal checking
- ❌ Doesn't throw `AppError` on validation failures

**Fix:**
```typescript
async createCharacter(
  character: InsertCharacter,
  opts?: StorageOptions
): Promise<CreateResult<Character>> {
  // Check for cancellation
  if (opts?.signal?.aborted) {
    throw AppError.aborted();
  }

  // Validate input
  if (!character.userId || !character.name) {
    throw AppError.invalidInput('Character must have userId and name');
  }

  // Verify notebook ownership
  if (character.notebookId) {
    const notebook = await this.notebookRepository.getNotebook(
      character.notebookId,
      character.userId
    );
    if (!notebook) {
      throw AppError.forbidden('User does not own the specified notebook');
    }
  }

  const [created] = await db
    .insert(characters)
    .values(character)
    .returning();

  return { value: created };
}
```

#### Gap 1.2: getCharacter Doesn't Enforce Tenant Boundaries

**Current:**
```typescript
async getCharacter(
  id: string,
  userId: string,
  notebookId: string
): Promise<Character | undefined> {
  const [character] = await db
    .select()
    .from(characters)
    .where(
      and(
        eq(characters.id, id),
        eq(characters.userId, userId),
        eq(characters.notebookId, notebookId)
      )
    );
  return character || undefined;
}
```

**Target:**
```typescript
getCharacter(
  id: string,
  userId: string,
  notebookId: string | null,
  opts?: StorageOptions
): Promise<Character | undefined>;
```

**What's Missing:**
- ❌ `notebookId` should be `string | null` (allow global characters)
- ❌ No `opts?: StorageOptions` parameter
- ❌ No AbortSignal checking
- ❌ Doesn't handle `notebookId: null` case

**Fix:**
```typescript
async getCharacter(
  id: string,
  userId: string,
  notebookId: string | null,
  opts?: StorageOptions
): Promise<Character | undefined> {
  if (opts?.signal?.aborted) {
    throw AppError.aborted();
  }

  const conditions = [
    eq(characters.id, id),
    eq(characters.userId, userId),
  ];

  // If notebookId is specified, filter by it
  // If null, only return global characters (notebookId IS NULL)
  if (notebookId !== undefined) {
    conditions.push(
      notebookId === null
        ? isNull(characters.notebookId)
        : eq(characters.notebookId, notebookId)
    );
  }

  const [character] = await db
    .select()
    .from(characters)
    .where(and(...conditions));

  return character || undefined;
}
```

#### Gap 1.3: updateCharacter Doesn't Return Structured Result

**Current:**
```typescript
async updateCharacter(
  id: string,
  userId: string,
  updates: UpdateCharacter,
  notebookId: string
): Promise<Character> {
  const [updated] = await db
    .update(characters)
    .set({ ...updates, updatedAt: new Date() })
    .where(
      and(
        eq(characters.id, id),
        eq(characters.userId, userId),
        eq(characters.notebookId, notebookId)
      )
    )
    .returning();
  return updated;
}
```

**Target:**
```typescript
updateCharacter(
  id: string,
  userId: string,
  notebookId: string | null,
  updates: UpdateCharacter,
  opts?: StorageOptions
): Promise<UpdateResult<Character>>;
```

**What's Missing:**
- ❌ Parameter order wrong (`updates` before `notebookId`)
- ❌ Returns `Character` instead of `UpdateResult<Character>`
- ❌ No `opts?: StorageOptions`
- ❌ Doesn't indicate if update actually happened

**Fix:**
```typescript
async updateCharacter(
  id: string,
  userId: string,
  notebookId: string | null,
  updates: UpdateCharacter,
  opts?: StorageOptions
): Promise<UpdateResult<Character>> {
  if (opts?.signal?.aborted) {
    throw AppError.aborted();
  }

  const conditions = [
    eq(characters.id, id),
    eq(characters.userId, userId),
  ];

  if (notebookId !== undefined) {
    conditions.push(
      notebookId === null
        ? isNull(characters.notebookId)
        : eq(characters.notebookId, notebookId)
    );
  }

  const [updated] = await db
    .update(characters)
    .set({ ...updates, updatedAt: new Date() })
    .where(and(...conditions))
    .returning();

  if (!updated) {
    return { updated: false };
  }

  return { updated: true, value: updated };
}
```

#### Gap 1.4: getUserCharacters Doesn't Support Pagination

**Current:**
```typescript
async getUserCharacters(
  userId: string,
  notebookId: string
): Promise<Character[]> {
  return await db
    .select()
    .from(characters)
    .where(
      and(
        eq(characters.userId, userId),
        eq(characters.notebookId, notebookId)
      )
    )
    .orderBy(desc(characters.createdAt));
}
```

**Target:**
```typescript
getUserCharacters(
  userId: string,
  notebookId: string | null,
  pagination?: PaginationParams,
  opts?: StorageOptions
): Promise<PaginatedResult<Character>>;
```

**What's Missing:**
- ❌ Returns `Character[]` instead of `PaginatedResult<Character>`
- ❌ No pagination support
- ❌ No `opts?: StorageOptions`

**Fix:**
```typescript
async getUserCharacters(
  userId: string,
  notebookId: string | null,
  pagination?: PaginationParams,
  opts?: StorageOptions
): Promise<PaginatedResult<Character>> {
  if (opts?.signal?.aborted) {
    throw AppError.aborted();
  }

  const limit = Math.min(pagination?.limit || 20, 100);

  const conditions = [eq(characters.userId, userId)];

  if (notebookId !== undefined) {
    conditions.push(
      notebookId === null
        ? isNull(characters.notebookId)
        : eq(characters.notebookId, notebookId)
    );
  }

  let query = db
    .select()
    .from(characters)
    .where(and(...conditions))
    .orderBy(desc(characters.createdAt), desc(characters.id));

  // Apply cursor if provided
  if (pagination?.cursor) {
    const { sortKey, id } = decodeCursor(pagination.cursor);
    query = query.where(
      or(
        lt(characters.createdAt, new Date(sortKey as string)),
        and(
          eq(characters.createdAt, new Date(sortKey as string)),
          lt(characters.id, id)
        )
      )
    );
  }

  // Fetch limit + 1 to check if there are more results
  const items = await query.limit(limit + 1);

  const hasMore = items.length > limit;
  const results = hasMore ? items.slice(0, limit) : items;

  const nextCursor = hasMore
    ? createCursor(results[results.length - 1].createdAt.toISOString(), results[results.length - 1].id)
    : undefined;

  return {
    items: results,
    nextCursor,
  };
}
```

#### Gap 1.5: deleteCharacter Returns void Instead of DeleteResult

**Current:**
```typescript
async deleteCharacter(
  id: string,
  userId: string,
  notebookId: string
): Promise<void> {
  await db
    .delete(characters)
    .where(
      and(
        eq(characters.id, id),
        eq(characters.userId, userId),
        eq(characters.notebookId, notebookId)
      )
    );
}
```

**Target:**
```typescript
deleteCharacter(
  id: string,
  userId: string,
  notebookId: string | null,
  opts?: StorageOptions
): Promise<DeleteResult>;
```

**What's Missing:**
- ❌ Returns `void` instead of `DeleteResult`
- ❌ Can't tell if delete succeeded or record didn't exist
- ❌ No `opts?: StorageOptions`

**Fix:**
```typescript
async deleteCharacter(
  id: string,
  userId: string,
  notebookId: string | null,
  opts?: StorageOptions
): Promise<DeleteResult> {
  if (opts?.signal?.aborted) {
    throw AppError.aborted();
  }

  const conditions = [
    eq(characters.id, id),
    eq(characters.userId, userId),
  ];

  if (notebookId !== undefined) {
    conditions.push(
      notebookId === null
        ? isNull(characters.notebookId)
        : eq(characters.notebookId, notebookId)
    );
  }

  const result = await db
    .delete(characters)
    .where(and(...conditions))
    .returning();

  return { deleted: result.length > 0 };
}
```

---

### 2. Storage Facade Gaps

**File:** `server/repositories/storage.facade.ts`

#### Gap 2.1: Facade Doesn't Implement New Interface Signatures

The `StorageFacade` class currently implements the old `IStorage` interface. It needs to:

1. Update all method signatures to match new domain interfaces
2. Add `opts?: StorageOptions` to all methods
3. Return structured results (`CreateResult`, `UpdateResult`, `DeleteResult`)
4. Pass `opts` through to repository methods

**Example - User Methods:**

**Current:**
```typescript
async getUser(id: string): Promise<User | undefined> {
  return await this.userRepository.getUser(id);
}

async createUser(insertUser: InsertUser): Promise<User> {
  return await this.userRepository.createUser(insertUser);
}
```

**Target:**
```typescript
async getUser(id: string, opts?: StorageOptions): Promise<User | undefined> {
  return await this.userRepository.getUser(id, opts);
}

async createUser(insertUser: InsertUser, opts?: StorageOptions): Promise<CreateResult<User>> {
  return await this.userRepository.createUser(insertUser, opts);
}
```

#### Gap 2.2: Content Repository Delegation Doesn't Match Patterns

The facade delegates to `contentRepository` for most worldbuilding entities, but:

- Methods don't accept `opts?: StorageOptions`
- Methods don't return structured results
- No pagination support

**Example - Plot Methods:**

**Current:**
```typescript
async createPlot(plot: InsertPlot): Promise<Plot> {
  return await contentRepository.createPlot(plot);
}

async getUserPlots(userId: string, notebookId: string): Promise<Plot[]> {
  return await contentRepository.getUserPlots(userId, notebookId);
}
```

**Target:**
```typescript
async createPlot(plot: InsertPlot, opts?: StorageOptions): Promise<CreateResult<Plot>> {
  return await contentRepository.createPlot(plot, opts);
}

async getUserPlots(
  userId: string,
  notebookId: string | null,
  pagination?: PaginationParams,
  opts?: StorageOptions
): Promise<PaginatedResult<Plot>> {
  return await contentRepository.getUserPlots(userId, notebookId, pagination, opts);
}
```

---

### 3. Content Repository Gaps

**File:** `server/repositories/content.repository.ts`

The content repository (4,784 lines) handles 40+ entity types. Every single method needs:

- ✅ Add `opts?: StorageOptions` parameter
- ✅ Check `opts?.signal?.aborted` before queries
- ✅ Return structured results
- ✅ Support pagination for list methods
- ✅ Throw `AppError` instead of generic Error
- ✅ Handle `notebookId: null` for global content

**This is the largest scope of work** - approximately 200+ methods to update.

---

### 4. Search Repository Gaps

**File:** `server/repositories/search.repository.ts`

#### Gap 4.1: searchAllContent Returns any[]

**Current:**
```typescript
async searchAllContent(userId: string, query: string): Promise<any[]> {
  // ... searches across multiple tables
  return results; // array of any
}
```

**Target:**
```typescript
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

**What's Missing:**
- ❌ Returns `any[]` instead of `SearchResult[]`
- ❌ No filtering by notebookId or content kinds
- ❌ No pagination
- ❌ No structured result

---

## Priority Ranking for Implementation

### Phase 2: Prove the Pattern (Week 1)

**Priority 1: IUserStorage** (Low complexity, core functionality)
- Update `user.repository.ts` (~6 methods)
- Update facade delegation
- Write tests
- Validate pattern works end-to-end

**Priority 2: IFeedbackStorage** (Simple, isolated)
- Update feedback methods (~5 methods)
- Good practice for larger domains
- Low risk

### Phase 3: Medium Domains (Weeks 2-3)

**Priority 3: INotebookStorage**
- Update `notebook.repository.ts` (~10 methods)
- Critical for tenant boundaries

**Priority 4: ICharacterStorage**
- Update `character.repository.ts` (~25 methods)
- Validates aggregate pattern

**Priority 5: ISearchStorage**
- Update `search.repository.ts` (~2 methods)
- High impact (cross-cutting)

### Phase 4: Large Domains (Weeks 3-4)

**Priority 6: IContentOrganizationStorage**
- Saved items, pinned content

**Priority 7-18: Remaining Domains**
- Content repositories (Equipment, Consumables, etc.)
- Can be parallelized across team

### Phase 5: Refactor Facade

Once all domains updated:
- Refactor `StorageFacade` to extend domain interfaces
- Remove old signatures
- Clean up deprecated code

---

## Estimated Effort

| Task | Methods | Effort | Risk |
|------|---------|--------|------|
| User Repository | 8 | 1-2 days | Low |
| Feedback Repository | 5 | 1 day | Low |
| Notebook Repository | 12 | 2 days | Low |
| Character Repository | 25 | 3-4 days | Medium |
| Search Repository | 2 | 1 day | Low |
| Content Repository | 200+ | 2-3 weeks | High |
| Storage Facade Updates | All | 1 week | Medium |
| Route Handler Updates | All | 1 week | Medium |
| **TOTAL** | **~400** | **5-6 weeks** | - |

**With 2-3 developers working in parallel:** 2-3 weeks total

---

## Testing Strategy

For each repository update:

1. **Unit Tests**
   - Test AbortSignal cancellation
   - Test structured results (updated: true/false, deleted: true/false)
   - Test pagination cursors
   - Test AppError throwing

2. **Integration Tests**
   - Test tenant boundaries (can't access other user's data)
   - Test notebook isolation (can't access other notebook's data)
   - Test null notebookId (global content accessible)

3. **Performance Tests**
   - Test cursor pagination with large datasets
   - Test AbortSignal doesn't leak resources

---

## Backward Compatibility Strategy

To avoid breaking existing code during migration:

### Option A: Overload Methods (Temporary)

```typescript
// Old signature (deprecated)
async getCharacter(id: string, userId: string, notebookId: string): Promise<Character | undefined>;

// New signature
async getCharacter(
  id: string,
  userId: string,
  notebookId: string | null,
  opts?: StorageOptions
): Promise<Character | undefined>;
```

### Option B: Feature Flag

```typescript
const USE_NEW_STORAGE = process.env.NEW_STORAGE_ENABLED === 'true';

if (USE_NEW_STORAGE) {
  // Use new pattern
} else {
  // Use old pattern
}
```

### Option C: Gradual Migration (Recommended)

1. Update interface first
2. Update implementation to accept both signatures
3. Update all callers
4. Remove old signature

---

## Success Criteria

✅ **Phase 1: Foundation** - COMPLETE
- Type system in place
- Documentation complete
- Examples demonstrate patterns

⏳ **Phase 2: Validation** - NOT STARTED
- One domain (UserStorage) fully migrated
- All tests passing
- Pattern validated in production

⏳ **Phase 3: Migration** - NOT STARTED
- All repositories implement new patterns
- All facades delegate correctly
- All routes use new result types

⏳ **Phase 4: Cleanup** - NOT STARTED
- No `any` types remain
- No void returns on mutations
- Deprecated signatures removed
- 100% test coverage

---

## Next Steps

1. **Review this gap analysis** with the team
2. **Choose migration strategy** (gradual vs feature flag)
3. **Start with IUserStorage** (prove the pattern)
4. **Set up testing infrastructure** for new patterns
5. **Assign domains to developers** for parallel work
6. **Track progress** with project board/issues

---

## Questions to Resolve

1. **Breaking Changes:** Are we willing to update all route handlers simultaneously, or do we need backward compatibility?
2. **Timeline:** 2-3 weeks with full team, or 5-6 weeks incremental?
3. **Testing:** Should we write tests before or after implementation?
4. **Deployment:** Big bang or gradual rollout per domain?

---

**Recommendation:** Start with IUserStorage to prove the pattern (1-2 days), then proceed with gradual migration of remaining domains in parallel.
