/**
 * Production-ready logging utility for server
 * Conditionally logs based on environment
 */

const isDevelopment = process.env.NODE_ENV === "development";
const isProduction = process.env.NODE_ENV === "production";

/**
 * Interface for structured logging context
 */
export interface LogContext {
  [key: string]: unknown;
}

export const logger = {
  /**
   * Debug-level logging - only in development
   * Use for verbose debugging information
   */
  debug: (...args: unknown[]) => {
    if (isDevelopment) {
      console.log("[DEBUG]", ...args);
    }
  },

  /**
   * Info-level logging - all environments
   * Use for important application flow information
   */
  info: (...args: unknown[]) => {
    console.info("[INFO]", ...args);
  },

  /**
   * Warning-level logging - all environments
   * Use for recoverable errors or concerning situations
   */
  warn: (...args: unknown[]) => {
    console.warn("[WARN]", ...args);
  },

  /**
   * Error-level logging - all environments
   * Use for actual errors that need attention
   */
  error: (...args: unknown[]) => {
    console.error("[ERROR]", ...args);
  },

  /**
   * Log only in development environment
   * Alias for debug()
   */
  dev: (...args: unknown[]) => {
    if (isDevelopment) {
      console.log("[DEV]", ...args);
    }
  },

  /**
   * Log only in production environment
   * Use for production-specific monitoring
   */
  prod: (...args: unknown[]) => {
    if (isProduction) {
      console.log("[PROD]", ...args);
    }
  },

  /**
   * Structured logging with context
   * In development, pretty-prints; in production, outputs JSON for log aggregation services
   *
   * Usage:
   * ```typescript
   * logger.structured('info', 'User created', {
   *   userId: '123',
   *   email: 'user@example.com',
   *   timestamp: new Date().toISOString()
   * });
   * ```
   */
  structured: (
    level: "debug" | "info" | "warn" | "error",
    message: string,
    context?: LogContext,
  ) => {
    const timestamp = new Date().toISOString();

    // Skip debug logs in production
    if (level === "debug" && !isDevelopment) {
      return;
    }

    if (isDevelopment) {
      // Pretty-print in development
      console.log(
        `[${level.toUpperCase()}] [${timestamp}] ${message}`,
        context || "",
      );
    } else {
      // Output JSON in production for log aggregation (Datadog, Sentry, etc.)
      const logData = {
        timestamp,
        level,
        message,
        ...(context && { context }),
      };
      console.log(JSON.stringify(logData));
    }
  },
};

export default logger;
