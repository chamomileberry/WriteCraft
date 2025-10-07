# WriteCraft - Creative Writing Tools Platform

## Overview

WriteCraft is a comprehensive web platform designed to support creative writers with an extensive suite of tools, generators, and educational resources. It provides character generators, plot structure tools, writing prompts, setting builders, and detailed writing guides to enhance the creative process. The platform aims to be a modern, full-stack application with a clean, writer-friendly interface, enhancing the creative workflow for professional writers.

## Recent Changes

### October 2025 - AI Field Assist & Character Update Fixes
- **AI Field Assist Feature**: Implemented context-aware AI generation for character editor form fields with sparkle buttons next to all textarea fields
  - Context Pattern: Uses `getCharacterContext={() => form.getValues()}` to fetch fresh form values on each AI invocation, ensuring AI sees all previously generated content
  - Comprehensive Context: AI receives ALL filled fields as context (not just hardcoded subset), dynamically formatted with field names and values
  - Anti-Repetition: AI prompts explicitly instruct to build upon existing information without repeating content from other fields, providing only fresh details and new perspectives
  - Actions: Generate (create from scratch), Improve (enhance existing), Expand (add depth), Custom (user-specified prompt)
  - Implementation: AIFieldAssist component integrates with CharacterEditorWithSidebar, backend route processes context and generates via Anthropic Claude 3.5 Sonnet
- **Enhanced Name Parsing**: Fixed character name parsing to properly handle multi-word honorific titles (e.g., "Lord Commander", "Lady in waiting", "High Priestess") using prefix-based detection that iterates through title candidates
- **Improved Field Mapping**: Added comprehensive field name variation checking (firstName/firstname/first_name, etc.) and enhanced image URL fallbacks (portrait/cover/image/images) across all content types
- **Import Metadata Tracking**: Added importSource and importExternalId fields to character imports for tracing origin and supporting deduplication workflows
- **Fixed Notebook Refresh Bug**: Resolved critical issue where character name updates weren't appearing immediately in notebook view. Root cause: saved_items table stored stale snapshot data. Complete fix:
  - Backend: Added `updateSavedItemDataByItem()` storage method to update saved_items.itemData when characters are edited
  - Backend: Character PATCH route now updates saved_items table after updating character
  - Frontend: Corrected cache invalidation query keys to match SavedItems structure: `['/api/saved-items', user.id, notebookId]`
  - Frontend: Replaced hardcoded 'demo-user' with authenticated user ID in both CharacterEditPage and CharacterEditPageWithSidebar
  - Frontend: Switched from fetch() to apiRequest() for proper authentication headers
  - Result: Character edits now immediately reflect in notebook view without manual refresh

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
    - **AI-Powered Inline Editing**: Grammarly-style AI assistance integrated across all text editors, offering actions like improving, shortening, expanding, fixing grammar, and suggestions using Anthropic's Claude 3.5 Sonnet.
    - **Writing Assistant Panel**: Conversational AI assistant for analyzing text, proofreading, generating questions, and providing writing feedback.
    - **AI Writing Style**: All AI features adhere to comprehensive anti-cliché guidelines to produce human-like, authentic, and expressive writing, avoiding robotic patterns and forbidden phrases.
    - **World Anvil Import**: Comprehensive import system that parses World Anvil export ZIP files and imports content into WriteCraft notebooks. Supports 17 content types: characters, species, locations, organizations, professions, ethnicities, settlements, rituals, laws, items, documents, languages, buildings, materials, transportation, ranks, and conditions. Processes individual JSON article files with comprehensive schema mapping (~230+ fields across all content types). Background job processing with progress tracking. Import UI displays granular success/failure details with collapsible error messages showing specific items that failed and why. All imported items automatically create saved_items entries for immediate notebook visibility.
        - **Comprehensive Field Mapping**: Each content type has extensive field mappings that preserve maximum data fidelity from World Anvil exports:
            - Species (17 fields): classification, habitat, behavior, diet, lifespan, intelligence, socialStructure, abilities, weaknesses, culturalTraits, reproduction, images
            - Locations (15 fields): geography, climate, population, government, economy, culture, history, notableFeatures, landmarks, threats, resources, images
            - Organizations (16 fields): structure, leadership, members, headquarters, influence, resources, goals, history, allies, enemies, images
            - Professions (19 fields): skillsRequired, responsibilities, workEnvironment, trainingRequired, socialStatus, income, riskLevel, tools, relatedProfessions, careerPath, workHours, physicalDemands, seasonalVariation, dress, culturalSignificance, images
            - Ethnicities (13 fields): origin, physicalTraits, culturalTraits, traditions, language, religion, socialStructure, values, customs, images
            - Plus comprehensive mappings for Settlements, Rituals, Laws, Items, Documents, Languages, Buildings, Materials, Transportation, Ranks, and Conditions
        - **Robust Data Processing**: Helper functions handle World Anvil field variations (camelCase, lowercase, Display suffix), parse arrays from comma/newline-separated strings or pre-parsed arrays, strip BBCode formatting from all text fields, extract human-readable values from object-valued fields (title/name/label), and prevent data loss through type-safe conversion of numbers, arrays, and objects.
        - **Enhanced Name Parsing**: Multi-word honorific detection (Lady in waiting, Lord Commander, High Priestess, etc.) using prefix-based iteration through title candidates to preserve full honorific phrases.
        - **Import Tracking**: Character imports include importSource='world_anvil' and importExternalId metadata for tracing origin and supporting deduplication workflows.
    - **Character Data Consolidation Tool**: Admin interface at `/notebook/consolidate` for managing character data quality post-import. Features three main panels: (1) Issues Panel showing characters with incomplete data (missing names, descriptions, images) grouped by issue type with Quick Fix modal for inline editing, (2) Duplicates Panel using Levenshtein distance algorithm (0.8 similarity threshold) for fuzzy matching of character names to identify potential duplicates with side-by-side comparison and delete functionality, (3) Stats Summary displaying real-time counts of data issues. Import metadata tracking via `importSource` and `importExternalId` fields enables tracing content origin. Notebook-scoped cache invalidation ensures all views (admin panels, SavedItems, character lists) update immediately after fixes or deletions without manual reload.

### Security & Authorization
- **Multi-Layer Security Architecture**: Enterprise-grade security implementation protecting against major web vulnerabilities.
- **Security Layers**: Input Sanitization (SQLi, XSS, Prototype Pollution), Authentication & Access Control, Rate Limiting, Admin Privilege Protection, Row-Level Security (RLS), CSRF Protection, Security Headers, and Security Audit Logging.
- **XSS Protection**: All user-generated HTML sanitized using DOMPurify (isomorphic-dompurify) before rendering. ProjectViewer uses sanitizeHtml() for rich content. React JSX automatically escapes text fields.
- **Session Security**: httpOnly, secure, sameSite:'lax' cookies with automatic regeneration after login, preserving returnTo redirect URLs.
- **Error Handling**: Generic error messages sent to clients (preventing information disclosure) while detailed errors logged server-side for debugging.
- **Ownership Validation Pattern**: All content operations enforce strict ownership validation using a "Fetch → Validate → Execute" pattern.
- **Critical Security Rules**: Delete/update operations validate ownership, triple-filter for multi-tenant isolation, and return 404 for unauthorized access to prevent information disclosure.

### Collaboration & Sharing System
- **Multi-User Collaboration**: Comprehensive sharing system enabling co-authors, writing groups, and mentors/students to collaborate on notebooks and projects with granular permission controls.
- **Permission Levels**: View, Comment (future), Edit.
- **Share Management**: User search, ShareDialog component for managing collaborators, and integrated share buttons.
- **Security & Access Control**: RLS middleware validates ownership first, then checks shares table for collaborative access. Unauthorized access returns 404.

### Testing & Quality Assurance
- **Test Framework**: Playwright for end-to-end testing
- **Import Regression Tests**: Comprehensive test suite (tests/import-regression.spec.ts) validates:
  - All 17 content types import correctly with saved_items creation
  - Import job metrics accurately track total/processed item counts
  - Granular error details preserved for failed items
  - UI displays detailed success/failure information
  - Database state verified after import completion
- **Test Coverage**: Auth flows, image upload, project smoke tests, World Anvil import pipeline
- **Known Test Limitations**: Current regression tests require reliable test user authentication for full DB assertion coverage. Recommended improvements: authenticated API integration, deterministic failure fixtures, direct DB validation without conditional guards.

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