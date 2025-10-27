import type { Request, Response, NextFunction, RequestHandler } from 'express';
import { serverAnalytics, SERVER_EVENTS } from '../services/serverAnalytics';

/**
 * Middleware to track API request volume for IDS baseline analysis
 * This helps establish normal usage patterns to set appropriate thresholds
 */
export const trackApiRequest: RequestHandler = (req: any, res: Response, next: NextFunction) => {
  try {
    // Skip tracking for health checks and static assets
    const skipPaths = ['/health', '/api/health', '/assets', '/favicon.ico'];
    if (skipPaths.some(path => req.path.startsWith(path))) {
      return next();
    }
    
    // Track API request volume
    const userId = req.user?.claims?.sub || 'anonymous';
    const ipAddress = req.headers['x-forwarded-for']?.toString().split(',')[0].trim() || 
                      req.socket.remoteAddress || 
                      'unknown';
    
    serverAnalytics.capture({
      distinctId: userId,
      event: SERVER_EVENTS.API_REQUEST,
      properties: {
        method: req.method,
        path: req.path,
        endpoint: req.originalUrl,
        ipAddress,
        userAgent: req.headers['user-agent'],
        authenticated: !!req.user,
        timestamp: new Date().toISOString(),
      },
    });
    
    next();
  } catch (error) {
    // Don't block the request if tracking fails
    console.error('[API Tracking] Failed to track request:', error);
    next();
  }
};

/**
 * Track content paste events to detect if pasted content triggers false positives
 * Should be called from content editor endpoints
 */
export function trackContentPaste(params: {
  userId: string;
  contentLength: number;
  contentType?: string;
  endpoint: string;
  triggerDetection?: boolean;
}): void {
  try {
    serverAnalytics.capture({
      distinctId: params.userId,
      event: SERVER_EVENTS.CONTENT_PASTE,
      properties: {
        contentLength: params.contentLength,
        contentType: params.contentType || 'unknown',
        endpoint: params.endpoint,
        triggerDetection: params.triggerDetection || false,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('[API Tracking] Failed to track content paste:', error);
  }
}

/**
 * Track login attempts for baseline analysis
 */
export function trackLoginAttempt(params: {
  success: boolean;
  ipAddress: string;
  userAgent?: string;
  userId?: string;
  method?: string; // 'password', 'google', 'github', etc.
}): void {
  try {
    const event = params.success ? SERVER_EVENTS.LOGIN_SUCCESS : SERVER_EVENTS.LOGIN_FAILURE;
    
    serverAnalytics.capture({
      distinctId: params.userId || params.ipAddress,
      event,
      properties: {
        success: params.success,
        ipAddress: params.ipAddress,
        userAgent: params.userAgent,
        method: params.method || 'unknown',
        timestamp: new Date().toISOString(),
      },
    });
    
    // Also capture generic login_attempt event for overall tracking
    serverAnalytics.capture({
      distinctId: params.userId || params.ipAddress,
      event: SERVER_EVENTS.LOGIN_ATTEMPT,
      properties: {
        success: params.success,
        ipAddress: params.ipAddress,
        userAgent: params.userAgent,
        method: params.method || 'unknown',
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('[API Tracking] Failed to track login attempt:', error);
  }
}
