# WriteCraft - Creative Writing Tools Platform

## Overview
WriteCraft is a web platform offering a comprehensive suite of creative writing tools, generators, and educational resources. Its purpose is to streamline the creative process for professional writers through features like character generators, plot tools, writing prompts, setting builders, and writing guides. The platform provides a modern, full-stack application with a user-friendly interface to enhance writers' workflows. The business vision is to become a leading platform for creative writers, offering innovative AI-powered assistance and robust organizational tools to unlock market potential and achieve project ambitions.

## User Preferences
Preferred communication style: Simple, everyday language.
Documentation: Proactively create documentation for new features, APIs, and system changes to help future developers understand the codebase.

## System Architecture

### UI/UX Decisions
- **Design System**: Custom design system using Tailwind CSS and Radix UI (shadcn/ui), supporting Dark/Light modes.
- **Theming**: Professional writer-focused color palette (purple, teal, orange accents). Theme preferences persist across sessions, devices, and browser tabs.
- **Theme Persistence Architecture**: Centralized ThemeProvider (use-theme.tsx) with race-condition-free implementation:
  - Database-first approach with localStorage fallback for non-logged-in users
  - Cross-tab synchronization via storage events
  - Per-user theme isolation with automatic reset on user changes (login/logout/switch)
  - Guard against late-resolving preference fetches overwriting manual toggles
  - Prevents flash of unstyled content by initializing from localStorage immediately
- **Typography**: Hierarchical font sizing with serif headings and sans-serif body text.
- **User Feedback**: Standardized toast notifications and auto-navigation post-generation/save.
- **Page Layout Conventions**: Fixed-viewport experiences use `h-screen`, scrollable content pages use `min-h-screen`.

### Technical Implementations
- **Frontend**: React with TypeScript, Zustand for client state, TanStack Query for server state, Wouter for routing, and Vite for building.
- **Backend**: Node.js with Express.js and TypeScript, using RESTful APIs.
- **Data Storage**: PostgreSQL (Neon serverless) with Drizzle ORM.
- **Authentication**: Replit Auth integrated with PostgreSQL-backed sessions, supporting Google, GitHub, X, Apple, and email/password. Max 3 concurrent sessions per user with auto-eviction.
- **Security**: Multi-Factor Authentication, API Key Rotation, Intrusion Detection (opt-in dry run mode, configurable thresholds), IP Whitelist (CIDR support), Nonce-based CSP, Zod validation, Redis-backed rate limiting, enhanced security headers, SRI, XSS protection, bcrypt for password hashing, Row-Level Security, and strict ownership validation.
- **Production Infrastructure**: Sentry for error tracking, PostHog for product analytics (GDPR/CCPA compliant), Pino for structured logging, and health check endpoints for uptime monitoring.
- **GDPR/CCPA Compliance**: Cookie consent banner, detailed privacy policy, documented data retention policies, and consent-gated PostHog analytics.
- **Email Notification System**: Nodemailer with Zoho SMTP for transactional emails, including subscription lifecycle, payment, security alerts, team management, and usage limit warnings.

### Feature Specifications
- **Content Management**: Notebook system with rich text editor, modular generator system, writing guides, hierarchical project system, and an enhanced character editor.
- **AI-Powered Tools**: Grammarly-style assistance, context-aware generation, conversational writing assistant, and literary examples. Uses a hybrid AI model strategy (Claude Haiku 4.5, Claude Opus 4.1) with entity detection, intelligent model selection, prompt caching, rate limiting, and usage tracking.
- **Content Generators**: Theme, conflict, item, and location generators with contextual AI generation and notebook ownership validation.
- **AI Usage Tracking**: Token-based usage tracking with tier-based limits, logged to PostgreSQL, and displayed on a Usage Dashboard.
- **Timeline System**: List, Canvas, and Gantt views with timescale toggles and swim lanes, supporting custom event types, multi-character linking, and relationship creation.
- **Subscription & Monetization**: Tier system (Free, Author, Professional, Team) with server-side enforcement, AI usage tracking, contextual upgrade prompts, and a 7-day grace period system for exceeding quotas.
- **Billing Infrastructure**: Stripe integration for plan preview, real-time proration, payment method and invoice management, billing alerts, subscription pause/resume, and discount codes. Includes refund request workflow and cancellation survey.
- **User Migration System**: Intelligent tier recommendation service with self-service and admin migration endpoints.
- **Collaboration & Sharing**: Granular permission controls (View, Comment, Edit) enforced via Row-Level Security.
- **Team Management System**: Role hierarchy, token-based invitations, real-time activity feed, shared AI quota, and dedicated UI.
- **Data Import/Export**: World Anvil import system (17 content types) and development data migration to production.
- **Canvas System**: Visual whiteboard using Excalidraw for story diagrams and plot structures.
- **Onboarding System**: Interactive wizard with "Experienced User Tour" or "New User Tutorial" options.

### System Design Choices
- **Code Organization**: Centralized constants, API layer, custom Zustand hooks, and schema-driven form generation.
- **Code Reusability**: Custom hooks for autosave, debounced save, and generators.
- **Testing**: Playwright for end-to-end and regression testing.

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