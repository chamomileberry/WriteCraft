import { Router } from "express";
import { storage } from "../storage";
import { insertThemeSchema } from "@shared/schema";
import { z } from "zod";
import { makeAICall } from "../lib/aiHelper";
import { getBannedPhrasesInstruction } from "../utils/banned-phrases";
import {
  trackAIUsage,
  attachUsageMetadata,
} from "../middleware/aiUsageMiddleware";
import {
  aiRateLimiter,
  writeRateLimiter,
  readRateLimiter,
} from "../security/rateLimiters";

const router = Router();

router.post(
  "/generate",
  aiRateLimiter,
  trackAIUsage("theme_generation"),
  async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const generateRequestSchema = z.object({
        genre: z.string().optional(),
        notebookId: z.string().optional(),
      });

      const { genre, notebookId } = generateRequestSchema.parse(req.body);

      // Load style instruction from database
      const styleInstruction = await getBannedPhrasesInstruction();

      const genreContext =
        genre && genre !== "any" ? ` for ${genre} stories` : "";

      // System prompt for AI generation
      const systemPrompt = `You are a creative writing assistant specialized in literary themes. Generate compelling, thought-provoking themes that resonate with readers${genreContext}.${styleInstruction}

IMPORTANT GUIDELINES:
- Themes should be profound and meaningful, exploring universal human experiences
- Focus on the deeper meaning and emotional resonance
- Make themes specific enough to be interesting, but broad enough to explore
- Avoid clichés and overused concepts`;

      const userPrompt = `Generate a powerful literary theme${genreContext}.

Return a JSON object with exactly these fields:
{
  "title": "Brief, evocative theme title (3-6 words)",
  "description": "Thoughtful exploration of the theme (2-3 sentences that explain the core concept and why it matters)"
}`;

      // Use intelligent model selection
      const result = await makeAICall({
        operationType: "theme_generation",
        userId,
        systemPrompt,
        userPrompt,
        maxTokens: 512,
        enableCaching: true,
      });

      // Parse the AI response
      const parsed = JSON.parse(result.content);

      const theme = {
        title: parsed.title,
        description: parsed.description,
        genre: genre === "any" ? null : genre,
        userId: userId || null,
        notebookId: notebookId || null,
      };

      const validatedTheme = insertThemeSchema.parse(theme);
      const savedTheme = await storage.createTheme(validatedTheme);

      // Attach usage metadata for tracking
      attachUsageMetadata(res, result.usage, result.model);

      res.json(savedTheme);
    } catch (error) {
      console.error("Error generating theme:", error);
      if (error instanceof z.ZodError) {
        return res
          .status(400)
          .json({ error: "Invalid request data", details: error.errors });
      }
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      res.status(500).json({ error: errorMessage });
    }
  },
);

router.post("/", writeRateLimiter, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const notebookId = req.body.notebookId;

    // Validate notebook ownership before allowing write
    if (notebookId) {
      const ownsNotebook = await storage.validateNotebookOwnership(
        notebookId,
        userId,
      );
      if (!ownsNotebook) {
        console.warn(
          `[Security] Unauthorized notebook access attempt - userId: ${userId}, notebookId: ${notebookId}`,
        );
        return res.status(404).json({ error: "Notebook not found" });
      }
    }

    const validatedTheme = insertThemeSchema.parse(req.body);
    const savedTheme = await storage.createTheme(validatedTheme);
    res.json(savedTheme);
  } catch (error) {
    console.error("Error saving theme:", error);
    if (error instanceof z.ZodError) {
      return res
        .status(400)
        .json({ error: "Invalid request data", details: error.errors });
    }
    res.status(500).json({ error: "Failed to save theme" });
  }
});

router.get("/user/:userId?", readRateLimiter, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const notebookId = req.query.notebookId as string;

    if (!notebookId) {
      return res
        .status(400)
        .json({ error: "notebookId query parameter is required" });
    }

    const themes = await storage.getUserThemes(userId, notebookId);
    res.json(themes);
  } catch (error) {
    console.error("Error fetching themes:", error);
    res.status(500).json({ error: "Failed to fetch themes" });
  }
});

router.get("/:id", readRateLimiter, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const notebookId = req.query.notebookId as string;

    if (!notebookId) {
      return res
        .status(400)
        .json({ error: "notebookId query parameter is required" });
    }

    const theme = await storage.getTheme(req.params.id, userId, notebookId);
    if (!theme) {
      return res.status(404).json({ error: "Theme not found" });
    }
    res.json(theme);
  } catch (error) {
    console.error("Error fetching theme:", error);
    res.status(500).json({ error: "Failed to fetch theme" });
  }
});

export default router;
