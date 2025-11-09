import { Router } from "express";
import * as Sentry from "@sentry/node";
import { readRateLimiter } from "../security/rateLimiters";

const router = Router();

// Diagnostic endpoint to check Sentry configuration
router.get("/check-config", readRateLimiter, (req, res) => {
  const sentryDsn = getEnvOptional('SENTRY_DSN');
  const isEnabled = !!sentryDsn;

  res.json({
    sentryConfigured: isEnabled,
    dsnPresent: isEnabled,
    dsnPreview: sentryDsn ? `${sentryDsn.substring(0, 30)}...` : "NOT SET",
    environment: getEnvOptional('NODE_ENV') || "development",
    message: isEnabled
      ? "Sentry DSN is configured and Sentry should be active"
      : "SENTRY_DSN environment variable is not set. Please add it to Replit Secrets.",
    instructions: !isEnabled
      ? "Go to Replit Secrets and add SENTRY_DSN with your Sentry DSN value, then restart the server."
      : "Configuration looks good. Try the /debug-sentry endpoint to test error tracking.",
  });
});

// Official Sentry test endpoint (recommended by Sentry docs)
// Use /api/sentry/debug to avoid client-side router interception
router.get("/debug", readRateLimiter, function mainHandler(req, res) {
  console.log(
    "[Sentry Test] /api/sentry/debug endpoint triggered - throwing error",
  );
  throw new Error("My first Sentry error!");
});

// Legacy endpoint for backward compatibility
router.get("/debug-sentry", readRateLimiter, function mainHandler(req, res) {
  console.log(
    "[Sentry Test] /api/sentry/debug-sentry endpoint triggered - throwing error",
  );
  throw new Error("My first Sentry error!");
});

// Test endpoint that throws an error to verify Sentry error capture
router.get("/test-sentry-error", readRateLimiter, (req, res) => {
  console.log("[Sentry Test] Triggering test error...");

  // Capture a message first
  Sentry.captureMessage("Sentry test endpoint accessed", "info");

  // Then throw an error
  throw new Error(
    "This is a test error from WriteCraft to verify Sentry integration is working!",
  );
});

// Test endpoint that captures a message (doesn't throw an error)
router.get("/test-sentry-message", readRateLimiter, (req, res) => {
  console.log("[Sentry Test] Sending test message to Sentry...");

  const eventId = Sentry.captureMessage(
    "Sentry message test - integration is working!",
    "info",
  );

  res.json({
    success: true,
    message: "Test message sent to Sentry",
    eventId,
    instructions:
      "Check your Sentry dashboard at https://writecraft.sentry.io to see this event",
  });
});

// Simple test endpoint that manually captures an exception
router.get("/test-capture", readRateLimiter, async (req, res) => {
  console.log("[Sentry Test] Manually capturing exception...");

  try {
    // Create and capture an error without throwing it
    const error = new Error("Manual Sentry test - captured without throwing");
    const eventId = Sentry.captureException(error);

    // Force flush to ensure event is sent immediately
    await Sentry.flush(2000);

    res.json({
      success: true,
      message: "Exception manually captured and sent to Sentry",
      eventId,
      sentryDsn: getEnvOptional('SENTRY_DSN')
        ? `${getEnvOptional('SENTRY_DSN').substring(0, 50)}...`
        : "NOT SET",
      instructions:
        "Check your Sentry dashboard. Look for event ID: " +
        eventId +
        ". It may take a few seconds to appear.",
    });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to capture exception", details: String(err) });
  }
});

export default router;
