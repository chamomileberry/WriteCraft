# WriteCraft - Creative Writing Tools Platform

## Overview

WriteCraft is a comprehensive web platform designed to support creative writers with an extensive suite of tools, generators, and educational resources. It provides character generators, plot structure tools, writing prompts, setting builders, and detailed writing guides to enhance the creative process. The platform aims to be a modern, full-stack application with a clean, writer-friendly interface, enhancing the creative workflow for professional writers.

## User Preferences

Preferred communication style: Simple, everyday language.
Documentation: Proactively create documentation for new features, APIs, and system changes to help future developers understand the codebase.

## System Architecture

### Frontend
- **Framework**: React with TypeScript
- **Styling**: Tailwind CSS with a custom design system, Radix UI primitives (shadcn/ui) for accessibility
- **State Management**: TanStack Query for server state, Zustand for client state (with custom hooks for abstraction)
- **Routing**: Wouter
- **Build Tool**: Vite

### Backend
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript
- **API Design**: RESTful endpoints
- **Content Generation**: Server-side algorithms for creative writing content.

### Code Organization & Architecture
- **Shared Constants**: Centralized for genres, settings, etc., with distinct import patterns for client and server.
- **Centralized API Layer**: All API calls consolidated by domain in `client/src/lib/api.ts` for maintainability and type-safety.
- **Custom Zustand Hooks**: Abstraction layer for Zustand stores providing clean, organized state access and preventing re-render issues.
- **Schema-Driven Form Generator**: Automatic form configuration generation from Drizzle/Zod schemas, eliminating manual configurations and ensuring new database fields automatically appear in forms. This includes a 4-layer config system for UI customization.
- **Custom Hooks for Code Reuse**: `useAutosave` (TipTap), `useDebouncedSave` (generic), `useRequireNotebook` (context validation), `useGenerator` (unified generator logic).
- **NotebookGuard Component**: Wrapper for pages requiring notebook context, providing guided user experience.
- **User Feedback Standardization**: Consistent toast notifications and auto-navigation post-generation/save.
- **Security Enhancements**: Integration with `useAuth` hook for authenticated user context; removal of hardcoded user IDs.
- **Database-Backed Banned Phrases System**: Dynamic loading of AI writing style guidelines from PostgreSQL with admin management and caching.
- **Character Validation with Fallbacks**: Comprehensive Zod schema-based validation for AI-generated character data with multi-tier fallback system for robustness.
- **Enhanced AI Writing Assistant** (Oct 2025): Conversational system prompt with emotional intelligence, literary examples (referencing authors like Tolkien, Le Guin, Gaiman), dialogue-driven guidance with mandatory clarifying questions, and scenario-based personality demonstrations for stuck/excited/discouraged writers.

### Data Storage
- **Database**: PostgreSQL (Neon serverless)
- **ORM**: Drizzle ORM
- **Schema**: Tables for users, generated content, guides, and user collections.

### Design System & Theming
- **Color Palette**: Professional writer-focused colors (purple primary, teal secondary, orange accents).
- **Theming**: Dark/Light mode with CSS custom properties.
- **Typography**: Hierarchical font sizing with serif headings and sans-serif body text.

### Key Features
- **Authentication**: Replit Auth integration (Google, GitHub, X, Apple, email/password) with PostgreSQL-backed sessions.
- **Content Management**: Notebook system, modular generator system, writing guides, hierarchical project system with rich text editor (TipTap), enhanced character editor.
- **Timeline Canvas** (Oct 2025): Visual timeline builder using ReactFlow for drag-and-drop event organization with auto-layout, relationship edges, and content linking. Features auto-creation workflow (modal → instant canvas view), event CRUD operations, position persistence, and type-based visual indicators.
- **AI-Powered Tools**: Grammarly-style AI assistance in text editors (Anthropic's Claude 3.5 Sonnet) with context-aware generation, enhanced conversational writing assistant with emotional intelligence, literary examples, and dialogue-driven guidance.
- **Data Import/Export**: World Anvil import system (17 content types) with extensive field mapping, robust processing, and error reporting.
- **Character Data Consolidation Tool**: Admin interface for managing character data quality (incomplete data, duplicate detection).

### Security & Authorization
- **Multi-Layer Security Architecture**: Protection against SQLi, XSS, Prototype Pollution, robust authentication, access control, rate limiting, RLS, CSRF protection, and security headers.
- **Backend Input Validation** (Oct 2025): Comprehensive Zod validation middleware applied to all high-traffic API routes for robust input security:
  - `validateInput` middleware from `server/security/middleware.ts` validates request bodies before they reach route handlers
  - Applied to core CRUD operations: notebooks (create/update), projects (create/update/sections), characters (create), settings (create), creatures (update)
  - All schemas properly omit `userId` fields, which are securely injected from authentication (`req.user.claims.sub`)
  - Consistent HTTP 400 responses with clear Zod validation error messages for malformed requests
  - Prevents malicious payloads, userId forgery, and overlong/malformed bodies from reaching database
  - End-to-end tests confirm both success paths (valid data accepted) and failure paths (invalid data rejected with proper error messages)
- **XSS Protection**: DOMPurify for all user-generated HTML.
- **Session Security**: httpOnly, secure, sameSite:'lax' cookies.
- **Ownership Validation Pattern**: Strict "Fetch → Validate → Execute" for all content operations.

### Collaboration & Sharing System
- **Multi-User Collaboration**: Granular permission controls (View, Comment, Edit) for notebooks and projects, enforced via RLS middleware.

### Testing & Quality Assurance
- **Test Framework**: Playwright for end-to-end testing, with comprehensive regression tests for the World Anvil import pipeline.

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