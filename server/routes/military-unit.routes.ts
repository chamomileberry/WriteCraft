import { Router } from "express";
import { storage } from "../storage";
import { insertMilitaryUnitSchema } from "@shared/schema";
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
          `[Security] Unauthorized military-unit access attempt - userId: ${userId}, notebookId: ${notebookId}`,
        );
        return res.status(404).json({ error: "Military unit not found" });
      }
    }

    const validatedMilitaryUnit = insertMilitaryUnitSchema.parse(req.body);
    const savedMilitaryUnit = await storage.createMilitaryUnit(
      validatedMilitaryUnit,
    );
    res.json(savedMilitaryUnit);
  } catch (error) {
    console.error("Error saving military unit:", error);
    if (error instanceof z.ZodError) {
      return res
        .status(400)
        .json({ error: "Invalid request data", details: error.errors });
    }
    if (error instanceof Error && error.message.includes("Unauthorized")) {
      const userId = req.user?.claims?.sub || "unknown";
      const militaryUnitId = req.body.id || "unknown";
      console.warn(
        `[Security] Unauthorized military-unit operation - userId: ${userId}, militaryUnitId: ${militaryUnitId}`,
      );
      return res.status(404).json({ error: "Not found" });
    }
    res.status(500).json({ error: "Failed to save military unit" });
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

    const militaryUnits = await storage.getUserMilitaryUnits(
      userId,
      notebookId,
    );
    res.json(militaryUnits);
  } catch (error) {
    console.error("Error fetching military units:", error);
    res.status(500).json({ error: "Failed to fetch military units" });
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

    const militaryUnit = await storage.getMilitaryUnit(
      req.params.id,
      userId,
      notebookId,
    );
    if (!militaryUnit) {
      return res.status(404).json({ error: "Military unit not found" });
    }
    res.json(militaryUnit);
  } catch (error) {
    console.error("Error fetching military unit:", error);
    res.status(500).json({ error: "Failed to fetch military unit" });
  }
});

router.put("/:id", writeRateLimiter, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const validatedUpdates = insertMilitaryUnitSchema.parse(req.body);
    const updatedMilitaryUnit = await storage.updateMilitaryUnit(
      req.params.id,
      userId,
      validatedUpdates,
    );
    res.json(updatedMilitaryUnit);
  } catch (error) {
    console.error("Error updating military unit:", error);
    if (error instanceof z.ZodError) {
      return res
        .status(400)
        .json({ error: "Invalid request data", details: error.errors });
    }
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    if (error instanceof Error && error.message.includes("Unauthorized")) {
      const userId = req.user?.claims?.sub || "unknown";
      const militaryUnitId = req.params.id || "unknown";
      console.warn(
        `[Security] Unauthorized military-unit operation - userId: ${userId}, militaryUnitId: ${militaryUnitId}`,
      );
      return res.status(404).json({ error: "Not found" });
    }
    res.status(500).json({ error: errorMessage });
  }
});

router.delete("/:id", writeRateLimiter, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    await storage.deleteMilitaryUnit(req.params.id, userId);
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting military unit:", error);
    if (error instanceof Error && error.message.includes("Unauthorized")) {
      const userId = req.user?.claims?.sub || "unknown";
      const militaryUnitId = req.params.id || "unknown";
      console.warn(
        `[Security] Unauthorized military-unit operation - userId: ${userId}, militaryUnitId: ${militaryUnitId}`,
      );
      return res.status(404).json({ error: "Not found" });
    }
    res.status(500).json({ error: "Failed to delete military unit" });
  }
});

export default router;
