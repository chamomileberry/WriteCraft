# WriteCraft - Creative Writing Tools Platform

## Overview

WriteCraft is a comprehensive web platform designed to support creative writers with an extensive suite of tools, generators, and educational resources. It provides character generators, plot structure tools, writing prompts, setting builders, and detailed writing guides to enhance the creative process. The platform aims to be a modern, full-stack application with a clean, writer-friendly interface, enhancing the creative workflow for professional writers.

## User Preferences

Preferred communication style: Simple, everyday language.
Documentation: Proactively create documentation for new features, APIs, and system changes to help future developers understand the codebase.

## System Architecture

### Frontend
- **Framework**: React with TypeScript
- **Styling**: Tailwind CSS with a custom design system and writer-friendly typography (Merriweather, Open Sans)
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
- **ORM**: Drizzle ORM for type-safe operations
- **Schema**: Tables for users, generated content, guides, and user collections.

### Design System & Theming
- **Color Palette**: Professional writer-focused colors (purple primary, teal secondary, orange accents)
- **Theming**: Dark/Light mode with CSS custom properties
- **Typography**: Hierarchical font sizing with serif headings and sans-serif body text.

### Key Features
- **Authentication**: Replit Auth integration (Google, GitHub, X, Apple, email/password) with PostgreSQL-backed sessions.
- **Account Management**: User profiles, editing, and secure access control.
- **Content Management**:
    - **Notebook System**: User-created notebooks for organizing worldbuilding content with scoping and active notebook persistence. Includes responsive grid display with image thumbnails and improved empty states for onboarding.
    - **Generator System**: Modular content generation (characters, plots, settings, names, conflicts, themes, moods).
    - **Writing Guides**: Structured educational content with categories and search, featuring admin-only creation, editing, deletion, and publishing with draft/published workflows.
    - **Hierarchical Project System**: Project management with unlimited folder nesting, pages (sections), rich text editor (TipTap), auto-save, media insertion, and export capabilities.
    - **Enhanced Character Editor**: Responsive sidebar navigation for character details.
    - **AI-Powered Inline Editing**: Grammarly-style AI assistance integrated across all text editors, offering actions like improving, shortening, expanding, fixing grammar, and suggestions using Anthropic's Claude 3.5 Sonnet. AI suggestions are positioned accurately.
    - **Writing Assistant Panel**: Conversational AI assistant for analyzing text, proofreading, generating questions, and providing writing feedback.
    - **AI Writing Style**: All AI features adhere to comprehensive anti-cliché guidelines to produce human-like, authentic, and expressive writing, avoiding robotic patterns and forbidden phrases.

### AI Human-Like Writing Style Guidelines (Oct 4)
- **Comprehensive Anti-Cliché System**: Implemented extensive style guidelines across all AI features to produce authentic, human-like writing
  - **Forbidden Phrases (350+)**: Exhaustive ban on overused AI expressions including:
    - Generic insights: "valuable insights", "actionable insights", "key takeaways", "treasure trove"
    - Overused metaphors: "indelible mark", "tapestry", "journey", "beacon of hope", "golden ticket", "uncharted waters"
    - Corporate buzzwords: "leverage", "optimize", "utilize", "synergy", "paradigm shift", "game-changer", "disruptive innovation", "scalable", "bandwidth"
    - Tech jargon: "AI-powered", "cloud-based", "blockchain-enabled", "digital transformation", "cutting-edge", "state-of-the-art", "next-generation"
    - Business clichés: "best practices", "thought leadership", "competitive landscape", "value proposition", "stakeholders", "deliverables", "roi", "kpis"
    - Flowery language: "delve into", "embark on", "navigate the landscape", "at its core", "robust", "seamless", "comprehensive", "meticulous"
    - Agile/tech terms: "sprint", "scrum", "mvp", "poc", "roadmap", "iteration", "deployment", "granular"
    - Overused adjectives: "profound", "remarkable", "captivating", "exemplary", "invaluable", "unparalleled", "groundbreaking", "revolutionary"
    - Corporate speak: "operational excellence", "process optimization", "strategic alignment", "resource allocation", "continuous improvement"
  - **Transition Word Controls**: Banned overuse of robotic transitions (however, moreover, furthermore, consequently, notably, ultimately, etc.)
  - **Natural Word Replacements**: Guidelines for authentic alternatives (e.g., "explore/look into" instead of "delve into", "important/key" instead of "pivotal", "use/apply" instead of "harness/leverage")
  - **Human Authenticity Requirements**:
    - Be diffident and partisan - express opinions and genuine uncertainty
    - Choose words for emotional resonance and personal connection
    - Include personal touches showing individuality and quirks
    - Draw from lived experience with anecdotes and emotional nuance
    - Vary sentence length unpredictably (mix short punchy with longer flowing)
    - Use conversational rhythm and natural speech patterns
    - Embrace natural imperfection over polished prose
    - Write with personality - let emotion and perspective show through
    - Avoid formulaic structures, bullet points, predictable formatting
    - Sound clear, creative, nuanced, expressive
  - **Robotic Pattern Avoidance**: Eliminates repetitive structures, generic generalizations, stiff academic tone, perfectly balanced phrasing, predictable conclusions, corporate buzzwords
  - **Implementation**: Applied to all AI features including inline suggestions (Improve, Shorten, Expand, Fix Grammar, Ask AI), Writing Assistant chat, text analysis, proofreading, rephrasing, and description generation
  - Files: `server/routes/ai.routes.ts`, `server/ai-generation.ts`

### Security & Authorization (Oct 6, 2025 - Comprehensive Hardening)
- **Multi-Layer Security Architecture**: Enterprise-grade security implementation protecting against all major web vulnerabilities
  
**Security Layers:**
1. **Input Sanitization** (Pre-Authentication Layer)
   - SQL injection protection: Blocks dangerous SQL patterns
   - XSS protection: Removes HTML/script tags and malicious content
   - Prototype pollution prevention: Filters `__proto__`, `constructor`, `prototype` keys
   - String length limits (10,000 chars) and array size limits (100 items)
   - Runs AFTER body parsing (express.json/urlencoded) to ensure req.body exists
   
2. **Authentication & Access Control**
   - Enhanced authentication middleware with session validation
   - Test mode bypass protection (blocks x-test-user-id in production)
   - Token expiration checking and automatic refresh
   - Unauthorized requests return 401 (authentication enforcement)
   
3. **Rate Limiting**
   - Global: 100 requests / 15 minutes per user/IP
   - User profile updates: 20 requests / 15 minutes
   - User deletion: 5 requests / 15 minutes
   - Admin operations: 10 requests / 15 minutes
   - Rate limit headers in responses (X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset)
   
4. **Admin Privilege Protection**
   - `isAdmin` field cannot be modified via regular user endpoints
   - Strict Zod schema validation rejects additional fields
   - Only firstName, lastName, profileImageUrl updatable via user profile
   - Dedicated admin-only endpoint at `/api/admin/users/:id/role`
   - Self-demotion prevention (cannot remove last admin)
   - All privilege escalation attempts logged as CRITICAL events
   
5. **Row-Level Security (RLS)**
   - Application-level RLS with ownership validation
   - Triple-filter pattern: `id`, `userId`, AND `notebookId` for multi-tenant isolation
   - Fetch → Validate → Execute pattern for all data operations
   - Unauthorized access returns 404 (not 403) to prevent resource enumeration
   - `enforceRowLevelSecurity` middleware on all protected routes
   
6. **CSRF Protection**
   - Token-based CSRF protection for state-changing operations (POST, PUT, PATCH, DELETE)
   - 1-hour token expiry with secure generation
   - Timing-safe token comparison prevents timing attacks
   - Token generation endpoint: `/api/auth/csrf-token`
   - Applied to user updates, deletions, admin operations
   
7. **Security Headers**
   - X-Frame-Options: DENY (clickjacking protection)
   - X-Content-Type-Options: nosniff (MIME sniffing protection)
   - X-XSS-Protection: 1; mode=block
   - Content-Security-Policy: default-src 'self'
   - Strict-Transport-Security: max-age=31536000 (HTTPS enforcement)
   - Referrer-Policy: strict-origin-when-cross-origin
   - Permissions-Policy: disables unnecessary browser features
   
8. **Security Audit Logging**
   - Comprehensive event logging for security incidents
   - Event types: AUTH_FAILURE, PRIVILEGE_ESCALATION, UNAUTHORIZED_ACCESS, DATA_BREACH_ATTEMPT, RATE_LIMIT, CSRF_FAILURE
   - Severity levels: LOW, MEDIUM, HIGH, CRITICAL
   - Structured JSON logging with timestamps, IPs, and user agents

**Ownership Validation Pattern**: All content operations enforce strict ownership validation using a "Fetch → Validate → Execute" pattern.

**Critical Security Rules**:
1. All delete/update operations must fetch the record first, validate ownership, then execute.
2. Delete operations triple-filter by `id`, `userId`, AND `notebookId` for multi-tenant isolation.
3. Unauthorized access returns 404 (not 403) to prevent information disclosure.
4. Structured logging is implemented for all ownership denial attempts.

**Security Test Verification**:
- ✅ SQL injection blocked (400 "Invalid input detected")
- ✅ XSS attacks blocked (400 "Invalid input detected")
- ✅ Rate limiting active (headers present and functioning)
- ✅ Security headers verified (X-Frame-Options, X-Content-Type-Options, X-XSS-Protection)
- ✅ Authentication enforcement (401 for unauthenticated requests)
- ✅ Admin field protection (strict schema validation)
- ✅ Middleware ordering correct (sanitization after body parsing)

**Security Module Files**:
- `server/security/middleware.ts` - Core security middleware
- `server/security/userRoutes.ts` - Secure user management endpoints
- `server/security/test-endpoints.ts` - Security testing endpoints (dev only)
- `server/security/index.ts` - Module exports
- `server/app-security.ts` - Security middleware application
- `SECURITY.md` - Complete security documentation
- `SECURITY_SUMMARY.md` - Security implementation summary

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