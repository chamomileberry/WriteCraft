import { Router } from "express";
import { z } from "zod";
import { storage } from "../storage";
import { insertUserPreferencesSchema } from "@shared/schema";

const router = Router();

// Get user preferences
router.get("/preferences", async (req: any, res) => {
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
router.patch("/preferences", async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    
    // Validate the request body using the insert schema (partial)
    const updateSchema = insertUserPreferencesSchema.partial().omit({ userId: true });
    const validatedData = updateSchema.parse(req.body);
    
    // Upsert user preferences
    const updatedPreferences = await storage.upsertUserPreferences(userId, validatedData);
    
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

export default router;
