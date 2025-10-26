/**
 * Migration Routes - Admin endpoints for user migration
 */

import { Router } from 'express';
import { secureAuthentication, requireAdmin } from '../security/middleware';
import { userMigrationService } from '../services/userMigrationService';
import { db } from '../db';
import { users } from '@shared/schema';
import { eq } from 'drizzle-orm';

const router = Router();

/**
 * Preview migration without applying changes
 * GET /api/migration/preview
 * 
 * RESTRICTED: Admin-only endpoint
 */
router.get('/preview', secureAuthentication, requireAdmin, async (req: any, res) => {
  try {
    const preview = await userMigrationService.previewMigration();
    res.json(preview);
  } catch (error) {
    console.error('Migration preview error:', error);
    res.status(500).json({ error: 'Failed to generate migration preview' });
  }
});

/**
 * Analyze a specific user's usage
 * GET /api/migration/analyze/:userId
 */
router.get('/analyze/:userId', secureAuthentication, async (req: any, res) => {
  try {
    const { userId } = req.params;
    const requestingUserId = req.user.claims.sub;
    
    // Check if user is admin
    const [requestingUser] = await db
      .select()
      .from(users)
      .where(eq(users.id, requestingUserId));
    
    const isAdmin = requestingUser?.isAdmin || false;
    
    // Security: Only allow users to analyze themselves, unless they're admin
    if (userId !== requestingUserId && !isAdmin) {
      return res.status(403).json({ error: 'Unauthorized: Can only analyze your own account' });
    }
    
    const analysis = await userMigrationService.analyzeUserUsage(userId);
    res.json(analysis);
  } catch (error) {
    console.error('User analysis error:', error);
    res.status(500).json({ error: 'Failed to analyze user' });
  }
});

/**
 * Execute full migration
 * POST /api/migration/execute
 * 
 * RESTRICTED: Admin-only endpoint
 */
router.post('/execute', secureAuthentication, requireAdmin, async (req: any, res) => {
  try {
    const stats = await userMigrationService.migrateAllUsers();
    res.json(stats);
  } catch (error) {
    console.error('Migration execution error:', error);
    res.status(500).json({ error: 'Failed to execute migration' });
  }
});

/**
 * Migrate a specific user
 * POST /api/migration/user/:userId
 */
router.post('/user/:userId', secureAuthentication, async (req: any, res) => {
  try {
    const { userId } = req.params;
    const requestingUserId = req.user.claims.sub;
    
    // Check if user is admin
    const [requestingUser] = await db
      .select()
      .from(users)
      .where(eq(users.id, requestingUserId));
    
    const isAdmin = requestingUser?.isAdmin || false;
    
    // Security: Only allow users to migrate themselves, unless they're admin
    if (userId !== requestingUserId && !isAdmin) {
      return res.status(403).json({ error: 'Unauthorized: Can only migrate your own account' });
    }
    
    await userMigrationService.migrateUser(userId);
    res.json({ success: true, message: 'User migrated successfully' });
  } catch (error) {
    console.error('User migration error:', error);
    res.status(500).json({ error: 'Failed to migrate user' });
  }
});

export default router;
