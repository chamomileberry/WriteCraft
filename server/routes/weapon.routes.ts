import { Router } from "express";
import { storage } from "../storage";
import { insertWeaponSchema } from "@shared/schema";
import { z } from "zod";
import { readRateLimiter, writeRateLimiter } from "../security/rateLimiters";

const router = Router();

// POST - Create weapon
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

    const validatedWeapon = insertWeaponSchema.parse(req.body);
    const savedWeapon = await storage.createWeapon(validatedWeapon);
    res.json(savedWeapon);
  } catch (error) {
    console.error("Error saving weapon:", error);
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
    res.status(500).json({ error: "Failed to save weapon" });
  }
});

// GET - List weapons (with notebookId filter)
router.get("/", readRateLimiter, async (req: any, res) => {
  try {
    const search = req.query.search as string;
    const notebookId = req.query.notebookId as string;
    const userId = req.user.claims.sub;

    if (!notebookId) {
      return res.status(400).json({ error: "Notebook ID is required" });
    }

    const weapons = await storage.getUserWeapons(userId, notebookId);

    if (search) {
      const filtered = weapons.filter((weapon) =>
        weapon.name?.toLowerCase().includes(search.toLowerCase()),
      );
      res.json(filtered);
    } else {
      res.json(weapons);
    }
  } catch (error) {
    console.error("Error fetching weapons:", error);
    res.status(500).json({ error: "Failed to fetch weapons" });
  }
});

// GET - Single weapon
router.get("/:id", readRateLimiter, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const notebookId = req.query.notebookId as string;

    if (!notebookId) {
      return res.status(400).json({ error: "Notebook ID is required" });
    }

    const weapon = await storage.getWeapon(req.params.id, userId, notebookId);
    if (!weapon) {
      return res.status(404).json({ error: "Weapon not found" });
    }
    res.json(weapon);
  } catch (error) {
    console.error("Error fetching weapon:", error);
    res.status(500).json({ error: "Failed to fetch weapon" });
  }
});

// PATCH - Update weapon
router.patch("/:id", writeRateLimiter, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const notebookId = req.query.notebookId as string;

    if (!notebookId) {
      return res.status(400).json({ error: "Notebook ID is required" });
    }

    const updates = insertWeaponSchema.partial().parse(req.body);
    const updatedWeapon = await storage.updateWeapon(
      req.params.id,
      userId,
      notebookId,
      updates,
    );
    res.json(updatedWeapon);
  } catch (error) {
    console.error("Error updating weapon:", error);
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
    res.status(500).json({ error: "Failed to update weapon" });
  }
});

// PUT - Update weapon
router.put("/:id", writeRateLimiter, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const notebookId = req.query.notebookId as string;

    if (!notebookId) {
      return res.status(400).json({ error: "Notebook ID is required" });
    }

    const updates = insertWeaponSchema.partial().parse(req.body);
    const updatedWeapon = await storage.updateWeapon(
      req.params.id,
      userId,
      notebookId,
      updates,
    );
    res.json(updatedWeapon);
  } catch (error) {
    console.error("Error updating weapon:", error);
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
    res.status(500).json({ error: "Failed to update weapon" });
  }
});

// DELETE
router.delete("/:id", writeRateLimiter, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const notebookId = req.query.notebookId as string;

    if (!notebookId) {
      return res.status(400).json({ error: "Notebook ID is required" });
    }

    await storage.deleteWeapon(req.params.id, userId, notebookId);
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting weapon:", error);
    if (error instanceof Error && error.message.includes("Unauthorized")) {
      const userId = req.user?.claims?.sub || "unknown";
      const notebookId =
        req.query.notebookId || req.body.notebookId || "unknown";
      console.warn(
        `[Security] Unauthorized operation - userId: ${userId}, notebookId: ${notebookId}`,
      );
      return res.status(404).json({ error: "Not found" });
    }
    res.status(500).json({ error: "Failed to delete weapon" });
  }
});

export default router;
