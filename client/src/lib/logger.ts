/**
 * Production-ready logging utility for client
 * Conditionally logs based on environment
 */

const isDev = import.meta.env.DEV;
const isProd = import.meta.env.PROD;

/**
 * Color scheme for console output
 * Using Material Design colors for consistency
 */
const LOG_COLORS = {
  DEBUG: "#888", // Gray
  INFO: "#2196F3", // Blue
  WARN: "#FF9800", // Orange
  ERROR: "#F44336", // Red
  DEV: "#4CAF50", // Green
  PROD: "#9C27B0", // Purple
} as const;

export const logger = {
  /**
   * Debug-level logging - only in development
   * Use for verbose debugging information
   */
  debug: (...args: unknown[]) => {
    if (isDev) {
      console.log(`%c[DEBUG]`, `color: ${LOG_COLORS.DEBUG}`, ...args);
    }
  },

  /**
   * Info-level logging - all environments
   * Use for important application flow information
   */
  info: (...args: unknown[]) => {
    console.info(`%c[INFO]`, `color: ${LOG_COLORS.INFO}`, ...args);
  },

  /**
   * Warning-level logging - all environments
   * Use for recoverable errors or concerning situations
   */
  warn: (...args: unknown[]) => {
    console.warn(`%c[WARN]`, `color: ${LOG_COLORS.WARN}`, ...args);
  },

  /**
   * Error-level logging - all environments
   * Use for actual errors that need attention
   */
  error: (...args: unknown[]) => {
    console.error(`%c[ERROR]`, `color: ${LOG_COLORS.ERROR}`, ...args);
  },

  /**
   * Log only in development environment
   * Alias for debug() with different styling
   */
  dev: (...args: unknown[]) => {
    if (isDev) {
      console.log(
        `%c[DEV]`,
        `color: ${LOG_COLORS.DEV}; font-weight: bold`,
        ...args,
      );
    }
  },

  /**
   * Log only in production environment
   * Use for production-specific monitoring
   */
  prod: (...args: unknown[]) => {
    if (isProd) {
      console.log(`%c[PROD]`, `color: ${LOG_COLORS.PROD}`, ...args);
    }
  },

  /**
   * Regular console.log replacement - only in development
   * Use for temporary debugging (should be removed before commit)
   */
  log: (...args: unknown[]) => {
    if (isDev) {
      console.log(...args);
    }
  },
};

export default logger;
