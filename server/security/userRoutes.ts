import { Router } from 'express';
import { z } from 'zod';
import { db } from '../db';
import { users } from '@shared/schema';
import { eq } from 'drizzle-orm';
import { storage } from '../storage';
import {
  secureAuthentication,
  createRateLimiter,
  CSRFProtection,
  validateInput,
  sanitizeAllInputs,
  SecurityAuditLog,
  requireAdmin,
  enforceRowLevelSecurity
} from './middleware';

const router = Router();

// User profile update schema with strict validation
const updateUserSchema = z.object({
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
  profileImageUrl: z.string().url().max(500).optional(),
  // Explicitly exclude sensitive fields
  isAdmin: z.never().optional(),
  id: z.never().optional(),
  email: z.never().optional(),
  createdAt: z.never().optional(),
  updatedAt: z.never().optional()
}).strict(); // Strict mode prevents additional properties

/**
 * Get current authenticated user with limited data exposure
 */
router.get(
  '/auth/user',
  secureAuthentication,
  createRateLimiter({ maxRequests: 60 }), // 60 requests per 15 minutes
  async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Return limited user data (exclude sensitive fields)
      const safeUserData = {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        profileImageUrl: user.profileImageUrl,
        // Explicitly exclude isAdmin from response unless user is admin
        ...(user.isAdmin ? { isAdmin: true } : {})
      };
      
      res.json(safeUserData);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  }
);

/**
 * Update user profile with enhanced security
 */
router.patch(
  '/users/:id',
  secureAuthentication,
  createRateLimiter({ maxRequests: 20 }), // Stricter rate limit for updates
  CSRFProtection.middleware(), // CSRF protection for state-changing operation
  sanitizeAllInputs,
  validateInput(updateUserSchema),
  enforceRowLevelSecurity('user'),
  async (req: any, res) => {
    try {
      const authenticatedUserId = req.user.claims.sub;
      const targetUserId = req.params.id;
      
      // Security check: Users can only update their own profile
      if (authenticatedUserId !== targetUserId) {
        SecurityAuditLog.log({
          type: 'UNAUTHORIZED_ACCESS',
          userId: authenticatedUserId,
          ip: req.ip,
          details: `User ${authenticatedUserId} attempted to update profile of user ${targetUserId}`,
          severity: 'HIGH'
        });
        
        // Return 404 to prevent user enumeration
        return res.status(404).json({ message: "User not found" });
      }
      
      // Get current user to check for privilege escalation attempts
      const currentUser = await storage.getUser(targetUserId);
      if (!currentUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Check for any attempt to modify restricted fields
      const restrictedFields = ['isAdmin', 'id', 'email', 'createdAt', 'updatedAt'];
      const attemptedFields = Object.keys(req.body);
      const violations = attemptedFields.filter(field => restrictedFields.includes(field));
      
      if (violations.length > 0) {
        SecurityAuditLog.log({
          type: 'PRIVILEGE_ESCALATION',
          userId: authenticatedUserId,
          ip: req.ip,
          details: `User attempted to modify restricted fields: ${violations.join(', ')}`,
          severity: 'CRITICAL'
        });
        
        return res.status(403).json({ 
          message: "Forbidden: Cannot modify restricted fields" 
        });
      }
      
      // Prepare safe updates
      const safeUpdates = {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        profileImageUrl: req.body.profileImageUrl
      };
      
      // Remove undefined values
      Object.keys(safeUpdates).forEach(key => {
        if (safeUpdates[key as keyof typeof safeUpdates] === undefined) {
          delete safeUpdates[key as keyof typeof safeUpdates];
        }
      });
      
      // Update user with safe data only
      const updatedUser = await storage.updateUser(targetUserId, safeUpdates);
      
      if (!updatedUser) {
        return res.status(500).json({ message: "Failed to update user profile" });
      }
      
      // Log successful update
      console.log(`[SECURITY] User ${authenticatedUserId} successfully updated their profile`);
      
      // Return updated user data (excluding sensitive fields)
      const safeResponse = {
        id: updatedUser.id,
        email: updatedUser.email,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        profileImageUrl: updatedUser.profileImageUrl
      };
      
      res.json(safeResponse);
    } catch (error) {
      console.error("Error updating user:", error);
      
      SecurityAuditLog.log({
        type: 'UNAUTHORIZED_ACCESS',
        userId: req.user?.claims?.sub,
        ip: req.ip,
        details: `Error during user profile update: ${error}`,
        severity: 'MEDIUM'
      });
      
      res.status(500).json({ message: "Failed to update user profile" });
    }
  }
);

/**
 * Admin-only endpoint to update user roles
 */
router.patch(
  '/admin/users/:id/role',
  secureAuthentication,
  requireAdmin,
  createRateLimiter({ maxRequests: 10 }), // Very strict rate limit
  CSRFProtection.middleware(),
  sanitizeAllInputs,
  async (req: any, res) => {
    try {
      const adminUserId = req.user.claims.sub;
      const targetUserId = req.params.id;
      const { isAdmin } = req.body;
      
      // Validate input
      if (typeof isAdmin !== 'boolean') {
        return res.status(400).json({ message: "Invalid role data" });
      }
      
      // Prevent self-demotion
      if (adminUserId === targetUserId && !isAdmin) {
        return res.status(400).json({ 
          message: "Cannot remove your own admin privileges" 
        });
      }
      
      // Check if target user exists
      const targetUser = await storage.getUser(targetUserId);
      if (!targetUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Update admin status
      await db
        .update(users)
        .set({
          isAdmin,
          updatedAt: new Date()
        })
        .where(eq(users.id, targetUserId));
      
      // Log admin action
      SecurityAuditLog.log({
        type: 'PRIVILEGE_ESCALATION',
        userId: adminUserId,
        ip: req.ip,
        details: `Admin ${adminUserId} ${isAdmin ? 'granted' : 'revoked'} admin privileges ${isAdmin ? 'to' : 'from'} user ${targetUserId}`,
        severity: 'HIGH'
      });
      
      res.json({ 
        message: `User ${targetUserId} admin status updated successfully`,
        userId: targetUserId,
        isAdmin
      });
    } catch (error) {
      console.error("Error updating user role:", error);
      
      SecurityAuditLog.log({
        type: 'UNAUTHORIZED_ACCESS',
        userId: req.user?.claims?.sub,
        ip: req.ip,
        details: `Error during admin role update: ${error}`,
        severity: 'CRITICAL'
      });
      
      res.status(500).json({ message: "Failed to update user role" });
    }
  }
);

/**
 * Get user by ID with proper authorization
 */
router.get(
  '/users/:id',
  secureAuthentication,
  createRateLimiter(),
  enforceRowLevelSecurity('user'),
  async (req: any, res) => {
    try {
      const authenticatedUserId = req.user.claims.sub;
      const requestedUserId = req.params.id;
      
      // Users can only view their own profile (unless admin)
      const [requestingUser] = await db.select().from(users).where(eq(users.id, authenticatedUserId));
      
      if (!requestingUser) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      // Check authorization
      if (authenticatedUserId !== requestedUserId && !requestingUser.isAdmin) {
        SecurityAuditLog.log({
          type: 'UNAUTHORIZED_ACCESS',
          userId: authenticatedUserId,
          ip: req.ip,
          details: `User ${authenticatedUserId} attempted to access profile of user ${requestedUserId}`,
          severity: 'MEDIUM'
        });
        
        return res.status(404).json({ message: "User not found" });
      }
      
      const user = await storage.getUser(requestedUserId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Return limited data for non-admin users
      const responseData = requestingUser.isAdmin ? user : {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        profileImageUrl: user.profileImageUrl
      };
      
      res.json(responseData);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  }
);

/**
 * Delete user account (self-service only)
 */
router.delete(
  '/users/:id',
  secureAuthentication,
  createRateLimiter({ maxRequests: 5 }), // Very strict for deletion
  CSRFProtection.middleware(),
  enforceRowLevelSecurity('user'),
  async (req: any, res) => {
    try {
      const authenticatedUserId = req.user.claims.sub;
      const targetUserId = req.params.id;
      
      // Users can only delete their own account
      if (authenticatedUserId !== targetUserId) {
        SecurityAuditLog.log({
          type: 'DATA_BREACH_ATTEMPT',
          userId: authenticatedUserId,
          ip: req.ip,
          details: `User ${authenticatedUserId} attempted to delete account of user ${targetUserId}`,
          severity: 'CRITICAL'
        });
        
        return res.status(404).json({ message: "User not found" });
      }
      
      // Check if user exists
      const user = await storage.getUser(targetUserId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Prevent admin self-deletion if they're the last admin
      if (user.isAdmin) {
        const adminCount = await db
          .select({ count: users.id })
          .from(users)
          .where(eq(users.isAdmin, true));
        
        if (adminCount.length === 1) {
          return res.status(400).json({ 
            message: "Cannot delete the last admin account" 
          });
        }
      }
      
      // Soft delete or anonymize user data (GDPR compliance)
      await db
        .update(users)
        .set({
          email: `deleted-${targetUserId}@deleted.local`,
          firstName: 'Deleted',
          lastName: 'User',
          profileImageUrl: null,
          isAdmin: false,
          updatedAt: new Date()
        })
        .where(eq(users.id, targetUserId));
      
      // Log account deletion
      SecurityAuditLog.log({
        type: 'UNAUTHORIZED_ACCESS',
        userId: authenticatedUserId,
        ip: req.ip,
        details: `User ${authenticatedUserId} deleted their account`,
        severity: 'HIGH'
      });
      
      // Invalidate session
      req.session.destroy((err: any) => {
        if (err) {
          console.error('Error destroying session:', err);
        }
      });
      
      res.json({ message: "Account deleted successfully" });
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ message: "Failed to delete account" });
    }
  }
);

/**
 * Generate CSRF token endpoint
 */
router.get(
  '/auth/csrf-token',
  secureAuthentication,
  createRateLimiter(),
  (req: any, res) => {
    const sessionId = req.sessionID;
    if (!sessionId) {
      return res.status(401).json({ message: "No session" });
    }
    
    const token = CSRFProtection.generateToken(sessionId);
    res.json({ csrfToken: token });
  }
);

/**
 * Logout endpoint with session cleanup
 */
router.post(
  '/auth/logout',
  secureAuthentication,
  (req: any, res) => {
    const userId = req.user?.claims?.sub;
    
    req.session.destroy((err: any) => {
      if (err) {
        console.error('Error destroying session:', err);
        return res.status(500).json({ message: "Logout failed" });
      }
      
      console.log(`[SECURITY] User ${userId} logged out successfully`);
      res.json({ message: "Logged out successfully" });
    });
  }
);

export default router;