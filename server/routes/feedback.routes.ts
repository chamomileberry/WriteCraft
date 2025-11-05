import { Router } from "express";
import { storage } from "../storage";
import { insertFeedbackSchema } from "@shared/schema";
import { z } from "zod";
import { logger } from "../utils/logger";
import { writeRateLimiter } from "../security/rateLimiters";

const router = Router();

// POST /api/feedback - Create new feedback
router.post("/", writeRateLimiter, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const userEmail = req.user.claims.email || "";

    // Get browser and OS info from headers
    const userAgent = req.headers["user-agent"] || "";
    const referer = req.headers["referer"] || "";

    // Parse user agent for browser and OS (basic parsing)
    let userBrowser = "Unknown";
    let userOS = "Unknown";

    if (userAgent.includes("Chrome")) userBrowser = "Chrome";
    else if (userAgent.includes("Firefox")) userBrowser = "Firefox";
    else if (userAgent.includes("Safari")) userBrowser = "Safari";
    else if (userAgent.includes("Edge")) userBrowser = "Edge";

    if (userAgent.includes("Windows")) userOS = "Windows";
    else if (userAgent.includes("Mac")) userOS = "macOS";
    else if (userAgent.includes("Linux")) userOS = "Linux";
    else if (userAgent.includes("Android")) userOS = "Android";
    else if (userAgent.includes("iOS")) userOS = "iOS";

    // Validate request body
    const createSchema = z.object({
      type: z.enum(["bug", "feature-request", "general-feedback"]),
      title: z.string().min(1).max(200),
      description: z.string().min(1).max(5000),
    });

    const validatedData = createSchema.parse(req.body);

    // Create feedback
    const feedbackData = {
      userId,
      userEmail,
      type: validatedData.type,
      title: validatedData.title,
      description: validatedData.description,
      status: "new" as const,
      userBrowser,
      userOS,
      currentPage: referer,
    };

    const feedback = await storage.createFeedback(feedbackData);

    logger.info(`Feedback created: ${feedback.id} by user ${userId}`);
    res.status(201).json(feedback);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: "Invalid request data",
        details: error.errors,
      });
    }
    logger.error("Error creating feedback:", error);
    res.status(500).json({ error: "Failed to create feedback" });
  }
});

export default router;
