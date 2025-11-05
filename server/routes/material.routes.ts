import { Router } from "express";
import { storage } from "../storage";
import { insertMaterialSchema } from "@shared/schema";
import { z } from "zod";
import { readRateLimiter, writeRateLimiter } from "../security/rateLimiters";

const router = Router();

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

    const validatedMaterial = insertMaterialSchema.parse(req.body);
    const savedMaterial = await storage.createMaterial(validatedMaterial);
    res.json(savedMaterial);
  } catch (error) {
    console.error("Error saving material:", error);
    if (error instanceof z.ZodError) {
      return res
        .status(400)
        .json({ error: "Invalid request data", details: error.errors });
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
    res.status(500).json({ error: "Failed to save material" });
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

    const materials = await storage.getUserMaterials(userId, notebookId);
    res.json(materials);
  } catch (error) {
    console.error("Error fetching materials:", error);
    res.status(500).json({ error: "Failed to fetch materials" });
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

    const material = await storage.getMaterial(
      req.params.id,
      userId,
      notebookId,
    );
    if (!material) {
      return res.status(404).json({ error: "Material not found" });
    }
    res.json(material);
  } catch (error) {
    console.error("Error fetching material:", error);
    res.status(500).json({ error: "Failed to fetch material" });
  }
});

router.put("/:id", writeRateLimiter, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const validatedUpdates = insertMaterialSchema.parse(req.body);
    const updatedMaterial = await storage.updateMaterial(
      req.params.id,
      userId,
      validatedUpdates,
    );
    res.json(updatedMaterial);
  } catch (error) {
    console.error("Error updating material:", error);
    if (error instanceof z.ZodError) {
      return res
        .status(400)
        .json({ error: "Invalid request data", details: error.errors });
    }
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    if (error instanceof Error && error.message.includes("Unauthorized")) {
      const userId = req.user?.claims?.sub || "unknown";
      const notebookId =
        req.query.notebookId || req.body.notebookId || "unknown";
      console.warn(
        `[Security] Unauthorized operation - userId: ${userId}, notebookId: ${notebookId}`,
      );
      return res.status(404).json({ error: "Not found" });
    }
    res.status(500).json({ error: errorMessage });
  }
});

router.delete("/:id", writeRateLimiter, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    await storage.deleteMaterial(req.params.id, userId);
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting material:", error);
    if (error instanceof Error && error.message.includes("Unauthorized")) {
      const userId = req.user?.claims?.sub || "unknown";
      const notebookId =
        req.query.notebookId || req.body.notebookId || "unknown";
      console.warn(
        `[Security] Unauthorized operation - userId: ${userId}, notebookId: ${notebookId}`,
      );
      return res.status(404).json({ error: "Not found" });
    }
    res.status(500).json({ error: "Failed to delete material" });
  }
});

export default router;
