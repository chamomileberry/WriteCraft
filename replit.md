# WriteCraft - Creative Writing Tools Platform

## Overview

WriteCraft is a comprehensive web platform designed to support creative writers with an extensive suite of tools, generators, and educational resources. It aims to enhance the creative workflow for professional writers through character generators, plot structure tools, writing prompts, setting builders, and detailed writing guides, all within a modern, full-stack application with a clean, writer-friendly interface.

## User Preferences

Preferred communication style: Simple, everyday language.
Documentation: Proactively create documentation for new features, APIs, and system changes to help future developers understand the codebase.

## System Architecture

### UI/UX Decisions
- **Design System**: Custom design system built with Tailwind CSS and Radix UI primitives (shadcn/ui) for accessibility.
- **Theming**: Professional writer-focused color palette (purple primary, teal secondary, orange accents) with Dark/Light mode support via CSS custom properties.
- **Typography**: Hierarchical font sizing with serif headings and sans-serif body text.
- **User Feedback**: Standardized toast notifications and auto-navigation post-generation/save.

### Technical Implementations
- **Frontend**: React with TypeScript, Zustand for client state, TanStack Query for server state, Wouter for routing, and Vite for building.
- **Backend**: Node.js with Express.js and TypeScript, using RESTful API design. Server-side algorithms handle creative writing content generation.
- **Data Storage**: PostgreSQL (Neon serverless) with Drizzle ORM for user, generated content, guides, and collection schemas.
- **Authentication**: Replit Auth integration (Google, GitHub, X, Apple, email/password) with PostgreSQL-backed sessions.
- **Session Management**:
    - Session data stored in PostgreSQL via connect-pg-simple (persistent, reliable)
    - Concurrent session tracking uses in-memory Map (no Redis needed for single-instance deployment)
    - Optional Redis support for distributed session tracking (multi-instance deployments)
    - Maximum 3 concurrent sessions per user with automatic eviction of oldest sessions
- **Security**:
    - Multi-Factor Authentication (TOTP-based 2FA, backup codes).
    - API Key Rotation System for sensitive keys.
    - Intrusion Detection System with IP blocking and security alerts.
    - Nonce-based Content Security Policy (CSP).
    - Comprehensive Zod validation middleware for all high-traffic API routes.
    - Redis for distributed session storage with PostgreSQL fallback.
    - Concurrent session limiting (max 3 active devices).
    - Distributed Redis-backed rate limiting (global, AI generation, search, auth).
    - Enhanced Security Headers (HSTS, X-Content-Type-Options, etc.).
    - Subresource Integrity (SRI) for CDN assets.
    - XSS protection via DOMPurify, bcrypt for password hashing, and Row-Level Security (RLS) for database operations.
    - Strict "Fetch → Validate → Execute" ownership validation.

### Feature Specifications
- **Content Management**: Notebook system with rich text editor (TipTap), modular generator system, writing guides, hierarchical project system, and enhanced character editor.
- **AI-Powered Tools**: Grammarly-style assistance using Anthropic's Claude 3.5 Sonnet, context-aware generation, enhanced conversational writing assistant with emotional intelligence, literary examples, and dialogue-driven guidance.
- **Timeline System**: Features triple view modes (List, Canvas, Gantt), timescale toggles, swim lanes, a template system, mobile responsiveness, and auto-layout with relationship edges for event organization.
- **Subscription & Monetization**:
    - Tier system (Free, Professional, Team) with distinct features.
    - Server-side enforcement of tier limits.
    - Comprehensive AI usage tracking and cost analysis.
    - Free tier auto-provisioning.
    - UseSubscription hook for feature and quota validation in the frontend.
    - Usage Analytics Dashboard with time range selectors, KPIs, visualizations, trend-based forecasting, and proactive upgrade recommendations.
    - Contextual Feature Comparison Tooltips and Upgrade Prompts for users hitting limits.
    - **Billing Infrastructure**:
        - Plan Preview System: Real-time proration calculations using Stripe's upcoming invoice API, showing immediate charges, credits, new charges, and next billing date before plan changes.
        - Payment Methods Management: Stripe Setup Intents integration for adding/removing cards, setting default payment method, secure card storage without immediate charges.
- **Collaboration & Sharing**: Granular permission controls (View, Comment, Edit) for notebooks and projects enforced via RLS.
- **Team Management System**: Role hierarchy (Owner, Admin, Editor, Viewer), token-based invitations, real-time activity feed, shared AI generation quota, and dedicated UI.
- **Data Import/Export**: World Anvil import system (17 content types) with extensive field mapping and error reporting.
- **Character Data Consolidation Tool**: Admin interface for managing data quality.

### System Design Choices
- **Code Organization**: Centralized constants, an API layer, custom Zustand hooks for state abstraction, and a schema-driven form generator from Drizzle/Zod schemas.
- **Code Reusability**: Custom hooks like `useAutosave`, `useDebouncedSave`, `useRequireNotebook`, and `useGenerator`.
- **Testing**: Playwright for end-to-end testing, including comprehensive regression tests for the World Anvil import pipeline.

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
## Recent Feature Additions (October 2025)

### Premium Sample Content Showcase
- **Dedicated Examples Page** (/examples): Displays high-quality AI-generated samples across all content types (characters, plots, settings, creatures, conflicts, themes, descriptions, moods)
- **Tier-Based Access Control**: Samples are locked/unlocked based on user's subscription tier with clear visual indicators
- **Quality Ratings**: Each sample marked as basic, enhanced, premium, or elite showing progression across tiers
- **Interactive Sample Cards**: Full content dialogs for unlocked samples, pricing page redirect for locked samples
- **Search and Filtering**: Category-based tabs and search functionality for easy sample discovery
- **Centralized Data Management**: Sample catalog in client/src/lib/premiumSamples.ts for easy maintenance
- **Balanced Upgrade Messaging**: Educates users about tier benefits without aggressive marketing

### Feature Comparison Tooltips
- **FeatureTooltip Component**: Provides contextual information on pricing page features
- **Hover-Activated Help**: Detailed feature descriptions appear only on user intent
- **Tier Comparison Tables**: Show feature availability across all subscription levels
- **Centralized Configuration**: Feature descriptions in client/src/lib/featureDescriptions.ts
- **Non-Intrusive UX**: Preserves clean pricing page layout while providing helpful information

### Upgrade Prompts
- **Contextual Dialogs**: Shown when users hit daily AI generation limits
- **Universal Integration**: All generator tools (Plot, Setting, Name, Character, Creature, Conflict, Theme, Plant, Description, Mood)
- **Clear Messaging**: Explains tier benefits and upgrade paths
- **Dual Implementation**: Automatic via useGenerator hook for standard generators, manual implementation for custom patterns (like MoodPalette)

### Billing and Subscription System (October 2025)

#### Plan Preview with Proration (Completed)
- **Backend API** (`/api/stripe/preview-subscription-change`):
    - Uses Stripe's `invoices.retrieveUpcoming` API to calculate real-time proration
    - Separates invoice line items into credits (negative amounts) and new charges (positive amounts)
    - Returns detailed breakdown: immediate charge, credits applied, new charges, next billing date
    - Handles edge cases: new subscribers (no active subscription), trial periods, same-tier changes
- **PlanPreviewDialog Component**:
    - Reactive data fetching: refetches when tier or billing cycle changes while dialog is open
    - Uses mutation variables instead of closure to ensure fresh data on every request
    - Dedicated error state with retry functionality
    - Shows loading spinner during API calls
    - Displays different UI for new subscribers vs. existing subscribers with prorations
- **Integration**: Dialog appears before checkout on Pricing page, allowing users to review costs before confirming plan changes
- **Key Technical Decisions**:
    - useEffect triggers refetch when props (tier/billingCycle) change AND dialog is open
    - Mutation uses variables to avoid stale closure data
    - Error handling includes both toast notifications and inline error display with retry

#### Payment Methods Management (Completed)
- **Backend API** (`/api/stripe/payment-methods`):
    - List all payment methods for a customer
    - Add new payment methods using Setup Intents (no immediate charge)
    - Remove payment methods
    - Set default payment method
    - Automatic Stripe customer creation when stripeCustomerId is null
- **PaymentMethods Component**:
    - Displays all saved cards with brand, last 4 digits, expiration
    - Stripe Elements integration for secure card input
    - Inline "Add New Card" form with proper error handling
    - Set default payment method functionality
    - Delete payment methods with confirmation
- **Integration**: Embedded in AccountSettings page under Billing section
- **Security**: Uses Stripe Setup Intents for PCI-compliant card collection, no card data touches the server

#### Upcoming Features (9 remaining tasks)
1. Invoice Management: History, PDF generation, download
2. Billing Alerts: Failed payments, trial expiration warnings
3. Subscription Lifecycle: Pause and resume functionality
4. Discount Codes: Validation, application at checkout
5. Gift Subscriptions: Purchase and redemption flows
6. Referral System: Tracking, rewards, unique codes
7. AI Suggestions: Activity-based upgrade recommendations
8. Testing: End-to-end coverage of all billing flows
9. Documentation: User-facing help content, API documentation
