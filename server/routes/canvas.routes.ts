import { Router } from "express";
import { storage } from "../storage";
import { insertCanvasSchema } from "@shared/schema";
import { validateInput } from "../security/middleware";
import { readRateLimiter, writeRateLimiter } from "../security/rateLimiters";

const router = Router();

// Get all canvases for the current user
router.get("/", readRateLimiter, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const canvases = await storage.getUserCanvases(userId);
    res.json(canvases);
  } catch (error) {
    console.error("Error fetching canvases:", error);
    res.status(500).json({ error: "Failed to fetch canvases" });
  }
});

// Get canvases for a specific project
router.get("/project/:projectId", readRateLimiter, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const { projectId } = req.params;

    // Verify user owns the project
    const project = await storage.getProject(projectId, userId);
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    const canvases = await storage.getProjectCanvases(projectId, userId);
    res.json(canvases);
  } catch (error) {
    console.error("Error fetching project canvases:", error);
    res.status(500).json({ error: "Failed to fetch project canvases" });
  }
});

// Create a new canvas
router.post(
  "/",
  writeRateLimiter,
  validateInput(insertCanvasSchema.omit({ userId: true })),
  async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const canvasData = { ...req.body, userId };

      // If projectId is provided, verify user owns the project
      if (canvasData.projectId) {
        const project = await storage.getProject(canvasData.projectId, userId);
        if (!project) {
          return res.status(404).json({ error: "Project not found" });
        }
      }

      const savedCanvas = await storage.createCanvas(canvasData);
      res.json(savedCanvas);
    } catch (error) {
      console.error("Error creating canvas:", error);
      res.status(500).json({ error: "Failed to create canvas" });
    }
  },
);

// Get a specific canvas
router.get("/:id", readRateLimiter, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const canvas = await storage.getCanvas(req.params.id, userId);
    if (!canvas) {
      return res.status(404).json({ error: "Canvas not found" });
    }
    res.json(canvas);
  } catch (error) {
    console.error("Error fetching canvas:", error);
    res.status(500).json({ error: "Failed to fetch canvas" });
  }
});

// Update a canvas
router.put(
  "/:id",
  writeRateLimiter,
  validateInput(insertCanvasSchema.omit({ userId: true }).partial()),
  async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const updateData = req.body;

      // If projectId is being updated, verify user owns the project
      if (updateData.projectId) {
        const project = await storage.getProject(updateData.projectId, userId);
        if (!project) {
          return res.status(404).json({ error: "Project not found" });
        }
      }

      const updatedCanvas = await storage.updateCanvas(
        req.params.id,
        userId,
        updateData,
      );

      if (!updatedCanvas) {
        return res.status(404).json({ error: "Canvas not found" });
      }

      res.json(updatedCanvas);
    } catch (error) {
      console.error("Error updating canvas:", error);
      if (error instanceof Error && error.message.includes("Unauthorized")) {
        const userId = req.user?.claims?.sub || "unknown";
        const canvasId = req.params.id || "unknown";
        console.warn(
          `[Security] Unauthorized canvas operation - userId: ${userId}, canvasId: ${canvasId}`,
        );
        return res.status(404).json({ error: "Not found" });
      }
      res.status(500).json({ error: "Failed to update canvas" });
    }
  },
);

// Delete a canvas
router.delete("/:id", writeRateLimiter, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    await storage.deleteCanvas(req.params.id, userId);
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting canvas:", error);
    if (error instanceof Error && error.message.includes("Unauthorized")) {
      const userId = req.user?.claims?.sub || "unknown";
      const canvasId = req.params.id || "unknown";
      console.warn(
        `[Security] Unauthorized canvas operation - userId: ${userId}, canvasId: ${canvasId}`,
      );
      return res.status(404).json({ error: "Not found" });
    }
    res.status(500).json({ error: "Failed to delete canvas" });
  }
});

export default router;
