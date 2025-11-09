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
import { AppError } from "../../../storage-types";

const router = Router();

// Apply API authentication to all routes
router.use(apiAuthMiddleware);
router.use(addRateLimitHeaders);

/**
 * List all characters for the authenticated user
 * GET /api/v1/characters?notebookId=<id>&limit=<num>&cursor=<cursor>
 */
router.get("/", readRateLimiter, async (req: ApiAuthRequest, res) => {
  try {
    const userId = req.apiKey!.userId;
    const notebookId = req.query.notebookId as string;
    const limit = req.query.limit
      ? parseInt(req.query.limit as string, 10)
      : undefined;
    const cursor = req.query.cursor
      ? { value: req.query.cursor as string }
      : undefined;

    if (!notebookId) {
      return res.status(400).json({
        error: "notebookId query parameter is required",
      });
    }

    const result = await storage.getUserCharacters(
      userId,
      notebookId,
      { limit, cursor },
    );

    res.json({
      characters: result.items,
      count: result.items.length,
      nextCursor: result.nextCursor?.value,
    });
  } catch (error) {
    if (error instanceof AppError) {
      const statusMap: Record<string, number> = {
        not_found: 404,
        forbidden: 403,
        conflict: 409,
        invalid_input: 400,
        aborted: 503,
      };
      return res.status(statusMap[error.code] || 500).json({
        error: error.message,
        code: error.code,
      });
    }

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
    if (error instanceof AppError) {
      const statusMap: Record<string, number> = {
        not_found: 404,
        forbidden: 403,
        conflict: 409,
        invalid_input: 400,
        aborted: 503,
      };
      return res.status(statusMap[error.code] || 500).json({
        error: error.message,
        code: error.code,
      });
    }

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

      const result = await storage.createCharacter({
        ...req.body,
        userId,
      });

      res.status(201).json(result.value);
    } catch (error) {
      if (error instanceof AppError) {
        const statusMap: Record<string, number> = {
          not_found: 404,
          forbidden: 403,
          conflict: 409,
          invalid_input: 400,
          aborted: 503,
        };
        return res.status(statusMap[error.code] || 500).json({
          error: error.message,
          code: error.code,
        });
      }

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

      const result = await storage.updateCharacter(
        characterId,
        userId,
        notebookId,
        req.body,
      );

      if (!result.updated) {
        return res.status(404).json({
          error: "Character not found",
        });
      }

      res.json(result.value);
    } catch (error) {
      if (error instanceof AppError) {
        const statusMap: Record<string, number> = {
          not_found: 404,
          forbidden: 403,
          conflict: 409,
          invalid_input: 400,
          aborted: 503,
        };
        return res.status(statusMap[error.code] || 500).json({
          error: error.message,
          code: error.code,
        });
      }

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

      const result = await storage.deleteCharacter(characterId, userId, notebookId);

      if (!result.deleted) {
        return res.status(404).json({
          error: "Character not found",
        });
      }

      res.status(204).send();
    } catch (error) {
      if (error instanceof AppError) {
        const statusMap: Record<string, number> = {
          not_found: 404,
          forbidden: 403,
          conflict: 409,
          invalid_input: 400,
          aborted: 503,
        };
        return res.status(statusMap[error.code] || 500).json({
          error: error.message,
          code: error.code,
        });
      }

      console.error("Error deleting character:", error);
      res.status(500).json({
        error: "Failed to delete character",
      });
    }
  },
);

export default router;
