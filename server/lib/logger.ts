import pino from "pino";

const isDevelopment = getEnvOptional('NODE_ENV') === "development";

// Create Pino logger instance with appropriate configuration
export const logger = pino({
  level: getEnvOptional('LOG_LEVEL') || (isDevelopment ? "debug" : "info"),

  // Pretty print in development, JSON in production
  transport: isDevelopment
    ? {
        target: "pino-pretty",
        options: {
          colorize: true,
          translateTime: "HH:MM:ss",
          ignore: "pid,hostname",
          singleLine: false,
        },
      }
    : undefined,

  // Base context for all logs
  base: {
    env: getEnvOptional('NODE_ENV'),
  version: process.env['npm_package_version'] || "unknown",
  },

  // Redact sensitive fields
  redact: {
    paths: [
      "password",
      "apiKey",
      "token",
      "secret",
      "authorization",
      "cookie",
      "*.password",
      "*.apiKey",
      "*.token",
      "*.secret",
      "req.headers.authorization",
      "req.headers.cookie",
      'res.headers["set-cookie"]',
    ],
    remove: true,
  },

  // Serialize errors properly
  serializers: {
    err: pino.stdSerializers.err,
    req: pino.stdSerializers.req,
    res: pino.stdSerializers.res,
  },

  // Timestamp format
  timestamp: pino.stdTimeFunctions.isoTime,
});

/**
 * Create a child logger with additional context
 * Useful for tagging logs with specific features or operations
 */
export function createChildLogger(context: Record<string, any>) {
  return logger.child(context);
}

/**
 * Log AI operations with standardized format
 */
export function logAIOperation(
  operation: string,
  metadata: {
    userId: string;
    model?: string;
    tokens?: { input: number; output: number };
    duration?: number;
    success: boolean;
    error?: string;
  },
) {
  logger.info(
    {
      type: "ai_operation",
      operation,
      ...metadata,
    },
    `AI operation: ${operation}`,
  );
}

/**
 * Log security events
 */
export function logSecurityEvent(
  event: string,
  metadata: {
    userId?: string;
    ipAddress?: string;
    severity: "low" | "medium" | "high" | "critical";
    blocked: boolean;
    reason: string;
  },
) {
  logger.warn(
    {
      type: "security_event",
      event,
      ...metadata,
    },
    `Security event: ${event}`,
  );
}

/**
 * Log API errors
 */
export function logAPIError(
  endpoint: string,
  error: Error,
  metadata?: {
    userId?: string;
    statusCode?: number;
    duration?: number;
  },
) {
  logger.error(
    {
      type: "api_error",
      endpoint,
      err: error,
      ...metadata,
    },
    `API error on ${endpoint}: ${error.message}`,
  );
}

/**
 * Log database operations
 */
export function logDatabaseOperation(
  operation: string,
  metadata: {
    table?: string;
    duration?: number;
    success: boolean;
    error?: string;
    rowCount?: number;
  },
) {
  const level = metadata.success ? "debug" : "error";
  logger[level](
    {
      type: "database_operation",
      operation,
      ...metadata,
    },
    `Database operation: ${operation}`,
  );
}

/**
 * Log user actions for audit trail
 */
export function logUserAction(
  action: string,
  metadata: {
    userId: string;
    resourceType?: string;
    resourceId?: string;
    ipAddress?: string;
    details?: Record<string, any>;
  },
) {
  logger.info(
    {
      type: "user_action",
      action,
      ...metadata,
    },
    `User action: ${action}`,
  );
}

/**
 * Log performance metrics
 */
export function logPerformance(
  operation: string,
  duration: number,
  metadata?: Record<string, any>,
) {
  logger.info(
    {
      type: "performance",
      operation,
      duration,
      ...metadata,
    },
    `Performance: ${operation} took ${duration}ms`,
  );
}

export default logger;
