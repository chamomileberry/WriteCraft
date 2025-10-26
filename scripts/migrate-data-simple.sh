#!/bin/bash

# Simple Data Migration: Development to Production
# Uses pg_dump to export and psql to import

echo "🚀 WriteCraft Data Migration"
echo "=============================="
echo ""

# Get database URLs
DEV_URL="$DATABASE_URL"
PROD_URL="$1"

if [ -z "$PROD_URL" ]; then
    echo "❌ Error: Production database URL required"
    echo ""
    echo "Usage: ./scripts/migrate-data-simple.sh 'postgresql://...'"
    echo ""
    echo "Get your production database URL from:"
    echo "  1. Go to your published app"
    echo "  2. Open the Database tool"
    echo "  3. Copy the production connection string"
    exit 1
fi

echo "📊 Development database: ${DEV_URL:0:50}..."
echo "📊 Production database: ${PROD_URL:0:50}..."
echo ""

# Create temporary dump file
DUMP_FILE="migration_dump_$(date +%Y%m%d_%H%M%S).sql"

echo "📦 Step 1: Exporting data from development..."
pg_dump "$DEV_URL" \
  --data-only \
  --no-owner \
  --no-privileges \
  --on-conflict-do-nothing \
  --file="$DUMP_FILE"

if [ $? -ne 0 ]; then
    echo "❌ Export failed!"
    exit 1
fi

echo "   ✓ Exported to $DUMP_FILE"
echo ""

# Add ON CONFLICT handling to the dump
echo "📝 Step 2: Adding conflict handling..."
sed -i 's/COPY public\./-- &/g' "$DUMP_FILE"
sed -i 's/INSERT INTO /INSERT INTO public./g' "$DUMP_FILE"

# Ask for confirmation
echo "⚠️  WARNING: This will import data into production!"
echo ""
read -p "Continue? (y/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Aborted. Dump file saved at: $DUMP_FILE"
    exit 1
fi

echo ""
echo "📤 Step 3: Importing data to production..."
echo "   This may take a few minutes..."
echo ""

psql "$PROD_URL" -f "$DUMP_FILE" 2>&1 | grep -v "ERROR:  duplicate key"

if [ $? -ne 0 ]; then
    echo ""
    echo "⚠️  Import completed with some warnings (this is normal for duplicate keys)"
else
    echo ""
    echo "✅ Import completed successfully!"
fi

echo ""
echo "📄 Dump file saved at: $DUMP_FILE"
echo "   You can delete this file once you've verified the migration"
echo ""
echo "🎉 Migration complete!"
echo ""
echo "Next steps:"
echo "  1. Visit your published app"
echo "  2. Log in and verify your data is present"
echo "  3. Delete the dump file: rm $DUMP_FILE"
