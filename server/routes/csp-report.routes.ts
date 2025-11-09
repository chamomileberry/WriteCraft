import { Router, Request, Response } from "express";
import { securityAlerts } from "@shared/schema";
import { db } from "../db";
import { writeRateLimiter } from "../security/rateLimiters";

const router = Router();

/**
 * POST /api/csp-report
 * Endpoint for receiving Content Security Policy violation reports
 * This is called automatically by the browser when CSP violations occur
 */
router.post("/", writeRateLimiter, async (req: Request, res: Response) => {
  try {
    // CSP reports can be sent in different formats:
    // 1. Nested: { "csp-report": { ... } }
    // 2. Direct JSON: { "document-uri": ..., "violated-directive": ... }
    // We need to handle both formats
    const report = req.body["csp-report"] || req.body;

    // Validate that we have a report with required fields
    if (!report || typeof report !== "object") {
      // Still return 204 to prevent browser retry storms
      console.warn("[CSP] Received invalid CSP report format");
      return res.status(204).send();
    }

    // Extract violation details (handle both camelCase and hyphenated keys)
    const {
      "document-uri": documentUri,
      "violated-directive": violatedDirective,
      "blocked-uri": blockedUri,
      "source-file": sourceFile,
      "line-number": lineNumber,
      "column-number": columnNumber,
      "original-policy": originalPolicy,
    } = report;

    // Log the violation
    console.warn("[CSP] Content Security Policy violation detected:", {
      documentUri,
      violatedDirective,
      blockedUri,
      sourceFile,
      lineNumber,
      columnNumber,
    });

    // Determine severity based on the violation
    let severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" = "MEDIUM";

    if (violatedDirective?.includes("script-src")) {
      severity = "HIGH"; // Script violations are serious
    } else if (violatedDirective?.includes("style-src")) {
      severity = "LOW"; // Style violations are less critical
    }

    // Check if this is a legitimate violation or just development noise
    const isDevelopment = getEnvOptional('NODE_ENV') === "development";
    const isViteHMR =
      blockedUri?.includes("/@vite") || blockedUri?.includes("/__vite");

    // Don't create alerts for Vite HMR in development
    if (isDevelopment && isViteHMR) {
      return res.status(204).send();
    }

    // Create security alert for the violation
    await db.insert(securityAlerts).values({
      alertType: "CSP_VIOLATION",
      severity,
      message: `CSP violation: ${violatedDirective || "unknown directive"}`,
      details: {
        documentUri,
        violatedDirective,
        blockedUri,
        sourceFile,
        lineNumber,
        columnNumber,
        userAgent: req.headers["user-agent"],
        timestamp: new Date().toISOString(),
      },
    });

    // Return 204 No Content (standard for CSP reporting)
    res.status(204).send();
  } catch (error) {
    console.error("[CSP] Error processing CSP report:", error);
    // Always return 204 even on error to prevent browser retry storms
    res.status(204).send();
  }
});

export default router;
