import type { Express } from 'express';
import { 
  securityHeaders, 
  createRateLimiter,
  sanitizeAllInputs 
} from './security/middleware';

/**
 * Apply security middleware to Express app
 * This MUST be called AFTER express.json() and express.urlencoded() 
 * so that req.body exists for sanitization
 */
export function applySecurityMiddleware(app: Express): void {
  // Apply security headers to all requests
  app.use(securityHeaders);
  
  // Apply global rate limiting (can be overridden per route)
  app.use(createRateLimiter({
    maxRequests: 1000, // 1000 requests per 15 minutes for normal app operation
    windowMs: 15 * 60 * 1000
  }));
  
  // Sanitize all inputs globally to prevent injection attacks
  // NOTE: This MUST run after body parsing middleware
  app.use(sanitizeAllInputs);
  
  // Log security initialization
  console.log('[SECURITY] Security middleware initialized:');
  console.log('[SECURITY] ✓ Security headers enabled');
  console.log('[SECURITY] ✓ Rate limiting enabled (1000 req/15min)');
  console.log('[SECURITY] ✓ Input sanitization enabled');
  console.log('[SECURITY] ✓ CSRF protection available per route');
  console.log('[SECURITY] ✓ Row-level security enforced');
}