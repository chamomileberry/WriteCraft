import { Router } from "express";
import { db } from "../db";
import { sql } from "drizzle-orm";
import { readRateLimiter } from "../security/rateLimiters";

const router = Router();

/**
 * Basic health check - returns OK if server is responding
 * Use this for uptime monitoring
 */
router.get("/", readRateLimiter, (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    environment: getEnvOptional('NODE_ENV') || "development",
  });
});

/**
 * Database health check - verifies database connectivity
 * Use this to detect database issues separately from app issues
 */
router.get("/db", readRateLimiter, async (req, res) => {
  try {
    // Simple query to verify database is responding
    await db.execute(sql`SELECT 1 as health_check`);

    res.json({
      status: "ok",
      database: "connected",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(503).json({
      status: "error",
      database: "disconnected",
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * Detailed health check - requires authentication (admin only)
 * Provides comprehensive system status information
 */
router.get("/detailed", readRateLimiter, async (req, res) => {
  // Only allow in development or for authenticated admins
  const isDevelopment = getEnvOptional('NODE_ENV') === "development";
  const isAdmin = req.user && (req.user as any).role === "admin";

  if (!isDevelopment && !isAdmin) {
    return res.status(403).json({
      status: "error",
      message: "Forbidden - Admin access required",
    });
  }

  try {
    // Database check
    const dbStart = Date.now();
    await db.execute(sql`SELECT 1`);
    const dbLatency = Date.now() - dbStart;

    // System metrics
    const uptime = process.uptime();
    const memory = process.memoryUsage();

    res.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      environment: getEnvOptional('NODE_ENV') || "development",
  version: process.env['npm_package_version'] || "unknown",
      database: {
        status: "connected",
        latency: `${dbLatency}ms`,
      },
      system: {
        uptime: `${Math.floor(uptime)}s`,
        memory: {
          heapUsed: `${Math.round(memory.heapUsed / 1024 / 1024)}MB`,
          heapTotal: `${Math.round(memory.heapTotal / 1024 / 1024)}MB`,
          rss: `${Math.round(memory.rss / 1024 / 1024)}MB`,
        },
        nodeVersion: process.version,
      },
      services: {
        sentry: !!getEnvOptional('SENTRY_DSN'),
        redis: !!getEnvOptional('REDIS_URL'),
      },
    });
  } catch (error) {
    res.status(503).json({
      status: "error",
      message: "Health check failed",
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString(),
    });
  }
});

export default router;
