/**
 * Migration Routes - Admin endpoints for user migration
 */

import { Router } from 'express';
import { secureAuthentication } from '../security/middleware';
import { userMigrationService } from '../services/userMigrationService';

const router = Router();

/**
 * Preview migration without applying changes
 * GET /api/migration/preview
 */
router.get('/preview', secureAuthentication, async (req: any, res) => {
  try {
    // TODO: Add admin role check
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
    
    // Allow users to analyze themselves, or admins to analyze anyone
    const requestingUserId = req.user.claims.sub;
    if (userId !== requestingUserId) {
      // TODO: Add admin role check
      return res.status(403).json({ error: 'Unauthorized' });
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
 */
router.post('/execute', secureAuthentication, async (req: any, res) => {
  try {
    // TODO: Add admin role check
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
    
    // Allow users to migrate themselves, or admins to migrate anyone
    const requestingUserId = req.user.claims.sub;
    if (userId !== requestingUserId) {
      // TODO: Add admin role check
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    await userMigrationService.migrateUser(userId);
    res.json({ success: true, message: 'User migrated successfully' });
  } catch (error) {
    console.error('User migration error:', error);
    res.status(500).json({ error: 'Failed to migrate user' });
  }
});

export default router;
