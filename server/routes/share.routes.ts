import { Router } from 'express';
import { db } from '../db';
import { shares, users, notebooks, projects, guides } from '@shared/schema';
import { insertShareSchema } from '@shared/schema';
import { eq, and, or } from 'drizzle-orm';
import { secureAuthentication } from '../security/middleware';
import { requireBooleanFeature } from '../middleware/featureGate';

const router = Router();

async function validateResourceOwnership(
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
    console.error('Error validating resource ownership:', error);
    return false;
  }
}

router.post('/shares', secureAuthentication, requireBooleanFeature('collaboration'), async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    
    const validatedData = insertShareSchema.parse(req.body);
    
    if (userId !== validatedData.ownerId) {
      return res.status(403).json({ message: 'Only the owner can share resources' });
    }
    
    if (validatedData.userId === validatedData.ownerId) {
      return res.status(400).json({ message: 'Cannot share resource with yourself' });
    }
    
    const ownsResource = await validateResourceOwnership(
      validatedData.resourceType,
      validatedData.resourceId,
      userId
    );
    
    if (!ownsResource) {
      console.warn(`[Security] Attempted to share unowned resource - userId: ${userId}, resourceType: ${validatedData.resourceType}, resourceId: ${validatedData.resourceId}`);
      return res.status(404).json({ message: 'Resource not found' });
    }
    
    const [share] = await db.insert(shares).values(validatedData).returning();
    
    res.status(201).json(share);
  } catch (error) {
    console.error('Error creating share:', error);
    res.status(400).json({ 
      message: error instanceof Error ? error.message : 'Failed to create share' 
    });
  }
});

router.get('/shares', secureAuthentication, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const { resourceType, resourceId } = req.query;
    
    if (!resourceType || !resourceId) {
      return res.status(400).json({ 
        message: 'resourceType and resourceId are required' 
      });
    }
    
    const resourceShares = await db
      .select({
        id: shares.id,
        userId: shares.userId,
        ownerId: shares.ownerId,
        permission: shares.permission,
        resourceType: shares.resourceType,
        resourceId: shares.resourceId,
        createdAt: shares.createdAt,
        user: {
          id: users.id,
          email: users.email,
          firstName: users.firstName,
          lastName: users.lastName,
          profileImageUrl: users.profileImageUrl,
        }
      })
      .from(shares)
      .leftJoin(users, eq(shares.userId, users.id))
      .where(
        and(
          eq(shares.resourceType, resourceType as string),
          eq(shares.resourceId, resourceId as string),
          eq(shares.ownerId, userId)
        )
      );
    
    res.json(resourceShares);
  } catch (error) {
    console.error('Error fetching shares:', error);
    res.status(500).json({ 
      message: error instanceof Error ? error.message : 'Failed to fetch shares' 
    });
  }
});

router.delete('/shares/:id', secureAuthentication, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const shareId = req.params.id;
    
    const [existingShare] = await db
      .select()
      .from(shares)
      .where(eq(shares.id, shareId));
    
    if (!existingShare) {
      return res.status(404).json({ message: 'Share not found' });
    }
    
    if (existingShare.ownerId !== userId) {
      return res.status(403).json({ message: 'Only the owner can remove shares' });
    }
    
    await db.delete(shares).where(eq(shares.id, shareId));
    
    res.json({ message: 'Share removed successfully' });
  } catch (error) {
    console.error('Error deleting share:', error);
    res.status(500).json({ 
      message: error instanceof Error ? error.message : 'Failed to delete share' 
    });
  }
});

router.patch('/shares/:id/permission', secureAuthentication, requireBooleanFeature('collaboration'), async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const shareId = req.params.id;
    const { permission } = req.body;
    
    if (!['view', 'comment', 'edit'].includes(permission)) {
      return res.status(400).json({ 
        message: 'Invalid permission. Must be view, comment, or edit' 
      });
    }
    
    const [existingShare] = await db
      .select()
      .from(shares)
      .where(eq(shares.id, shareId));
    
    if (!existingShare) {
      return res.status(404).json({ message: 'Share not found' });
    }
    
    if (existingShare.ownerId !== userId) {
      return res.status(403).json({ 
        message: 'Only the owner can update permissions' 
      });
    }
    
    const [updatedShare] = await db
      .update(shares)
      .set({ permission })
      .where(eq(shares.id, shareId))
      .returning();
    
    res.json(updatedShare);
  } catch (error) {
    console.error('Error updating share permission:', error);
    res.status(500).json({ 
      message: error instanceof Error ? error.message : 'Failed to update permission' 
    });
  }
});

router.get('/shares/with-me', secureAuthentication, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const { resourceType } = req.query;
    
    const baseQuery = db
      .select({
        id: shares.id,
        userId: shares.userId,
        ownerId: shares.ownerId,
        permission: shares.permission,
        resourceType: shares.resourceType,
        resourceId: shares.resourceId,
        createdAt: shares.createdAt,
        owner: {
          id: users.id,
          email: users.email,
          firstName: users.firstName,
          lastName: users.lastName,
          profileImageUrl: users.profileImageUrl,
        }
      })
      .from(shares)
      .leftJoin(users, eq(shares.ownerId, users.id));
    
    const whereConditions = resourceType
      ? and(
          eq(shares.userId, userId),
          eq(shares.resourceType, resourceType as string)
        )
      : eq(shares.userId, userId);
    
    const sharedWithMe = await baseQuery.where(whereConditions);
    
    res.json(sharedWithMe);
  } catch (error) {
    console.error('Error fetching shared resources:', error);
    res.status(500).json({ 
      message: error instanceof Error ? error.message : 'Failed to fetch shared resources' 
    });
  }
});

export default router;
