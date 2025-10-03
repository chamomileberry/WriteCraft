# WriteCraft - Creative Writing Tools Platform

## Overview

WriteCraft is a comprehensive web platform designed to support creative writers with an extensive suite of tools, generators, and educational resources. The platform provides writers with character generators, plot structure tools, writing prompts, setting builders, and detailed writing guides to enhance their creative process. Built as a modern full-stack application, it features a clean, writer-friendly interface inspired by Writer's Digest and Reedsy, with enhanced aesthetics for creative professionals.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript for type safety and developer experience
- **Styling**: Tailwind CSS with custom design system featuring writer-friendly typography (Merriweather serif for headings, Open Sans for body text)
- **UI Components**: Comprehensive component library built on Radix UI primitives (shadcn/ui) for accessibility and consistency
- **State Management**: TanStack Query for server state management with optimistic updates and caching
- **Routing**: Wouter for lightweight client-side routing
- **Build Tool**: Vite for fast development and optimized production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js framework for RESTful API endpoints
- **Language**: TypeScript throughout the stack for consistency and type safety
- **API Design**: RESTful endpoints organized by feature (characters, plots, prompts, guides, etc.)
- **Content Generation**: Server-side algorithms for generating creative writing content with genre-specific variations

### Data Storage
- **Database**: PostgreSQL for structured data storage with strong consistency
- **ORM**: Drizzle ORM for type-safe database operations and migrations
- **Schema**: Well-defined tables for users, generated content (characters, plots, prompts), guides, and user collections
- **Connection**: Neon serverless PostgreSQL with connection pooling for scalability

### Design System & Theming
- **Color Palette**: Professional writer-focused colors with creative purple primary (#6B73FF), teal secondary, and warm orange accents
- **Dark/Light Mode**: Complete theme system with CSS custom properties and automatic system preference detection
- **Typography Scale**: Hierarchical font sizing with serif headings and sans-serif body text for optimal readability
- **Component Variants**: Consistent styling patterns across buttons, cards, and interactive elements

### Content Management
- **Notebook System**: User-created notebooks for organizing all worldbuilding content with proper scoping
  - **Active Notebook**: Zustand store persists active notebook selection across sessions
  - **Automatic Activation**: Newly created notebooks are automatically set as active
  - **Query Cache Sync**: All notebook mutations (create/update/delete) invalidate React Query cache to prevent race conditions
  - **Quick Access**: Settings gear icon in ContentTypeModal provides direct access to NotebookManager for convenient notebook management during content creation
  - **Fixed Issue (Oct 2024)**: Resolved critical bug where new notebooks would disappear after creation due to stale cache overwriting Zustand store
  - **Data Isolation Fix (Oct 2 2024)**: Fixed critical cross-contamination bug where autocomplete fields (species, profession) showed items from all notebooks instead of filtering by active notebook. Updated autocomplete-field.tsx to pass notebookId in API requests and include in React Query cache keys. Fixed species.routes.ts and profession.routes.ts GET endpoints to filter by notebookId query parameter. Verified isolation through testing.
- **Generator System**: Modular content generation for characters, plots, settings, names, conflicts, themes, and moods
- **Writing Guides**: Structured educational content with categories, difficulty levels, and comprehensive search
- **User Collections**: System for saving and organizing generated content and favorite guides
- **Enhanced Character Editor**: Responsive sidebar navigation system with 6 logical sections (Identity, Appearance, Mind & Personality, Skills & Powers, Life & Background, Prompts) that replaces cramped multi-row tab layouts with clean, organized navigation for both desktop and mobile users
- **Hierarchical Project System**: Complete hierarchical project management with folders and pages (replacing the old manuscript system):
  - **View/Edit Modes**: Projects can be viewed in read-only mode or edited with full functionality
  - **Tree Structure**: Unlimited folder nesting with pages as leaf nodes containing content
  - **ProjectContainer**: Main orchestrator managing active sections, auto-save, and navigation
  - **ProjectOutline**: Collapsible tree sidebar with expand/collapse, highlighting, and CRUD operations
  - **SectionEditor**: Full TipTap rich text editor with 2-second auto-save, media insertion (images, videos, links), and export (HTML/PDF/DOCX)
  - **Smart Navigation**: Auto-saves before section switching, shows empty state for folders, editor for pages
  - **Visual Feedback**: Badge system for save status (unsaved/saving/saved with timestamps), breadcrumb trail with chevron separators, real-time word count
  - **API**: RESTful endpoints for section CRUD, tree retrieval, and reordering
- **AI-Powered Inline Editing**: Grammarly-style AI editing assistance integrated across all text editors:
  - **Floating AI Menu**: Custom bubble menu that appears when text is selected, offering quick AI actions
  - **AI Actions**: Improve writing, shorten text, expand content, fix grammar, or ask AI for suggestions
  - **Inline Suggestions**: ProseMirror-based suggestion system showing deletions (strikethrough) and additions (green highlight) with accept/reject buttons
  - **Real-time Feedback**: Visual decorations show AI suggestions inline without disrupting the writing flow
  - **Claude Integration**: Backend uses Anthropic's Claude 3.5 Sonnet for high-quality text improvements
  - **Universal Integration**: Available in all editors (ArticleEditor, GuideEditor, ProjectEditor, and SectionEditor)

## External Dependencies

### Database & Infrastructure
- **@neondatabase/serverless**: Serverless PostgreSQL database connection and management
- **connect-pg-simple**: PostgreSQL session store for user session management
- **drizzle-orm & drizzle-kit**: Type-safe ORM with migration tooling

### UI & Design
- **@radix-ui/***: Comprehensive set of accessible UI primitives for consistent component behavior
- **tailwindcss**: Utility-first CSS framework with custom design tokens
- **class-variance-authority**: Type-safe component variant system
- **lucide-react**: Modern icon library for consistent iconography

### Development & Tooling
- **vite**: Fast build tool with HMR for development
- **@replit/vite-plugin-runtime-error-modal**: Development error handling for Replit environment
- **tsx**: TypeScript execution for server-side development

### State & Data Management
- **@tanstack/react-query**: Server state management with caching, background updates, and optimistic updates
- **react-hook-form & @hookform/resolvers**: Form management with validation
- **zod**: Runtime type validation for API requests and responses

### Utilities
- **date-fns**: Date manipulation and formatting
- **nanoid**: Unique ID generation for database records
- **clsx & tailwind-merge**: Conditional CSS class management

## Known Issues & Technical Debt

### CRITICAL: Notebook Data Isolation Vulnerability (Oct 2-3 2024)
**Status**: Immediate security fix applied (route-layer filtering), storage-layer refactor required

**Security Audit Results**: Out of 60 content type routes audited:
- ✅ **10 routes SECURE** (character, culture, faction, item, location, organization, plant, profession, species, weapon)
- ⚠️ **6 routes PATCHED** (religion, language, tradition, family-tree - route-layer filtering added)
- ❌ **44 routes VULNERABLE** (still missing notebook filtering)

**Root Cause**: Storage layer methods (getUserX functions) only filter by userId, not notebookId, causing cross-notebook data leakage. Users can see data from other notebooks through autocomplete fields and direct API access.

**Immediate Fix Applied** (Oct 2-3 2024):
- Updated autocomplete-field.tsx to pass notebookId in all API requests
- Fixed species.routes.ts and profession.routes.ts with route-layer filtering
- Fixed religion, language, tradition, family-tree routes with route-layer filtering
- Pattern: Fetch all user data, then filter by notebookId in JavaScript (stopgap solution)

**Remaining Vulnerable Routes** (44 routes):
accessory, animal, armor, building, ceremony, clothing, conflict, creature, dance, description, document, drink, ethnicity, event, food, guide, language (GET /user), legend, map, material, military-unit, mood, music, myth, name, natural-law, note, plot, policy, potion, prompt, religion (GET /user), resource, ritual, setting, settlement, society, spell, technology, theme, timeline, transportation

**Required Long-Term Fix** (Architect-Recommended):
1. **Storage Layer Refactor**: Update all 48+ getUserX methods in IStorage interface and DatabaseStorage implementation to accept and filter by notebookId parameter
2. **Database-Level Filtering**: Use `and(eq(table.userId, userId), eq(table.notebookId, notebookId))` pattern like getUserCharacters does
3. **Automated Testing**: Add notebook isolation tests for all content types before refactoring
4. **Phased Rollout**: Implement in batches with regression testing

**Why Route-Layer Filtering is Insufficient**:
- Still fetches cross-notebook data from database before filtering
- Inefficient (fetches all user data, then filters in JavaScript)
- Security gap if storage methods are reused elsewhere in codebase
- Does not prevent data leakage at storage boundary

**Recommended Actions**:
1. Complete route-layer filtering for all 44 vulnerable routes (immediate stopgap)
2. Create storage layer refactor plan with shared helper utilities
3. Implement automated notebook isolation tests per content type
4. Execute storage-layer refactor in phases with validation
5. Remove route-layer filtering once storage layer is secure