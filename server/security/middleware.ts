import { Request, Response, NextFunction, RequestHandler } from 'express';
import { z } from 'zod';
import crypto from 'crypto';
import { db } from '../db';
import { users, shares, notebooks, projects, guides } from '@shared/schema';
import { eq, and, or } from 'drizzle-orm';
import { getRedisClient } from '../services/redisClient';

// Security configuration
const SECURITY_CONFIG = {
  // Rate limiting
  RATE_LIMIT_WINDOW_MS: 15 * 60 * 1000, // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: 2000, // Increased to handle imports + polling (was 1000)
  STRICT_RATE_LIMIT_MAX_REQUESTS: 50, // For sensitive operations (was 10)
  
  // Security headers
  ALLOWED_HEADERS: ['content-type', 'authorization'],
  MAX_REQUEST_SIZE: '10mb',
  
  // Input validation
  MAX_STRING_LENGTH: 10000,
  MAX_ARRAY_LENGTH: 100,
};

// Rate limiting store (in production, use Redis)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

/**
 * Enhanced authentication middleware with security checks
 */
export const secureAuthentication: RequestHandler = async (req: any, res, next) => {
  try {
    // Block test mode bypass in production
    if (process.env.NODE_ENV === 'production' && req.headers['x-test-user-id']) {
      console.error(`[SECURITY] Test mode bypass attempt in production - IP: ${req.ip}`);
      return res.status(403).json({ message: "Forbidden" });
    }
    
    // Only allow test mode in actual test environment with additional checks
    if (process.env.NODE_ENV === 'test' && req.headers['x-test-user-id']) {
      // Additional validation for test mode
      const testUserId = req.headers['x-test-user-id'] as string;
      
      // Validate test user ID format
      if (!/^test-user-[a-z0-9-]+$/.test(testUserId)) {
        console.error(`[SECURITY] Invalid test user ID format: ${testUserId}`);
        return res.status(403).json({ message: "Forbidden" });
      }
      
      req.user = {
        claims: {
          sub: testUserId
        }
      };
      return next();
    }
    
    // Continue with normal authentication
    const user = req.user as any;
    
    if (!req.isAuthenticated() || !user?.expires_at) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    const now = Math.floor(Date.now() / 1000);
    if (now > user.expires_at) {
      return res.status(401).json({ message: "Session expired" });
    }
    
    // Add security context to request
    req.securityContext = {
      userId: user.claims.sub,
      sessionId: req.sessionID,
      timestamp: Date.now()
    };
    
    next();
  } catch (error) {
    console.error('[SECURITY] Authentication error:', error);
    return res.status(500).json({ message: "Authentication error" });
  }
};

/**
 * Rate limiting middleware with Redis support
 */
export function createRateLimiter(options?: { 
  maxRequests?: number; 
  windowMs?: number;
  keyGenerator?: (req: Request) => string;
}): RequestHandler {
  const maxRequests = options?.maxRequests || SECURITY_CONFIG.RATE_LIMIT_MAX_REQUESTS;
  const windowMs = options?.windowMs || SECURITY_CONFIG.RATE_LIMIT_WINDOW_MS;
  const keyGenerator = options?.keyGenerator || ((req: any) => {
    const userId = req.user?.claims?.sub || 'anonymous';
    const ip = req.ip || req.connection.remoteAddress;
    return `${userId}:${ip}`;
  });
  
  return async (req: Request, res: Response, next: NextFunction) => {
    const key = keyGenerator(req);
    const now = Date.now();
    
    try {
      const redisClient = await getRedisClient();
      
      if (redisClient) {
        // Use Redis for distributed rate limiting with atomic operations
        const redisKey = `writecraft:ratelimit:${key}`;
        const resetKey = `${redisKey}:reset`;
        
        // Use atomic INCR operation to increment counter
        const count = await redisClient.incr(redisKey);
        
        // If this is the first request in the window, set expiration
        if (count === 1) {
          const ttl = Math.ceil(windowMs / 1000);
          await redisClient.expire(redisKey, ttl);
          await redisClient.setEx(resetKey, ttl, String(now + windowMs));
        }
        
        // Get reset time
        const resetTimeStr = await redisClient.get(resetKey);
        const resetTime = resetTimeStr ? parseInt(resetTimeStr) : now + windowMs;
        
        // Set rate limit headers
        res.setHeader('X-RateLimit-Limit', maxRequests);
        res.setHeader('X-RateLimit-Remaining', Math.max(0, maxRequests - count));
        res.setHeader('X-RateLimit-Reset', new Date(resetTime).toISOString());
        
        // Check if rate limit exceeded
        if (count > maxRequests) {
          console.warn(`[SECURITY] Rate limit exceeded for ${key}`);
          return res.status(429).json({ 
            message: "Too many requests, please try again later",
            retryAfter: Math.ceil((resetTime - now) / 1000)
          });
        }
      } else {
        // Fallback to in-memory rate limiting
        let entry = rateLimitStore.get(key);
        
        if (!entry || now > entry.resetTime) {
          entry = {
            count: 0,
            resetTime: now + windowMs
          };
          rateLimitStore.set(key, entry);
        }
        
        entry.count++;
        
        res.setHeader('X-RateLimit-Limit', maxRequests);
        res.setHeader('X-RateLimit-Remaining', Math.max(0, maxRequests - entry.count));
        res.setHeader('X-RateLimit-Reset', new Date(entry.resetTime).toISOString());
        
        if (entry.count > maxRequests) {
          console.warn(`[SECURITY] Rate limit exceeded for ${key}`);
          return res.status(429).json({ 
            message: "Too many requests, please try again later",
            retryAfter: Math.ceil((entry.resetTime - now) / 1000)
          });
        }
      }
      
      next();
    } catch (error) {
      console.error('[SECURITY] Rate limiter error:', error);
      // On error, allow the request but log it
      next();
    }
  };
}

/**
 * CSRF token generation and validation
 */
export class CSRFProtection {
  private static tokens = new Map<string, { token: string; expires: number }>();
  
  static generateToken(sessionId: string): string {
    const token = crypto.randomBytes(32).toString('hex');
    const expires = Date.now() + (60 * 60 * 1000); // 1 hour
    
    this.tokens.set(sessionId, { token, expires });
    return token;
  }
  
  static validateToken(sessionId: string, token: string): boolean {
    const stored = this.tokens.get(sessionId);
    
    if (!stored) return false;
    if (Date.now() > stored.expires) {
      this.tokens.delete(sessionId);
      return false;
    }
    
    // Use timing-safe comparison
    return crypto.timingSafeEqual(
      Buffer.from(stored.token),
      Buffer.from(token)
    );
  }
  
  static middleware(): RequestHandler {
    return (req: any, res: Response, next: NextFunction) => {
      // Skip CSRF for GET and HEAD requests
      if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
        return next();
      }
      
      const sessionId = req.sessionID;
      const csrfToken = req.headers['x-csrf-token'] as string || req.body?._csrf;
      
      if (!sessionId) {
        return res.status(401).json({ message: "No session" });
      }
      
      if (!csrfToken || !this.validateToken(sessionId, csrfToken)) {
        console.warn(`[SECURITY] CSRF validation failed for session ${sessionId}`);
        return res.status(403).json({ message: "Invalid CSRF token" });
      }
      
      next();
    };
  }
}

/**
 * Input validation middleware
 */
export function validateInput(schema: z.ZodSchema): RequestHandler {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validate request body
      const validated = await schema.parseAsync(req.body);
      req.body = validated;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.warn('[SECURITY] Input validation failed:', error.errors);
        return res.status(400).json({ 
          message: "Invalid input",
          errors: error.errors 
        });
      }
      next(error);
    }
  };
}

/**
 * CSP Nonce generation middleware
 * Generates a unique nonce for each request to enable secure inline scripts
 */
export const generateCSPNonce: RequestHandler = (req: Request, res: Response, next: NextFunction) => {
  // Generate a cryptographically secure random nonce
  const nonce = crypto.randomBytes(16).toString('base64');
  res.locals.cspNonce = nonce;
  next();
};

/**
 * Security headers middleware with nonce-based CSP
 */
export const securityHeaders: RequestHandler = (req: Request, res: Response, next: NextFunction) => {
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');
  
  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // Enable XSS protection (legacy browsers)
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Control referrer information
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Restrict browser features and APIs
  res.setHeader('Permissions-Policy', 
    'accelerometer=(), ' +
    'camera=(), ' +
    'geolocation=(), ' +
    'gyroscope=(), ' +
    'magnetometer=(), ' +
    'microphone=(), ' +
    'payment=(), ' +
    'usb=()'
  );
  
  // Prevent DNS prefetching
  res.setHeader('X-DNS-Prefetch-Control', 'off');
  
  // Remove server information
  res.removeHeader('X-Powered-By');
  
  // Get the nonce for this request
  const nonce = res.locals.cspNonce;
  
  // Content Security Policy with nonce-based script execution
  // In development, we need to allow 'unsafe-eval' and 'unsafe-inline' for Vite HMR
  const isDevelopment = process.env.NODE_ENV === 'development';
  const scriptSrc = isDevelopment 
    ? `'self' 'unsafe-inline' 'unsafe-eval' blob: https://replit.com https://js.stripe.com` // Dev: Allow inline for Vite + Stripe + Excalidraw + Replit banner
    : `'self' 'nonce-${nonce}' blob: https://js.stripe.com`; // Production: strict nonce-only + Stripe + Excalidraw (no Replit banner in prod)
  
  res.setHeader('Content-Security-Policy', 
    `default-src 'self'; ` +
    `script-src ${scriptSrc}; ` +
    `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; ` + // Allow Google Fonts
    `img-src 'self' data: blob: https:; ` + // Add blob: for Excalidraw image handling
    `font-src 'self' data: blob: https://fonts.gstatic.com https://cdn.jsdelivr.net https://esm.sh; ` + // Allow fonts from multiple sources for Excalidraw
    `connect-src 'self' wss: https:; ` +
    `worker-src 'self' blob:; ` + // Allow Web Workers for Excalidraw
    `child-src 'self' blob:; ` + // Allow blob: children for Excalidraw
    `frame-src https://js.stripe.com https://*.stripe.com; ` + // Allow Stripe frames for 3D Secure
    `frame-ancestors 'none'; ` + // Prevent embedding (redundant with X-Frame-Options but more secure)
    `base-uri 'self'; ` + // Restrict <base> tag URLs
    `form-action 'self'; ` + // Restrict form submissions
    `upgrade-insecure-requests; ` + // Auto-upgrade HTTP to HTTPS
    `report-uri /api/csp-report;` // CSP violation reporting
  );
  
  // Strict Transport Security (HTTPS only)
  if (req.secure) {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }
  
  // Cross-Origin policies for additional security
  res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  res.setHeader('Cross-Origin-Resource-Policy', 'same-origin');
  
  // Permissions Policy
  res.setHeader('Permissions-Policy', 
    'geolocation=(), microphone=(), camera=(), payment=()'
  );
  
  next();
};

/**
 * SQL Injection prevention through strict input sanitization
 */
export function sanitizeInput(input: any, fieldName?: string): any {
  if (typeof input === 'string') {
    // Only flag SQL injection if it looks like actual SQL syntax, not just keywords in prose
    // Look for SQL patterns with special characters that indicate malicious intent
    const sqlInjectionPattern = /(';|--;|\*\/|\/\*|xp_|sp_|exec\s*\(|execute\s*\(|union\s+select|insert\s+into|delete\s+from|drop\s+table|update\s+\w+\s+set)/gi;
    
    if (sqlInjectionPattern.test(input)) {
      console.warn(`[SECURITY] Potential SQL injection attempt detected: ${input.substring(0, 100)}`);
      throw new Error('Invalid input detected');
    }
    
    // Exempt certain fields from length restrictions (rich content fields)
    const exemptFields = ['content', 'description', 'notes', 'body', 'excerpt', 'summary'];
    const isExemptField = fieldName && exemptFields.includes(fieldName);
    
    // Limit string length (unless it's an exempt field)
    if (!isExemptField && input.length > SECURITY_CONFIG.MAX_STRING_LENGTH) {
      throw new Error('Input too long');
    }
    
    // For exempt fields, apply a much higher limit (1MB)
    if (isExemptField && input.length > 1024 * 1024) {
      throw new Error('Content too long');
    }
    
    return input.trim();
  }
  
  if (Array.isArray(input)) {
    if (input.length > SECURITY_CONFIG.MAX_ARRAY_LENGTH) {
      throw new Error('Array too large');
    }
    // Preserve field name context when recursing into arrays
    return input.map((item) => sanitizeInput(item, fieldName));
  }
  
  if (typeof input === 'object' && input !== null) {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(input)) {
      // Prevent prototype pollution
      if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
        console.warn(`[SECURITY] Prototype pollution attempt detected: ${key}`);
        continue;
      }
      // Pass the field name when sanitizing values
      sanitized[sanitizeInput(key)] = sanitizeInput(value, key);
    }
    return sanitized;
  }
  
  return input;
}

/**
 * Middleware to sanitize all inputs
 */
export const sanitizeAllInputs: RequestHandler = (req: Request, res: Response, next: NextFunction) => {
  try {
    if (req.body) {
      req.body = sanitizeInput(req.body);
    }
    if (req.query) {
      req.query = sanitizeInput(req.query) as any;
    }
    if (req.params) {
      req.params = sanitizeInput(req.params) as any;
    }
    next();
  } catch (error: any) {
    console.error('[SECURITY] Input sanitization failed:', error);
    return res.status(400).json({ message: error.message || 'Invalid input' });
  }
};

/**
 * Audit logging for security events
 */
export class SecurityAuditLog {
  static log(event: {
    type: 'AUTH_FAILURE' | 'PRIVILEGE_ESCALATION' | 'UNAUTHORIZED_ACCESS' | 'DATA_BREACH_ATTEMPT' | 'RATE_LIMIT' | 'CSRF_FAILURE';
    userId?: string;
    ip?: string;
    details: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  }) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      ...event
    };
    
    // In production, this should write to a secure audit log
    console.error('[SECURITY AUDIT]', JSON.stringify(logEntry));
    
    // For critical events, trigger alerts
    if (event.severity === 'CRITICAL') {
      // In production, send alerts to security team
      console.error('[SECURITY ALERT] CRITICAL EVENT:', event.details);
    }
  }
}

/**
 * Middleware to check admin privileges
 */
export const requireAdmin: RequestHandler = async (req: any, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.claims?.sub;
    
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    // Check if user is admin
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    
    if (!user || !user.isAdmin) {
      SecurityAuditLog.log({
        type: 'PRIVILEGE_ESCALATION',
        userId,
        ip: req.ip,
        details: `Non-admin user attempted to access admin endpoint: ${req.path}`,
        severity: 'HIGH'
      });
      
      // Return 404 to prevent information disclosure
      return res.status(404).json({ message: "Not found" });
    }
    
    next();
  } catch (error) {
    console.error('[SECURITY] Admin check failed:', error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Helper function to check resource ownership
 */
async function checkResourceOwnership(
  resourceType: string,
  resourceId: string,
  userId: string
): Promise<boolean> {
  try {
    switch (resourceType) {
      case 'notebook': {
        const [notebook] = await db
          .select()
          .from(notebooks)
          .where(and(eq(notebooks.id, resourceId), eq(notebooks.userId, userId)))
          .limit(1);
        return !!notebook;
      }
      case 'project': {
        const [project] = await db
          .select()
          .from(projects)
          .where(and(eq(projects.id, resourceId), eq(projects.userId, userId)))
          .limit(1);
        return !!project;
      }
      case 'guide': {
        const [guide] = await db
          .select()
          .from(guides)
          .where(and(eq(guides.id, resourceId), eq(guides.userId, userId)))
          .limit(1);
        return !!guide;
      }
      default:
        return false;
    }
  } catch (error) {
    console.error('[RLS] Error checking resource ownership:', error);
    return false;
  }
}

/**
 * Enhanced row-level security middleware with shared access support
 */
export function enforceRowLevelSecurity(
  resourceType: string,
  options?: { 
    paramName?: string;
    resolver?: (req: any) => string | null;
  }
): RequestHandler {
  return async (req: any, res: Response, next: NextFunction) => {
    const userId = req.user?.claims?.sub;
    
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    // Resolve resource ID from multiple possible locations
    let resourceId: string | null = null;
    
    if (options?.resolver) {
      // Use custom resolver if provided
      resourceId = options.resolver(req);
    } else {
      // Try multiple common locations
      const paramName = options?.paramName || 'id';
      resourceId = 
        req.params[paramName] || 
        req.params.id || 
        req.params[`${resourceType}Id`] ||
        req.query[paramName] ||
        req.query.id ||
        req.body?.id ||
        null;
    }
    
    const notebookId = req.query.notebookId || req.body?.notebookId;
    
    // Log access attempt
    console.log(`[RLS] User ${userId} attempting to access ${resourceType}:${resourceId || 'unknown'}`);
    
    let permission: string | null = null;
    let isOwner = false;
    let hasAccess = false;
    
    if (resourceId) {
      // First check if user owns the resource
      isOwner = await checkResourceOwnership(resourceType, resourceId, userId);
      
      if (isOwner) {
        hasAccess = true;
        console.log(`[RLS] User ${userId} is owner of ${resourceType}:${resourceId}`);
      } else {
        // Check if resource is shared with the user
        const [share] = await db
          .select()
          .from(shares)
          .where(
            and(
              eq(shares.resourceType, resourceType),
              eq(shares.resourceId, resourceId),
              eq(shares.userId, userId)
            )
          );
        
        if (share) {
          permission = share.permission;
          hasAccess = true;
          console.log(`[RLS] User ${userId} has ${permission} access to shared ${resourceType}:${resourceId}`);
        }
      }
      
      // If neither owner nor shared, deny access
      if (!hasAccess) {
        SecurityAuditLog.log({
          type: 'UNAUTHORIZED_ACCESS',
          userId,
          ip: req.ip,
          details: `User attempted to access ${resourceType}:${resourceId} without permission`,
          severity: 'MEDIUM'
        });
        return res.status(404).json({ message: "Resource not found" });
      }
    }
    
    // Store security context for downstream use
    req.rlsContext = {
      userId,
      resourceType,
      resourceId,
      notebookId,
      permission,
      isOwner,
      timestamp: Date.now()
    };
    
    next();
  };
}

/**
 * Helper function to check if user can access a resource (owner or shared)
 */
export async function canAccessResource(
  userId: string,
  resourceType: string,
  resourceId: string,
  requiredPermission?: 'view' | 'comment' | 'edit'
): Promise<{ canAccess: boolean; permission: string | null; isOwner: boolean }> {
  // First check if user owns the resource
  const isOwner = await checkResourceOwnership(resourceType, resourceId, userId);
  
  if (isOwner) {
    // Owner has full access (implicitly 'edit' permission)
    return { canAccess: true, permission: 'edit', isOwner: true };
  }
  
  // Check if resource is shared with the user
  const [share] = await db
    .select()
    .from(shares)
    .where(
      and(
        eq(shares.resourceType, resourceType),
        eq(shares.resourceId, resourceId),
        eq(shares.userId, userId)
      )
    );
  
  if (share) {
    // Check if user has required permission level
    if (requiredPermission) {
      const permissionLevels = { view: 1, comment: 2, edit: 3 };
      const userLevel = permissionLevels[share.permission as keyof typeof permissionLevels] || 0;
      const requiredLevel = permissionLevels[requiredPermission] || 0;
      
      if (userLevel < requiredLevel) {
        return { canAccess: false, permission: share.permission, isOwner: false };
      }
    }
    
    return { canAccess: true, permission: share.permission, isOwner: false };
  }
  
  return { canAccess: false, permission: null, isOwner: false };
}

// Clean up expired rate limit entries periodically
setInterval(() => {
  const now = Date.now();
  rateLimitStore.forEach((entry, key) => {
    if (now > entry.resetTime + SECURITY_CONFIG.RATE_LIMIT_WINDOW_MS) {
      rateLimitStore.delete(key);
    }
  });
}, 60000); // Every minute

// Clean up expired CSRF tokens periodically  
setInterval(() => {
  const now = Date.now();
  CSRFProtection['tokens'].forEach((data, sessionId) => {
    if (now > data.expires) {
      CSRFProtection['tokens'].delete(sessionId);
    }
  });
}, 300000); // Every 5 minutes

export default {
  secureAuthentication,
  createRateLimiter,
  CSRFProtection,
  validateInput,
  securityHeaders,
  sanitizeInput,
  sanitizeAllInputs,
  SecurityAuditLog,
  requireAdmin,
  enforceRowLevelSecurity,
  canAccessResource
};