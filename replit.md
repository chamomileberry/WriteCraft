# WriteCraft - Creative Writing Tools Platform

## Overview
WriteCraft is a comprehensive web platform designed to empower creative writers with an extensive suite of tools, generators, and educational resources. It aims to streamline the creative process through features like character generators, plot structure tools, writing prompts, setting builders, and detailed writing guides. The platform offers a modern, full-stack application with a clean, user-friendly interface, focusing on supporting professional writers and enhancing their workflow.

## User Preferences
Preferred communication style: Simple, everyday language.
Documentation: Proactively create documentation for new features, APIs, and system changes to help future developers understand the codebase.

## System Architecture

### UI/UX Decisions
- **Design System**: Custom design system built with Tailwind CSS and Radix UI primitives (shadcn/ui), supporting Dark/Light modes.
- **Theming**: Professional writer-focused color palette (purple primary, teal secondary, orange accents).
- **Typography**: Hierarchical font sizing with serif headings and sans-serif body text.
- **User Feedback**: Standardized toast notifications and auto-navigation post-generation/save.
- **Z-Index Hierarchy**: Consistent layering using CSS custom properties for headers (z-40), floating elements (z-50), modals (z-60), and toasts (z-70) to prevent conflicts.
- **Page Layout Conventions**: Fixed-viewport experiences use `h-screen` for precise control, while scrollable content pages use `min-h-screen`.

### Technical Implementations
- **Frontend**: React with TypeScript, Zustand for client state, TanStack Query for server state, Wouter for routing, and Vite for building.
- **Backend**: Node.js with Express.js and TypeScript, utilizing RESTful API design.
- **Data Storage**: PostgreSQL (Neon serverless) with Drizzle ORM.
- **Authentication**: Replit Auth integration with PostgreSQL-backed sessions, supporting Google, GitHub, X, Apple, and email/password.
- **Session Management**: PostgreSQL for persistent sessions, in-memory Map for concurrent tracking, max 3 concurrent sessions per user with auto-eviction.
- **Security**: Multi-Factor Authentication, API Key Rotation, Intrusion Detection (prod only), Nonce-based CSP, Zod validation, Redis-backed rate limiting, enhanced security headers, SRI, XSS protection, bcrypt for password hashing, Row-Level Security, and strict ownership validation.

### Feature Specifications
- **Content Management**: Notebook system with rich text editor, modular generator system, writing guides, hierarchical project system, and an enhanced character editor.
- **AI-Powered Tools**: Grammarly-style assistance, context-aware generation, conversational writing assistant, and literary examples. Employs a hybrid AI model strategy: Claude Haiku 4.5 for standard operations and Claude Opus 4.1 for premium features (Professional/Team tiers). Includes an entity detection system for extracting and managing character, location, and plot point details from conversations. All AI generation endpoints use makeAICall with intelligent model selection, prompt caching, rate limiting (30 req/15min), usage tracking, and metadata attachment.
- **Content Generators**: Theme, conflict, item, and location generators with contextual AI generation, notebook ownership validation, and proper error handling. All generators follow the established pattern: aiRateLimiter → trackAIUsage → makeAICall → attachUsageMetadata.
- **AI Usage Tracking**: Comprehensive token-based usage tracking with tier-based limits, enforced via middleware. Logs usage to PostgreSQL and provides a Usage Dashboard API for real-time statistics and historical analysis.
- **Timeline System**: Offers List, Canvas, and Gantt views with timescale toggles and swim lanes. Supports event type configuration with custom icons/colors, multi-character linking with avatar previews, and a relationship creation dialog for defining connections between events.
- **Subscription & Monetization**: Tier system (Free, Author, Professional, Team) with server-side enforcement, AI usage tracking, and contextual upgrade prompts.
- **Billing Infrastructure**: Plan Preview with real-time proration via Stripe, payment method management, invoice management, billing alerts, subscription pause/resume, and discount code system.
- **Grace Period System**: A 7-day warning period before strict limit enforcement for users exceeding tier quotas, preventing immediate feature lockout. Tracks and manages user recovery from exceeded limits.
- **User Migration System**: Intelligent tier recommendation service analyzes user activity to suggest appropriate subscription tiers, with self-service and admin migration endpoints.
- **Collaboration & Sharing**: Granular permission controls (View, Comment, Edit) enforced via Row-Level Security.
- **Team Management System**: Role hierarchy, token-based invitations, real-time activity feed, shared AI quota, and dedicated UI.
- **Data Import/Export**: World Anvil import system (17 content types) and a data migration system for exporting development data to production.
- **Canvas System**: Visual whiteboard using Excalidraw for story diagrams and plot structures, integrated with projects.
- **Onboarding System**: Interactive wizard for new users, offering an "Experienced User Tour" or a "New User Tutorial" (guided character creation with AI generation).

### Production Infrastructure
- **Error Tracking**: Sentry integration for error capture, performance monitoring, CPU/memory profiling, and user context tracking.
- **Analytics**: PostHog integration for product analytics, tracking page views, user identification, content generation, and AI assistant usage.
- **Logging Strategy**: Pino structured logging with JSON output in production, redacting sensitive fields.
- **Uptime Monitoring**: Health check endpoints at `/api/health`, `/api/health/db`, `/api/health/detailed`.

### System Design Choices
- **Code Organization**: Centralized constants, API layer, custom Zustand hooks, and schema-driven form generation.
- **Code Reusability**: Custom hooks for autosave, debounced save, and generators.
- **Testing**: Playwright for end-to-end and regression testing.
- **Recent Improvements (Oct 26, 2025)**:
  - Cleaned up misleading TODOs: Removed outdated share system comments (shares fully implemented), removed duplicate project links code
  - Enhanced migration routes with proper requireAdmin middleware enforcement
  - Implemented AI generation for themes, conflicts, items, and locations with full security and usage tracking
  - Added 'item_generation' and 'location_generation' to OperationType enum for proper model selection and cache segregation
  - Enhanced QuickNotePanel with functional new note creation using workspace panel management

## External Dependencies

### Database & Infrastructure
- **@neondatabase/serverless**: Serverless PostgreSQL connection.
- **connect-pg-simple**: PostgreSQL session store.
- **drizzle-orm & drizzle-kit**: ORM and migration tooling.

### UI & Design
- **@radix-ui/***: Accessible UI primitives.
- **tailwindcss**: Utility-first CSS framework.
- **class-variance-authority**: Type-safe component variant system.
- **lucide-react**: Icon library.

### Development & Tooling
- **vite**: Fast build tool.
- **@replit/vite-plugin-runtime-error-modal**: Replit-specific error handling.
- **tsx**: TypeScript execution for server-side.

### State & Data Management
- **@tanstack/react-query**: Server state management.
- **react-hook-form & @hookform/resolvers**: Form management and validation.
- **zod**: Runtime type validation.

### Utilities
- **date-fns**: Date manipulation.
- **nanoid**: Unique ID generation.
- **clsx & tailwind-merge**: Conditional CSS class management.