import { Router } from "express";
import { storage } from "../storage";
import { z } from "zod";
import { logger } from "../utils/logger";

const router = Router();

// GET /api/admin/feedback - Get all feedback (admin only)
router.get("/", async (req: any, res) => {
  try {
    // Check if user is admin
    const user = await storage.getUser(req.user.claims.sub);
    if (!user?.isAdmin) {
      return res.status(403).json({ error: "Unauthorized - Admin access required" });
    }

    const feedbackList = await storage.getAllFeedback();
    res.json(feedbackList);
  } catch (error) {
    logger.error("Error fetching feedback:", error);
    res.status(500).json({ error: "Failed to fetch feedback" });
  }
});

// PUT /api/admin/feedback/:id - Update feedback status (admin only)
router.put("/:id", async (req: any, res) => {
  try {
    // Check if user is admin
    const user = await storage.getUser(req.user.claims.sub);
    if (!user?.isAdmin) {
      return res.status(403).json({ error: "Unauthorized - Admin access required" });
    }

    const updateSchema = z.object({
      status: z.enum(['new', 'reviewed', 'in-progress', 'resolved', 'closed']),
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

export default router;
