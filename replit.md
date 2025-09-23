# WriteCraft - Creative Writing Tools Platform

## Overview

WriteCraft is a comprehensive web platform designed to support creative writers with an extensive suite of tools, generators, and educational resources. The platform provides writers with character generators, plot structure tools, writing prompts, setting builders, and detailed writing guides to enhance their creative process. Built as a modern full-stack application, it features a clean, writer-friendly interface inspired by Writer's Digest and Reedsy, with enhanced aesthetics for creative professionals.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript for type safety and developer experience
- **Styling**: Tailwind CSS with custom design system featuring writer-friendly typography (Merriweather serif for headings, Open Sans for body text)
- **UI Components**: Comprehensive component library built on Radix UI primitives (shadcn/ui) for accessibility and consistency
- **State Management**: TanStack Query for server state management with optimistic updates and caching
- **Routing**: Wouter for lightweight client-side routing
- **Build Tool**: Vite for fast development and optimized production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js framework for RESTful API endpoints
- **Language**: TypeScript throughout the stack for consistency and type safety
- **API Design**: RESTful endpoints organized by feature (characters, plots, prompts, guides, etc.)
- **Content Generation**: Server-side algorithms for generating creative writing content with genre-specific variations

### Data Storage
- **Database**: PostgreSQL for structured data storage with strong consistency
- **ORM**: Drizzle ORM for type-safe database operations and migrations
- **Schema**: Well-defined tables for users, generated content (characters, plots, prompts), guides, and user collections
- **Connection**: Neon serverless PostgreSQL with connection pooling for scalability

### Design System & Theming
- **Color Palette**: Professional writer-focused colors with creative purple primary (#6B73FF), teal secondary, and warm orange accents
- **Dark/Light Mode**: Complete theme system with CSS custom properties and automatic system preference detection
- **Typography Scale**: Hierarchical font sizing with serif headings and sans-serif body text for optimal readability
- **Component Variants**: Consistent styling patterns across buttons, cards, and interactive elements

### Content Management
- **Generator System**: Modular content generation for characters, plots, settings, names, conflicts, themes, and moods
- **Writing Guides**: Structured educational content with categories, difficulty levels, and comprehensive search
- **User Collections**: System for saving and organizing generated content and favorite guides
- **Enhanced Character Editor**: Responsive sidebar navigation system with 6 logical sections (Identity, Appearance, Mind & Personality, Skills & Powers, Life & Background, Prompts) that replaces cramped multi-row tab layouts with clean, organized navigation for both desktop and mobile users

## External Dependencies

### Database & Infrastructure
- **@neondatabase/serverless**: Serverless PostgreSQL database connection and management
- **connect-pg-simple**: PostgreSQL session store for user session management
- **drizzle-orm & drizzle-kit**: Type-safe ORM with migration tooling

### UI & Design
- **@radix-ui/***: Comprehensive set of accessible UI primitives for consistent component behavior
- **tailwindcss**: Utility-first CSS framework with custom design tokens
- **class-variance-authority**: Type-safe component variant system
- **lucide-react**: Modern icon library for consistent iconography

### Development & Tooling
- **vite**: Fast build tool with HMR for development
- **@replit/vite-plugin-runtime-error-modal**: Development error handling for Replit environment
- **tsx**: TypeScript execution for server-side development

### State & Data Management
- **@tanstack/react-query**: Server state management with caching, background updates, and optimistic updates
- **react-hook-form & @hookform/resolvers**: Form management with validation
- **zod**: Runtime type validation for API requests and responses

### Utilities
- **date-fns**: Date manipulation and formatting
- **nanoid**: Unique ID generation for database records
- **clsx & tailwind-merge**: Conditional CSS class management