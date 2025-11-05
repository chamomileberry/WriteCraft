import { Router } from "express";
import { IntrusionDetectionService } from "../services/intrusionDetectionService";
import { requireAdmin } from "../security/middleware";
import { z } from "zod";
import { readRateLimiter, writeRateLimiter } from "../security/rateLimiters";

const router = Router();

/**
 * Get security overview statistics
 * Admin only
 */
router.get("/overview", readRateLimiter, requireAdmin, async (req, res) => {
  try {
    const [unacknowledgedAlerts, blockedIps, recentAttempts] =
      await Promise.all([
        IntrusionDetectionService.getUnacknowledgedAlerts(100),
        IntrusionDetectionService.getBlockedIps(),
        IntrusionDetectionService.getRecentAttempts(100),
      ]);

    // Calculate statistics
    const stats = {
      totalUnacknowledgedAlerts: unacknowledgedAlerts.length,
      criticalAlerts: unacknowledgedAlerts.filter(
        (a) => a.severity === "CRITICAL",
      ).length,
      highAlerts: unacknowledgedAlerts.filter((a) => a.severity === "HIGH")
        .length,
      blockedIpsCount: blockedIps.length,
      recentAttemptsCount: recentAttempts.length,
      attackTypesBreakdown: recentAttempts.reduce((acc: any, attempt) => {
        acc[attempt.attackType] = (acc[attempt.attackType] || 0) + 1;
        return acc;
      }, {}),
    };

    res.json(stats);
  } catch (error) {
    console.error("[Security API] Error getting overview:", error);
    res.status(500).json({ error: "Failed to get security overview" });
  }
});

/**
 * Get security alerts with pagination
 * Admin only
 */
router.get("/alerts", readRateLimiter, requireAdmin, async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
    const acknowledgedFilter =
      req.query.acknowledged === "true"
        ? true
        : req.query.acknowledged === "false"
          ? false
          : undefined;

    const alerts =
      await IntrusionDetectionService.getUnacknowledgedAlerts(limit);

    // Filter by acknowledged status if specified
    const filteredAlerts =
      acknowledgedFilter !== undefined
        ? alerts.filter((a) => a.acknowledged === acknowledgedFilter)
        : alerts;

    res.json(filteredAlerts);
  } catch (error) {
    console.error("[Security API] Error getting alerts:", error);
    res.status(500).json({ error: "Failed to get security alerts" });
  }
});

/**
 * Acknowledge a security alert
 * Admin only
 */
router.post(
  "/alerts/:alertId/acknowledge",
  writeRateLimiter,
  requireAdmin,
  async (req: any, res) => {
    try {
      const { alertId } = req.params;
      const adminUserId = req.user.claims.sub;

      await IntrusionDetectionService.acknowledgeAlert(alertId, adminUserId);

      res.json({ success: true, message: "Alert acknowledged" });
    } catch (error) {
      console.error("[Security API] Error acknowledging alert:", error);
      res.status(500).json({ error: "Failed to acknowledge alert" });
    }
  },
);

/**
 * Get intrusion attempts with pagination
 * Admin only
 */
router.get(
  "/intrusion-attempts",
  readRateLimiter,
  requireAdmin,
  async (req, res) => {
    try {
      const limit = Math.min(parseInt(req.query.limit as string) || 100, 200);

      const attempts = await IntrusionDetectionService.getRecentAttempts(limit);

      res.json(attempts);
    } catch (error) {
      console.error("[Security API] Error getting intrusion attempts:", error);
      res.status(500).json({ error: "Failed to get intrusion attempts" });
    }
  },
);

/**
 * Get blocked IPs
 * Admin only
 */
router.get("/blocked-ips", readRateLimiter, requireAdmin, async (req, res) => {
  try {
    const blockedIps = await IntrusionDetectionService.getBlockedIps();

    res.json(blockedIps);
  } catch (error) {
    console.error("[Security API] Error getting blocked IPs:", error);
    res.status(500).json({ error: "Failed to get blocked IPs" });
  }
});

/**
 * Block an IP manually
 * Admin only
 */
router.post(
  "/block-ip",
  writeRateLimiter,
  requireAdmin,
  async (req: any, res) => {
    try {
      const schema = z.object({
        ipAddress: z.string().min(7),
        reason: z.string().min(1),
        severity: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),
        durationMinutes: z.number().optional(),
      });

      const data = schema.parse(req.body);
      const adminUserId = req.user.claims.sub;

      await IntrusionDetectionService.blockIp({
        ipAddress: data.ipAddress,
        reason: data.reason,
        severity: data.severity,
        durationMinutes: data.durationMinutes,
        blockedBy: adminUserId,
      });

      res.json({
        success: true,
        message: `IP ${data.ipAddress} blocked successfully`,
      });
    } catch (error) {
      console.error("[Security API] Error blocking IP:", error);

      if (error instanceof z.ZodError) {
        return res
          .status(400)
          .json({ error: "Invalid request data", details: error.errors });
      }

      res.status(500).json({ error: "Failed to block IP" });
    }
  },
);

/**
 * Unblock an IP
 * Admin only
 */
router.post(
  "/unblock-ip",
  writeRateLimiter,
  requireAdmin,
  async (req: any, res) => {
    try {
      const schema = z.object({
        ipAddress: z.string().min(7),
      });

      const data = schema.parse(req.body);
      const adminUserId = req.user.claims.sub;

      await IntrusionDetectionService.unblockIp(data.ipAddress, adminUserId);

      res.json({
        success: true,
        message: `IP ${data.ipAddress} unblocked successfully`,
      });
    } catch (error) {
      console.error("[Security API] Error unblocking IP:", error);

      if (error instanceof z.ZodError) {
        return res
          .status(400)
          .json({ error: "Invalid request data", details: error.errors });
      }

      res.status(500).json({ error: "Failed to unblock IP" });
    }
  },
);

export default router;
