/**
 * Centralized Rate Limiting Configuration
 * 
 * This module provides pre-configured rate limiters for different endpoint types
 * across the WriteCraft platform. All rate limiters use Redis when available for
 * distributed rate limiting, falling back to in-memory storage.
 * 
 * Rate Limiting Tiers:
 * - Strict: 5-10 req/min - Authentication, MFA, billing, admin operations
 * - Moderate: 30-50 req/min - Database write operations (POST, PATCH, DELETE)
 * - Expensive: 10 req/min - AI calls, import/export, image generation
 * - Standard: 100 req/min - Read operations (GET, LIST, SEARCH)
 * - Generous: 200 req/min - Low-cost operations
 */

import { createRateLimiter } from './middleware';
import type { RequestHandler } from 'express';

// ============================================================================
// AUTHENTICATION & SECURITY
// ============================================================================

/**
 * Strict rate limiter for authentication endpoints
 * Prevents brute-force attacks on login/callback endpoints
 * No custom keyGenerator - let express-rate-limit handle IPv6 normalization
 */
export const authRateLimiter: RequestHandler = createRateLimiter({
  maxRequests: 5,
  windowMs: 60 * 1000, // 1 minute
});

/**
 * Rate limiter for MFA operations
 * Prevents brute-force attacks on MFA codes
 * Rate limited per user only (no IP) since we already have user auth
 */
export const mfaRateLimiter: RequestHandler = createRateLimiter({
  maxRequests: 5,
  windowMs: 60 * 1000,
  keyGenerator: (req: any) => {
    const userId = req.user?.claims?.sub || 'anonymous';
    return `mfa:${userId}`;
  }
});

/**
 * Rate limiter for password operations
 * Prevents password change/reset abuse
 * For unauthenticated users, let express-rate-limit handle IP properly
 */
export const passwordRateLimiter: RequestHandler = createRateLimiter({
  maxRequests: 3,
  windowMs: 60 * 1000,
  keyGenerator: ((req: any) => {
    const userId = req.user?.claims?.sub;
    return userId ? `password:${userId}` : undefined;
  }) as any
});

/**
 * Rate limiter for session operations
 * Prevents session enumeration/hijacking attempts
 * Rate limited per user only (no IP) since we already have user auth
 */
export const sessionRateLimiter: RequestHandler = createRateLimiter({
  maxRequests: 10,
  windowMs: 60 * 1000,
  keyGenerator: (req: any) => {
    const userId = req.user?.claims?.sub || 'anonymous';
    return `session:${userId}`;
  }
});

// ============================================================================
// DATABASE WRITE OPERATIONS
// ============================================================================

/**
 * Moderate rate limiter for database write operations
 * Applies to all POST, PATCH, DELETE operations on content types
 */
export const writeRateLimiter: RequestHandler = createRateLimiter({
  maxRequests: 50,
  windowMs: 60 * 1000,
  keyGenerator: (req: any) => {
    const userId = req.user?.claims?.sub || 'anonymous';
    return `write:${userId}`;
  }
});

/**
 * Stricter rate limiter for batch operations
 * Prevents abuse of bulk create/update/delete endpoints
 */
export const batchRateLimiter: RequestHandler = createRateLimiter({
  maxRequests: 10,
  windowMs: 60 * 1000,
  keyGenerator: (req: any) => {
    const userId = req.user?.claims?.sub || 'anonymous';
    return `batch:${userId}`;
  }
});

// ============================================================================
// EXPENSIVE OPERATIONS
// ============================================================================

/**
 * Strict rate limiter for AI generation endpoints
 * Prevents excessive API costs from AI abuse
 */
export const aiRateLimiter: RequestHandler = createRateLimiter({
  maxRequests: 10,
  windowMs: 60 * 1000,
  keyGenerator: (req: any) => {
    const userId = req.user?.claims?.sub || 'anonymous';
    return `ai:${userId}`;
  }
});

/**
 * Strict rate limiter for AI chat endpoints
 * Higher limit than generation but still controlled
 */
export const aiChatRateLimiter: RequestHandler = createRateLimiter({
  maxRequests: 20,
  windowMs: 60 * 1000,
  keyGenerator: (req: any) => {
    const userId = req.user?.claims?.sub || 'anonymous';
    return `ai-chat:${userId}`;
  }
});

/**
 * Very strict rate limiter for import operations
 * File processing is expensive and slow
 */
export const importRateLimiter: RequestHandler = createRateLimiter({
  maxRequests: 3,
  windowMs: 60 * 1000,
  keyGenerator: (req: any) => {
    const userId = req.user?.claims?.sub || 'anonymous';
    return `import:${userId}`;
  }
});

/**
 * Strict rate limiter for export operations
 * Data export is expensive and requires careful throttling
 */
export const exportRateLimiter: RequestHandler = createRateLimiter({
  maxRequests: 5,
  windowMs: 60 * 1000,
  keyGenerator: (req: any) => {
    const userId = req.user?.claims?.sub || 'anonymous';
    return `export:${userId}`;
  }
});

/**
 * Strict rate limiter for image generation
 * Prevents excessive API costs from image generation abuse
 */
export const imageGenerationRateLimiter: RequestHandler = createRateLimiter({
  maxRequests: 5,
  windowMs: 60 * 1000,
  keyGenerator: (req: any) => {
    const userId = req.user?.claims?.sub || 'anonymous';
    return `image-gen:${userId}`;
  }
});

/**
 * Rate limiter for image search/retrieval
 * More generous than generation but still controlled
 */
export const imageSearchRateLimiter: RequestHandler = createRateLimiter({
  maxRequests: 30,
  windowMs: 60 * 1000,
  keyGenerator: (req: any) => {
    const userId = req.user?.claims?.sub || 'anonymous';
    return `image-search:${userId}`;
  }
});

// ============================================================================
// STANDARD READ OPERATIONS
// ============================================================================

/**
 * Standard rate limiter for read operations
 * Generous limits for GET requests
 */
export const readRateLimiter: RequestHandler = createRateLimiter({
  maxRequests: 100,
  windowMs: 60 * 1000,
  keyGenerator: (req: any) => {
    const userId = req.user?.claims?.sub || 'anonymous';
    return `read:${userId}`;
  }
});

/**
 * Generous rate limiter for low-cost operations
 * Health checks, preferences, etc.
 */
export const generousRateLimiter: RequestHandler = createRateLimiter({
  maxRequests: 200,
  windowMs: 60 * 1000,
  keyGenerator: (req: any) => {
    const userId = req.user?.claims?.sub || 'anonymous';
    return `generous:${userId}`;
  }
});

/**
 * Rate limiter for search operations
 * Search can be expensive so moderate limits
 */
export const searchRateLimiter: RequestHandler = createRateLimiter({
  maxRequests: 30,
  windowMs: 60 * 1000,
  keyGenerator: (req: any) => {
    const userId = req.user?.claims?.sub || 'anonymous';
    return `search:${userId}`;
  }
});

// ============================================================================
// COLLABORATION & TEAMS
// ============================================================================

/**
 * Rate limiter for team operations
 * Invites, member management, role changes
 */
export const teamRateLimiter: RequestHandler = createRateLimiter({
  maxRequests: 20,
  windowMs: 60 * 1000,
  keyGenerator: (req: any) => {
    const userId = req.user?.claims?.sub || 'anonymous';
    return `team:${userId}`;
  }
});

/**
 * Strict rate limiter for team invitations
 * Prevents invitation spam
 */
export const inviteRateLimiter: RequestHandler = createRateLimiter({
  maxRequests: 10,
  windowMs: 60 * 1000,
  keyGenerator: (req: any) => {
    const userId = req.user?.claims?.sub || 'anonymous';
    return `invite:${userId}`;
  }
});

/**
 * Rate limiter for share operations
 * Creating/updating shares with permission controls
 */
export const shareRateLimiter: RequestHandler = createRateLimiter({
  maxRequests: 30,
  windowMs: 60 * 1000,
  keyGenerator: (req: any) => {
    const userId = req.user?.claims?.sub || 'anonymous';
    return `share:${userId}`;
  }
});

/**
 * Generous rate limiter for collaboration/presence
 * Real-time collaboration requires frequent updates
 */
export const collaborationRateLimiter: RequestHandler = createRateLimiter({
  maxRequests: 200,
  windowMs: 60 * 1000,
  keyGenerator: (req: any) => {
    const userId = req.user?.claims?.sub || 'anonymous';
    return `collab:${userId}`;
  }
});

// ============================================================================
// BILLING & SUBSCRIPTIONS
// ============================================================================

/**
 * Strict rate limiter for billing operations
 * Prevents abuse of Stripe API
 */
export const billingRateLimiter: RequestHandler = createRateLimiter({
  maxRequests: 10,
  windowMs: 60 * 1000,
  keyGenerator: (req: any) => {
    const userId = req.user?.claims?.sub || 'anonymous';
    return `billing:${userId}`;
  }
});

/**
 * Very strict rate limiter for subscription changes
 * Prevents rapid subscription changes that could cause billing issues
 */
export const subscriptionChangeRateLimiter: RequestHandler = createRateLimiter({
  maxRequests: 5,
  windowMs: 60 * 1000,
  keyGenerator: (req: any) => {
    const userId = req.user?.claims?.sub || 'anonymous';
    return `subscription-change:${userId}`;
  }
});

// ============================================================================
// ADMIN OPERATIONS
// ============================================================================

/**
 * Strict rate limiter for admin operations
 * Admin endpoints should be rarely used
 */
export const adminRateLimiter: RequestHandler = createRateLimiter({
  maxRequests: 30,
  windowMs: 60 * 1000,
  keyGenerator: (req: any) => {
    const userId = req.user?.claims?.sub || 'anonymous';
    return `admin:${userId}`;
  }
});

/**
 * Very strict rate limiter for destructive admin operations
 * Prevents accidental bulk deletions
 */
export const adminDestructiveRateLimiter: RequestHandler = createRateLimiter({
  maxRequests: 5,
  windowMs: 60 * 1000,
  keyGenerator: (req: any) => {
    const userId = req.user?.claims?.sub || 'anonymous';
    return `admin-destructive:${userId}`;
  }
});

// ============================================================================
// USER-SPECIFIC OPERATIONS
// ============================================================================

/**
 * Rate limiter for user profile operations
 * Prevents excessive profile updates
 */
export const profileRateLimiter: RequestHandler = createRateLimiter({
  maxRequests: 20,
  windowMs: 60 * 1000,
  keyGenerator: (req: any) => {
    const userId = req.user?.claims?.sub || 'anonymous';
    return `profile:${userId}`;
  }
});

/**
 * Rate limiter for user search operations
 * Prevents abuse of user search for scraping
 */
export const userSearchRateLimiter: RequestHandler = createRateLimiter({
  maxRequests: 10,
  windowMs: 60 * 1000,
  keyGenerator: (req: any) => {
    const userId = req.user?.claims?.sub || 'anonymous';
    return `user-search:${userId}`;
  }
});

/**
 * Strict rate limiter for account deletion
 * Critical operation that should be rare
 */
export const accountDeletionRateLimiter: RequestHandler = createRateLimiter({
  maxRequests: 2,
  windowMs: 60 * 60 * 1000, // 1 hour window
  keyGenerator: (req: any) => {
    const userId = req.user?.claims?.sub || 'anonymous';
    return `account-deletion:${userId}`;
  }
});

// ============================================================================
// FEEDBACK & ANALYTICS
// ============================================================================

/**
 * Rate limiter for feedback submission
 * Prevents spam but allows legitimate feedback
 * For unauthenticated users, let express-rate-limit handle IP properly
 */
export const feedbackRateLimiter: RequestHandler = createRateLimiter({
  maxRequests: 5,
  windowMs: 60 * 60 * 1000, // 1 hour window
  keyGenerator: ((req: any) => {
    const userId = req.user?.claims?.sub;
    return userId ? `feedback:${userId}` : undefined;
  }) as any
});

/**
 * Generous rate limiter for analytics/usage endpoints
 * Users should be able to check their usage frequently
 */
export const analyticsRateLimiter: RequestHandler = createRateLimiter({
  maxRequests: 50,
  windowMs: 60 * 1000,
  keyGenerator: (req: any) => {
    const userId = req.user?.claims?.sub || 'anonymous';
    return `analytics:${userId}`;
  }
});

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Creates a custom rate limiter with specific configuration
 * Use this for special cases not covered by predefined limiters
 */
export function createCustomRateLimiter(
  name: string,
  maxRequests: number,
  windowMs: number = 60 * 1000
): RequestHandler {
  return createRateLimiter({
    maxRequests,
    windowMs,
    keyGenerator: (req: any) => {
      const userId = req.user?.claims?.sub || 'anonymous';
      return `${name}:${userId}`;
    }
  });
}

/**
 * Export all rate limiters for easy import
 */
export const rateLimiters = {
  // Auth & Security
  auth: authRateLimiter,
  mfa: mfaRateLimiter,
  password: passwordRateLimiter,
  session: sessionRateLimiter,
  
  // Database Operations
  write: writeRateLimiter,
  batch: batchRateLimiter,
  read: readRateLimiter,
  search: searchRateLimiter,
  
  // Expensive Operations
  ai: aiRateLimiter,
  aiChat: aiChatRateLimiter,
  import: importRateLimiter,
  export: exportRateLimiter,
  imageGeneration: imageGenerationRateLimiter,
  imageSearch: imageSearchRateLimiter,
  
  // Collaboration & Teams
  team: teamRateLimiter,
  invite: inviteRateLimiter,
  share: shareRateLimiter,
  collaboration: collaborationRateLimiter,
  
  // Billing
  billing: billingRateLimiter,
  subscriptionChange: subscriptionChangeRateLimiter,
  
  // Admin
  admin: adminRateLimiter,
  adminDestructive: adminDestructiveRateLimiter,
  
  // User Operations
  profile: profileRateLimiter,
  userSearch: userSearchRateLimiter,
  accountDeletion: accountDeletionRateLimiter,
  
  // Feedback & Analytics
  feedback: feedbackRateLimiter,
  analytics: analyticsRateLimiter,
  
  // General
  generous: generousRateLimiter,
  
  // Custom
  createCustom: createCustomRateLimiter,
};
