import { Router } from "express";
import { storage } from "../storage";
import { insertItemSchema } from "@shared/schema";
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
  trackAIUsage("item_generation"),
  async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;

      const generateRequestSchema = z.object({
        itemType: z.string().optional(),
        genre: z.string().optional(),
        notebookId: z.string(),
      });

      const { itemType, genre, notebookId } = generateRequestSchema.parse(
        req.body,
      );

      // Validate user owns the notebook before creating content
      const userNotebook = await storage.getNotebook(notebookId, userId);
      if (!userNotebook) {
        console.warn(
          `[Security] Unauthorized notebook access attempt - userId: ${userId}, notebookId: ${notebookId}`,
        );
        return res.status(404).json({ error: "Notebook not found" });
      }

      // Load style instruction from database
      const styleInstruction = await getBannedPhrasesInstruction();

      const typeContext = itemType ? ` of type ${itemType}` : "";
      const genreContext =
        genre && genre !== "any" ? ` suitable for ${genre} stories` : "";

      // System prompt for AI generation
      const systemPrompt = `You are a creative writing assistant specialized in worldbuilding items and objects. Generate imaginative, detailed items that enrich story worlds${typeContext}${genreContext}.${styleInstruction}

IMPORTANT GUIDELINES:
- Items should have clear purpose and significance to the story
- Include sensory details and unique characteristics
- Consider the item's history, creation, and impact
- Make items memorable and distinctive`;

      const userPrompt = `Generate an intriguing item${typeContext}${genreContext}.

Return a JSON object with exactly these fields:
{
  "name": "Distinctive item name (2-5 words)",
  "description": "Rich description including appearance, properties, origin, and significance (2-3 sentences)",
  "itemType": "${itemType || "artifact"}"
}`;

      // Use intelligent model selection
      const result = await makeAICall({
        operationType: "item_generation",
        userId,
        systemPrompt,
        userPrompt,
        maxTokens: 512,
        enableCaching: true,
      });

      // Parse the AI response
      const parsed = JSON.parse(result.content);

      const item = {
        name: parsed.name,
        description: parsed.description,
        itemType: parsed.itemType,
        genre: genre === "any" ? null : genre,
        userId,
        notebookId,
      };

      const validatedItem = insertItemSchema.parse(item);
      const savedItem = await storage.createItem(validatedItem);

      // Attach usage metadata for tracking
      attachUsageMetadata(res, result.usage, result.model);

      res.json(savedItem);
    } catch (error) {
      console.error("Error generating item:", error);
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

    const itemData = { ...req.body, userId };
    const validatedItem = insertItemSchema.parse(itemData);
    const savedItem = await storage.createItem(validatedItem);
    res.json(savedItem);
  } catch (error) {
    console.error("Error saving item:", error);
    if (error instanceof z.ZodError) {
      return res
        .status(400)
        .json({ error: "Invalid request data", details: error.errors });
    }
    res.status(500).json({ error: "Failed to save item" });
  }
});

router.get("/user/:userId?", readRateLimiter, async (req: any, res) => {
  try {
    // Extract userId from authentication headers for security (ignore client-supplied userId)
    const userId = req.user.claims.sub;
  const notebookId = req.query['notebookId'] as string;

    if (!notebookId) {
      return res
        .status(400)
        .json({ error: "notebookId query parameter is required" });
    }

    const items = await storage.getUserItems(userId, notebookId);
    res.json(items);
  } catch (error) {
    console.error("Error fetching items:", error);
    res.status(500).json({ error: "Failed to fetch items" });
  }
});

router.get("/:id", readRateLimiter, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
  const notebookId = req.query['notebookId'] as string;

    if (!notebookId) {
      return res
        .status(400)
        .json({ error: "notebookId query parameter is required" });
    }

  const item = await storage.getItem(req.params['id'], userId, notebookId);
    if (!item) {
      return res.status(404).json({ error: "Item not found" });
    }
    res.json(item);
  } catch (error) {
    console.error("Error fetching item:", error);
    res.status(500).json({ error: "Failed to fetch item" });
  }
});

export default router;
