import { Router } from "express";
import { z } from "zod";
import { storage } from "../storage";
import { insertUserPreferencesSchema } from "@shared/schema";
import { db } from "../db";
import { users, auditLogs } from "@shared/schema";
import { eq, ilike } from "drizzle-orm";
import { logger } from "../utils/logger";
import {
  profileRateLimiter,
  accountDeletionRateLimiter,
  readRateLimiter,
} from "../security/rateLimiters";

const router = Router();

// Search for users by email (for sharing/collaboration)
router.get("/search", readRateLimiter, async (req: any, res) => {
  try {
    const { email } = req.query;

    if (!email || typeof email !== "string") {
      return res.status(400).json({ error: "Email parameter is required" });
    }

    // Search for user by exact email match
    const [user] = await db
      .select({
        id: users.id,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        profileImageUrl: users.profileImageUrl,
      })
      .from(users)
      .where(eq(users.email, email.toLowerCase().trim()))
      .limit(1);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error("Error searching for user:", error);
    res.status(500).json({ error: "Failed to search for user" });
  }
});

// Get user preferences
router.get("/preferences", profileRateLimiter, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const preferences = await storage.getUserPreferences(userId);

    if (!preferences) {
      // Return default preferences if none exist
      return res.json({
        experienceLevel: null,
        preferredGenres: [],
        writingGoals: [],
        feedbackStyle: null,
        targetWordCount: null,
        writingSchedule: null,
        preferredTone: null,
        responseFormat: null,
        detailLevel: null,
        examplesPreference: null,
        onboardingCompleted: false,
        onboardingStep: 0,
        betaBannerDismissed: false,
      });
    }

    res.json(preferences);
  } catch (error) {
    console.error("Error fetching user preferences:", error);
    res.status(500).json({ error: "Failed to fetch preferences" });
  }
});

// Update user preferences (PATCH)
router.patch("/preferences", profileRateLimiter, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;

    // Validate the request body using the insert schema (partial)
    const updateSchema = insertUserPreferencesSchema
      .partial()
      .omit({ userId: true });
    const validatedData = updateSchema.parse(req.body);

    // Upsert user preferences
    const updatedPreferences = await storage.upsertUserPreferences(
      userId,
      validatedData,
    );

    res.json(updatedPreferences);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: "Invalid request data",
        details: error.errors,
      });
    }
    console.error("Error updating user preferences:", error);
    res.status(500).json({ error: "Failed to update preferences" });
  }
});

// DELETE /api/users/account - Delete user account and all associated data (GDPR Right to Deletion)
router.delete("/account", accountDeletionRateLimiter, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const userEmail = req.user.claims.email || "unknown";

    logger.info(`Account deletion requested for user ${userId} (${userEmail})`);

    // Get user details before deletion for audit log
    const userRecord = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!userRecord || userRecord.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    // Log the deletion (audit logs require teamSubscriptionId, so we use logger for individual accounts)
    logger.info(
      {
        action: "account_deleted",
        userId: userId,
        email: userEmail,
        subscriptionTier: userRecord[0].subscriptionTier,
        deletedAt: new Date().toISOString(),
        reason: "user_requested",
      },
      "User account deletion initiated",
    );

    // Delete the user account (this will cascade delete all related data thanks to foreign key constraints)
    // The schema has 170+ cascade delete constraints that will automatically remove:
    // - All notebooks and their content (characters, plots, settings, etc.)
    // - All projects, timelines, family trees, canvases
    // - All guides, notes, folders
    // - All AI conversation threads and messages
    // - All team memberships
    // - All feedback and API keys
    // - All subscription and billing data
    // - All preferences and settings
    await db.delete(users).where(eq(users.id, userId));

    logger.info(
      `Account successfully deleted for user ${userId} (${userEmail})`,
    );

    // Destroy the session to log out the user
    if (req.session) {
      req.session.destroy((err: any) => {
        if (err) {
          logger.error("Error destroying session after account deletion:", err);
        }
      });
    }

    // Clear the session cookie
    res.clearCookie("connect.sid");

    res.json({
      success: true,
      message: "Account and all associated data have been permanently deleted",
    });
  } catch (error) {
    logger.error("Error deleting user account:", error);
    res.status(500).json({ error: "Failed to delete account" });
  }
});

// DELETE /api/users/account/request - Request account deletion with confirmation (optional soft delete)
router.post(
  "/account/deletion-request",
  accountDeletionRateLimiter,
  async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const userEmail = req.user.claims.email || "unknown";
      const { reason } = req.body;

      logger.info(
        `Account deletion request submitted for user ${userId} (${userEmail})`,
      );

      // Log the deletion request
      logger.info(
        {
          action: "account_deletion_requested",
          userId: userId,
          email: userEmail,
          reason: reason || "Not provided",
          requestedAt: new Date().toISOString(),
        },
        "User account deletion request received",
      );

      // In a production system, you might want to:
      // 1. Send a confirmation email with a deletion link
      // 2. Set a "scheduledForDeletion" date 30 days in the future
      // 3. Allow the user to cancel before the deletion date
      // For now, we just log the request

      res.json({
        success: true,
        message:
          "Deletion request received. Your account will be deleted immediately when you confirm.",
        nextSteps:
          "To permanently delete your account, use the DELETE /api/users/account endpoint",
      });
    } catch (error) {
      logger.error("Error processing deletion request:", error);
      res.status(500).json({ error: "Failed to process deletion request" });
    }
  },
);

export default router;
