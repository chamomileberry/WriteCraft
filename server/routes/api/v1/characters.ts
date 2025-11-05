import { Router } from "express";
import {
  apiAuthMiddleware,
  requireScope,
  addRateLimitHeaders,
  ApiAuthRequest,
} from "../../../middleware/apiAuthMiddleware";
import { storage } from "../../../storage";
import {
  readRateLimiter,
  writeRateLimiter,
} from "../../../security/rateLimiters";

const router = Router();

// Apply API authentication to all routes
router.use(apiAuthMiddleware);
router.use(addRateLimitHeaders);

/**
 * List all characters for the authenticated user
 * GET /api/v1/characters?notebookId=<id>
 */
router.get("/", readRateLimiter, async (req: ApiAuthRequest, res) => {
  try {
    const userId = req.apiKey!.userId;
    const notebookId = req.query.notebookId as string;

    if (!notebookId) {
      return res.status(400).json({
        error: "notebookId query parameter is required",
      });
    }

    const characters = await storage.getUserCharacters(userId, notebookId);

    res.json({
      characters,
      count: characters.length,
    });
  } catch (error) {
    console.error("Error fetching characters:", error);
    res.status(500).json({
      error: "Failed to fetch characters",
    });
  }
});

/**
 * Get a specific character by ID
 * GET /api/v1/characters/:id?notebookId=<id>
 */
router.get("/:id", readRateLimiter, async (req: ApiAuthRequest, res) => {
  try {
    const userId = req.apiKey!.userId;
    const characterId = req.params.id;
    const notebookId = req.query.notebookId as string;

    if (!notebookId) {
      return res.status(400).json({
        error: "notebookId query parameter is required",
      });
    }

    const character = await storage.getCharacter(
      characterId,
      userId,
      notebookId,
    );

    if (!character) {
      return res.status(404).json({
        error: "Character not found",
      });
    }

    res.json(character);
  } catch (error) {
    console.error("Error fetching character:", error);
    res.status(500).json({
      error: "Failed to fetch character",
    });
  }
});

/**
 * Create a new character
 * POST /api/v1/characters
 */
router.post(
  "/",
  writeRateLimiter,
  requireScope("write"),
  async (req: ApiAuthRequest, res) => {
    try {
      const userId = req.apiKey!.userId;

      const character = await storage.createCharacter({
        ...req.body,
        userId,
      });

      res.status(201).json(character);
    } catch (error) {
      console.error("Error creating character:", error);
      res.status(500).json({
        error: "Failed to create character",
      });
    }
  },
);

/**
 * Update a character
 * PATCH /api/v1/characters/:id?notebookId=<id>
 */
router.patch(
  "/:id",
  writeRateLimiter,
  requireScope("write"),
  async (req: ApiAuthRequest, res) => {
    try {
      const userId = req.apiKey!.userId;
      const characterId = req.params.id;
      const notebookId = req.query.notebookId as string;

      if (!notebookId) {
        return res.status(400).json({
          error: "notebookId query parameter is required",
        });
      }

      const character = await storage.updateCharacter(
        characterId,
        userId,
        req.body,
        notebookId,
      );

      if (!character) {
        return res.status(404).json({
          error: "Character not found",
        });
      }

      res.json(character);
    } catch (error) {
      console.error("Error updating character:", error);
      res.status(500).json({
        error: "Failed to update character",
      });
    }
  },
);

/**
 * Delete a character
 * DELETE /api/v1/characters/:id?notebookId=<id>
 */
router.delete(
  "/:id",
  writeRateLimiter,
  requireScope("write"),
  async (req: ApiAuthRequest, res) => {
    try {
      const userId = req.apiKey!.userId;
      const characterId = req.params.id;
      const notebookId = req.query.notebookId as string;

      if (!notebookId) {
        return res.status(400).json({
          error: "notebookId query parameter is required",
        });
      }

      await storage.deleteCharacter(characterId, userId, notebookId);

      res.status(204).send();
    } catch (error) {
      console.error("Error deleting character:", error);
      res.status(500).json({
        error: "Failed to delete character",
      });
    }
  },
);

export default router;
