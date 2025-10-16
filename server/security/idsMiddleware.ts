import type { Request, Response, NextFunction, RequestHandler } from 'express';
import { IntrusionDetectionService } from '../services/intrusionDetectionService';

/**
 * Get client IP address from request
 * Handles various proxy configurations
 */
function getClientIp(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  
  if (forwarded) {
    const ips = Array.isArray(forwarded) ? forwarded[0] : forwarded;
    return ips.split(',')[0].trim();
  }
  
  return req.headers['x-real-ip'] as string || 
         req.socket.remoteAddress || 
         'unknown';
}

/**
 * Middleware to block requests from blocked IPs
 * MUST be applied early in the middleware chain
 */
export const blockBlacklistedIps: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const ipAddress = getClientIp(req);
    
    // Skip for unknown IPs
    if (ipAddress === 'unknown') {
      return next();
    }
    
    const isBlocked = await IntrusionDetectionService.isIpBlocked(ipAddress);
    
    if (isBlocked) {
      console.warn(`[IDS] Blocked request from blacklisted IP: ${ipAddress}`);
      
      // Log the blocked attempt
      await IntrusionDetectionService.logAttempt({
        ipAddress,
        userAgent: req.headers['user-agent'],
        attackType: 'UNAUTHORIZED_ACCESS',
        endpoint: req.originalUrl,
        severity: 'HIGH',
        blocked: true,
      });
      
      return res.status(403).json({ 
        error: 'Access denied',
        message: 'Your IP address has been blocked due to suspicious activity'
      });
    }
    
    next();
  } catch (error) {
    console.error('[IDS] Error checking IP block status:', error);
    // Don't block on error - fail open
    next();
  }
};

/**
 * Detect SQL injection patterns in request
 */
function detectSqlInjection(value: any): boolean {
  if (typeof value !== 'string') return false;
  
  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE)\b.*\b(FROM|INTO|TABLE|DATABASE)\b)/i,
    /(\bUNION\b.*\bSELECT\b)/i,
    /(;|\-\-|\/\*|\*\/|xp_|sp_)/i,
    /(\bOR\b.*=.*|'\s*OR\s*'1'\s*=\s*'1)/i,
  ];
  
  return sqlPatterns.some(pattern => pattern.test(value));
}

/**
 * Detect XSS patterns in request
 */
function detectXss(value: any): boolean {
  if (typeof value !== 'string') return false;
  
  const xssPatterns = [
    /<script[^>]*>.*<\/script>/i,
    /javascript:/i,
    /on\w+\s*=/i, // onclick, onload, etc.
    /<iframe[^>]*>/i,
    /eval\(/i,
  ];
  
  return xssPatterns.some(pattern => pattern.test(value));
}

/**
 * Recursively scan object for injection patterns
 */
function scanForInjection(obj: any): { type: 'SQL_INJECTION' | 'XSS' | null; payload: string | null } {
  if (typeof obj === 'string') {
    if (detectSqlInjection(obj)) {
      return { type: 'SQL_INJECTION', payload: obj.substring(0, 200) };
    }
    if (detectXss(obj)) {
      return { type: 'XSS', payload: obj.substring(0, 200) };
    }
    return { type: null, payload: null };
  }
  
  if (Array.isArray(obj)) {
    for (const item of obj) {
      const result = scanForInjection(item);
      if (result.type) return result;
    }
  }
  
  if (typeof obj === 'object' && obj !== null) {
    for (const value of Object.values(obj)) {
      const result = scanForInjection(value);
      if (result.type) return result;
    }
  }
  
  return { type: null, payload: null };
}

/**
 * Middleware to detect injection attacks
 * Should run after body parsing but before route handlers
 */
export const detectInjectionAttacks: RequestHandler = async (req: any, res: Response, next: NextFunction) => {
  try {
    const ipAddress = getClientIp(req);
    
    // Scan all input sources
    const sources = [
      { name: 'body', data: req.body },
      { name: 'query', data: req.query },
      { name: 'params', data: req.params },
    ];
    
    for (const source of sources) {
      const { type, payload } = scanForInjection(source.data);
      
      if (type) {
        console.warn(`[IDS] ${type} detected in ${source.name} from IP: ${ipAddress}`);
        
        // Log the injection attempt
        await IntrusionDetectionService.logAttempt({
          userId: req.user?.claims?.sub,
          ipAddress,
          userAgent: req.headers['user-agent'],
          attackType: type,
          endpoint: req.originalUrl,
          payload: payload || undefined,
          severity: 'CRITICAL',
          blocked: false, // We're not blocking yet, just logging
        });
        
        // Note: Not blocking the request here - sanitization middleware will clean it
        // But the pattern is logged and may trigger auto-block after threshold
        break;
      }
    }
    
    next();
  } catch (error) {
    console.error('[IDS] Error detecting injection attacks:', error);
    next();
  }
};

/**
 * Log failed authentication attempts
 * Should be called from auth routes
 */
export async function logAuthFailure(params: {
  ipAddress: string;
  userAgent?: string;
  userId?: string;
  endpoint: string;
}): Promise<void> {
  await IntrusionDetectionService.logAttempt({
    userId: params.userId,
    ipAddress: params.ipAddress,
    userAgent: params.userAgent,
    attackType: 'BRUTE_FORCE',
    endpoint: params.endpoint,
    severity: 'MEDIUM',
    blocked: false,
  });
}

/**
 * Log rate limit violations
 * Called when rate limiter blocks a request
 */
export async function logRateLimitViolation(params: {
  ipAddress: string;
  userAgent?: string;
  userId?: string;
  endpoint: string;
}): Promise<void> {
  await IntrusionDetectionService.logAttempt({
    userId: params.userId,
    ipAddress: params.ipAddress,
    userAgent: params.userAgent,
    attackType: 'RATE_LIMIT_EXCEEDED',
    endpoint: params.endpoint,
    severity: 'LOW',
    blocked: true,
  });
}

/**
 * Log unauthorized access attempts
 * Should be called when permission checks fail
 */
export async function logUnauthorizedAccess(params: {
  ipAddress: string;
  userAgent?: string;
  userId?: string;
  endpoint: string;
  details?: string;
}): Promise<void> {
  await IntrusionDetectionService.logAttempt({
    userId: params.userId,
    ipAddress: params.ipAddress,
    userAgent: params.userAgent,
    attackType: 'UNAUTHORIZED_ACCESS',
    endpoint: params.endpoint,
    payload: params.details,
    severity: 'HIGH',
    blocked: false,
  });
}

/**
 * Export helper to get client IP
 */
export { getClientIp };
