import { Request, Response, NextFunction } from "express";
import { subscriptionService } from "../services/subscriptionService";

/**
 * AI Usage Tracking Middleware
 *
 * Wraps AI generation routes to:
 * 1. Check if user can perform AI generation (tier limits)
 * 2. For premium operations (polish, extended_thinking), check tier access and quota
 * 3. Track usage after successful generation
 *
 * Usage:
 * router.post('/endpoint', secureAuthentication, trackAIUsage('operation_type'), async (req, res) => {
 *   // Your AI logic here
 *   // Make sure to attach usage metadata to res.locals.aiUsage
 * });
 */
export function trackAIUsage(operationType: string) {
  return async (req: any, res: Response, next: NextFunction) => {
    const userId = req.user?.claims?.sub;

    if (!userId) {
      console.error(
        "[AI Usage] No userId found in request for operation:",
        operationType,
      );
      console.error(
        "[AI Usage] Request user object:",
        JSON.stringify(req.user, null, 2),
      );
      return res.status(401).json({
        error: "Unauthorized",
        message:
          "User authentication required. Please refresh the page and try again.",
        code: "AUTH_REQUIRED",
      });
    }

    console.log("[AI Usage] Tracking operation:", {
      operationType,
      userId: userId.substring(0, 8) + "...",
    });

    // Check for premium operations (polish, extended_thinking)
    const isPremiumOp =
      operationType === "polish" || operationType === "extended_thinking";

    if (isPremiumOp) {
      // Check premium operation access and quota
      const premiumCheck = await subscriptionService.canUsePremiumOperation(
        userId,
        operationType as "polish" | "extended_thinking",
      );

      if (!premiumCheck.allowed) {
        return res.status(403).json({
          error: "Premium feature access denied",
          message: premiumCheck.reason,
          upgradeUrl: "/pricing",
          isPremiumFeature: true,
        });
      }

      // Store quota info for client
      res.locals.premiumQuota = {
        remaining: premiumCheck.remaining,
        limit: premiumCheck.limit,
      };
    } else {
      // Check standard AI generation limits
      const permission = await subscriptionService.canPerformAction(
        userId,
        "ai_generation",
      );

      if (!permission.allowed) {
        return res.status(403).json({
          error: "Usage limit exceeded",
          message: permission.reason,
          upgradeUrl: "/pricing",
        });
      }
    }

    // Store the operation type for later use
    res.locals.aiOperationType = operationType;
    res.locals.aiUserId = userId;

    // Override res.json to track usage before sending response
    const originalJson = res.json.bind(res);
    res.json = function (body: any) {
      // If the response has usage metadata, log it
      if (res.locals.aiUsage) {
        const usage = res.locals.aiUsage;

        // Fire and forget - don't block the response
        subscriptionService
          .logAIUsage({
            userId: res.locals.aiUserId,
            operationType: res.locals.aiOperationType,
            model: usage.model || "claude-haiku-4-5",
            inputTokens: usage.input_tokens || 0,
            outputTokens: usage.output_tokens || 0,
            cachedTokens:
              usage.cache_read_input_tokens ||
              usage.cache_creation_input_tokens ||
              0,
            projectId: req.body.projectId,
            notebookId: req.body.notebookId,
          })
          .catch((error) => {
            console.error("[AI Usage Tracking] Failed to log usage:", error);
          });
      }

      return originalJson(body);
    } as any;

    next();
  };
}

/**
 * Helper function to attach usage metadata to response
 * Call this in your route handler after getting Anthropic response
 *
 * @param res Express response object
 * @param usage Anthropic usage object from message.usage
 * @param model Model name used for the generation
 */
export function attachUsageMetadata(res: Response, usage: any, model?: string) {
  res.locals.aiUsage = {
    ...usage,
    model: model || "claude-sonnet-4-20250514",
  };
}
