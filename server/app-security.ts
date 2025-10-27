import type { Express } from 'express';
import { 
  generateCSPNonce,
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
  const isDevelopment = process.env.NODE_ENV === 'development';
  const enableIDS = process.env.ENABLE_IDS === 'true'; // Opt-in IDS (disabled by default)
  
  // Generate CSP nonce for each request (MUST be before securityHeaders)
  app.use(generateCSPNonce);
  
  // Apply security headers to all requests (uses the nonce)
  app.use(securityHeaders);
  
  // Block blacklisted IPs (opt-in only - requires ENABLE_IDS=true)
  if (enableIDS && !isDevelopment) {
    app.use(blockBlacklistedIps);
  }
  
  // Apply global rate limiting (can be overridden per route)
  app.use(createRateLimiter({
    maxRequests: isDevelopment ? 10000 : 1000, // Higher limit in development
    windowMs: 15 * 60 * 1000
  }));
  
  // Detect injection attacks (opt-in only - requires ENABLE_IDS=true)
  if (enableIDS && !isDevelopment) {
    app.use(detectInjectionAttacks);
  }
  
  // Sanitize all inputs globally to prevent injection attacks
  // NOTE: This MUST run after body parsing middleware
  app.use(sanitizeAllInputs);
  
  // Log security initialization
  console.log('[SECURITY] Security middleware initialized:');
  console.log('[SECURITY] ✓ Security headers enabled');
  console.log(`[SECURITY] ${enableIDS && !isDevelopment ? '✓' : '○'} Intrusion Detection System (IDS) ${enableIDS && !isDevelopment ? 'active' : 'disabled (set ENABLE_IDS=true to enable)'}`);
  console.log(`[SECURITY] ${enableIDS && !isDevelopment ? '✓' : '○'} IP blocking ${enableIDS && !isDevelopment ? 'enabled' : 'disabled (set ENABLE_IDS=true to enable)'}`);
  console.log(`[SECURITY] ✓ Rate limiting enabled (${isDevelopment ? '10000' : '1000'} req/15min)`);
  console.log(`[SECURITY] ${enableIDS && !isDevelopment ? '✓' : '○'} Injection detection ${enableIDS && !isDevelopment ? 'active' : 'disabled (set ENABLE_IDS=true to enable)'}`);
  console.log('[SECURITY] ✓ Input sanitization enabled');
  console.log('[SECURITY] ✓ CSRF protection available per route');
  console.log('[SECURITY] ✓ Row-level security enforced');
}