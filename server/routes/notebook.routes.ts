import { Router } from "express";
import { storage } from "../storage";
import { insertNotebookSchema, updateNotebookSchema } from "@shared/schema";
import { z } from "zod";
import { validateInput } from "../security/middleware";
import { requireFeature } from "../middleware/featureGate";
import { readRateLimiter, writeRateLimiter } from "../security/rateLimiters";
import { AppError } from "../storage-types";

const router = Router();

// Get all notebooks for a user (backward compatible - returns array)
router.get("/", readRateLimiter, async (req: any, res) => {
  try {
    console.log("[notebook.routes] GET / - Fetching notebooks", {
      userId: req.user?.claims?.sub,
      isAuthenticated: !!req.user,
      sessionID: req.sessionID,
      path: req.path,
      method: req.method,
      headers: {
        cookie: req.headers.cookie ? "present" : "missing",
        referer: req.headers.referer,
      },
    });

    const userId = req.user.claims.sub;
    const result = await storage.getUserNotebooks(userId);

    console.log("[notebook.routes] Successfully fetched notebooks:", {
      userId,
      count: result.items.length,
      notebookIds: result.items.map((n: any) => n.id),
      hasMore: !!result.nextCursor,
    });

    // Return array for backward compatibility
    res.json(result.items);
  } catch (error) {
    console.error("[notebook.routes] Error fetching notebooks:", error);
    if (error instanceof AppError) {
      if (error.code === "aborted") {
        return res.status(408).json({ error: "Request timeout" });
      }
      if (error.code === "forbidden") {
        const userId = req.user?.claims?.sub || "unknown";
        console.warn(
          `[Security] Unauthorized notebook operation - userId: ${userId}`,
        );
        return res.status(404).json({ error: "Not found" });
      }
    }
    res.status(500).json({ error: "Failed to fetch notebooks" });
  }
});

// Get all notebooks for a user with pagination support
router.get("/paginated", readRateLimiter, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;

    // Parse pagination params from query string
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;
    const cursor = req.query.cursor ? { value: req.query.cursor as string } : undefined;

    const pagination = limit || cursor ? { limit, cursor } : undefined;
    const result = await storage.getUserNotebooks(userId, pagination);

    console.log("[notebook.routes] Successfully fetched paginated notebooks:", {
      userId,
      count: result.items.length,
      hasMore: !!result.nextCursor,
    });

    res.json(result);
  } catch (error) {
    console.error("[notebook.routes] Error fetching paginated notebooks:", error);
    if (error instanceof AppError) {
      if (error.code === "aborted") {
        return res.status(408).json({ error: "Request timeout" });
      }
      if (error.code === "forbidden") {
        const userId = req.user?.claims?.sub || "unknown";
        console.warn(
          `[Security] Unauthorized notebook operation - userId: ${userId}`,
        );
        return res.status(404).json({ error: "Not found" });
      }
    }
    res.status(500).json({ error: "Failed to fetch notebooks" });
  }
});

// Create a new notebook
router.post(
  "/",
  writeRateLimiter,
  requireFeature("create_notebook"),
  validateInput(insertNotebookSchema.omit({ userId: true })),
  async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const notebookData = { ...req.body, userId };

      const result = await storage.createNotebook(notebookData);
      res.status(201).json(result.value);
    } catch (error) {
      console.error("Error creating notebook:", error);
      if (error instanceof AppError) {
        if (error.code === "invalid_input") {
          return res.status(400).json({ error: error.message });
        }
        if (error.code === "aborted") {
          return res.status(408).json({ error: "Request timeout" });
        }
      }
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      res.status(500).json({ error: errorMessage });
    }
  },
);

// Get a specific notebook by ID
router.get("/:id", readRateLimiter, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const notebook = await storage.getNotebook(req.params.id, userId);
    if (!notebook) {
      return res.status(404).json({ error: "Notebook not found" });
    }
    res.json(notebook);
  } catch (error) {
    console.error("Error fetching notebook:", error);
    res.status(500).json({ error: "Failed to fetch notebook" });
  }
});

// Update a notebook
router.put(
  "/:id",
  writeRateLimiter,
  validateInput(updateNotebookSchema),
  async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const updateData = { ...req.body, userId };

      const result = await storage.updateNotebook(
        req.params.id,
        userId,
        updateData,
      );

      if (!result.updated || !result.value) {
        return res.status(404).json({ error: "Notebook not found" });
      }

      res.json(result.value);
    } catch (error) {
      console.error("Error updating notebook:", error);
      if (error instanceof AppError) {
        if (error.code === "forbidden") {
          const userId = req.user?.claims?.sub || "unknown";
          const notebookId = req.params.id || "unknown";
          console.warn(
            `[Security] Unauthorized notebook operation - userId: ${userId}, notebookId: ${notebookId}`,
          );
          return res.status(404).json({ error: "Not found" });
        }
        if (error.code === "aborted") {
          return res.status(408).json({ error: "Request timeout" });
        }
      }
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      res.status(500).json({ error: errorMessage });
    }
  },
);

// Delete a notebook
router.delete("/:id", writeRateLimiter, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const result = await storage.deleteNotebook(req.params.id, userId);

    if (!result.deleted) {
      return res.status(404).json({ error: "Notebook not found" });
    }

    res.status(204).send();
  } catch (error) {
    console.error("Error deleting notebook:", error);
    if (error instanceof AppError) {
      if (error.code === "forbidden") {
        const userId = req.user?.claims?.sub || "unknown";
        console.warn(
          `[Security] Unauthorized notebook deletion attempt - userId: ${userId}, notebookId: ${req.params.id}`,
        );
        return res.status(404).json({ error: "Notebook not found" });
      }
      if (error.code === "aborted") {
        return res.status(408).json({ error: "Request timeout" });
      }
    }
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    res.status(500).json({ error: errorMessage });
  }
});

export default router;
