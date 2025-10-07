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