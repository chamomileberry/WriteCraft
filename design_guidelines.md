
# WriteCraft Platform Design Guidelines

## Design Philosophy
**Reference-Based Approach**: A modern writing platform combining the organizational depth of Scrivener with the collaborative features of Notion, enhanced with AI assistance and a clean, professional interface designed for creative writers.

## Core Design Elements

### A. Color Palette
**Light Mode:**
- Primary: 255 69% 71% (creative purple #6B73FF)
- Secondary: 174 60% 64% (teal #4ECDC4) 
- Background: 0 0% 99% (clean white #FEFEFE)
- Text: 210 25% 25% (charcoal #2D3748)
- Accent: 32 91% 65% (warm orange #F6AD55)
- Success: 145 63% 49% (green #48BB78)
- Muted: 210 40% 96% (light gray for cards/panels)

**Dark Mode:**
- Primary: 255 69% 75% (lighter purple)
- Secondary: 174 50% 70% (softer teal)
- Background: 220 25% 8% (dark charcoal)
- Text: 0 0% 95% (off-white)
- Cards: 220 20% 12% (elevated dark)

### B. Typography
- **Primary Font**: Inter (sans-serif) for UI elements and headings - clean, modern, highly readable
- **Editor Font**: System font stack for writing (Georgia, serif fallback) - comfortable for long-form writing
- **Code Font**: JetBrains Mono for technical content
- **Hierarchy**: h1 (2.5rem), h2 (2rem), h3 (1.5rem), h4 (1.25rem), body (1rem), small (0.875rem)

### C. Layout System
**Spacing Units**: Tailwind units of 2, 4, 6, 8, 12, 16, 20 for consistent rhythm
- Base spacing: p-4, m-4 for components
- Section spacing: py-8, py-12 for vertical rhythm
- Card spacing: p-6 for content containers
- Panel spacing: p-3, p-4 for sidebar panels

### D. Component Library

**Navigation & Structure**
- Sticky header with logo, main navigation, user profile
- Collapsible sidebar for workspace navigation
- Breadcrumb navigation for deep hierarchies
- Responsive hamburger menu for mobile

**Workspace Layout**
- Multi-panel docking system with drag-and-drop
- Floating panels with resize handles
- Tab strips for multiple open items
- Docking zones with visual feedback
- Persistent panel states across sessions

**Content Cards**
- Elevated cards with subtle shadows (shadow-sm to shadow-lg)
- Hover states with gentle lift (transform + shadow transition)
- Category/type badges with color coding
- Clear visual hierarchy (thumbnail → title → metadata → actions)
- Consistent card dimensions in grid layouts

**Editors & Forms**
- Rich text editor with floating toolbar
- AI bubble menu for inline editing (appears on text selection)
- Form sections organized in tabs (Identity, Physical, Personality, etc.)
- Auto-save indicators (subtle, non-intrusive)
- Image upload with preview and caption fields
- Tag input with autocomplete
- Searchable select dropdowns for relationships

**AI Features**
- Floating assistant trigger button (bottom-right, gradient purple)
- Writing Assistant panel with tabs (Chat, Analysis, Actions, Questions)
- Inline AI suggestions with accept/dismiss UI
- Generation forms with parameter inputs
- Real-time streaming responses where applicable

**Content Management**
- Notebook switcher with creation flow
- Content type selector with icons
- Hierarchical project outline (drag-to-reorder)
- Search with filters and facets
- Gallery/list view toggles
- Bulk actions with selection checkboxes

**Dialogs & Modals**
- Sheet-style drawers for forms (slide from right)
- Alert dialogs for confirmations
- Popover menus for contextual actions
- Toast notifications for feedback (bottom-right)

### E. Visual Hierarchy & Patterns
- Strong contrast between sections using background variations
- Card-based organization for scannable content
- Consistent iconography (Lucide icons)
- Color-coded content types (characters, locations, items, etc.)
- Progressive disclosure (collapse/expand patterns)
- Loading states with skeletons
- Empty states with helpful CTAs

### F. Interactive Elements
- Primary buttons: Purple gradient, white text
- Secondary buttons: Outline style
- Ghost buttons for tertiary actions
- Icon buttons for compact toolbars
- Drag handles with visual affordance
- Resize handles on panel edges
- Focus rings for keyboard navigation

## Application Structure

### Core Features

**1. Notebook System**
- Scoped content storage (separate universes/stories)
- Supports 40+ content types
- Tag-based organization
- Cross-notebook search
- Import/export capabilities

**2. Project Editor (Manuscripts)**
- Hierarchical document structure (Acts → Chapters → Scenes)
- Rich text editing with formatting
- Word count tracking (live, per-section, total)
- Auto-save (every few seconds)
- Outline view with drag-to-reorder
- Content linking via @ mentions
- Export to Markdown/PDF

**3. Worldbuilding Tools**
- Character editor with comprehensive fields
- Location/setting builder
- Family tree visualizer (interactive graph)
- Timeline management
- Organization/faction tracking
- Item/equipment database
- Cultural elements (languages, religions, traditions)

**4. AI Generators**
- Character generation (personality, backstory, appearance)
- Location/setting generation
- Plot structure suggestions
- Name generation (character, place, object)
- Creature/species creation
- Description generation (scenes, objects, atmospheres)
- Conflict/theme exploration

**5. Writing Assistant**
- Conversational AI coach
- Context-aware (knows current project/document)
- Modes: Chat, Analyze, Proofread, Questions
- Inline text editing (Grammarly-style)
- Genre-specific advice
- Persistent conversation history

**6. Educational Resources**
- Writing guides library
- Categorized by topic and difficulty
- Rich content with examples
- Searchable and filterable
- Custom guide creation

### User Flows

**Starting a New Story**
1. Create notebook for story universe
2. Generate or create characters, locations, factions
3. Save content with tags for organization
4. Create project for manuscript
5. Build outline (hierarchical structure)
6. Write sections using rich editor
7. Link worldbuilding content via @ mentions
8. Get feedback from Writing Assistant

**Character Development**
1. Generate character with AI or create manually
2. Save to notebook
3. Open in character editor
4. Fill in tabs: Identity, Physical, Personality, Background, Relationships
5. Upload portrait image
6. Link to family tree
7. Reference in project using @ mention

**Writing & Revising**
1. Open project section in editor
2. Write/edit with auto-save
3. Select text → use AI inline editing for quick fixes
4. Open Writing Assistant for deeper analysis
5. Use proofread mode for grammar/style
6. Apply suggestions and iterate

## Accessibility & Responsiveness

**Mobile Adaptations**
- Single-column layouts on mobile
- Touch-friendly button sizes (min 44px)
- Swipe gestures for navigation
- Collapsible sidebars
- Bottom navigation on small screens

**Keyboard Navigation**
- Tab order follows visual hierarchy
- Keyboard shortcuts for common actions
- Focus indicators on all interactive elements
- Escape to close dialogs/menus

**Screen Reader Support**
- Semantic HTML structure
- ARIA labels for icon buttons
- Live regions for dynamic content
- Skip links for main content

**Performance**
- Progressive loading for large lists
- Virtual scrolling for long content
- Optimistic updates for better UX
- Debounced auto-save
- Lazy loading for images

## Content Strategy & Writing

**Voice & Tone**
- Professional but approachable
- Encouraging and supportive (especially for AI assistant)
- Clear, concise UI copy
- Writer-focused terminology

**Microcopy**
- Empty states: Helpful, actionable
- Error messages: Specific, with solutions
- Loading states: Informative
- Success messages: Brief, positive

**Help & Guidance**
- Contextual tooltips
- Onboarding for new users
- In-app documentation links
- Feature discovery prompts (non-intrusive)

## Technical Patterns

**State Management**
- TanStack Query for server state
- Zustand for client state (workspace, notebooks)
- Local storage for preferences
- Optimistic updates for better UX

**Data Flow**
- RESTful API endpoints
- Automatic query invalidation
- Error boundary fallbacks
- Retry logic for failed requests

**Component Architecture**
- Radix UI primitives (shadcn/ui)
- Composition over prop drilling
- Controlled vs uncontrolled patterns
- Custom hooks for reusable logic

---

## Agent Implementation Protocol

### Automatic Implementation of Architect Suggestions

**When receiving architect feedback:**

1. **For PASS responses with "Next Steps":**
   - Automatically implement all suggested improvements
   - Do not wait for explicit user request
   - Treat "Next Steps" as required refinements, not optional suggestions
   - Verify implementation matches architect's intent

2. **For FAIL responses:**
   - Revert problematic changes
   - Implement corrections as specified
   - Address all failure points before re-proposing

3. **Implementation Priority:**
   - Critical bugs: Fix immediately
   - Security issues: Fix immediately  
   - UX improvements: Implement from architect suggestions
   - Code quality: Apply suggested refactoring
   - Performance: Implement optimization suggestions

4. **Response Pattern:**
   ```
   Architect provided these improvements:
   1. [Suggestion 1]
   2. [Suggestion 2]
   
   Implementing these refinements now...
   
   [Propose file changes]
   ```

5. **Never Skip:**
   - Accessibility improvements
   - Responsive design fixes
   - Error handling enhancements
   - Loading state additions
   - Empty state handling
   - Keyboard navigation support

**This ensures continuous improvement and prevents technical debt accumulation.**

---

## Design Tokens Reference

```css
/* Spacing */
--space-1: 0.25rem;  /* 4px */
--space-2: 0.5rem;   /* 8px */
--space-3: 0.75rem;  /* 12px */
--space-4: 1rem;     /* 16px */
--space-6: 1.5rem;   /* 24px */
--space-8: 2rem;     /* 32px */

/* Border Radius */
--radius-sm: 0.25rem;  /* 4px */
--radius-md: 0.375rem; /* 6px */
--radius-lg: 0.5rem;   /* 8px */
--radius-xl: 0.75rem;  /* 12px */

/* Shadows */
--shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
--shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
--shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);

/* Transitions */
--transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1);
--transition-base: 200ms cubic-bezier(0.4, 0, 0.2, 1);
--transition-slow: 300ms cubic-bezier(0.4, 0, 0.2, 1);
```

This design system creates a cohesive, professional platform that empowers writers to create, organize, and refine their work with the help of modern AI tools while maintaining a clean, intuitive interface that doesn't get in the way of the creative process.
