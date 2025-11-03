
# Development Guide

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database (Neon serverless, configured via environment variables)
- Anthropic API key for AI features (optional for development)

### Environment Variables

Required environment variables (set in Secrets):

```bash
DATABASE_URL=postgresql://...  # Neon database connection string
ANTHROPIC_API_KEY=sk-...       # For AI features (optional)
SESSION_SECRET=...             # Auto-generated
```

### Installation

The project auto-installs dependencies. To manually install:

```bash
npm install
```

### Running the Application

Click the **Run** button, or:

```bash
npm run dev
```

## Project Structure

```
├── client/              # React frontend
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── pages/       # Route pages
│   │   ├── hooks/       # Custom hooks
│   │   ├── stores/      # Zustand state stores
│   │   └── lib/         # Utilities
├── server/              # Express backend
│   ├── routes/          # API route handlers
│   ├── storage.ts       # Database operations
│   └── ai-generation.ts # AI integration
├── shared/              # Shared types/schemas
└── tests/               # Test files
```

## Key Technologies

- **Frontend**: React 18, TypeScript, Tailwind CSS, TanStack Query, Wouter
- **Backend**: Express, Drizzle ORM, PostgreSQL
- **UI Components**: Radix UI (shadcn/ui), TipTap editor
- **AI**: Anthropic Claude 3.5 Sonnet
- **Auth**: Google Auth

## Database Migrations

Create a migration:

```bash
npm run db:generate
```

Apply migrations:

```bash
npm run db:push
```

## Code Style

- TypeScript strict mode enabled
- ESLint configuration follows React best practices
- Tailwind for styling (utility-first approach)
- Component files use PascalCase
- Route files use kebab-case

## Testing

Run tests:

```bash
npm test
```

Tests use Vitest and are located in the `tests/` directory.

## Common Development Tasks

### Adding a New Content Type

1. Add schema to `shared/schema.ts`
2. Add type mapping to `shared/contentTypes.ts`
3. Create route handler in `server/routes/`
4. Add storage methods to `server/storage.ts`
5. Create form configuration in `client/src/configs/content-types/`
6. Add to content type list in `client/src/config/content-types.ts`

### Adding a New API Endpoint

1. Create route file in `server/routes/`
2. Register in `server/routes/index.ts`
3. Add authentication middleware if needed
4. Implement storage methods in `server/storage.ts`

### Working with the Editor

The project uses TipTap for rich text editing with custom extensions:

- AI bubble menu (`client/src/components/AIBubbleMenu.tsx`)
- Mention system for linking content
- Auto-save functionality
- Image upload support

### State Management

- **Server state**: TanStack Query (React Query)
- **Client state**: Zustand stores
  - `workspaceStore.ts` - Manages workspace panels and layout
  - `notebookStore.ts` - Current notebook selection

## Debugging

### Backend Debugging

Check Express logs in the console:

```bash
# Logs show in format:
HH:MM:SS [express] METHOD /path STATUS in Xms :: response
```

### Frontend Debugging

Use browser DevTools:
- React DevTools for component inspection
- Network tab for API requests
- Console for errors and logs

### Common Issues

**Database connection fails:**
- Verify `DATABASE_URL` in Secrets
- Check Neon database is active

**AI features not working:**
- Verify `ANTHROPIC_API_KEY` is set
- Check API quota

**Session issues:**
- Clear browser cookies
- Verify `SESSION_SECRET` is set

## Performance Considerations

- Images stored in Object Storage (not database)
- Database indexes on frequently queried fields
- React Query caching reduces API calls
- Auto-save debounced to reduce database writes

## Security


- All content operations enforce ownership validation
- Unauthorized access returns 404 (not 403)
- Triple-filter pattern for deletes (id, userId, notebookId)
- Structured logging for security events

## Contributing Workflow

1. Make changes in your workspace
2. Test thoroughly
3. Update documentation if needed
4. Verify no TypeScript errors (`npx tsc --noEmit`)
5. Commit changes

## Additional Resources

- [TanStack Query Docs](https://tanstack.com/query)
- [Drizzle ORM Docs](https://orm.drizzle.team)
- [TipTap Editor Docs](https://tiptap.dev)
