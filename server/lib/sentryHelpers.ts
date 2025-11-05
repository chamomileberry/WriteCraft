import Sentry from "../instrument";
import type { Request } from "express";

/**
 * Set user context for Sentry error tracking
 * Call this after authentication to associate errors with specific users
 */
export function setSentryUser(
  userId: string,
  email?: string,
  username?: string,
) {
  Sentry.setUser({
    id: userId,
    email,
    username,
  });
}

/**
 * Clear user context (e.g., on logout)
 */
export function clearSentryUser() {
  Sentry.setUser(null);
}

/**
 * Add custom context to Sentry events
 */
export function addSentryContext(key: string, data: Record<string, any>) {
  Sentry.setContext(key, data);
}

/**
 * Capture exception with additional context
 */
export function captureSentryException(
  error: Error,
  context?: Record<string, any>,
) {
  if (context) {
    Sentry.withScope((scope) => {
      Object.entries(context).forEach(([key, value]) => {
        scope.setContext(key, value);
      });
      Sentry.captureException(error);
    });
  } else {
    Sentry.captureException(error);
  }
}

/**
 * Capture a message (not an error) with severity level
 */
export function captureSentryMessage(
  message: string,
  level: "fatal" | "error" | "warning" | "log" | "info" | "debug" = "info",
  context?: Record<string, any>,
) {
  if (context) {
    Sentry.withScope((scope) => {
      Object.entries(context).forEach(([key, value]) => {
        scope.setContext(key, value);
      });
      Sentry.captureMessage(message, level);
    });
  } else {
    Sentry.captureMessage(message, level);
  }
}

/**
 * Start a performance transaction for monitoring
 * Use this to track performance of specific operations
 */
export function startSentryTransaction(name: string, op: string) {
  return Sentry.startSpan({ name, op }, async (span) => {
    return span;
  });
}

/**
 * Express middleware to set user context from authenticated requests
 */
export function sentryUserMiddleware(req: Request, _res: any, next: any) {
  if (req.user) {
    const user = req.user as any;
    setSentryUser(user.id, user.email, user.username || user.name);
  }
  next();
}

export default Sentry;
