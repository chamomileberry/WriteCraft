# Storage Refactoring: Completed vs Remaining Tasks

**Last Updated:** 2025-11-09
**Overall Progress:** 20% Complete (Phase 1 ✅, Phase 2 80% ✅)

---

## ✅ COMPLETED TASKS

### Phase 1: Foundation (100% Complete)

#### 1. Type System ✅
- ✅ Created `server/storage-types.ts` with all foundational types
  - `AppError` class with typed error codes
  - `StorageOptions` interface with AbortSignal
  - Cursor-based pagination types (`PaginationParams`, `PaginatedResult`, `Cursor`)
  - Mutation result types (`CreateResult`, `UpdateResult`, `DeleteResult`)
  - `SearchResult` discriminated union (50+ content types)
  - `Json` type for type-safe JSON handling
  - Helper functions (`createCursor`, `decodeCursor`, `validateShape`)

#### 2. Documentation ✅
- ✅ Created `STORAGE-REFACTORING-SUMMARY.md` - Complete overview of refactoring
- ✅ Created `server/storage-interface-improvements.md` - Migration guide with examples
- ✅ Created `server/storage-domain-grouping.md` - Domain consolidation strategy (82 → 19 interfaces)
- ✅ Created `IMPLEMENTATION-GAP-ANALYSIS.md` - Detailed gap analysis

#### 3. Planning ✅
- ✅ Defined 19 domain interfaces to replace monolithic IStorage
- ✅ Created file organization structure
- ✅ Documented migration strategy
- ✅ Created testing checklist

---

### Phase 2: Validation (80% Complete)

#### 4. IUserStorage - Fully Implemented ✅
**Interface:** `server/storage-interfaces/user.interface.ts`
**Repository:** `server/repositories/user.repository.ts`
**Merged:** PR #51

- ✅ Interface file created with 8 methods
- ✅ Repository fully implements interface
- ✅ All methods accept `StorageOptions` with AbortSignal
- ✅ Returns `CreateResult<User>`, `UpdateResult<User>`
- ✅ Cursor-based pagination in `searchUsers()`
- ✅ Uses `AppError` with typed error codes
- ✅ User preferences (upsert operations)
- ✅ Tests passing
- ✅ Fixed cursor generation bug
- ✅ Fixed tenant boundary issues

**Methods Implemented (8):**
- `getUser(id, opts?)`
- `getUserByUsername(username, opts?)`
- `createUser(user, opts?)`
- `upsertUser(user, opts?)`
- `updateUser(id, updates, opts?)`
- `searchUsers(query, pagination?, opts?)`
- `getUserPreferences(userId, opts?)`
- `upsertUserPreferences(userId, preferences, opts?)`

---

#### 5. IFeedbackStorage - Fully Implemented ✅
**Interface:** `server/storage-interfaces/feedback.interface.ts`
**Repository:** `server/repositories/feedback.repository.ts`
**Merged:** PR #52

- ✅ Interface file created with 9 methods
- ✅ Repository fully implements interface
- ✅ All methods accept `StorageOptions`
- ✅ Returns structured results
- ✅ Cursor-based pagination for listing methods
- ✅ Uses `AppError` consistently
- ✅ Admin operations (reply, status updates)
- ✅ User notifications (unread counts)
- ✅ Tests passing

**Methods Implemented (9):**
- `createFeedback(feedbackData, opts?)`
- `getFeedback(id, opts?)`
- `getAllFeedback(pagination?, opts?)`
- `getUserFeedback(userId, pagination?, opts?)`
- `getUnreadReplyCount(userId, opts?)`
- `updateFeedbackStatus(id, status, opts?)`
- `replyToFeedback(feedbackId, reply, adminUserId, opts?)`
- `markFeedbackReplyAsRead(feedbackId, userId, opts?)`

---

#### 6. ISearchStorage - Fully Implemented ✅
**Interface:** `server/storage-interfaces/search.interface.ts`
**Repository:** `server/repositories/search.repository.ts`
**Merged:** PR #54

- ✅ Interface file created with 3 methods
- ✅ Repository fully implements interface
- ✅ `searchAllContent()` returns `PaginatedResult<SearchResult>`
- ✅ Type-safe discriminated union for results
- ✅ Cursor-based pagination with proper sorting
- ✅ Filter by notebook and content kinds
- ✅ `ensureContentOwnership()` with assertion signature (NEW pattern)
- ✅ `validateContentOwnership()` for backward compatibility
- ✅ Fixed security bug in content ownership validation
- ✅ Optimized search query performance
- ✅ Tests passing

**Methods Implemented (3):**
- `searchAllContent(userId, query, filters?, pagination?, opts?)`
- `ensureContentOwnership(content, userId, notebookId?)` [assertion signature]
- `validateContentOwnership(content, userId, notebookId?)` [backward compat]

---

#### 7. INotebookStorage - 85% Implemented ⚠️
**Interface:** `server/storage-interfaces/notebook.interface.ts`
**Repository:** `server/repositories/notebook.repository.ts`
**Merged:** PR #53 (partial)

- ✅ Interface file created with 10 methods
- ✅ Notebook CRUD operations fully implemented (6 methods)
- ✅ Returns structured results
- ✅ Cursor-based pagination
- ✅ Uses `AppError`
- ✅ Handles shared notebooks
- ✅ Fixed critical multi-tenant data leak bug
- ✅ Fixed cursor type mismatch in routes
- ⚠️ Minor type issue: `nextCursor` should be typed as `Cursor`
- ❌ **Missing:** Import job operations (4 methods)

**Methods Implemented (6/10):**
- ✅ `createNotebook(notebook, opts?)`
- ✅ `getNotebook(id, userId, opts?)`
- ✅ `getUserNotebooks(userId, pagination?, opts?)`
- ✅ `updateNotebook(id, userId, updates, opts?)`
- ✅ `deleteNotebook(id, userId, opts?)`
- ✅ `validateNotebookOwnership(notebookId, userId, opts?)`

**Methods NOT Implemented (4/10):**
- ❌ `createImportJob(job, opts?)`
- ❌ `getImportJob(id, userId, opts?)`
- ❌ `getUserImportJobs(userId, pagination?, opts?)`
- ❌ `updateImportJob(id, updates, opts?)`

---

## ❌ REMAINING TASKS

### Phase 2: Validation (20% Remaining)

#### 8. ICharacterStorage - NOT Implemented ❌ CRITICAL
**Interface:** `server/storage-interfaces/character.interface.ts` (template exists)
**Repository:** `server/repositories/character.repository.ts` (LEGACY IMPLEMENTATION)
**Status:** 0% Complete

**Critical Issues:**
- ❌ Repository does NOT implement interface
- ❌ No `StorageOptions` parameters on any methods
- ❌ Returns raw types instead of `CreateResult`, `UpdateResult`, `DeleteResult`
- ❌ No pagination support (`getUserCharacters()` returns `Promise<Character[]>`)
- ❌ Uses generic `Error` instead of `AppError`
- ❌ Parameter order inconsistent
- ❌ No AbortSignal support

**Required Work:**
- Update ~25 methods in character.repository.ts
- Add ~15 methods for family tree operations
- Implement cursor-based pagination
- Add proper error handling with AppError
- Fix parameter order
- Add AbortSignal checking

**Estimated Effort:** 3-4 days
**Priority:** HIGH (blocking core functionality)

**Methods to Implement (18 character methods + 14 family tree methods = 32 total):**

**Character CRUD:**
- ❌ `createCharacter(character, opts?)`
- ❌ `getCharacter(id, userId, notebookId, opts?)`
- ❌ `getUserCharacters(userId, notebookId, pagination?, opts?)`
- ❌ `updateCharacter(id, userId, notebookId, updates, opts?)`
- ❌ `deleteCharacter(id, userId, notebookId, opts?)`
- ❌ `getCharactersWithIssues(userId, notebookId, opts?)`
- ❌ `getPotentialDuplicates(userId, notebookId, opts?)`

**Family Tree CRUD (7 methods):**
- ❌ `createFamilyTree(familyTree, opts?)`
- ❌ `getFamilyTree(id, userId, notebookId, opts?)`
- ❌ `getUserFamilyTrees(userId, notebookId, pagination?, opts?)`
- ❌ `updateFamilyTree(id, userId, notebookId, updates, opts?)`
- ❌ `deleteFamilyTree(id, userId, notebookId, opts?)`

**Family Tree Members (4 methods):**
- ❌ `createFamilyTreeMember(member, opts?)`
- ❌ `getFamilyTreeMembers(treeId, userId, opts?)`
- ❌ `updateFamilyTreeMember(id, userId, updates, opts?)`
- ❌ `deleteFamilyTreeMember(id, userId, treeId, opts?)`

**Family Tree Relationships (4 methods):**
- ❌ `createFamilyTreeRelationship(relationship, opts?)`
- ❌ `getFamilyTreeRelationships(treeId, userId, opts?)`
- ❌ `updateFamilyTreeRelationship(id, userId, updates, opts?)`
- ❌ `deleteFamilyTreeRelationship(id, userId, treeId, opts?)`

---

#### 9. Complete INotebookStorage ⚠️
**Status:** 15% Remaining

**Required Work:**
- Add 4 import job methods to notebook.repository.ts
- Fix `nextCursor` type from `{ value: string }` to `Cursor`
- Change class declaration from `Partial<INotebookStorage>` to `INotebookStorage`

**Estimated Effort:** 1 day
**Priority:** MEDIUM

---

### Phase 3: Migration (0% Complete)

#### 10. Create 14 Remaining Interface Files ❌
**Status:** Not Started

**Interfaces to Create:**
1. ❌ `IStoryElementStorage` - Plot, Prompt, Theme, Mood, Conflict, Description (6 entities)
2. ❌ `IGuideStorage` - Guide, GuideCategory, GuideReference (3 entities)
3. ❌ `IContentOrganizationStorage` - SavedItem, PinnedContent, GeneratedName (3 entities)
4. ❌ `IDocumentStorage` - Document, Note, QuickNote, Folder (4 entities)
5. ❌ `IProjectStorage` - Project, ProjectSection, ProjectLink, Canvas, ConversationThread (6 entities)
6. ❌ `IEquipmentStorage` - Weapon, Armor, Accessory, Clothing, Item (5 entities)
7. ❌ `IConsumableStorage` - Food, Drink, Potion (3 entities)
8. ❌ `IMaterialStorage` - Material, Resource, Building, Transportation (4 entities)
9. ❌ `IMagicStorage` - Spell, MagicSystem (2 entities)
10. ❌ `ILivingBeingStorage` - Creature, Species, Animal, Plant (4 entities)
11. ❌ `ICultureStorage` - Culture, Ethnicity, Society, Organization, Faction, MilitaryUnit, Language, Religion, Tradition, Ritual, Ceremony, Music, Dance (13 entities)
12. ❌ `IGovernanceStorage` - Law, Policy, NaturalLaw, Profession, Rank, Condition (6 entities)
13. ❌ `IGeographyStorage` - Location, Setting, Settlement, Map (4 entities)
14. ❌ `IHistoryStorage` - Timeline, TimelineEvent, TimelineRelationship, Event, Myth, Legend (7 entities)

**Estimated Effort:** 2-3 days
**Priority:** MEDIUM (establishes contracts for Phase 3)

---

#### 11. Update Content Repository ❌ MASSIVE SCOPE
**File:** `server/repositories/content.repository.ts` (4,784 lines)
**Status:** 0% Complete

**Scope:**
- ~200+ methods across 40+ entity types
- All entities listed in interfaces above

**Required Changes for ALL Methods:**
- ❌ Add `opts?: StorageOptions` parameter
- ❌ Check `opts?.signal?.aborted` before queries
- ❌ Return `CreateResult<T>`, `UpdateResult<T>`, `DeleteResult`
- ❌ Implement cursor-based pagination for list methods
- ❌ Replace generic `Error` with `AppError`
- ❌ Handle `notebookId: null` for global content
- ❌ Fix parameter order to match standards

**Estimated Effort:** 2-3 weeks (or 1 week with 3 developers in parallel)
**Priority:** HIGH (largest scope of work)

**Strategy:** Break into 14 smaller PRs by domain interface

---

#### 12. Update Storage Facade ❌
**File:** `server/repositories/storage.facade.ts` (3,247 lines)
**Status:** Partial (delegates to updated repositories, but needs final cleanup)

**Required Changes:**
- ❌ Pass through `opts?: StorageOptions` to all repository methods
- ❌ Update return types to match new domain interfaces
- ❌ Once all interfaces complete: Refactor `IStorage` to extend all domain interfaces
- ❌ Clean up delegation methods

**Estimated Effort:** 1 week
**Priority:** MEDIUM (depends on repository updates)

---

#### 13. Update Route Handlers ❌
**Files:** Multiple in `server/routes/*.ts`
**Status:** Partial (some routes updated for User, Feedback, Notebook, Search)

**Required Changes for ALL Routes:**
- ❌ Use `UpdateResult.updated` to determine HTTP 200 vs 404
- ❌ Use `DeleteResult.deleted` to determine HTTP 204 vs 404
- ❌ Use `CreateResult.value` for created entities
- ❌ Support pagination with cursor parameters
- ❌ Handle `AppError` codes in error middleware
- ❌ Update request/response types

**Estimated Effort:** 1 week
**Priority:** MEDIUM (follows repository updates)

---

### Phase 4: Cleanup (0% Complete)

#### 14. Remove Deprecated Code ❌
**Status:** Not Started

- ❌ Remove temporary method overloads
- ❌ Remove old signatures
- ❌ Remove any type assertions
- ❌ Clean up comments

**Estimated Effort:** 2-3 days

---

#### 15. Final Testing & Documentation ❌
**Status:** Not Started

- ❌ 100% test coverage on new interfaces
- ❌ Integration tests for tenant boundaries
- ❌ Performance tests for pagination
- ❌ Update API documentation
- ❌ Update development guides

**Estimated Effort:** 3-5 days

---

## Summary Statistics

### Interfaces
- **Created:** 5 / 19 (26%)
- **Fully Implemented:** 3 / 19 (16%)
- **Partially Implemented:** 1 / 19 (5%)
- **Not Started:** 14 / 19 (74%)

### Methods
- **Completed:** ~50 / ~400 (12%)
- **Remaining:** ~350 / ~400 (88%)

### Lines of Code Updated
- **Completed:** ~1,500 lines (UserRepository, FeedbackRepository, SearchRepository, partial NotebookRepository)
- **Remaining:** ~8,000+ lines (CharacterRepository, ContentRepository, StorageFacade, Routes)

### Time Estimates
- **Phase 1 (Foundation):** ✅ COMPLETE
- **Phase 2 (Validation):** 80% complete, ~1 week remaining
- **Phase 3 (Migration):** 0% complete, ~3-4 weeks remaining
- **Phase 4 (Cleanup):** 0% complete, ~1 week remaining

**Total Remaining:** 5-6 weeks (sequential) or 2-3 weeks (parallel with 3 developers)

---

## Priority Order (Recommended)

### This Week
1. ✅ **CRITICAL:** Implement ICharacterStorage (3-4 days) - Core feature, blocking
2. ✅ Complete INotebookStorage import jobs (1 day) - Finish Phase 2

### Next Week
3. ⚠️ Create 14 remaining interface files (2-3 days) - Establish contracts
4. ⚠️ Update Content Repository - Phase 1 (2-3 simple domains as proof) (3 days)

### Following Weeks
5. ⚠️ Update Content Repository - Phase 2 (remaining domains) (2-3 weeks)
6. ⚠️ Update Storage Facade (1 week)
7. ⚠️ Update Route Handlers (1 week)
8. ⚠️ Final Cleanup & Testing (1 week)

---

## Key Blockers

1. **ICharacterStorage** - Core feature not compliant with new patterns
2. **Content Repository Scope** - 200+ methods is massive undertaking
3. **Testing Coverage** - Need tests as we migrate to catch regressions

---

## Risk Mitigation

1. **Break Content Repository into Small PRs** - One domain interface at a time
2. **Parallelize Work** - Multiple developers can work on different domains
3. **Maintain Backward Compatibility** - Use overloads temporarily during migration
4. **Add Tests Incrementally** - Test each domain as it's migrated
5. **Prioritize Core Features** - Character, Notebook, Search are most critical

---

## Conclusion

**Phase 1 is complete** with a solid foundation. **Phase 2 is 80% complete** with 4 of 5 interfaces fully implemented. The patterns are proven to work well.

**Critical next step:** Implement ICharacterStorage to complete Phase 2 validation before scaling to Phase 3.

**Overall status:** ~20% complete. Significant work remains, but foundation is solid and patterns are validated.
