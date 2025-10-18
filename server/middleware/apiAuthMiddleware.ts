import { Request, Response, NextFunction } from 'express';
import { apiKeyService } from '../services/apiKeyService';

export interface ApiAuthRequest extends Request {
  apiKey?: {
    id: string;
    userId: string;
    scope: string;
    monthlyRateLimit: number;
    currentMonthUsage: number;
  };
}

/**
 * Middleware to authenticate API requests using API keys
 * 
 * Usage:
 *   router.get('/api/v1/projects', apiAuthMiddleware, handler);
 * 
 * Expects API key in Authorization header:
 *   Authorization: Bearer wc_live_abc123...
 */
export async function apiAuthMiddleware(
  req: ApiAuthRequest,
  res: Response,
  next: NextFunction
) {
  const startTime = Date.now();
  
  try {
    // Extract API key from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Missing or invalid Authorization header. Use: Authorization: Bearer <your_api_key>',
      });
    }

    const apiKey = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Get client IP and User-Agent for logging
    const ipAddress = (req.headers['x-forwarded-for'] as string)?.split(',')[0] || 
                      req.socket.remoteAddress || 
                      'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';

    // Validate the API key
    const validation = await apiKeyService.validateApiKey(
      apiKey,
      req.path,
      ipAddress
    );

    if (!validation.valid || !validation.apiKey) {
      // Log failed attempt
      if (validation.apiKey) {
        await apiKeyService.logUsage({
          apiKeyId: validation.apiKey.id,
          userId: validation.apiKey.userId,
          endpoint: req.path,
          method: req.method,
          statusCode: 401,
          responseTime: Date.now() - startTime,
          ipAddress,
          userAgent,
          errorMessage: validation.error,
        });
      }

      // Return appropriate error
      if (validation.rateLimitExceeded) {
        return res.status(429).json({
          error: 'Rate Limit Exceeded',
          message: validation.error,
          retryAfter: validation.apiKey?.usageResetDate,
        });
      }

      return res.status(401).json({
        error: 'Unauthorized',
        message: validation.error || 'Invalid API key',
      });
    }

    // Attach API key info to request
    req.apiKey = {
      id: validation.apiKey.id,
      userId: validation.apiKey.userId,
      scope: validation.apiKey.scope,
      monthlyRateLimit: validation.apiKey.monthlyRateLimit,
      currentMonthUsage: validation.apiKey.currentMonthUsage,
    };

    // Increment usage counter
    await apiKeyService.incrementUsage(validation.apiKey.id);

    // Log successful request (will be completed in response handler)
    res.on('finish', async () => {
      try {
        await apiKeyService.logUsage({
          apiKeyId: validation.apiKey!.id,
          userId: validation.apiKey!.userId,
          endpoint: req.path,
          method: req.method,
          statusCode: res.statusCode,
          responseTime: Date.now() - startTime,
          ipAddress,
          userAgent,
        });
      } catch (error) {
        console.error('Error logging API usage:', error);
      }
    });

    // Continue to next middleware
    next();
  } catch (error) {
    console.error('API authentication error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'An error occurred during authentication',
    });
  }
}

/**
 * Middleware to check if API key has specific scope
 * 
 * Usage:
 *   router.post('/api/v1/projects', apiAuthMiddleware, requireScope('write'), handler);
 */
export function requireScope(requiredScope: 'read' | 'write' | 'admin') {
  return (req: ApiAuthRequest, res: Response, next: NextFunction) => {
    if (!req.apiKey) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'API key not found in request',
      });
    }

    const scopeHierarchy: Record<string, number> = {
      read: 1,
      write: 2,
      admin: 3,
    };

    const userScope = scopeHierarchy[req.apiKey.scope] || 0;
    const required = scopeHierarchy[requiredScope] || 999;

    if (userScope < required) {
      return res.status(403).json({
        error: 'Forbidden',
        message: `This endpoint requires '${requiredScope}' scope. Your API key has '${req.apiKey.scope}' scope.`,
      });
    }

    next();
  };
}

/**
 * Middleware to add rate limit headers to response
 */
export function addRateLimitHeaders(req: ApiAuthRequest, res: Response, next: NextFunction) {
  if (req.apiKey) {
    const remaining = Math.max(0, req.apiKey.monthlyRateLimit - req.apiKey.currentMonthUsage);
    
    res.setHeader('X-RateLimit-Limit', req.apiKey.monthlyRateLimit);
    res.setHeader('X-RateLimit-Remaining', remaining);
    res.setHeader('X-RateLimit-Used', req.apiKey.currentMonthUsage);
  }
  
  next();
}
