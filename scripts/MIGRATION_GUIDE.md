# Data Migration Guide: Development to Production

This guide will help you migrate all your WriteCraft data from the development database to the production database.

## ⚠️ Important Notes

- **Always backup your production database before running any migration!**
- This migration uses `ON CONFLICT DO NOTHING`, so existing data in production won't be overwritten
- The migration includes all your content: notebooks, characters, plots, projects, timelines, etc.

## Step 1: Export Development Data

Run the migration script to export all your development data:

```bash
tsx scripts/migrate-to-production.ts
```

This will create a file called `migration.sql` in your project root containing all your data.

## Step 2: Review the Migration File

Open `migration.sql` and review it to make sure everything looks correct. The file should contain:
- User accounts
- Subscriptions and preferences
- All projects and their content
- All notebooks and notes
- All generated content (characters, locations, plots, etc.)
- Timelines, family trees, canvases
- Conversation history
- AI usage logs

## Step 3: Get Production Database URL

You need the connection string for your **production** database. This is different from your development DATABASE_URL.

To find it:
1. Go to your published Replit app
2. Click on the "Database" tool in the left sidebar
3. Look for the production database connection string

It will look something like:
```
postgresql://username:password@hostname/database?sslmode=require
```

## Step 4: Backup Production Database

Before importing, **create a backup** of your production database:

```bash
# Replace with your actual production database URL
pg_dump "YOUR_PRODUCTION_DATABASE_URL" > production_backup.sql
```

## Step 5: Import to Production

Run the migration SQL file against your production database:

```bash
# Replace with your actual production database URL
psql "YOUR_PRODUCTION_DATABASE_URL" -f migration.sql
```

You should see output like:
```
BEGIN
INSERT 0 1
INSERT 0 1
...
COMMIT
```

## Step 6: Verify the Migration

1. Open your published WriteCraft app
2. Log in with your Replit account
3. Verify that all your content is present:
   - Check your notebooks
   - Check your projects
   - Check your generated content
   - Check your subscription tier

## Troubleshooting

### "Permission denied" errors
Make sure you're using the correct production database URL and have the necessary permissions.

### "Relation does not exist" errors
This means your production database schema isn't up to date. Run migrations first:
```bash
# Make sure you're connected to production, then:
npm run db:push
```

### Data appears duplicated
The migration uses `ON CONFLICT DO NOTHING`, so if data already exists with the same ID, it won't be inserted again. This is intentional to prevent duplicates.

### Some data is missing
Check the console output when you ran the export script. It shows exactly what was exported. If something is missing, it may not exist in your development database.

## Need Help?

If you encounter any issues during migration:

1. Check the error messages carefully
2. Make sure you backed up your production database
3. Try restoring the backup if needed:
   ```bash
   psql "YOUR_PRODUCTION_DATABASE_URL" < production_backup.sql
   ```

## After Migration

Once your data is successfully migrated to production:

1. You can safely continue using your published app for writing/worldbuilding
2. Use the development environment for fixing bugs and testing new features
3. When you publish updates, your production data will remain intact
4. The development and production databases are completely separate

This workflow allows you to:
- Work on your creative content in production without interruptions
- Find bugs during real usage
- Fix those bugs in development
- Publish stable updates without disrupting your writing flow
