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
    - **Notebook System**: User-created notebooks for organizing worldbuilding content with scoping and active notebook persistence.
    - **Generator System**: Modular content generation (characters, plots, settings, names, conflicts, themes, moods).
    - **Writing Guides**: Structured educational content with categories and search.
    - **Hierarchical Project System**: Project management with unlimited folder nesting, pages (sections), rich text editor (TipTap), auto-save, media insertion, and export capabilities.
    - **Enhanced Character Editor**: Responsive sidebar navigation for character details.
    - **AI-Powered Inline Editing**: Grammarly-style AI assistance integrated across all text editors, offering actions like improving, shortening, expanding, fixing grammar, and suggestions using Anthropic's Claude 3.5 Sonnet.
    - **Writing Assistant Panel**: Conversational AI assistant for analyzing text, proofreading, generating questions, and providing writing feedback.

## Security & Authorization

### Ownership Validation Pattern
All content operations (create, read, update, delete) enforce strict ownership validation to ensure complete data isolation between notebooks and users.

**Critical Security Rules:**
1. **Fetch → Validate → Execute**: All delete/update operations must fetch the record first, validate ownership, then execute
2. **Triple-Filter Deletes**: Delete operations filter by `id`, `userId`, AND `notebookId` for multi-tenant isolation
3. **404 for Unauthorized**: Return 404 (not 403) for unauthorized access to prevent information disclosure
4. **Structured Logging**: Log all ownership denial attempts with context for security monitoring

**Security Audit Status (Completed):**
✅ Comprehensive security audit completed across all 56 route files
✅ All 403 responses changed to 404 to prevent information disclosure
✅ Structured logging added for all unauthorized access attempts: `[Security] Unauthorized X attempt - userId: ..., notebookId: ...`
✅ Test suite validates 401/404/200/204 responses (14/14 tests passing)
✅ Zero LSP errors, no regressions detected

**Implementation Pattern:**
```typescript
async deleteContent(id: string, userId: string, notebookId: string): Promise<void> {
  // 1. Fetch existing record
  const [existing] = await db.select().from(table).where(eq(table.id, id));
  
  // 2. Validate userId ownership
  if (!this.validateContentOwnership(existing, userId)) {
    throw new Error('Unauthorized: You do not own this content');
  }
  
  // 3. Validate notebookId association
  if (!existing || existing.notebookId !== notebookId) {
    throw new Error('Content not found in the specified notebook');
  }
  
  // 4. Delete with triple-filter
  const whereClause = and(
    eq(table.id, id),
    eq(table.userId, userId),
    eq(table.notebookId, notebookId)
  );
  await db.delete(table).where(whereClause);
}
```

**Route Error Handling:**
```typescript
try {
  await storage.deleteContent(id, userId, notebookId);
  res.status(204).send();
} catch (error) {
  if (error.message.includes('Unauthorized') || error.message.includes('not found')) {
    console.warn(`[Security] Unauthorized deletion attempt - userId: ${userId}, id: ${id}`);
    return res.status(404).json({ error: 'Content not found' });
  }
  res.status(500).json({ error: 'Internal server error' });
}
```

### Code Review Checklist
Before deploying changes that affect authorization:
- [ ] All delete operations use fetch → validate → delete pattern
- [ ] Update operations validate ownership before modifying
- [ ] Unauthorized access returns 404 (not 403)
- [ ] Triple-filter used for all content deletes (id, userId, notebookId)
- [ ] Structured logging added for ownership denials
- [ ] Test suite validates 401/404/200 scenarios
- [ ] No silent failures (e.g., deleting 0 rows returns success)

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