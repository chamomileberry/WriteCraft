# WriteCraft - Creative Writing Tools Platform

## Overview

WriteCraft is a comprehensive web platform providing creative writers with an extensive suite of tools, generators, and educational resources. It aims to enhance the creative workflow through features like character generators, plot structure tools, writing prompts, setting builders, and detailed writing guides. The platform offers a modern, full-stack application with a clean, writer-friendly interface, focusing on supporting professional writers.

## User Preferences

Preferred communication style: Simple, everyday language.
Documentation: Proactively create documentation for new features, APIs, and system changes to help future developers understand the codebase.

## System Architecture

### UI/UX Decisions
- **Design System**: Custom design system using Tailwind CSS and Radix UI primitives (shadcn/ui).
- **Theming**: Professional writer-focused color palette (purple primary, teal secondary, orange accents) with Dark/Light mode support.
- **Typography**: Hierarchical font sizing with serif headings and sans-serif body text.
- **User Feedback**: Standardized toast notifications and auto-navigation post-generation/save.
- **Z-Index Hierarchy**: Consistent layering system using CSS custom properties (--z-header: 40, --z-floating: 50, --z-modal: 60, --z-toast: 70). All UI components follow this hierarchy: Headers at z-40, floating elements (popovers, dropdowns, tooltips, bubble menus) at z-50, modals (dialogs, sheets) at z-60, and toasts at z-70. This prevents layering conflicts and ensures predictable stacking behavior.
- **Page Layout Conventions**: Fixed-viewport experiences (editors, canvases, timelines, conversations) use h-screen for precise viewport control with internal scrolling. Scrollable content pages (lists, settings, documentation) use min-h-screen to allow natural page scrolling. Components never combine overflow-hidden with hover-elevate utilities to prevent elevation animation conflicts.

### Technical Implementations
- **Frontend**: React with TypeScript, Zustand for client state, TanStack Query for server state, Wouter for routing, and Vite for building.
- **Backend**: Node.js with Express.js and TypeScript, using RESTful API design for content generation.
- **Data Storage**: PostgreSQL (Neon serverless) with Drizzle ORM for all application data.
- **Authentication**: Replit Auth integration (Google, GitHub, X, Apple, email/password) with PostgreSQL-backed sessions.
- **Session Management**: PostgreSQL for persistent session data; in-memory Map for concurrent session tracking; optional Redis support for distributed environments; max 3 concurrent sessions per user with auto-eviction.
- **Security**: Multi-Factor Authentication, API Key Rotation, Intrusion Detection (disabled in development to prevent false positives), Nonce-based CSP, Zod validation, Redis-backed rate limiting (10,000 req/15min in dev, 1,000 in prod), enhanced security headers, SRI, XSS protection, bcrypt for password hashing, Row-Level Security, and strict ownership validation.

### Feature Specifications
- **Content Management**: Notebook system with rich text editor, modular generator system, writing guides, hierarchical project system, and enhanced character editor.
- **AI-Powered Tools**: Grammarly-style assistance, context-aware generation, conversational writing assistant, literary examples, and dialogue-driven guidance. Uses hybrid model strategy:
  - **Standard Operations**: Claude Haiku 4.5 (67% cost reduction, 3-5x faster speed, matches Sonnet 4 performance)
  - **Premium Features** (Professional/Team only): Claude Opus 4.1 for Polish (content enhancement) and Extended Thinking (deep reasoning in chat)
  - **Entity Detection System**: Analyzes conversation history in the Writing Assistant to automatically extract character, location, and plot point details; displays EntityActionCards with confidence scores; EntityPreviewDialog allows review/editing of extracted data before creation; 2-second debouncing prevents performance lag; creates entities via POST endpoints with automatic query invalidation; robust JSON parsing with multiple fallback strategies handles malformed AI responses; error handling provides user feedback via toast notifications
- **AI Usage Tracking**: Comprehensive token-based usage tracking with tier-based limits; middleware system (`trackAIUsage`, `attachUsageMetadata`) for automatic limit enforcement and usage logging; all AI generation functions return `AIGenerationResult<T>` with usage metadata (input/output tokens, cache metrics); PostgreSQL-backed usage logs (`ai_usage_logs`, `ai_usage_daily_summary`) with operation type tracking; Usage Dashboard API (`/api/usage/today`, `/api/usage/history`) with real-time statistics, forecasting, and historical analysis.
  - **Standard AI Limits**: Free: 20/day, Author: 100/day, Professional/Team: unlimited
  - **Premium Opus Limits**: Polish (Professional: 20/month, Team: 50/month), Extended Thinking (Professional: 100/month, Team: 500/month)
- **Timeline System**: Triple view modes (List, Canvas, Gantt), timescale toggles, swim lanes, template system, mobile responsiveness, and auto-layout with relationship edges. Enhanced features include:
  - **Event Type Configuration**: Centralized system (`eventTypeConfig.ts`) with predefined icons and colors for 9 event types (battle, discovery, birth, death, meeting, political, cultural, location, other); typed helpers (`getEventTypeIcon`, `getEventTypeColor`, `getEventTypeIconName`) for consistent icon/color resolution.
  - **Character Linking**: Multi-select character association with events via `characterIds` text array field; EventEditDialog fetches characters with avatar previews; TimelineEventNode displays up to 3 character avatars with tooltips, "+N" overflow badge for >3 characters; efficient single fetch per timeline.
  - **Custom Icons & Colors**: Icon picker (Select dropdown with Lucide icon previews) and color picker (Select with color swatches) in EventEditDialog; auto-fill based on selected event type for new events; stores serializable strings (icon: 'Swords', color: '#ef4444'); TimelineEventNode renders custom values with fallback to type-based defaults; dynamic option inclusion ensures saved custom icons persist through edit cycles.
  - **Relationship Creation**: RelationshipCreateDialog component replaces "Coming Soon" toast; allows users to select target event and relationship type (causes, precedes, concurrent, related) with optional description; filters source event from target options; creates relationships via POST `/api/timeline-relationships`; invalidates queries to show new edges on canvas; integrated into TimelineCanvas via `handleAddRelationship`.
  - **Visual Rendering**: TimelineEventNode uses custom icons and colors when available, falls back to EVENT_TYPE_CONFIGS based on event type; applies color to icon background (8% opacity) and icon itself (full color); maintains visual consistency across all timeline views.
- **Subscription & Monetization**: Tier system (Free, Author, Professional, Team) with server-side enforcement, AI usage tracking, Free tier auto-provisioning, `useSubscription` hook, Usage Analytics Dashboard with forecasting, and contextual upgrade prompts.
- **Billing Infrastructure**: Plan Preview with real-time proration via Stripe's upcoming invoice API; Payment Methods Management using Stripe Setup Intents; Invoice Management System; Billing Alerts System (payment failures, trial warnings via Stripe webhooks); Subscription Pause/Resume System with feature access gating; Discount Code System (percentage/fixed, usage limits, tier restrictions, Stripe coupon sync, admin management).
- **Grace Period System**: 7-day warning period before strict enforcement when users exceed tier limits (projects, notebooks, AI generations); grace period tracks when user FIRST exceeds ANY limit and persists until ALL limits are back under quota; prevents infinite restart gaming via `isUnderAllLimits()` check across all quotas; supports recovery from expired grace periods when usage returns to compliance; `checkGracePeriodStatus()` returns explicit null values for TypeScript safety; `/api/subscription/status` endpoint provides comprehensive status (tier, limits, usage, grace period, warnings); **Frontend Integration**: Global `GracePeriodBanner` (active/expired states with upgrade CTAs), `LimitExceededDialog` (shown only after grace period expires), `SubscriptionStatusCard` (usage dashboard with progress bars), `useSubscription` hook (fetches grace period and limit status); UX Flow: During active grace period, users can create resources with toast warnings; after expiration, strict blocking with upgrade requirement; all AI generators protected by server-side `trackAIUsage` middleware.
- **User Migration System**: Intelligent tier recommendation service (`UserMigrationService`) analyzes user activity (projects, notebooks, AI usage, collaborators) to recommend appropriate subscription tier with confidence scores and detailed reasoning; self-service migration endpoints allow users to preview and execute their own account migration; admin bulk migration endpoints disabled pending role verification implementation; migration strategy includes AI-only users via `aiUsageDailySummary` queries.
- **Collaboration & Sharing**: Granular permission controls (View, Comment, Edit) enforced via RLS.
- **Team Management System**: Role hierarchy, token-based invitations, real-time activity feed, shared AI quota, and dedicated UI.
- **Data Import/Export**: World Anvil import system (17 content types) with field mapping and error reporting.
- **Character Data Consolidation Tool**: Admin interface for data quality management.
- **Canvas System**: Visual whiteboard feature using Excalidraw for creating story diagrams, character relationship maps, and plot structures; database schema includes `canvases` table with JSON data storage; API endpoints at `/api/canvases` for CRUD operations; integrated with projects system for organization.
- **Onboarding System**: Interactive wizard for new users with two paths: (1) Experienced User Tour - 4-step overlay highlighting main features, (2) New User Tutorial - guided character creation with AI generation; database fields: `onboardingCompleted`, `onboardingStep`, `experienceLevel`; API endpoints: GET/PATCH `/api/user/preferences`; dialog dismissal prevention implemented via `onInteractOutside` and `onEscapeKeyDown` handlers; character generation uses capitalized genre values ("Fantasy" not "fantasy"); tutorial creates default "My First Notebook" and includes notebookId when saving characters.

### System Design Choices
- **Code Organization**: Centralized constants, API layer, custom Zustand hooks, and schema-driven form generation.
- **Code Reusability**: Custom hooks for autosave, debounced save, notebook requirements, and generators.
- **Testing**: Playwright for end-to-end and regression testing, especially for the World Anvil import pipeline.

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