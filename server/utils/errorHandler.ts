/**
 * Error sanitization utility for server responses
 * Prevents internal implementation details from being exposed to clients
 */

import { logger } from "./logger";

export interface SanitizedError {
  error: string; // Error type/title (e.g., "Validation Error", "Not Found")
  message: string; // User-friendly error message
  details?: unknown; // Optional: additional context for specific errors (e.g., validation field errors)
  code?: string; // Optional: error code for programmatic handling
}

/**
 * Patterns to detect and sanitize
 */
const SENSITIVE_PATTERNS = [
  /password/i,
  /secret/i,
  /token/i,
  /key/i,
  /database/i,
  /sql/i,
  /query/i,
  /connection/i,
  /stack trace/i,
  /at Object\./i, // Stack trace indicators
  /at Function\./i,
  /at async/i,
  /ENOENT/i,
  /EACCES/i,
  /file:\/\//i, // File paths
  /\/home\//i,
  /\/usr\//i,
  /C:\\[a-z\\]/i, // ✅ Properly escaped Windows path (C:\...)
];

/**
 * Safe error messages by category
 */
const SAFE_ERROR_MESSAGES: Record<string, string> = {
  // Validation errors
  validation: "Invalid request data. Please check your input and try again.",

  // Authentication/Authorization
  unauthorized: "Authentication required. Please log in.",
  forbidden: "You do not have permission to perform this action.",

  // Not found
  notFound: "The requested resource was not found.",

  // Rate limiting
  rateLimit: "Too many requests. Please try again later.",

  // Payment/Stripe
  payment: "Payment processing failed. Please check your payment details.",
  subscription:
    "Subscription operation failed. Please try again or contact support.",

  // AI/External services
  aiGeneration:
    "AI generation service is temporarily unavailable. Please try again.",
  externalService: "External service error. Please try again later.",

  // Generic fallback
  generic: "An error occurred. Please try again.",
  serverError: "Internal server error. Our team has been notified.",
};

/**
 * Check if error message contains sensitive information
 */
function containsSensitiveInfo(message: string): boolean {
  return SENSITIVE_PATTERNS.some((pattern) => pattern.test(message));
}

/**
 * Sanitize error message for client response
 */
export function sanitizeError(error: any, context?: string): SanitizedError {
  // Log the actual error for debugging
  logger.error(`[${context || "Error"}]`, error);

  // Handle different error types
  if (error?.name === "ZodError") {
    // Zod validation errors are safe to expose
    return {
      error: "Validation Error",
      message: "Invalid request data",
      details: error.errors?.map((e: any) => ({
        field: e.path?.join("."),
        message: e.message,
      })),
    };
  }

  // Extract error message
  const originalMessage =
    error instanceof Error
      ? error.message
      : typeof error === "string"
        ? error
        : "Unknown error";

  // Check for sensitive information
  if (containsSensitiveInfo(originalMessage)) {
    logger.warn(`Sanitized sensitive error in ${context}:`, originalMessage);
    return {
      error: "Error",
      message: SAFE_ERROR_MESSAGES['serverError'] ?? "Internal server error. Our team has been notified.",
    };
  }

  // Map known safe error patterns
  const lowerMessage = originalMessage.toLowerCase();

  if (
    lowerMessage.includes("not found") ||
    lowerMessage.includes("does not exist")
  ) {
    return {
      error: "Not Found",
      message: SAFE_ERROR_MESSAGES['notFound'] ?? "The requested resource was not found.",
    };
  }

  if (
    lowerMessage.includes("unauthorized") ||
    lowerMessage.includes("not authenticated")
  ) {
    return {
      error: "Unauthorized",
      message: SAFE_ERROR_MESSAGES['unauthorized'] ?? "Authentication required. Please log in.",
    };
  }

  if (
    lowerMessage.includes("forbidden") ||
    lowerMessage.includes("access denied")
  ) {
    return {
      error: "Forbidden",
      message: SAFE_ERROR_MESSAGES['forbidden'] ?? "You do not have permission to perform this action.",
    };
  }

  if (
    lowerMessage.includes("rate limit") ||
    lowerMessage.includes("too many requests")
  ) {
    return {
      error: "Rate Limit Exceeded",
      message: SAFE_ERROR_MESSAGES['rateLimit'] ?? "Too many requests. Please try again later.",
    };
  }

  if (
    lowerMessage.includes("payment") ||
    lowerMessage.includes("stripe") ||
    lowerMessage.includes("charge")
  ) {
    return {
      error: "Payment Error",
      message: SAFE_ERROR_MESSAGES['payment'] ?? "Payment processing failed. Please check your payment details.",
    };
  }

  if (lowerMessage.includes("subscription")) {
    return {
      error: "Subscription Error",
      message: SAFE_ERROR_MESSAGES['subscription'] ?? "Subscription operation failed. Please try again or contact support.",
    };
  }

  if (
    lowerMessage.includes("ai") ||
    lowerMessage.includes("generation") ||
    lowerMessage.includes("quota")
  ) {
    return {
      error: "AI Service Error",
      message: SAFE_ERROR_MESSAGES['aiGeneration'] ?? "AI generation service is temporarily unavailable. Please try again.",
    };
  }

  if (lowerMessage.includes("invalid") || lowerMessage.includes("validation")) {
    return {
      error: "Validation Error",
      message: SAFE_ERROR_MESSAGES['validation'] ?? "Invalid request data. Please check your input and try again.",
    };
  }

  // If error message is short and doesn't seem dangerous, allow it
  if (
    originalMessage.length < 100 &&
    !originalMessage.includes("/") &&
    !originalMessage.includes("\\")
  ) {
    return {
      error: "Error",
      message: originalMessage,
    };
  }

  // Fallback to generic error
  return {
    error: "Error",
    message: SAFE_ERROR_MESSAGES['generic'] ?? "An error occurred. Please try again.",
  };
}

/**
 * Sanitize error for JSON response
 * Usage: res.status(500).json(sanitizeErrorResponse(error, 'CreateUser'))
 */
export function sanitizeErrorResponse(error: any, context?: string): object {
  return sanitizeError(error, context);
}

/**
 * Express middleware error handler with sanitization
 */
export function sanitizedErrorHandler(err: any, req: any, res: any, next: any) {
  const sanitized = sanitizeError(err, req.path);
  const status = err.status || err.statusCode || 500;

  res.status(status).json(sanitized);
}

export default {
  sanitizeError,
  sanitizeErrorResponse,
  sanitizedErrorHandler,
  SAFE_ERROR_MESSAGES,
};
