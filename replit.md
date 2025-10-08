# WriteCraft - Creative Writing Tools Platform

## Overview

WriteCraft is a comprehensive web platform designed to support creative writers with an extensive suite of tools, generators, and educational resources. It provides character generators, plot structure tools, writing prompts, setting builders, and detailed writing guides to enhance the creative process. The platform aims to be a modern, full-stack application with a clean, writer-friendly interface, enhancing the creative workflow for professional writers.

## User Preferences

Preferred communication style: Simple, everyday language.
Documentation: Proactively create documentation for new features, APIs, and system changes to help future developers understand the codebase.

## System Architecture

### Frontend
- **Framework**: React with TypeScript
- **Styling**: Tailwind CSS with a custom design system
- **UI Components**: Radix UI primitives (shadcn/ui) for accessibility
- **State Management**: TanStack Query for server state, Zustand for client state
- **Routing**: Wouter
- **Build Tool**: Vite

### Backend
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript
- **API Design**: RESTful endpoints
- **Content Generation**: Server-side algorithms for creative writing content.

### Code Organization & Architecture
- **Shared Constants**: Genre categories, setting types, creature types, ethnicity options, and other shared data constants are centralized in `shared/genres.ts` to maintain clean separation of concerns.
- **Import Pattern**: Client components import shared constants via `@shared/genres` alias, while server modules use relative paths (`../shared/genres.js`), preventing architectural violations where frontend would directly import from server directories.
- **Schema-Driven Form Generator**: Automatic form configuration generation from Drizzle/Zod schemas, eliminating 53+ manual form configurations and ensuring new database fields automatically appear in forms:
  - **Schema Analyzer** (`client/src/lib/schema-analyzer.ts`): Introspects Zod schemas to extract field metadata (name, type, constraints, arrays).
  - **Form Generator** (`client/src/lib/form-generator.ts`): Converts schema metadata + UI hints into complete form configurations with automatic tab grouping and field ordering. Includes safeguard to create "Other Details" tab for unassigned fields when tabs are configured.
  - **Schema-Driven Configs** (`client/src/configs/schema-driven-configs.ts`): UI customization layer providing field hints (labels, placeholders, tab assignments, autocomplete endpoints) for 54 content types.
  - **4-Layer Config System**: Hierarchical configuration lookup with caching: (1) Static manual configs → (2) Dynamic manual configs → (3) Schema-driven auto-generated configs → (4) Monolithic fallback.
  - **Migration Complete (Oct 2025)**: 54 content types successfully migrated to schema-driven system: document, ethnicity, culture, species, rank, condition, food, drink, resource, animal, plant, event, society, settlement, technology, religion, language, faction, weapon, building, creature, item, location, organization, conflict, theme, mood, description, name, map, setting, armor, spell, plot, familyTree, timeline, prompt, vehicle, clothing, disease, title, quest, artifact, flora, fauna, mineral, weather, disaster, custom, projectItem, projectFolder, quickNote. Only 'character' remains manual by design due to complex custom UI requirements.
- **Custom Hooks for Code Reuse**:
  - **`useAutosave`**: Specialized auto-save hook for TipTap rich text editors with debouncing, async error handling, and promise cleanup.
  - **`useDebouncedSave`**: Generic debounced auto-save hook with async error handling and promise management for any data type (forms, state, non-TipTap content).
  - **`useRequireNotebook`** (Oct 2025): Centralized notebook context validation hook providing:
    - Automatic notebook selection from Zustand store
    - Validation function for operations requiring notebook context
    - Configurable error messages
    - Optional auto-navigation to notebook selection page
    - Returns `{ notebookId, validateNotebook }` for component use
  - **`useGenerator`**: Unified hook for generator components handling generate/copy/save patterns, with support for:
    - Single results and arrays (via resolveResultId)
    - Custom save endpoints (configurable saveEndpoint)
    - User/notebook context (userId, notebookId parameters)
    - Validation before generation
    - Custom clipboard formatting and save payload preparation
    - Consistent error handling and user feedback
    - Auto-navigation to created content (via buildNavigateRoute)
  - **`NotebookGuard` Component** (Oct 2025): Wrapper component for pages requiring notebook context, offering two modes:
    - Full mode: Displays centered card with icon, title, description, and "Select Notebook" button
    - Minimal mode: Shows compact inline alert banner for existing page layouts
  - **Generator Refactoring**: 8 generators refactored using useGenerator (Character, Plot, Setting, Creature, Conflict, Plant, Description, Name), achieving 22% code reduction (559+ lines saved) while eliminating duplicate logic.
  - **Auto-Save Refactoring**: 4 components migrated to reusable auto-save hooks (ProjectEditor and SectionEditor use useAutosave; FamilyTreeEditor and QuickNotePanel use useDebouncedSave) for consistent auto-save behavior.
  - **Notebook Context Refactoring** (Oct 2025): 4 generators migrated to centralized notebook validation (Character, Name, Plant, Creature) using `useRequireNotebook` hook for consistent validation and error handling.
  - **User Feedback Standardization** (Oct 2025): All toasts/alerts positioned at top-right with slide-from-top animation for consistent user experience. Generator save operations auto-navigate to created content when route provided.
  - **Security Enhancement**: Removed all hardcoded user IDs ('guest', 'demo-user') from generators; all components now properly integrate with `useAuth` hook for authenticated user context.

### Data Storage
- **Database**: PostgreSQL (Neon serverless)
- **ORM**: Drizzle ORM
- **Schema**: Tables for users, generated content, guides, and user collections.

### Design System & Theming
- **Color Palette**: Professional writer-focused colors (purple primary, teal secondary, orange accents)
- **Theming**: Dark/Light mode with CSS custom properties
- **Typography**: Hierarchical font sizing with serif headings and sans-serif body text.

### Key Features
- **Authentication**: Replit Auth integration (Google, GitHub, X, Apple, email/password) with PostgreSQL-backed sessions.
- **Account Management**: User profiles and secure access control.
- **Content Management**:
    - **Notebook System**: User-created notebooks for organizing worldbuilding content with responsive display.
    - **Generator System**: Modular content generation (characters, plots, settings, names, conflicts, themes, moods).
    - **Writing Guides**: Structured educational content with categories and search, featuring admin-only management.
    - **Hierarchical Project System**: Project management with unlimited folder nesting, pages (sections), rich text editor (TipTap), auto-save, media insertion, and export capabilities.
    - **Enhanced Character Editor**: Responsive sidebar navigation for character details.
    - **AI-Powered Inline Editing**: Grammarly-style AI assistance integrated across all text editors, offering actions like improving, shortening, expanding, fixing grammar, and suggestions using Anthropic's Claude 3.5 Sonnet. Includes context-aware AI generation for character editor form fields with sparkle buttons, comprehensive context provision to AI, related character detection, and anti-repetition instructions.
    - **Writing Assistant Panel**: Conversational AI assistant for analyzing text, proofreading, generating questions, and providing writing feedback.
    - **AI Writing Style**: All AI features adhere to comprehensive anti-cliché guidelines to produce human-like, authentic, and expressive writing.
    - **World Anvil Import**: Comprehensive import system that parses World Anvil export ZIP files and imports 17 content types into WriteCraft notebooks. Features extensive field mapping, robust data processing (BBCode stripping, type-safe conversions, enhanced name parsing for honorifics), background job processing, and granular error reporting.
    - **Character Data Consolidation Tool**: Admin interface for managing character data quality post-import, including identification of incomplete data, duplicate detection using Levenshtein distance, and real-time stats.

### Security & Authorization
- **Multi-Layer Security Architecture**: Enterprise-grade security protecting against major web vulnerabilities including Input Sanitization (SQLi, XSS, Prototype Pollution), Authentication & Access Control, Rate Limiting, Admin Privilege Protection, Row-Level Security (RLS), CSRF Protection, Security Headers, and Security Audit Logging.
- **XSS Protection**: All user-generated HTML sanitized using DOMPurify.
- **Session Security**: httpOnly, secure, sameSite:'lax' cookies with automatic regeneration.
- **Error Handling**: Generic error messages to clients; detailed errors logged server-side.
- **Ownership Validation Pattern**: All content operations enforce strict ownership validation using a "Fetch → Validate → Execute" pattern.
- **Critical Security Rules**: Delete/update operations validate ownership, triple-filter for multi-tenant isolation, and return 404 for unauthorized access.

### Collaboration & Sharing System
- **Multi-User Collaboration**: Comprehensive sharing system enabling co-authors, writing groups, and mentors/students to collaborate on notebooks and projects with granular permission controls (View, Comment, Edit).
- **Security & Access Control**: RLS middleware validates ownership then checks shares table for collaborative access.

### Testing & Quality Assurance
- **Test Framework**: Playwright for end-to-end testing.
- **Import Regression Tests**: Comprehensive test suite for World Anvil import pipeline, validating all content types, metrics, error details, and UI display.
- **Test Coverage**: Auth flows, image upload, project smoke tests, World Anvil import pipeline.

## External Dependencies

### Database & Infrastructure
- **@neondatabase/serverless**: Serverless PostgreSQL connection
- **connect-pg-simple**: PostgreSQL session store
- **drizzle-orm & drizzle-kit**: ORM and migration tooling

### UI & Design
- **@radix-ui/***: Accessible UI primitives
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Type-safe component variant system
- **lucide-react**: Icon library

### Development & Tooling
- **vite**: Fast build tool
- **@replit/vite-plugin-runtime-error-modal**: Replit-specific error handling
- **tsx**: TypeScript execution for server-side

### State & Data Management
- **@tanstack/react-query**: Server state management
- **react-hook-form & @hookform/resolvers**: Form management and validation
- **zod**: Runtime type validation

### Utilities
- **date-fns**: Date manipulation
- **nanoid**: Unique ID generation
- **clsx & tailwind-merge**: Conditional CSS class management