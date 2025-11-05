#!/usr/bin/env tsx
/**
 * Migration Script: Create Free Subscriptions for Existing Users
 *
 * This script creates free-tier subscriptions for all existing users
 * who don't already have a subscription. This ensures backward compatibility
 * when rolling out the subscription system.
 *
 * Usage: npm run migrate:users
 */

import { db } from "../db";
import { users, userSubscriptions } from "@shared/schema";
import { sql, notInArray } from "drizzle-orm";

async function migrateExistingUsers() {
  console.log(
    "🚀 Starting migration: Create subscriptions for existing users...\n",
  );

  try {
    // Get all user IDs that don't have a subscription
    const usersWithoutSubscription = await db
      .select({ id: users.id, email: users.email })
      .from(users)
      .where(sql`${users.id} NOT IN (SELECT user_id FROM user_subscriptions)`);

    if (usersWithoutSubscription.length === 0) {
      console.log("✅ All users already have subscriptions. Nothing to do!");
      return;
    }

    console.log(
      `📊 Found ${usersWithoutSubscription.length} users without subscriptions\n`,
    );

    // Create free subscriptions for all users without one
    const subscriptionsToCreate = usersWithoutSubscription.map((user) => ({
      userId: user.id,
      tier: "free" as const,
      status: "active" as const,
      cancelAtPeriodEnd: false,
    }));

    // Batch insert all subscriptions
    const created = await db
      .insert(userSubscriptions)
      .values(subscriptionsToCreate)
      .returning();

    console.log(
      `✅ Successfully created ${created.length} free-tier subscriptions\n`,
    );

    // Update user records with subscription_tier
    await db
      .update(users)
      .set({ subscriptionTier: "free" })
      .where(
        sql`${users.id} IN (${sql.join(
          usersWithoutSubscription.map((u) => sql`${u.id}`),
          sql`, `,
        )})`,
      );

    console.log("✅ Updated user records with subscription tier\n");

    // Display summary
    console.log("📋 Migration Summary:");
    console.log(`   - Users migrated: ${created.length}`);
    console.log(`   - Subscription tier: free`);
    console.log(`   - Status: active\n`);

    console.log("🎉 Migration completed successfully!");
  } catch (error) {
    console.error("❌ Migration failed:", error);
    throw error;
  } finally {
    process.exit(0);
  }
}

// Run the migration
migrateExistingUsers();
