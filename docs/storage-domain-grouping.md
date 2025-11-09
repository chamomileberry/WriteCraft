# Storage Domain Grouping Strategy

This document proposes consolidating 82 domain methods into **19 focused domain interfaces** that are easier to maintain, test, and understand.

## Grouping Principles

1. **Shared lifecycle**: Entities created/managed together
2. **Feature cohesion**: Related from user's perspective
3. **Type similarity**: Similar CRUD patterns
4. **Bounded contexts**: Clear domain boundaries

---

## Proposed Domain Interfaces (19)

### 1. **IUserStorage** (User Management)
**Count:** 2 domains → 1 interface

**Includes:**
- User (core identity)
- User Preferences (settings)

**Rationale:** User and their preferences are tightly coupled lifecycle-wise.

**Methods:**
```typescript
interface IUserStorage {
  // User CRUD
  getUser(id: string, opts?: StorageOptions): Promise<User | undefined>;
  getUserByUsername(username: string, opts?: StorageOptions): Promise<User | undefined>;
  createUser(user: InsertUser, opts?: StorageOptions): Promise<CreateResult<User>>;
  upsertUser(user: UpsertUser, opts?: StorageOptions): Promise<User>;
  updateUser(id: string, updates: Partial<InsertUser>, opts?: StorageOptions): Promise<UpdateResult<User>>;
  searchUsers(query: string, pagination?: PaginationParams, opts?: StorageOptions): Promise<PaginatedResult<User>>;

  // User Preferences
  getUserPreferences(userId: string, opts?: StorageOptions): Promise<UserPreferences | undefined>;
  upsertUserPreferences(userId: string, prefs: Partial<InsertUserPreferences>, opts?: StorageOptions): Promise<UserPreferences>;
}
```

---

### 2. **INotebookStorage** (Workspace Management)
**Count:** 2 domains → 1 interface

**Includes:**
- Notebook
- Import Job

**Rationale:** Notebooks are workspaces; imports populate them. Lifecycle-coupled.

**Methods:**
```typescript
interface INotebookStorage {
  // Notebook CRUD
  createNotebook(notebook: InsertNotebook, opts?: StorageOptions): Promise<CreateResult<Notebook>>;
  getNotebook(id: string, userId: string, opts?: StorageOptions): Promise<Notebook | undefined>;
  getUserNotebooks(userId: string, pagination?: PaginationParams, opts?: StorageOptions): Promise<PaginatedResult<Notebook>>;
  updateNotebook(id: string, userId: string, updates: UpdateNotebook, opts?: StorageOptions): Promise<UpdateResult<Notebook>>;
  deleteNotebook(id: string, userId: string, opts?: StorageOptions): Promise<DeleteResult>;
  validateNotebookOwnership(notebookId: string, userId: string, opts?: StorageOptions): Promise<boolean>;

  // Import Jobs
  createImportJob(job: InsertImportJob, opts?: StorageOptions): Promise<CreateResult<ImportJob>>;
  getImportJob(id: string, userId: string, opts?: StorageOptions): Promise<ImportJob | undefined>;
  getUserImportJobs(userId: string, pagination?: PaginationParams, opts?: StorageOptions): Promise<PaginatedResult<ImportJob>>;
  updateImportJob(id: string, updates: UpdateImportJob, opts?: StorageOptions): Promise<UpdateResult<ImportJob>>;
}
```

---

### 3. **ICharacterStorage** (Characters & Relationships)
**Count:** 4 domains → 1 interface

**Includes:**
- Character
- Family Tree
- Family Tree Member
- Family Tree Relationship

**Rationale:** Family trees are character-centric. Natural aggregate boundary.

**Methods:** Character CRUD + specialized queries + family tree operations

---

### 4. **IStoryElementStorage** (Narrative Tools)
**Count:** 6 domains → 1 interface

**Includes:**
- Plot
- Prompt
- Theme
- Mood
- Conflict
- Description

**Rationale:** All are narrative/story-building tools writers use together.

**Pattern:** Standard CRUD for each type, all follow same tenant boundaries.

---

### 5. **IGuideStorage** (Writing Guides & References)
**Count:** 3 domains → 1 interface

**Includes:**
- Guide
- Guide Category
- Guide Reference

**Rationale:** Guides are a cohesive knowledge system with hierarchical structure.

**Methods:** Guide CRUD + category hierarchy + reference management

---

### 6. **IContentOrganizationStorage** (User Content Management)
**Count:** 3 domains → 1 interface

**Includes:**
- Saved Item
- Pinned Content
- Name (generated names)

**Rationale:** All are user-managed collections/favorites/bookmarks.

**Methods:**
```typescript
interface IContentOrganizationStorage {
  // Saved Items
  saveItem(item: InsertSavedItem, opts?: StorageOptions): Promise<CreateResult<SavedItem>>;
  unsaveItem(userId: string, itemType: string, itemId: string, notebookId: string | null, opts?: StorageOptions): Promise<DeleteResult>;
  getUserSavedItems(userId: string, notebookId: string | null, filters?: { itemType?: string }, pagination?: PaginationParams, opts?: StorageOptions): Promise<PaginatedResult<SavedItem>>;
  isItemSaved(userId: string, itemType: string, itemId: string, notebookId: string | null, opts?: StorageOptions): Promise<boolean>;
  updateSavedItemData(savedItemId: string, userId: string, itemData: Json, opts?: StorageOptions): Promise<UpdateResult<SavedItem>>;

  // Pinned Content
  pinContent(pin: InsertPinnedContent, opts?: StorageOptions): Promise<CreateResult<PinnedContent>>;
  unpinContent(userId: string, itemType: string, itemId: string, notebookId: string | null, opts?: StorageOptions): Promise<DeleteResult>;
  getUserPinnedContent(userId: string, notebookId: string | null, category?: string, opts?: StorageOptions): Promise<PinnedContent[]>;
  reorderPinnedContent(userId: string, itemId: string, newOrder: number, notebookId: string | null, opts?: StorageOptions): Promise<void>;
  isContentPinned(userId: string, itemType: string, itemId: string, notebookId: string | null, opts?: StorageOptions): Promise<boolean>;

  // Generated Names
  createName(name: InsertName, opts?: StorageOptions): Promise<CreateResult<GeneratedName>>;
  getName(id: string, userId: string, notebookId: string | null, opts?: StorageOptions): Promise<GeneratedName | undefined>;
  getUserNames(userId: string, notebookId: string | null, pagination?: PaginationParams, opts?: StorageOptions): Promise<PaginatedResult<GeneratedName>>;
}
```

---

### 7. **IDocumentStorage** (Documents & Notes)
**Count:** 4 domains → 1 interface

**Includes:**
- Document
- Note
- Quick Note (special case of Note)
- Folder

**Rationale:** All file-system-like entities. Folders organize docs/notes.

**Methods:** Document CRUD + Note CRUD + Quick Note helpers + Folder hierarchy

---

### 8. **IProjectStorage** (Project Management)
**Count:** 5 domains → 1 interface

**Includes:**
- Project
- Project Section
- Project Link
- Canvas
- Conversation Thread (project-scoped chats)
- Chat Message

**Rationale:** Projects encompass sections, links, canvases, and conversations.

**Methods:** Project CRUD + Section hierarchy + Link management + Canvas + Chat

---

### 9. **IEquipmentStorage** (Wearables & Combat Gear)
**Count:** 5 domains → 1 interface

**Includes:**
- Weapon
- Armor
- Accessory
- Clothing
- Item (generic catch-all)

**Rationale:** All equippable items. Similar game/RPG mechanics.

**Pattern:** Standard CRUD with (userId, notebookId) boundaries.

---

### 10. **IConsumableStorage** (Foods, Drinks, Potions)
**Count:** 3 domains → 1 interface

**Includes:**
- Food
- Drink
- Potion

**Rationale:** All consumable items. Similar properties (effects, ingredients).

---

### 11. **IMaterialStorage** (Resources & Materials)
**Count:** 4 domains → 1 interface

**Includes:**
- Material
- Resource
- Building (structures)
- Transportation (vehicles/mounts)

**Rationale:** Physical objects that aren't equipment or consumables.

---

### 12. **IMagicStorage** (Magic System)
**Count:** 2 domains → 1 interface

**Includes:**
- Spell
- Magic System (if implemented)

**Rationale:** Magic-related content. Natural grouping.

**Note:** If Magic System is not implemented, this becomes just spell CRUD.

---

### 13. **ILivingBeingStorage** (Creatures & Biology)
**Count:** 4 domains → 1 interface

**Includes:**
- Creature
- Species
- Animal
- Plant

**Rationale:** All living organisms in the world.

---

### 14. **ICultureStorage** (Cultures & Societies)
**Count:** 13 domains → 1 interface

**Includes:**
- Culture
- Ethnicity
- Society
- Organization
- Faction
- Military Unit
- Language
- Religion
- Tradition
- Ritual
- Ceremony
- Music
- Dance

**Rationale:** All cultural/societal constructs. Writers define these together.

**Pattern:** Most follow same CRUD pattern. Group for DRY.

---

### 15. **IGovernanceStorage** (Laws & Rules)
**Count:** 5 domains → 1 interface

**Includes:**
- Law
- Policy
- Natural Law (physics/magic rules)
- Profession
- Rank
- Condition (status effects)

**Rationale:** All define rules, hierarchies, or states in the world.

---

### 16. **IGeographyStorage** (Places & Maps)
**Count:** 4 domains → 1 interface

**Includes:**
- Location
- Setting
- Settlement
- Map

**Rationale:** All geographic/spatial entities.

---

### 17. **IHistoryStorage** (Timeline & Lore)
**Count:** 7 domains → 1 interface

**Includes:**
- Timeline
- Timeline Event
- Timeline Relationship
- Event (historical events)
- Myth
- Legend

**Rationale:** All temporal/historical narrative elements.

**Methods:** Timeline CRUD + Timeline Event management + Lore CRUD

---

### 18. **ISearchStorage** (Search & Discovery)
**Count:** 2 domains → 1 interface

**Includes:**
- Universal Search
- Content Validation (ownership checks)

**Rationale:** Cross-cutting concerns that touch all domains.

**Methods:**
```typescript
interface ISearchStorage {
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

  validateContentOwnership<T extends { userId?: string | null; notebookId?: string | null }>(
    content: T | undefined,
    userId: string,
    notebookId?: string | null,
  ): boolean;
}
```

---

### 19. **IFeedbackStorage** (User Feedback System)
**Count:** 1 domain → 1 interface

**Includes:**
- Feedback

**Rationale:** Standalone admin feature.

---

## Final Composition

```typescript
// server/storage.ts
import {
  IUserStorage,
  INotebookStorage,
  ICharacterStorage,
  IStoryElementStorage,
  IGuideStorage,
  IContentOrganizationStorage,
  IDocumentStorage,
  IProjectStorage,
  IEquipmentStorage,
  IConsumableStorage,
  IMaterialStorage,
  IMagicStorage,
  ILivingBeingStorage,
  ICultureStorage,
  IGovernanceStorage,
  IGeographyStorage,
  IHistoryStorage,
  ISearchStorage,
  IFeedbackStorage,
} from "./storage-interfaces";

export interface IStorage extends
  IUserStorage,
  INotebookStorage,
  ICharacterStorage,
  IStoryElementStorage,
  IGuideStorage,
  IContentOrganizationStorage,
  IDocumentStorage,
  IProjectStorage,
  IEquipmentStorage,
  IConsumableStorage,
  IMaterialStorage,
  IMagicStorage,
  ILivingBeingStorage,
  ICultureStorage,
  IGovernanceStorage,
  IGeographyStorage,
  IHistoryStorage,
  ISearchStorage,
  IFeedbackStorage {
  // Composite interface - all methods inherited from domain interfaces
}
```

---

## File Organization

```
server/
├── storage.ts                           # Main IStorage export
├── storage-types.ts                     # Foundational types ✅
├── storage-interfaces/
│   ├── index.ts                        # Re-export all interfaces
│   ├── user.interface.ts               # IUserStorage
│   ├── notebook.interface.ts           # INotebookStorage
│   ├── character.interface.ts          # ICharacterStorage
│   ├── story-element.interface.ts      # IStoryElementStorage
│   ├── guide.interface.ts              # IGuideStorage
│   ├── content-organization.interface.ts # IContentOrganizationStorage
│   ├── document.interface.ts           # IDocumentStorage
│   ├── project.interface.ts            # IProjectStorage
│   ├── equipment.interface.ts          # IEquipmentStorage
│   ├── consumable.interface.ts         # IConsumableStorage
│   ├── material.interface.ts           # IMaterialStorage
│   ├── magic.interface.ts              # IMagicStorage
│   ├── living-being.interface.ts       # ILivingBeingStorage
│   ├── culture.interface.ts            # ICultureStorage
│   ├── governance.interface.ts         # IGovernanceStorage
│   ├── geography.interface.ts          # IGeographyStorage
│   ├── history.interface.ts            # IHistoryStorage
│   ├── search.interface.ts             # ISearchStorage
│   └── feedback.interface.ts           # IFeedbackStorage
└── repositories/
    ├── storage.facade.ts               # Implements IStorage
    ├── user.repository.ts              # Implements IUserStorage
    ├── notebook.repository.ts          # Implements INotebookStorage
    ├── character.repository.ts         # Implements ICharacterStorage
    ├── story-element.repository.ts     # Implements IStoryElementStorage
    ├── guide.repository.ts             # Implements IGuideStorage
    ├── content-organization.repository.ts # Implements IContentOrganizationStorage
    ├── document.repository.ts          # Implements IDocumentStorage
    ├── project.repository.ts           # Implements IProjectStorage
    ├── equipment.repository.ts         # Implements IEquipmentStorage
    ├── consumable.repository.ts        # Implements IConsumableStorage
    ├── material.repository.ts          # Implements IMaterialStorage
    ├── magic.repository.ts             # Implements IMagicStorage
    ├── living-being.repository.ts      # Implements ILivingBeingStorage
    ├── culture.repository.ts           # Implements ICultureStorage
    ├── governance.repository.ts        # Implements IGovernanceStorage
    ├── geography.repository.ts         # Implements IGeographyStorage
    ├── history.repository.ts           # Implements IHistoryStorage
    ├── search.repository.ts            # Implements ISearchStorage
    └── feedback.repository.ts          # Implements IFeedbackStorage
```

---

## Migration Path

### Step 1: Create Interface Files (Non-Breaking)
Create all 19 interface files in `storage-interfaces/` with improved signatures.

### Step 2: Update One Domain at a Time
Start with smallest/simplest domains:
1. **IFeedbackStorage** (1 domain, ~5 methods)
2. **IUserStorage** (2 domains, ~8 methods)
3. **INotebookStorage** (2 domains, ~12 methods)
4. ... continue with others

### Step 3: Update Repositories
For each interface, update corresponding repository to match new signature.

### Step 4: Update Routes
Update route handlers one domain at a time to use new result types.

### Step 5: Refactor Storage Facade
Once all domain interfaces exist, refactor `StorageFacade` to delegate cleanly.

---

## Benefits of This Grouping

1. **Manageable size**: 19 interfaces vs 82 domains
2. **Clear boundaries**: Each interface has a clear purpose
3. **Easier testing**: Test one domain interface at a time
4. **Better navigation**: Developers know where to find methods
5. **Parallel development**: Teams can work on different domains
6. **Logical cohesion**: Related methods stay together

---

## Quick Reference Table

| Interface | Domains | Methods (Est.) | Complexity |
|-----------|---------|----------------|------------|
| IUserStorage | 2 | 8 | Low |
| INotebookStorage | 2 | 12 | Low |
| ICharacterStorage | 4 | 18 | Medium |
| IStoryElementStorage | 6 | 30 | Medium |
| IGuideStorage | 3 | 15 | Medium |
| IContentOrganizationStorage | 3 | 18 | Medium |
| IDocumentStorage | 4 | 25 | Medium |
| IProjectStorage | 6 | 35 | High |
| IEquipmentStorage | 5 | 25 | Low |
| IConsumableStorage | 3 | 15 | Low |
| IMaterialStorage | 4 | 20 | Low |
| IMagicStorage | 2 | 10 | Low |
| ILivingBeingStorage | 4 | 20 | Low |
| ICultureStorage | 13 | 65 | High |
| IGovernanceStorage | 6 | 30 | Medium |
| IGeographyStorage | 4 | 20 | Low |
| IHistoryStorage | 7 | 35 | Medium |
| ISearchStorage | 2 | 2 | Low |
| IFeedbackStorage | 1 | 5 | Low |
| **TOTAL** | **82** | **~408** | - |

---

## Recommended Starting Points

If implementing incrementally, start with these (low complexity, high value):

1. ✅ **IUserStorage** - Core functionality, low complexity
2. ✅ **INotebookStorage** - Core functionality, clear boundaries
3. ✅ **IFeedbackStorage** - Simple, isolated, good practice
4. ✅ **ISearchStorage** - Cross-cutting, used everywhere
5. ✅ **ICharacterStorage** - Proves aggregate pattern works

Once these 5 are done, you've validated the pattern and can parallelize the rest.
