import { Router } from "express";
import { storage } from "../storage";
import { z } from "zod";
import { logger } from "../utils/logger";
import { readRateLimiter, writeRateLimiter } from "../security/rateLimiters";

const router = Router();

// GET /api/admin/feedback - Get all feedback (admin only)
router.get("/", readRateLimiter, async (req: any, res) => {
  try {
    // Check if user is admin
    const user = await storage.getUser(req.user.claims.sub);
    if (!user?.isAdmin) {
      return res
        .status(403)
        .json({ error: "Unauthorized - Admin access required" });
    }

    const feedbackList = await storage.getAllFeedback();
    res.json(feedbackList);
  } catch (error) {
    logger.error("Error fetching feedback:", error);
    res.status(500).json({ error: "Failed to fetch feedback" });
  }
});

// PUT /api/admin/feedback/:id - Update feedback status (admin only)
router.put("/:id", writeRateLimiter, async (req: any, res) => {
  try {
    // Check if user is admin
    const user = await storage.getUser(req.user.claims.sub);
    if (!user?.isAdmin) {
      return res
        .status(403)
        .json({ error: "Unauthorized - Admin access required" });
    }

    const updateSchema = z.object({
      status: z.enum(["new", "reviewed", "in-progress", "resolved", "closed"]),
    });

    const { status } = updateSchema.parse(req.body);
    const feedbackId = req.params.id;

    const updated = await storage.updateFeedbackStatus(feedbackId, status);

    if (!updated) {
      return res.status(404).json({ error: "Feedback not found" });
    }

    logger.info(`Feedback ${feedbackId} status updated to ${status}`);
    res.json(updated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: "Invalid request data",
        details: error.errors,
      });
    }
    logger.error("Error updating feedback:", error);
    res.status(500).json({ error: "Failed to update feedback" });
  }
});

// POST /api/admin/feedback/:id/reply - Reply to feedback (admin only)
router.post("/:id/reply", writeRateLimiter, async (req: any, res) => {
  try {
    // Fetch CSRF token first
    const csrfResponse = await fetch("/api/auth/csrf-token", {
      credentials: "include",
    });

    // Check if user is admin
    const user = await storage.getUser(req.user.claims.sub);
    if (!user?.isAdmin) {
      return res
        .status(403)
        .json({ error: "Unauthorized - Admin access required" });
    }

    const replySchema = z.object({
      reply: z.string().min(1).max(5000),
    });

    const { reply } = replySchema.parse(req.body);
    const feedbackId = req.params.id;

    const updated = await storage.replyToFeedback(
      feedbackId,
      reply,
      req.user.claims.sub,
    );

    if (!updated) {
      return res.status(404).json({ error: "Feedback not found" });
    }

    logger.info(
      `Admin ${req.user.claims.sub} replied to feedback ${feedbackId}`,
    );
    res.json(updated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: "Invalid request data",
        details: error.errors,
      });
    }
    logger.error("Error replying to feedback:", error);
    res.status(500).json({ error: "Failed to reply to feedback" });
  }
});

export default router;
