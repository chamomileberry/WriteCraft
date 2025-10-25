/**
 * Production-ready logging utility for client
 * Conditionally logs based on environment
 */

const isDev = import.meta.env.DEV;
const isProd = import.meta.env.PROD;

export const logger = {
  /**
   * Debug-level logging - only in development
   * Use for verbose debugging information
   */
  debug: (...args: any[]) => {
    if (isDev) {
      console.log('%c[DEBUG]', 'color: #888', ...args);
    }
  },

  /**
   * Info-level logging - all environments
   * Use for important application flow information
   */
  info: (...args: any[]) => {
    console.info('%c[INFO]', 'color: #2196F3', ...args);
  },

  /**
   * Warning-level logging - all environments
   * Use for recoverable errors or concerning situations
   */
  warn: (...args: any[]) => {
    console.warn('%c[WARN]', 'color: #FF9800', ...args);
  },

  /**
   * Error-level logging - all environments
   * Use for actual errors that need attention
   */
  error: (...args: any[]) => {
    console.error('%c[ERROR]', 'color: #F44336', ...args);
  },

  /**
   * Log only in development environment
   * Alias for debug() with different styling
   */
  dev: (...args: any[]) => {
    if (isDev) {
      console.log('%c[DEV]', 'color: #4CAF50; font-weight: bold', ...args);
    }
  },

  /**
   * Log only in production environment
   * Use for production-specific monitoring
   */
  prod: (...args: any[]) => {
    if (isProd) {
      console.log('%c[PROD]', 'color: #9C27B0', ...args);
    }
  },

  /**
   * Regular console.log replacement - only in development
   * Use for temporary debugging (should be removed before commit)
   */
  log: (...args: any[]) => {
    if (isDev) {
      console.log(...args);
    }
  }
};

export default logger;
