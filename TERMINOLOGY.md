
# WriteCraft Terminology Migration Guide

## Overview

This document explains the terminology changes in WriteCraft and provides guidance for understanding legacy references in the codebase.

## Current vs. Legacy Terminology

### Primary Writing Feature

**Current (Correct):** **Projects**
- User interface: "Projects"
- Database: `projects` table
- API routes: `/api/projects`
- File organization: `ProjectEditor`, `ProjectPage`, etc.

**Legacy (Deprecated):** ~~Manuscripts~~
- Still appears in some code comments and internal types
- Some routes may redirect from `/manuscripts/*` to `/projects/*`
- Database may have legacy `manuscriptId` fields that map to `projectId`

### Content Organization Feature

**Current (Correct):** **Notebooks**
- User interface: "Notebooks"
- Database: `notebooks` table
- API routes: `/api/notebooks`
- Purpose: Organize worldbuilding content

**Legacy (Deprecated):** ~~Collections~~
- Completely removed from UI
- May appear in old comments or documentation

## Code Migration Checklist

When working with the codebase, be aware of these patterns:

### ✅ Correct Usage
```typescript
// Good - Use "project" terminology
const project = await storage.getProject(id, userId);
<Route path="/projects/:id/edit" component={ProjectEditPage} />
createProject({ title: "My Novel", userId })

// Good - Use "notebook" terminology  
const notebook = await storage.getNotebook(id, userId);
<NotebookSwitcher />
createNotebook({ name: "Fantasy World", userId })
```

### ⚠️ Legacy References (Acceptable in Context)

```typescript
// Acceptable - Internal type names for editor context
case 'manuscript':
case 'manuscriptOutline':
  // Note: 'manuscript' is legacy terminology, refers to project editor
  return <ProjectEditor />;

// Acceptable - Database schema with legacy fields
interface Note {
  projectId?: string;
  manuscriptId?: string; // Legacy field, maps to projectId
}

// Acceptable - Backwards compatibility routes
if (note?.manuscriptId) {
  setLocation(`/projects/${note.manuscriptId}/edit`);
}
```

### ❌ Avoid - Don't Use These
```typescript
// Bad - Don't create new "manuscript" references in UI
<h1>My Manuscripts</h1>
const manuscripts = await storage.getManuscripts();

// Bad - Don't create new "collection" references anywhere
<h1>My Collections</h1>
const collections = await storage.getCollections();
```

## Feature Mapping

| User-Facing Feature | Technical Implementation | Legacy Name |
|---------------------|-------------------------|-------------|
| Project Editor | `ProjectEditor.tsx`, `project.routes.ts` | ~~Manuscript Editor~~ |
| Project Outline | `ProjectOutline.tsx`, hierarchical sections | ~~Manuscript Structure~~ |
| Notebooks | `NotebookManager.tsx`, `notebooks` table | ~~Collections~~ |
| Notebook Switcher | `NotebookSwitcher.tsx` | ~~Collection Selector~~ |
| Writing Assistant | `WritingAssistantPanel.tsx` | (No change) |
| Content Types | Characters, Locations, etc. | (No change) |

## Database Schema Notes

### Projects Table
- Primary table: `projects`
- Related: `projectSections` (hierarchical structure)
- Links: `projectLinks` (references to worldbuilding content)

### Notebooks Table
- Primary table: `notebooks`
- Purpose: Organize and scope worldbuilding content
- Content scoping: All characters, locations, etc. belong to a notebook

### Legacy Compatibility
Some older data may still reference:
- `manuscriptId` fields (treat as `projectId`)
- `manuscript` type in editor context (refers to project editor)
- `/manuscripts/*` routes (should redirect to `/projects/*`)

## UI/UX Consistency

Always use these terms in user-facing text:

✅ **Do Say:**
- "Create a new project"
- "Open project"
- "Project outline"
- "Switch notebooks"
- "Add to notebook"

❌ **Don't Say:**
- "Create a new manuscript"
- "My manuscripts"
- "Collection manager"
- "Add to collection"

## Agent/AI Assistant Instructions

When communicating with AI agents or assistants about this codebase:

1. **Clarify immediately:** If they mention "manuscripts," respond: "We now call these 'projects' - do you mean the project editor?"
2. **Correct proactively:** "That feature is now called 'notebooks' instead of 'collections'"
3. **Reference this document:** Point agents to this guide when terminology confusion occurs

## Why the Change?

- **Projects**: More accurately describes the feature - users are creating writing projects, not just manuscripts
- **Notebooks**: Better conveys the organization/scoping purpose - a notebook contains related worldbuilding content for a story universe

## Questions?

If you encounter terminology that doesn't match this guide:

1. Check if it's a legacy reference that can be updated
2. Check if it's internal typing that needs to remain for backwards compatibility
3. Update this document if you discover new patterns

Last updated: 2025-01-31
