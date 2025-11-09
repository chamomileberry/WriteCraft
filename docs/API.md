# WriteCraft API Documentation

## Overview

This document provides a comprehensive reference for all API endpoints in WriteCraft.

## Authentication

All API endpoints (except `/api/auth/*`) require authentication via Replit Auth. The user ID is extracted from `req.user.claims.sub`.

## Base URL

Development: `http://localhost:5000/api`

## Core Concepts

### Notebooks

All worldbuilding content (characters, locations, etc.) is scoped to a **notebook**. Users create notebooks to organize content for different story universes.

### Projects

Writing projects are hierarchical documents with sections (folders and pages). Projects are separate from notebooks and contain the actual manuscript content.

## Common Response Codes

- `200` - Success
- `201` - Created
- `204` - Success (no content)
- `400` - Bad request (validation error)
- `401` - Unauthorized (not logged in)
- `404` - Not found (or unauthorized access)
- `500` - Internal server error

## Endpoints by Category

### Authentication

#### `GET /api/auth/user`

Get current authenticated user.

**Response:**

```json
{
  "id": "string",
  "email": "string",
  "displayName": "string",
  "profileImageUrl": "string"
}
```

### Notebooks

#### `POST /api/notebooks`

Create a new notebook.

**Request Body:**

```json
{
  "name": "string",
  "description": "string (optional)"
}
```

#### `GET /api/notebooks`

Get all notebooks for the current user.

#### `GET /api/notebooks/:id`

Get a specific notebook.

#### `PUT /api/notebooks/:id`

Update a notebook.

#### `DELETE /api/notebooks/:id`

Delete a notebook and all associated content.

### Projects

#### `POST /api/projects`

Create a new project.

**Request Body:**

```json
{
  "title": "string",
  "content": "string (optional)",
  "status": "draft | in-progress | completed (optional)"
}
```

#### `GET /api/projects`

Get all projects for the current user.

#### `GET /api/projects/:id`

Get a specific project.

#### `PUT /api/projects/:id`

Update a project.

#### `DELETE /api/projects/:id`

Delete a project.

#### `GET /api/projects/search?q=query`

Search projects by content.

### Project Sections

#### `GET /api/projects/:projectId/sections`

Get all sections for a project (hierarchical tree structure).

**Query Parameters:**

- `flat=true` - Return flat list instead of tree

#### `POST /api/projects/:projectId/sections`

Create a new section.

**Request Body:**

```json
{
  "title": "string",
  "type": "folder | page",
  "parentId": "string (optional)",
  "position": "number",
  "content": "string (for pages)"
}
```

#### `PUT /api/projects/:projectId/sections/:sectionId`

Update a section.

#### `DELETE /api/projects/:projectId/sections/:sectionId`

Delete a section.

#### `POST /api/projects/:projectId/sections/reorder`

Reorder sections.

**Request Body:**

```json
{
  "sectionOrders": [
    {
      "id": "string",
      "position": "number",
      "parentId": "string | null"
    }
  ]
}
```

### Worldbuilding Content

All worldbuilding content endpoints follow this pattern:

#### `POST /api/{contentType}`

Create new content.

**Required Query Parameter:** `notebookId=string`

**Common Request Fields:**

```json
{
  "name": "string",
  "description": "string",
  "genre": "Fantasy | Sci-Fi | etc."
  // Type-specific fields...
}
```

#### `GET /api/{contentType}?notebookId=string`

Get all content of this type in the notebook.

#### `GET /api/{contentType}/:id?notebookId=string`

Get specific content by ID.

#### `PUT /api/{contentType}/:id?notebookId=string`

Update content.

#### `DELETE /api/{contentType}/:id?notebookId=string`

Delete content.

**Content Types:**

- characters
- locations
- items
- weapons
- organizations
- creatures
- species
- cultures
- plants
- factions
- settlements
- technologies
- documents
- foods
- drinks
- religions
- languages
- professions
- armor
- accessories
- clothing
- materials
- societies
- military-units
- myths
- legends
- events
- spells
- resources
- buildings
- animals
- transportation
- natural-laws
- traditions
- rituals
- family-trees
- timelines
- ceremonies
- maps
- music
- dances
- laws
- policies
- potions

### Guides

#### `POST /api/guides`

Create a writing guide.

#### `GET /api/guides`

Get all guides.

**Query Parameters:**

- `category=string`
- `difficulty=Beginner | Intermediate | Advanced`
- `search=string`

#### `GET /api/guides/:id`

Get specific guide.

#### `PUT /api/guides/:id`

Update guide.

#### `DELETE /api/guides/:id`

Delete guide.

### AI Generation

#### `POST /api/ai/generate/{contentType}`

Generate content using AI.

**Request Body:**

```json
{
  "prompt": "string",
  "genre": "string"
  // Additional generation parameters
}
```

#### `POST /api/ai/edit`

AI-powered text editing.

**Request Body:**

```json
{
  "text": "string",
  "action": "improve | shorten | expand | fix-grammar",
  "context": "string (optional)"
}
```

#### `POST /api/ai/chat`

Writing assistant chat.

**Request Body:**

```json
{
  "message": "string",
  "projectId": "string (optional)",
  "guideId": "string (optional)",
  "history": [
    {
      "role": "user | assistant",
      "content": "string"
    }
  ]
}
```

### Saved Items

#### `POST /api/saved-items`

Save a generated item.

**Request Body:**

```json
{
  "itemType": "string",
  "itemId": "string",
  "itemData": "object",
  "notebookId": "string"
}
```

#### `GET /api/saved-items/:userId?notebookId=string`

Get saved items for a notebook.

**Query Parameters:**

- `itemType=string` - Filter by type

#### `DELETE /api/saved-items/:userId/:itemType/:itemId?notebookId=string`

Remove a saved item.

### Notes

#### `POST /api/notes`

Create a note.

#### `GET /api/notes`

Get all notes for the user.

#### `GET /api/notes/:id`

Get specific note.

#### `PUT /api/notes/:id`

Update note.

#### `DELETE /api/notes/:id`

Delete note.

#### `GET /api/quick-note`

Get or create user's quick note.

### Search

#### `GET /api/search?q=query`

Universal search across projects and saved content.

## Security

All content operations enforce:

1. User authentication
2. Ownership validation (userId must match)
3. Notebook association validation (notebookId must match)
4. Returns 404 (not 403) for unauthorized access to prevent information disclosure

## Error Handling

All endpoints return structured error responses:

```json
{
  "error": "Error message",
  "details": [] // Optional validation errors
}
```

## Rate Limiting

No rate limiting currently implemented.

## Versioning

API is currently unversioned. Breaking changes will be communicated via the changelog.
