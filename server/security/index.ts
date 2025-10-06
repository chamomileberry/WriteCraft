// Security module exports
export {
  secureAuthentication,
  createRateLimiter,
  CSRFProtection,
  validateInput,
  securityHeaders,
  sanitizeInput,
  sanitizeAllInputs,
  SecurityAuditLog,
  requireAdmin,
  enforceRowLevelSecurity
} from './middleware';

export { default as secureUserRoutes } from './userRoutes';

// Re-export for backwards compatibility
import { secureAuthentication } from './middleware';
export const isAuthenticated = secureAuthentication;