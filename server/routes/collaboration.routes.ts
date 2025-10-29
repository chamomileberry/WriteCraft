import { Router, Request, Response } from 'express';
import { getRoomUsers, getActiveRooms } from '../collaboration';
import { db } from '../db';
import { shares, users, projects } from '../../shared/schema';
import { eq, and, inArray } from 'drizzle-orm';
import { collaborationRateLimiter } from '../security/rateLimiters';

const router = Router();

// Get active collaborators for a document
router.get('/rooms/:resourceType/:resourceId/users', collaborationRateLimiter, async (req: Request, res: Response) => {
  try {
    const { resourceType, resourceId } = req.params;
    const userId = (req as any).user.id;

    // Verify user has access to this resource
    if (resourceType === 'project') {
      const project = await db.query.projects.findFirst({
        where: eq(projects.id, resourceId),
      });

      if (!project) {
        return res.status(404).json({ message: 'Resource not found' });
      }

      // Check if user owns or has access via sharing
      const hasAccess = project.userId === userId || await db.query.shares.findFirst({
        where: and(
          eq(shares.resourceType, 'project'),
          eq(shares.resourceId, project.id),
          eq(shares.userId, userId),
        ),
      });

      if (!hasAccess) {
        return res.status(403).json({ message: 'Access denied' });
      }
    }

    const docName = `${resourceType}:${resourceId}`;
    const userIds = getRoomUsers(docName);

    // Fetch user details
    const userDetails = userIds.length > 0 ? await db.query.users.findMany({
      where: inArray(users.id, userIds),
      columns: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        profileImageUrl: true,
      },
    }) : [];

    res.json({
      documentId: resourceId,
      activeUsers: userDetails,
      count: userDetails.length,
    });
  } catch (error: any) {
    console.error('[Collaboration API] Error getting room users:', error);
    res.status(500).json({ message: error.message || 'Failed to get active users' });
  }
});

// Get all active rooms (admin only)
router.get('/rooms', collaborationRateLimiter, async (req: Request, res: Response) => {
  try {
    const activeRooms = getActiveRooms();
    
    res.json({
      rooms: activeRooms,
      count: activeRooms.length,
    });
  } catch (error: any) {
    console.error('[Collaboration API] Error getting active rooms:', error);
    res.status(500).json({ message: error.message || 'Failed to get active rooms' });
  }
});

export default router;
