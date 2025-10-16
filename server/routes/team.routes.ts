import { Router } from 'express';
import { teamService } from '../services/teamService';
import { isAuthenticated } from '../replitAuth';
import { z } from 'zod';

const router = Router();

// Get team members
router.get('/members', isAuthenticated, async (req, res, next) => {
  try {
    const userId = (req.user as any).claims.sub;
    
    // Get user's team subscription
    const teamSubscription = await teamService.getUserTeamSubscription(userId);
    
    if (!teamSubscription) {
      return res.status(404).json({ message: 'Not a member of any team' });
    }

    const members = await teamService.getTeamMembers(teamSubscription.id);
    res.json(members);
  } catch (error: any) {
    next(error);
  }
});

// Get pending invitations
router.get('/invitations', isAuthenticated, async (req, res, next) => {
  try {
    const userId = (req.user as any).claims.sub;
    
    // Get user's team subscription
    const teamSubscription = await teamService.getUserTeamSubscription(userId);
    
    if (!teamSubscription) {
      return res.status(404).json({ message: 'Not a member of any team' });
    }

    const invitations = await teamService.getPendingInvitations(teamSubscription.id);
    res.json(invitations);
  } catch (error: any) {
    next(error);
  }
});

// Invite a member
router.post('/invite', isAuthenticated, async (req, res, next) => {
  try {
    const userId = (req.user as any).claims.sub;
    
    const schema = z.object({
      email: z.string().email(),
      role: z.enum(['admin', 'member']),
      canEdit: z.boolean().default(true),
      canComment: z.boolean().default(true),
      canInvite: z.boolean().default(false),
    });

    const data = schema.parse(req.body);

    // Get user's team subscription
    const teamSubscription = await teamService.getUserTeamSubscription(userId);
    
    if (!teamSubscription) {
      return res.status(403).json({ message: 'Only team members can invite others' });
    }

    // Check if user has permission to invite
    const hasPermission = await teamService.checkPermission(userId, teamSubscription.id, 'invite');
    
    if (!hasPermission) {
      return res.status(403).json({ message: 'You do not have permission to invite members' });
    }

    const invitation = await teamService.inviteMember(
      teamSubscription.id,
      data.email,
      data.role,
      {
        canEdit: data.canEdit,
        canComment: data.canComment,
        canInvite: data.canInvite,
      },
      userId
    );

    res.json(invitation);
  } catch (error: any) {
    if (error.message.includes('already')) {
      return res.status(400).json({ message: error.message });
    }
    next(error);
  }
});

// Accept invitation
router.post('/accept-invitation', isAuthenticated, async (req, res, next) => {
  try {
    const userId = (req.user as any).claims.sub;
    
    const schema = z.object({
      token: z.string(),
    });

    const { token } = schema.parse(req.body);

    const membership = await teamService.acceptInvitation(token, userId);
    res.json(membership);
  } catch (error: any) {
    if (error.message.includes('Invalid') || error.message.includes('expired') || error.message.includes('valid')) {
      return res.status(400).json({ message: error.message });
    }
    next(error);
  }
});

// Remove a member
router.delete('/members/:userId', isAuthenticated, async (req, res, next) => {
  try {
    const currentUserId = (req.user as any).claims.sub;
    const targetUserId = req.params.userId;
    
    // Get user's team subscription
    const teamSubscription = await teamService.getUserTeamSubscription(currentUserId);
    
    if (!teamSubscription) {
      return res.status(403).json({ message: 'Not a member of any team' });
    }

    // Check if user is team owner
    const isOwner = teamSubscription.userId === currentUserId;
    
    if (!isOwner) {
      return res.status(403).json({ message: 'Only team owner can remove members' });
    }

    await teamService.removeMember(teamSubscription.id, targetUserId, currentUserId);
    res.json({ success: true });
  } catch (error: any) {
    next(error);
  }
});

// Update member role
router.patch('/members/:userId', isAuthenticated, async (req, res, next) => {
  try {
    const currentUserId = (req.user as any).claims.sub;
    const targetUserId = req.params.userId;
    
    const schema = z.object({
      role: z.enum(['admin', 'member']),
      canEdit: z.boolean(),
      canComment: z.boolean(),
      canInvite: z.boolean(),
    });

    const data = schema.parse(req.body);

    // Get user's team subscription
    const teamSubscription = await teamService.getUserTeamSubscription(currentUserId);
    
    if (!teamSubscription) {
      return res.status(403).json({ message: 'Not a member of any team' });
    }

    // Check if user is team owner or admin
    const isOwner = teamSubscription.userId === currentUserId;
    
    if (!isOwner) {
      return res.status(403).json({ message: 'Only team owner can update member roles' });
    }

    const updated = await teamService.updateMemberRole(
      teamSubscription.id,
      targetUserId,
      data.role,
      {
        canEdit: data.canEdit,
        canComment: data.canComment,
        canInvite: data.canInvite,
      },
      currentUserId
    );

    res.json(updated);
  } catch (error: any) {
    next(error);
  }
});

// Revoke invitation
router.delete('/invitations/:invitationId', isAuthenticated, async (req, res, next) => {
  try {
    const userId = (req.user as any).claims.sub;
    const invitationId = req.params.invitationId;
    
    // Get user's team subscription
    const teamSubscription = await teamService.getUserTeamSubscription(userId);
    
    if (!teamSubscription) {
      return res.status(403).json({ message: 'Not a member of any team' });
    }

    // Check if user has permission to invite (same permission needed to revoke)
    const hasPermission = await teamService.checkPermission(userId, teamSubscription.id, 'invite');
    
    if (!hasPermission) {
      return res.status(403).json({ message: 'You do not have permission to revoke invitations' });
    }

    await teamService.revokeInvitation(invitationId, userId);
    res.json({ success: true });
  } catch (error: any) {
    next(error);
  }
});

// Get team activity feed
router.get('/activity', isAuthenticated, async (req, res, next) => {
  try {
    const userId = (req.user as any).claims.sub;
    const limit = parseInt(req.query.limit as string) || 50;
    
    // Get user's team subscription
    const teamSubscription = await teamService.getUserTeamSubscription(userId);
    
    if (!teamSubscription) {
      return res.status(404).json({ message: 'Not a member of any team' });
    }

    const activity = await teamService.getTeamActivity(teamSubscription.id, limit);
    res.json(activity);
  } catch (error: any) {
    next(error);
  }
});

// Get team daily usage
router.get('/usage', isAuthenticated, async (req, res, next) => {
  try {
    const userId = (req.user as any).claims.sub;
    
    // Get user's team subscription
    const teamSubscription = await teamService.getUserTeamSubscription(userId);
    
    if (!teamSubscription) {
      return res.status(404).json({ message: 'Not a member of any team' });
    }

    const usage = await teamService.getTeamDailyUsage(teamSubscription.id);
    res.json({ usage });
  } catch (error: any) {
    next(error);
  }
});

export default router;
