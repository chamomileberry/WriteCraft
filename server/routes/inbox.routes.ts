import { Router } from "express";
import { storage } from "../storage";
import { logger } from "../utils/logger";
import { readRateLimiter, writeRateLimiter } from "../security/rateLimiters";

const router = Router();

// GET /api/inbox/unread-count - Get unread reply count (must be before /:id routes)
router.get("/unread-count", readRateLimiter, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const count = await storage.getUnreadReplyCount(userId);
    res.json({ count });
  } catch (error) {
    logger.error("Error getting unread count:", error);
    res.status(500).json({ error: "Failed to get unread count" });
  }
});

// GET /api/inbox - Get user's feedback with replies
router.get("/", readRateLimiter, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const feedbackList = await storage.getUserFeedback(userId);
    res.json(feedbackList);
  } catch (error) {
    logger.error("Error fetching user inbox:", error);
    res.status(500).json({ error: "Failed to fetch inbox" });
  }
});

// PUT /api/inbox/:id/mark-read - Mark feedback reply as read
router.put("/:id/mark-read", writeRateLimiter, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const feedbackId = req.params.id;

    const updated = await storage.markFeedbackReplyAsRead(feedbackId, userId);

    if (!updated) {
      return res.status(404).json({ error: "Feedback not found" });
    }

    res.json(updated);
  } catch (error) {
    logger.error("Error marking feedback as read:", error);
    res.status(500).json({ error: "Failed to mark as read" });
  }
});

export default router;
