import { Router } from "express";
import { storage } from "../storage";
import { insertSettlementSchema } from "@shared/schema";
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
          `[Security] Unauthorized settlement access attempt - userId: ${userId}, notebookId: ${notebookId}`,
        );
        return res.status(404).json({ error: "Settlement not found" });
      }
    }

    const validatedSettlement = insertSettlementSchema.parse(req.body);
    const savedSettlement = await storage.createSettlement(validatedSettlement);
    res.json(savedSettlement);
  } catch (error) {
    console.error("Error saving settlement:", error);
    if (error instanceof z.ZodError) {
      return res
        .status(400)
        .json({ error: "Invalid request data", details: error.errors });
    }
    if (error instanceof Error && error.message.includes("Unauthorized")) {
      const userId = req.user?.claims?.sub || "unknown";
      const settlementId = req.body.id || "unknown";
      console.warn(
        `[Security] Unauthorized settlement operation - userId: ${userId}, settlementId: ${settlementId}`,
      );
      return res.status(404).json({ error: "Not found" });
    }
    res.status(500).json({ error: "Failed to save settlement" });
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

    const settlements = await storage.getUserSettlements(userId, notebookId);
    res.json(settlements);
  } catch (error) {
    console.error("Error fetching settlements:", error);
    res.status(500).json({ error: "Failed to fetch settlements" });
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

    const settlement = await storage.getSettlement(
      req.params.id,
      userId,
      notebookId,
    );
    if (!settlement) {
      return res.status(404).json({ error: "Settlement not found" });
    }
    res.json(settlement);
  } catch (error) {
    console.error("Error fetching settlement:", error);
    res.status(500).json({ error: "Failed to fetch settlement" });
  }
});

router.put("/:id", writeRateLimiter, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const validatedUpdates = insertSettlementSchema.parse(req.body);
    const updatedSettlement = await storage.updateSettlement(
      req.params.id,
      userId,
      validatedUpdates,
    );
    res.json(updatedSettlement);
  } catch (error) {
    console.error("Error updating settlement:", error);
    if (error instanceof z.ZodError) {
      return res
        .status(400)
        .json({ error: "Invalid request data", details: error.errors });
    }
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    if (error instanceof Error && error.message.includes("Unauthorized")) {
      const userId = req.user?.claims?.sub || "unknown";
      const settlementId = req.params.id || "unknown";
      console.warn(
        `[Security] Unauthorized settlement operation - userId: ${userId}, settlementId: ${settlementId}`,
      );
      return res.status(404).json({ error: "Not found" });
    }
    res.status(500).json({ error: errorMessage });
  }
});

router.delete("/:id", writeRateLimiter, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    await storage.deleteSettlement(req.params.id, userId);
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting settlement:", error);
    if (error instanceof Error && error.message.includes("Unauthorized")) {
      const userId = req.user?.claims?.sub || "unknown";
      const settlementId = req.params.id || "unknown";
      console.warn(
        `[Security] Unauthorized settlement operation - userId: ${userId}, settlementId: ${settlementId}`,
      );
      return res.status(404).json({ error: "Not found" });
    }
    res.status(500).json({ error: "Failed to delete settlement" });
  }
});

export default router;
