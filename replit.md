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

### Technical Implementations
- **Frontend**: React with TypeScript, Zustand for client state, TanStack Query for server state, Wouter for routing, and Vite for building.
- **Backend**: Node.js with Express.js and TypeScript, using RESTful API design for content generation.
- **Data Storage**: PostgreSQL (Neon serverless) with Drizzle ORM for all application data.
- **Authentication**: Replit Auth integration (Google, GitHub, X, Apple, email/password) with PostgreSQL-backed sessions.
- **Session Management**: PostgreSQL for persistent session data; in-memory Map for concurrent session tracking; optional Redis support for distributed environments; max 3 concurrent sessions per user with auto-eviction.
- **Security**: Multi-Factor Authentication, API Key Rotation, Intrusion Detection, Nonce-based CSP, Zod validation, Redis-backed rate limiting, enhanced security headers, SRI, XSS protection, bcrypt for password hashing, Row-Level Security, and strict ownership validation.

### Feature Specifications
- **Content Management**: Notebook system with rich text editor, modular generator system, writing guides, hierarchical project system, and enhanced character editor.
- **AI-Powered Tools**: Grammarly-style assistance, context-aware generation, conversational writing assistant, literary examples, and dialogue-driven guidance (Anthropic's Claude 3.5 Sonnet).
- **AI Usage Tracking**: Comprehensive token-based usage tracking with tier-based daily limits; middleware system (`trackAIUsage`, `attachUsageMetadata`) for automatic limit enforcement and usage logging; all AI generation functions return `AIGenerationResult<T>` with usage metadata (input/output tokens, cache metrics); PostgreSQL-backed usage logs (`ai_usage_logs`, `ai_usage_daily_summary`) with operation type tracking; Usage Dashboard API (`/api/usage/today`, `/api/usage/history`) with real-time statistics, forecasting, and historical analysis; Free tier: 20 generations/day, Author: 100/day, Professional: unlimited.
- **Timeline System**: Triple view modes (List, Canvas, Gantt), timescale toggles, swim lanes, template system, mobile responsiveness, and auto-layout with relationship edges.
- **Subscription & Monetization**: Tier system (Free, Author, Professional, Team) with server-side enforcement, AI usage tracking, Free tier auto-provisioning, `useSubscription` hook, Usage Analytics Dashboard with forecasting, and contextual upgrade prompts.
- **Billing Infrastructure**: Plan Preview with real-time proration via Stripe's upcoming invoice API; Payment Methods Management using Stripe Setup Intents; Invoice Management System; Billing Alerts System (payment failures, trial warnings via Stripe webhooks); Subscription Pause/Resume System with feature access gating; Discount Code System (percentage/fixed, usage limits, tier restrictions, Stripe coupon sync, admin management).
- **Grace Period System**: 7-day warning period before strict enforcement when users exceed tier limits (projects, notebooks, AI generations); grace period tracks when user FIRST exceeds ANY limit and persists until ALL limits are back under quota; prevents infinite restart gaming via `isUnderAllLimits()` check across all quotas; supports recovery from expired grace periods when usage returns to compliance; `checkGracePeriodStatus()` returns explicit null values for TypeScript safety; `/api/subscription/status` endpoint provides comprehensive status (tier, limits, usage, grace period, warnings) for frontend UI.
- **User Migration System**: Intelligent tier recommendation service (`UserMigrationService`) analyzes user activity (projects, notebooks, AI usage, collaborators) to recommend appropriate subscription tier with confidence scores and detailed reasoning; self-service migration endpoints allow users to preview and execute their own account migration; admin bulk migration endpoints disabled pending role verification implementation; migration strategy includes AI-only users via `aiUsageDailySummary` queries.
- **Collaboration & Sharing**: Granular permission controls (View, Comment, Edit) enforced via RLS.
- **Team Management System**: Role hierarchy, token-based invitations, real-time activity feed, shared AI quota, and dedicated UI.
- **Data Import/Export**: World Anvil import system (17 content types) with field mapping and error reporting.
- **Character Data Consolidation Tool**: Admin interface for data quality management.

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