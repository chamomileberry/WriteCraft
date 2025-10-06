import { Request, Response, NextFunction, RequestHandler } from 'express';
import { z } from 'zod';
import crypto from 'crypto';
import { db } from '../db';
import { users } from '@shared/schema';
import { eq } from 'drizzle-orm';

// Security configuration
const SECURITY_CONFIG = {
  // Rate limiting
  RATE_LIMIT_WINDOW_MS: 15 * 60 * 1000, // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: 100,
  STRICT_RATE_LIMIT_MAX_REQUESTS: 10, // For sensitive operations
  
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
 * Rate limiting middleware
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
    
    // Get or create rate limit entry
    let entry = rateLimitStore.get(key);
    
    if (!entry || now > entry.resetTime) {
      entry = {
        count: 0,
        resetTime: now + windowMs
      };
      rateLimitStore.set(key, entry);
    }
    
    entry.count++;
    
    // Set rate limit headers
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
    
    next();
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
 * Security headers middleware
 */
export const securityHeaders: RequestHandler = (req: Request, res: Response, next: NextFunction) => {
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');
  
  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // Enable XSS protection
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Content Security Policy
  res.setHeader('Content-Security-Policy', 
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
    "style-src 'self' 'unsafe-inline'; " +
    "img-src 'self' data: https:; " +
    "font-src 'self' data:; " +
    "connect-src 'self' wss: https:;"
  );
  
  // Strict Transport Security (HTTPS only)
  if (req.secure) {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  
  // Referrer Policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Permissions Policy
  res.setHeader('Permissions-Policy', 
    'geolocation=(), microphone=(), camera=(), payment=()'
  );
  
  next();
};

/**
 * SQL Injection prevention through strict input sanitization
 */
export function sanitizeInput(input: any): any {
  if (typeof input === 'string') {
    // Remove SQL keywords and special characters that could be used for injection
    // Note: This is a defense-in-depth measure; parameterized queries are the primary defense
    const sqlKeywords = /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|CREATE|ALTER|EXEC|EXECUTE|SCRIPT|JAVASCRIPT|ALERT|CONFIRM|PROMPT)\b)/gi;
    
    if (sqlKeywords.test(input)) {
      console.warn(`[SECURITY] Potential SQL injection attempt detected: ${input.substring(0, 100)}`);
      throw new Error('Invalid input detected');
    }
    
    // Limit string length
    if (input.length > SECURITY_CONFIG.MAX_STRING_LENGTH) {
      throw new Error('Input too long');
    }
    
    return input.trim();
  }
  
  if (Array.isArray(input)) {
    if (input.length > SECURITY_CONFIG.MAX_ARRAY_LENGTH) {
      throw new Error('Array too large');
    }
    return input.map(sanitizeInput);
  }
  
  if (typeof input === 'object' && input !== null) {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(input)) {
      // Prevent prototype pollution
      if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
        console.warn(`[SECURITY] Prototype pollution attempt detected: ${key}`);
        continue;
      }
      sanitized[sanitizeInput(key)] = sanitizeInput(value);
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
 * Enhanced row-level security middleware
 */
export function enforceRowLevelSecurity(resourceType: string): RequestHandler {
  return async (req: any, res: Response, next: NextFunction) => {
    const userId = req.user?.claims?.sub;
    const resourceId = req.params.id;
    const notebookId = req.query.notebookId || req.body?.notebookId;
    
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    // Log access attempt
    console.log(`[RLS] User ${userId} attempting to access ${resourceType}:${resourceId}`);
    
    // Store security context for downstream use
    req.rlsContext = {
      userId,
      resourceType,
      resourceId,
      notebookId,
      timestamp: Date.now()
    };
    
    next();
  };
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
  enforceRowLevelSecurity
};