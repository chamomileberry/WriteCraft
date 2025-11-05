/**
 * Mutation error handling utilities
 * Provides standardized error handling for mutations throughout the app
 */

import { ApiError } from "./queryClient";

/**
 * Patterns that indicate sensitive or unsafe error messages
 */
const UNSAFE_PATTERNS = [
  /[\/\\]/, // File paths
  /@[a-z0-9.-]+\.[a-z]{2,}/i, // Email addresses
  /\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/, // IP addresses
  /password|token|secret|key|auth|credential/i, // Sensitive terms
  /database|postgres|mysql|mongo|sql/i, // Database info
  /node_modules|src\/|dist\/|\.env/i, // Project structure
  /http(s)?:\/\//, // URLs with hostnames
];

/**
 * Check if a message is safe to show to users
 */
function isSafeMessage(message: string): boolean {
  // Check length
  if (message.length > 100) {
    return false;
  }

  // Check for unsafe patterns
  return !UNSAFE_PATTERNS.some((pattern) => pattern.test(message));
}

/**
 * Extract a user-friendly error message from an error object
 */
export function getErrorMessage(
  error: unknown,
  fallback: string = "An error occurred",
): string {
  if (error instanceof ApiError) {
    // Try to parse JSON error response
    try {
      const errorText = error.message;
      // If it looks like JSON, try to parse it
      if (errorText.includes("{")) {
        const jsonMatch = errorText.match(/\{.*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          const message = parsed.error || parsed.message;
          // Validate parsed message is safe
          if (message && isSafeMessage(message)) {
            return message;
          }
        }
      }
      // Otherwise return the raw message (after status code)
      const messagePart = errorText.split(": ")[1];
      if (messagePart && isSafeMessage(messagePart)) {
        return messagePart;
      }
    } catch {
      return fallback;
    }
  }

  if (error instanceof Error) {
    // Handle AbortError
    if (error.name === "AbortError" || error.message === "Request cancelled") {
      return "Request was cancelled";
    }

    // Return error message if it's safe
    if (isSafeMessage(error.message)) {
      return error.message;
    }
  }

  if (typeof error === "string" && isSafeMessage(error)) {
    return error;
  }

  return fallback;
}

/**
 * Standard error handler for mutations
 * Returns a function that can be used as onError callback
 */
export function createMutationErrorHandler(options: {
  toast: (props: {
    title: string;
    description: string;
    variant?: "default" | "destructive";
  }) => void;
  title?: string;
  message?: string;
  onError?: (error: unknown) => void;
}) {
  return (error: unknown) => {
    const errorMessage = getErrorMessage(
      error,
      options.message || "Operation failed. Please try again.",
    );

    options.toast({
      title: options.title || "Error",
      description: errorMessage,
      variant: "destructive",
    });

    // Call custom error handler if provided
    options.onError?.(error);
  };
}

/**
 * Standard success handler for mutations
 * Returns a function that can be used as onSuccess callback
 */
export function createMutationSuccessHandler<TData = any>(options: {
  toast: (props: { title: string; description: string }) => void;
  title?: string;
  message: string;
  onSuccess?: (data: TData) => void;
}) {
  return (data: TData) => {
    options.toast({
      title: options.title || "Success",
      description: options.message,
    });

    // Call custom success handler if provided
    options.onSuccess?.(data);
  };
}

/**
 * Get HTTP status code-specific error message
 */
export function getStatusErrorMessage(status: number): string {
  const messages: Record<number, string> = {
    400: "Invalid request. Please check your input.",
    401: "Please log in to continue.",
    403: "You do not have permission to perform this action.",
    404: "The requested resource was not found.",
    409: "This item already exists or conflicts with existing data.",
    422: "Validation error. Please check your input.",
    429: "Too many requests. Please wait a moment.",
    500: "Server error. Please try again later.",
    503: "Service temporarily unavailable. Please try again later.",
  };

  return messages[status] || "An error occurred. Please try again.";
}

/**
 * Check if error is a network error
 */
export function isNetworkError(error: unknown): boolean {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    return (
      message.includes("network") ||
      message.includes("fetch") ||
      message.includes("connection")
    );
  }
  return false;
}

/**
 * Check if error is an abort error
 */
export function isAbortError(error: unknown): boolean {
  if (error instanceof Error) {
    return error.name === "AbortError" || error.message === "Request cancelled";
  }
  return false;
}

export default {
  getErrorMessage,
  createMutationErrorHandler,
  createMutationSuccessHandler,
  getStatusErrorMessage,
  isNetworkError,
  isAbortError,
};
