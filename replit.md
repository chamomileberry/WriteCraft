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