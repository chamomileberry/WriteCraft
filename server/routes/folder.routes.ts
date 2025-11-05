import { Router } from "express";
import { storage } from "../storage";
import { insertFolderSchema } from "@shared/schema";
import { z } from "zod";
import { readRateLimiter, writeRateLimiter } from "../security/rateLimiters";

const router = Router();

router.post("/", writeRateLimiter, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const folderData = { ...req.body, userId };

    const validatedFolder = insertFolderSchema.parse(folderData);
    const savedFolder = await storage.createFolder(validatedFolder);
    res.json(savedFolder);
  } catch (error) {
    console.error("Error creating folder:", error);
    if (error instanceof z.ZodError) {
      return res
        .status(400)
        .json({ error: "Invalid folder data", details: error.errors });
    }
    if (error instanceof Error && error.message.includes("Unauthorized")) {
      const userId = req.user?.claims?.sub || "unknown";
      const notebookId =
        req.query.notebookId || req.body.notebookId || "unknown";
      console.warn(
        `[Security] Unauthorized operation - userId: ${userId}, notebookId: ${notebookId}`,
      );
      return res.status(404).json({ error: "Not found" });
    }
    res.status(500).json({ error: "Failed to create folder" });
  }
});

router.get("/", readRateLimiter, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const type = req.query.type as string;
    const manuscriptId = req.query.manuscriptId as string;
    const guideId = req.query.guideId as string;

    // If manuscriptId or guideId is provided, use document-specific method
    if (manuscriptId) {
      const folders = await storage.getDocumentFolders(manuscriptId, userId);
      res.json(folders);
    } else if (guideId) {
      const folders = await storage.getDocumentFolders(guideId, userId);
      res.json(folders);
    } else {
      // Fallback to general method with type filter
      const folders = await storage.getUserFolders(userId, type);
      res.json(folders);
    }
  } catch (error) {
    console.error("Error fetching folders:", error);
    res.status(500).json({ error: "Failed to fetch folders" });
  }
});

router.get("/:id", readRateLimiter, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const folder = await storage.getFolder(req.params.id, userId);
    if (!folder) {
      console.warn(
        `[Security] Unauthorized folder access attempt - userId: ${userId}, folderId: ${req.params.id}`,
      );
      return res.status(404).json({ error: "Folder not found" });
    }
    res.json(folder);
  } catch (error) {
    console.error("Error fetching folder:", error);
    res.status(500).json({ error: "Failed to fetch folder" });
  }
});

router.put("/:id", writeRateLimiter, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const folderData = { ...req.body, userId };

    const validatedUpdates = insertFolderSchema.partial().parse(folderData);
    const updatedFolder = await storage.updateFolder(
      req.params.id,
      userId,
      validatedUpdates,
    );

    if (!updatedFolder) {
      return res.status(404).json({ error: "Folder not found" });
    }

    res.json(updatedFolder);
  } catch (error) {
    console.error("Error updating folder:", error);
    if (error instanceof z.ZodError) {
      return res
        .status(400)
        .json({ error: "Invalid folder data", details: error.errors });
    }
    if (error instanceof Error && error.message.includes("Unauthorized")) {
      const userId = req.user?.claims?.sub || "unknown";
      const notebookId =
        req.query.notebookId || req.body.notebookId || "unknown";
      console.warn(
        `[Security] Unauthorized operation - userId: ${userId}, notebookId: ${notebookId}`,
      );
      return res.status(404).json({ error: "Not found" });
    }
    res.status(500).json({ error: "Failed to update folder" });
  }
});

router.delete("/:id", writeRateLimiter, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    await storage.deleteFolder(req.params.id, userId);
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting folder:", error);
    if (error instanceof Error && error.message.includes("Unauthorized")) {
      const userId = req.user?.claims?.sub || "unknown";
      const notebookId =
        req.query.notebookId || req.body.notebookId || "unknown";
      console.warn(
        `[Security] Unauthorized operation - userId: ${userId}, notebookId: ${notebookId}`,
      );
      return res.status(404).json({ error: "Not found" });
    }
    res.status(500).json({ error: "Failed to delete folder" });
  }
});

export default router;
