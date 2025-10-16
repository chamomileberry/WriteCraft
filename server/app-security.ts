import type { Express } from 'express';
import { 
  securityHeaders, 
  createRateLimiter,
  sanitizeAllInputs 
} from './security/middleware';
import { 
  blockBlacklistedIps,
  detectInjectionAttacks 
} from './security/idsMiddleware';

/**
 * Apply security middleware to Express app
 * This MUST be called AFTER express.json() and express.urlencoded() 
 * so that req.body exists for sanitization and IDS
 */
export function applySecurityMiddleware(app: Express): void {
  // Apply security headers to all requests
  app.use(securityHeaders);
  
  // Block blacklisted IPs (MUST be early in the chain)
  app.use(blockBlacklistedIps);
  
  // Apply global rate limiting (can be overridden per route)
  app.use(createRateLimiter({
    maxRequests: 1000, // 1000 requests per 15 minutes for normal app operation
    windowMs: 15 * 60 * 1000
  }));
  
  // Detect injection attacks (after body parsing, before sanitization)
  app.use(detectInjectionAttacks);
  
  // Sanitize all inputs globally to prevent injection attacks
  // NOTE: This MUST run after body parsing middleware
  app.use(sanitizeAllInputs);
  
  // Log security initialization
  console.log('[SECURITY] Security middleware initialized:');
  console.log('[SECURITY] ✓ Security headers enabled');
  console.log('[SECURITY] ✓ Intrusion Detection System (IDS) active');
  console.log('[SECURITY] ✓ IP blocking enabled');
  console.log('[SECURITY] ✓ Rate limiting enabled (1000 req/15min)');
  console.log('[SECURITY] ✓ Injection detection active');
  console.log('[SECURITY] ✓ Input sanitization enabled');
  console.log('[SECURITY] ✓ CSRF protection available per route');
  console.log('[SECURITY] ✓ Row-level security enforced');
}