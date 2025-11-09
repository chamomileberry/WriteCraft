import { Request, Response, NextFunction } from "express";
import { AppError } from "../storage-types";

/**
 * HTTP status code mapping for AppError codes
 */
const APP_ERROR_STATUS_MAP: Record<string, number> = {
  not_found: 404,
  forbidden: 403,
  conflict: 409,
  invalid_input: 400,
  aborted: 503,
  internal_error: 500,
};

/**
 * Centralized error handler middleware for Express
 * Handles AppError instances with typed error codes and maps them to appropriate HTTP status codes
 *
 * Usage:
 * - Apply after all routes in your Express app: app.use(errorHandler);
 * - In route handlers, call next(error) instead of handling errors directly
 * - For AppError instances, this will automatically map the error code to the correct HTTP status
 *
 * Example:
 * ```typescript
 * router.get('/', async (req, res, next) => {
 *   try {
 *     const result = await storage.getCharacter(...);
 *     res.json(result);
 *   } catch (error) {
 *     next(error); // Let the error handler deal with it
 *   }
 * });
 * ```
 */
export function errorHandler(
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  // Handle AppError instances
  if (error instanceof AppError) {
    const status = APP_ERROR_STATUS_MAP[error.code] || 500;
    res.status(status).json({
      error: error.message,
      code: error.code,
      ...(error.details && { details: error.details }),
    });
    return;
  }

  // Handle generic errors
  console.error("Unhandled error:", error);
  res.status(500).json({
    error: error.message || "Internal server error",
  });
}
