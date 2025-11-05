#!/usr/bin/env tsx
/**
 * Data Migration Script: Development to Production
 *
 * This script exports all user data from the development database
 * and generates SQL statements to import it into the production database.
 *
 * Usage:
 *   npm run migrate:export           - Export development data to migration.sql
 *   npm run migrate:import           - Import data to production (manual step)
 */

import { db } from "../server/db";
import {
  users,
  characters,
  plots,
  prompts,
  locations,
  settings,
  items,
  organizations,
  creatures,
  species,
  cultures,
  documents,
  foods,
  languages,
  religions,
  technologies,
  weapons,
  professions,
  ranks,
  conditions,
  savedItems,
  names,
  themes,
  moods,
  conflicts,
  guides,
  guideCategories,
  guideReferences,
  projects,
  projectSections,
  projectLinks,
  folders,
  notes,
  notebooks,
  importJobs,
  plants,
  descriptions,
  ethnicities,
  drinks,
  armor,
  accessories,
  clothing,
  materials,
  settlements,
  societies,
  factions,
  militaryUnits,
  myths,
  legends,
  events,
  spells,
  resources,
  buildings,
  animals,
  transportation,
  naturalLaws,
  traditions,
  rituals,
  familyTrees,
  familyTreeMembers,
  familyTreeRelationships,
  timelines,
  timelineEvents,
  timelineRelationships,
  ceremonies,
  maps,
  music,
  dances,
  laws,
  policies,
  potions,
  pinnedContent,
  canvases,
  chatMessages,
  conversationThreads,
  userPreferences,
  conversationSummaries,
  feedback,
  shares,
  userSubscriptions,
  lifetimeSubscriptions,
  teamMemberships,
  teamInvitations,
  teamActivity,
  aiUsageLogs,
  aiUsageDailySummary,
  discountCodes,
  billingAlerts,
} from "../shared/schema.js";
import * as fs from "fs";
import * as path from "path";

const OUTPUT_FILE = path.join(process.cwd(), "migration.sql");

// Escape single quotes in SQL strings
function escapeSql(value: any): string {
  if (value === null || value === undefined) {
    return "NULL";
  }
  if (typeof value === "boolean") {
    return value ? "true" : "false";
  }
  if (typeof value === "number") {
    return value.toString();
  }
  if (value instanceof Date) {
    return `'${value.toISOString()}'`;
  }
  if (typeof value === "object") {
    return `'${JSON.stringify(value).replace(/'/g, "''")}'`;
  }
  return `'${value.toString().replace(/'/g, "''")}'`;
}

// Generate INSERT statement for a table
function generateInsert(tableName: string, rows: any[]): string {
  if (rows.length === 0) return "";

  const columns = Object.keys(rows[0]);
  let sql = `-- Inserting ${rows.length} rows into ${tableName}\n`;

  for (const row of rows) {
    const values = columns.map((col) => escapeSql(row[col])).join(", ");
    sql += `INSERT INTO ${tableName} (${columns.join(", ")}) VALUES (${values}) ON CONFLICT DO NOTHING;\n`;
  }

  return sql + "\n";
}

async function exportData() {
  console.log("🚀 Starting data export from development database...\n");

  let sqlStatements: string[] = [];

  // Add header
  sqlStatements.push(`-- WriteCraft Data Migration
-- Generated: ${new Date().toISOString()}
-- This file contains all data from the development database
--
-- INSTRUCTIONS:
-- 1. Backup your production database before running this script
-- 2. Run this SQL file against your production database
-- 3. Verify the data was imported correctly
--
-- WARNING: This will skip any rows that conflict with existing data (ON CONFLICT DO NOTHING)
--

BEGIN;

`);

  try {
    // Export users
    console.log("📦 Exporting users...");
    const userData = await db.select().from(users);
    sqlStatements.push(generateInsert("users", userData));
    console.log(`   ✓ Exported ${userData.length} users`);

    // Export user subscriptions (must come after users)
    console.log("📦 Exporting user subscriptions...");
    const subscriptionData = await db.select().from(userSubscriptions);
    sqlStatements.push(generateInsert("user_subscriptions", subscriptionData));
    console.log(`   ✓ Exported ${subscriptionData.length} user subscriptions`);

    // Export lifetime subscriptions
    const lifetimeSubData = await db.select().from(lifetimeSubscriptions);
    if (lifetimeSubData.length > 0) {
      sqlStatements.push(
        generateInsert("lifetime_subscriptions", lifetimeSubData),
      );
      console.log(
        `   ✓ Exported ${lifetimeSubData.length} lifetime subscriptions`,
      );
    }

    // Export user preferences
    console.log("📦 Exporting user preferences...");
    const prefsData = await db.select().from(userPreferences);
    sqlStatements.push(generateInsert("user_preferences", prefsData));
    console.log(`   ✓ Exported ${prefsData.length} user preferences`);

    // Export projects
    console.log("📦 Exporting projects...");
    const projectData = await db.select().from(projects);
    sqlStatements.push(generateInsert("projects", projectData));
    console.log(`   ✓ Exported ${projectData.length} projects`);

    // Export project sections
    console.log("📦 Exporting project sections...");
    const sectionData = await db.select().from(projectSections);
    sqlStatements.push(generateInsert("project_sections", sectionData));
    console.log(`   ✓ Exported ${sectionData.length} project sections`);

    // Export folders
    console.log("📦 Exporting folders...");
    const folderData = await db.select().from(folders);
    sqlStatements.push(generateInsert("folders", folderData));
    console.log(`   ✓ Exported ${folderData.length} folders`);

    // Export notebooks
    console.log("📦 Exporting notebooks...");
    const notebookData = await db.select().from(notebooks);
    sqlStatements.push(generateInsert("notebooks", notebookData));
    console.log(`   ✓ Exported ${notebookData.length} notebooks`);

    // Export all content types
    const contentTables = [
      { name: "characters", table: characters },
      { name: "plots", table: plots },
      { name: "prompts", table: prompts },
      { name: "locations", table: locations },
      { name: "settings", table: settings },
      { name: "items", table: items },
      { name: "organizations", table: organizations },
      { name: "creatures", table: creatures },
      { name: "species", table: species },
      { name: "cultures", table: cultures },
      { name: "documents", table: documents },
      { name: "foods", table: foods },
      { name: "languages", table: languages },
      { name: "religions", table: religions },
      { name: "technologies", table: technologies },
      { name: "weapons", table: weapons },
      { name: "professions", table: professions },
      { name: "ranks", table: ranks },
      { name: "conditions", table: conditions },
      { name: "plants", table: plants },
      { name: "descriptions", table: descriptions },
      { name: "ethnicities", table: ethnicities },
      { name: "drinks", table: drinks },
      { name: "armor", table: armor },
      { name: "accessories", table: accessories },
      { name: "clothing", table: clothing },
      { name: "materials", table: materials },
      { name: "settlements", table: settlements },
      { name: "societies", table: societies },
      { name: "factions", table: factions },
      { name: "military_units", table: militaryUnits },
      { name: "myths", table: myths },
      { name: "legends", table: legends },
      { name: "events", table: events },
      { name: "spells", table: spells },
      { name: "resources", table: resources },
      { name: "buildings", table: buildings },
      { name: "animals", table: animals },
      { name: "transportation", table: transportation },
      { name: "natural_laws", table: naturalLaws },
      { name: "traditions", table: traditions },
      { name: "rituals", table: rituals },
      { name: "ceremonies", table: ceremonies },
      { name: "maps", table: maps },
      { name: "music", table: music },
      { name: "dances", table: dances },
      { name: "laws", table: laws },
      { name: "policies", table: policies },
      { name: "potions", table: potions },
    ];

    for (const { name, table } of contentTables) {
      const data = await db.select().from(table);
      if (data.length > 0) {
        console.log(`📦 Exporting ${name}...`);
        sqlStatements.push(generateInsert(name, data));
        console.log(`   ✓ Exported ${data.length} ${name}`);
      }
    }

    // Export timelines and timeline data
    console.log("📦 Exporting timelines...");
    const timelineData = await db.select().from(timelines);
    sqlStatements.push(generateInsert("timelines", timelineData));
    console.log(`   ✓ Exported ${timelineData.length} timelines`);

    const timelineEventData = await db.select().from(timelineEvents);
    if (timelineEventData.length > 0) {
      sqlStatements.push(generateInsert("timeline_events", timelineEventData));
      console.log(`   ✓ Exported ${timelineEventData.length} timeline events`);
    }

    const timelineRelData = await db.select().from(timelineRelationships);
    if (timelineRelData.length > 0) {
      sqlStatements.push(
        generateInsert("timeline_relationships", timelineRelData),
      );
      console.log(
        `   ✓ Exported ${timelineRelData.length} timeline relationships`,
      );
    }

    // Export family trees
    console.log("📦 Exporting family trees...");
    const familyTreeData = await db.select().from(familyTrees);
    sqlStatements.push(generateInsert("family_trees", familyTreeData));
    console.log(`   ✓ Exported ${familyTreeData.length} family trees`);

    const familyMemberData = await db.select().from(familyTreeMembers);
    if (familyMemberData.length > 0) {
      sqlStatements.push(
        generateInsert("family_tree_members", familyMemberData),
      );
      console.log(
        `   ✓ Exported ${familyMemberData.length} family tree members`,
      );
    }

    const familyRelData = await db.select().from(familyTreeRelationships);
    if (familyRelData.length > 0) {
      sqlStatements.push(
        generateInsert("family_tree_relationships", familyRelData),
      );
      console.log(`   ✓ Exported ${familyRelData.length} family relationships`);
    }

    // Export canvases
    console.log("📦 Exporting canvases...");
    const canvasData = await db.select().from(canvases);
    if (canvasData.length > 0) {
      sqlStatements.push(generateInsert("canvases", canvasData));
      console.log(`   ✓ Exported ${canvasData.length} canvases`);
    }

    // Export saved items
    console.log("📦 Exporting saved items...");
    const savedItemData = await db.select().from(savedItems);
    if (savedItemData.length > 0) {
      sqlStatements.push(generateInsert("saved_items", savedItemData));
      console.log(`   ✓ Exported ${savedItemData.length} saved items`);
    }

    // Export pinned content
    console.log("📦 Exporting pinned content...");
    const pinnedData = await db.select().from(pinnedContent);
    if (pinnedData.length > 0) {
      sqlStatements.push(generateInsert("pinned_content", pinnedData));
      console.log(`   ✓ Exported ${pinnedData.length} pinned items`);
    }

    // Export conversation threads and messages
    console.log("📦 Exporting conversations...");
    const threadData = await db.select().from(conversationThreads);
    if (threadData.length > 0) {
      sqlStatements.push(generateInsert("conversation_threads", threadData));
      console.log(`   ✓ Exported ${threadData.length} conversation threads`);
    }

    const messageData = await db.select().from(chatMessages);
    if (messageData.length > 0) {
      sqlStatements.push(generateInsert("chat_messages", messageData));
      console.log(`   ✓ Exported ${messageData.length} chat messages`);
    }

    // Export guides
    console.log("📦 Exporting guides...");
    const guideCatData = await db.select().from(guideCategories);
    if (guideCatData.length > 0) {
      sqlStatements.push(generateInsert("guide_categories", guideCatData));
      console.log(`   ✓ Exported ${guideCatData.length} guide categories`);
    }

    const guideData = await db.select().from(guides);
    if (guideData.length > 0) {
      sqlStatements.push(generateInsert("guides", guideData));
      console.log(`   ✓ Exported ${guideData.length} guides`);
    }

    // Export AI usage data
    console.log("📦 Exporting AI usage data...");
    const aiUsageData = await db.select().from(aiUsageLogs);
    if (aiUsageData.length > 0) {
      sqlStatements.push(generateInsert("ai_usage_logs", aiUsageData));
      console.log(`   ✓ Exported ${aiUsageData.length} AI usage logs`);
    }

    const aiDailySummaryData = await db.select().from(aiUsageDailySummary);
    if (aiDailySummaryData.length > 0) {
      sqlStatements.push(
        generateInsert("ai_usage_daily_summary", aiDailySummaryData),
      );
      console.log(
        `   ✓ Exported ${aiDailySummaryData.length} AI daily summaries`,
      );
    }

    // Export team data
    console.log("📦 Exporting team data...");
    const teamMemberData = await db.select().from(teamMemberships);
    if (teamMemberData.length > 0) {
      sqlStatements.push(generateInsert("team_memberships", teamMemberData));
      console.log(`   ✓ Exported ${teamMemberData.length} team memberships`);
    }

    const teamInviteData = await db.select().from(teamInvitations);
    if (teamInviteData.length > 0) {
      sqlStatements.push(generateInsert("team_invitations", teamInviteData));
      console.log(`   ✓ Exported ${teamInviteData.length} team invitations`);
    }

    const teamActData = await db.select().from(teamActivity);
    if (teamActData.length > 0) {
      sqlStatements.push(generateInsert("team_activity", teamActData));
      console.log(`   ✓ Exported ${teamActData.length} team activity records`);
    }

    // Export discount codes
    const discountData = await db.select().from(discountCodes);
    if (discountData.length > 0) {
      sqlStatements.push(generateInsert("discount_codes", discountData));
      console.log(`   ✓ Exported ${discountData.length} discount codes`);
    }

    // Export billing alerts
    const alertData = await db.select().from(billingAlerts);
    if (alertData.length > 0) {
      sqlStatements.push(generateInsert("billing_alerts", alertData));
      console.log(`   ✓ Exported ${alertData.length} billing alerts`);
    }

    // Add footer
    sqlStatements.push(`
COMMIT;

-- Migration complete!
-- Verify the data was imported correctly before using the production database.
`);

    // Write to file
    fs.writeFileSync(OUTPUT_FILE, sqlStatements.join("\n"));

    console.log("\n✅ Export complete!");
    console.log(`📄 Migration file created: ${OUTPUT_FILE}`);
    console.log("\n📋 Next steps:");
    console.log("1. Review the migration.sql file");
    console.log("2. Backup your production database");
    console.log("3. Connect to your production database");
    console.log("4. Run: psql $PRODUCTION_DATABASE_URL -f migration.sql");
    console.log("\n⚠️  IMPORTANT: Always backup before running migrations!");
  } catch (error) {
    console.error("❌ Export failed:", error);
    process.exit(1);
  }
}

// Run the export
exportData()
  .then(() => {
    console.log("\n🎉 All done!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
