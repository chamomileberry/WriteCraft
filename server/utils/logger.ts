/**
 * Production-ready logging utility for server
 * Conditionally logs based on environment
 */

const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';

export const logger = {
  /**
   * Debug-level logging - only in development
   * Use for verbose debugging information
   */
  debug: (...args: any[]) => {
    if (isDevelopment) {
      console.log('[DEBUG]', ...args);
    }
  },

  /**
   * Info-level logging - all environments
   * Use for important application flow information
   */
  info: (...args: any[]) => {
    console.info('[INFO]', ...args);
  },

  /**
   * Warning-level logging - all environments
   * Use for recoverable errors or concerning situations
   */
  warn: (...args: any[]) => {
    console.warn('[WARN]', ...args);
  },

  /**
   * Error-level logging - all environments
   * Use for actual errors that need attention
   */
  error: (...args: any[]) => {
    console.error('[ERROR]', ...args);
  },

  /**
   * Log only in development environment
   * Alias for debug()
   */
  dev: (...args: any[]) => {
    if (isDevelopment) {
      console.log('[DEV]', ...args);
    }
  },

  /**
   * Log only in production environment
   * Use for production-specific monitoring
   */
  prod: (...args: any[]) => {
    if (isProduction) {
      console.log('[PROD]', ...args);
    }
  }
};

export default logger;
