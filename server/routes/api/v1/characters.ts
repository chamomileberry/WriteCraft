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
import { errorHandler } from "../../../middleware/errorHandler";

const router = Router();

// Apply API authentication to all routes
router.use(apiAuthMiddleware);
router.use(addRateLimitHeaders);

/**
 * Helper to safely extract a single string from query parameter
 * Handles both string and string[] cases
 */
function getQueryString(
  value: string | string[] | undefined,
): string | undefined {
  if (Array.isArray(value)) {
    return value[0]; // Take first value if array
  }
  return value;
}

/**
 * Helper to parse notebookId from query parameter
 * Returns null for "null" string or undefined, otherwise returns the string value
 */
function parseNotebookId(value: string | undefined): string | null | undefined {
  if (value === undefined) return undefined;
  if (value === "null" || value === "") return null;
  return value;
}

/**
 * List all characters for the authenticated user
 * GET /api/v1/characters?notebookId=<id|null>&limit=<num>&cursor=<cursor>
 *
 * Query parameters:
 * - notebookId: Notebook ID or "null" for global characters (optional, defaults to undefined for all)
 * - limit: Number of results per page (optional, default 20, max 100)
 * - cursor: Pagination cursor from previous response (optional)
 */
router.get("/", readRateLimiter, async (req: ApiAuthRequest, res, next) => {
  try {
    const userId = req.apiKey!.userId;
    const notebookIdRaw = getQueryString(req.query.notebookId);
    const notebookId = parseNotebookId(notebookIdRaw);
    const limitStr = getQueryString(req.query.limit);
    const cursorStr = getQueryString(req.query.cursor);

    const limit = limitStr ? parseInt(limitStr, 10) : undefined;
    const cursor = cursorStr ? { value: cursorStr } : undefined;

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
    next(error);
  }
});

/**
 * Get a specific character by ID
 * GET /api/v1/characters/:id?notebookId=<id|null>
 *
 * Query parameters:
 * - notebookId: Notebook ID or "null" for global characters (optional)
 */
router.get("/:id", readRateLimiter, async (req: ApiAuthRequest, res, next) => {
  try {
    const userId = req.apiKey!.userId;
    const characterId = req.params.id;
    const notebookIdRaw = getQueryString(req.query.notebookId);
    const notebookId = parseNotebookId(notebookIdRaw);

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
    next(error);
  }
});

/**
 * Create a new character
 * POST /api/v1/characters
 *
 * Body should include character data with optional notebookId (null for global)
 */
router.post(
  "/",
  writeRateLimiter,
  requireScope("write"),
  async (req: ApiAuthRequest, res, next) => {
    try {
      const userId = req.apiKey!.userId;

      const result = await storage.createCharacter({
        ...req.body,
        userId,
      });

      res.status(201).json(result.value);
    } catch (error) {
      next(error);
    }
  },
);

/**
 * Update a character
 * PATCH /api/v1/characters/:id?notebookId=<id|null>
 *
 * Query parameters:
 * - notebookId: Notebook ID or "null" for global characters (optional)
 */
router.patch(
  "/:id",
  writeRateLimiter,
  requireScope("write"),
  async (req: ApiAuthRequest, res, next) => {
    try {
      const userId = req.apiKey!.userId;
      const characterId = req.params.id;
      const notebookIdRaw = getQueryString(req.query.notebookId);
      const notebookId = parseNotebookId(notebookIdRaw);

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
      next(error);
    }
  },
);

/**
 * Delete a character
 * DELETE /api/v1/characters/:id?notebookId=<id|null>
 *
 * Query parameters:
 * - notebookId: Notebook ID or "null" for global characters (optional)
 */
router.delete(
  "/:id",
  writeRateLimiter,
  requireScope("write"),
  async (req: ApiAuthRequest, res, next) => {
    try {
      const userId = req.apiKey!.userId;
      const characterId = req.params.id;
      const notebookIdRaw = getQueryString(req.query.notebookId);
      const notebookId = parseNotebookId(notebookIdRaw);

      const result = await storage.deleteCharacter(
        characterId,
        userId,
        notebookId,
      );

      if (!result.deleted) {
        return res.status(404).json({
          error: "Character not found",
        });
      }

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },
);

// Apply error handler middleware last
router.use(errorHandler);

export default router;
