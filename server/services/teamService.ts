import { db } from '../db';
import { eq, and, desc, sql } from "drizzle-orm";
import { 
  teamMemberships, 
  teamInvitations, 
  teamActivity, 
  userSubscriptions,
  users,
  type InsertTeamMembership,
  type InsertTeamInvitation,
  type InsertTeamActivity
} from "@shared/schema";
import { nanoid } from "nanoid";

export class TeamService {
  /**
   * Get team subscription for a user
   */
  async getUserTeamSubscription(userId: string) {
    // Check if user is owner of a team subscription
    const ownedTeam = await db.query.userSubscriptions.findFirst({
      where: and(
        eq(userSubscriptions.userId, userId),
        eq(userSubscriptions.tier, 'team')
      ),
    });

    if (ownedTeam) {
      return ownedTeam;
    }

    // Check if user is a member of a team
    const membership = await db.query.teamMemberships.findFirst({
      where: eq(teamMemberships.userId, userId),
      with: {
        teamSubscription: true,
      },
    });

    return membership?.teamSubscription || null;
  }

  /**
   * Get all members of a team
   */
  async getTeamMembers(teamSubscriptionId: string) {
    const members = await db
      .select({
        id: teamMemberships.id,
        userId: teamMemberships.userId,
        role: teamMemberships.role,
        canEdit: teamMemberships.canEdit,
        canComment: teamMemberships.canComment,
        canInvite: teamMemberships.canInvite,
        createdAt: teamMemberships.createdAt,
        user: {
          id: users.id,
          email: users.email,
          firstName: users.firstName,
          lastName: users.lastName,
          profileImageUrl: users.profileImageUrl,
        },
      })
      .from(teamMemberships)
      .leftJoin(users, eq(teamMemberships.userId, users.id))
      .where(eq(teamMemberships.teamSubscriptionId, teamSubscriptionId))
      .orderBy(desc(teamMemberships.createdAt));

    return members;
  }

  /**
   * Get pending invitations for a team
   */
  async getPendingInvitations(teamSubscriptionId: string) {
    const invitations = await db.query.teamInvitations.findMany({
      where: and(
        eq(teamInvitations.teamSubscriptionId, teamSubscriptionId),
        eq(teamInvitations.status, 'pending')
      ),
      with: {
        inviter: {
          columns: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: desc(teamInvitations.createdAt),
    });

    return invitations;
  }

  /**
   * Invite a member to the team
   */
  async inviteMember(
    teamSubscriptionId: string,
    email: string,
    role: 'admin' | 'member',
    permissions: { canEdit: boolean; canComment: boolean; canInvite: boolean },
    invitedBy: string
  ) {
    // Check if user is already a member
    const existingMember = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (existingMember) {
      const isMember = await db.query.teamMemberships.findFirst({
        where: and(
          eq(teamMemberships.teamSubscriptionId, teamSubscriptionId),
          eq(teamMemberships.userId, existingMember.id)
        ),
      });

      if (isMember) {
        throw new Error('User is already a member of this team');
      }
    }

    // Check for existing pending invitation
    const existingInvite = await db.query.teamInvitations.findFirst({
      where: and(
        eq(teamInvitations.teamSubscriptionId, teamSubscriptionId),
        eq(teamInvitations.email, email),
        eq(teamInvitations.status, 'pending')
      ),
    });

    if (existingInvite) {
      throw new Error('An invitation has already been sent to this email');
    }

    // Create invitation
    const token = nanoid(32);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // Expires in 7 days

    const [invitation] = await db.insert(teamInvitations).values({
      teamSubscriptionId,
      email,
      role,
      canEdit: permissions.canEdit,
      canComment: permissions.canComment,
      canInvite: permissions.canInvite,
      invitedBy,
      token,
      expiresAt,
      status: 'pending',
    }).returning();

    // Log activity
    await this.logActivity({
      teamSubscriptionId,
      userId: invitedBy,
      activityType: 'member_invited',
      metadata: { email, role },
    });

    return invitation;
  }

  /**
   * Accept team invitation
   */
  async acceptInvitation(token: string, userId: string) {
    const invitation = await db.query.teamInvitations.findFirst({
      where: eq(teamInvitations.token, token),
    });

    if (!invitation) {
      throw new Error('Invalid invitation token');
    }

    if (invitation.status !== 'pending') {
      throw new Error('This invitation is no longer valid');
    }

    if (new Date() > new Date(invitation.expiresAt)) {
      // Mark as expired
      await db.update(teamInvitations)
        .set({ status: 'expired' })
        .where(eq(teamInvitations.id, invitation.id));
      
      throw new Error('This invitation has expired');
    }

    // Add user to team
    const [membership] = await db.insert(teamMemberships).values({
      teamSubscriptionId: invitation.teamSubscriptionId,
      userId,
      role: invitation.role,
      canEdit: invitation.canEdit,
      canComment: invitation.canComment,
      canInvite: invitation.canInvite,
    }).returning();

    // Mark invitation as accepted
    await db.update(teamInvitations)
      .set({ status: 'accepted' })
      .where(eq(teamInvitations.id, invitation.id));

    // Log activity
    await this.logActivity({
      teamSubscriptionId: invitation.teamSubscriptionId,
      userId,
      activityType: 'member_joined',
      metadata: { role: invitation.role },
    });

    return membership;
  }

  /**
   * Remove a member from the team
   */
  async removeMember(teamSubscriptionId: string, userId: string, removedBy: string) {
    const membership = await db.query.teamMemberships.findFirst({
      where: and(
        eq(teamMemberships.teamSubscriptionId, teamSubscriptionId),
        eq(teamMemberships.userId, userId)
      ),
    });

    if (!membership) {
      throw new Error('Member not found');
    }

    await db.delete(teamMemberships)
      .where(eq(teamMemberships.id, membership.id));

    // Log activity
    await this.logActivity({
      teamSubscriptionId,
      userId: removedBy,
      activityType: 'member_removed',
      metadata: { removedUserId: userId, role: membership.role },
    });
  }

  /**
   * Update member role and permissions
   */
  async updateMemberRole(
    teamSubscriptionId: string,
    userId: string,
    role: string,
    permissions: { canEdit: boolean; canComment: boolean; canInvite: boolean },
    updatedBy: string
  ) {
    const membership = await db.query.teamMemberships.findFirst({
      where: and(
        eq(teamMemberships.teamSubscriptionId, teamSubscriptionId),
        eq(teamMemberships.userId, userId)
      ),
    });

    if (!membership) {
      throw new Error('Member not found');
    }

    const [updated] = await db.update(teamMemberships)
      .set({
        role,
        canEdit: permissions.canEdit,
        canComment: permissions.canComment,
        canInvite: permissions.canInvite,
      })
      .where(eq(teamMemberships.id, membership.id))
      .returning();

    // Log activity
    await this.logActivity({
      teamSubscriptionId,
      userId: updatedBy,
      activityType: 'role_changed',
      metadata: { 
        targetUserId: userId, 
        oldRole: membership.role, 
        newRole: role 
      },
    });

    return updated;
  }

  /**
   * Revoke a pending invitation
   */
  async revokeInvitation(invitationId: string, revokedBy: string) {
    const invitation = await db.query.teamInvitations.findFirst({
      where: eq(teamInvitations.id, invitationId),
    });

    if (!invitation) {
      throw new Error('Invitation not found');
    }

    await db.update(teamInvitations)
      .set({ status: 'revoked' })
      .where(eq(teamInvitations.id, invitationId));

    // Log activity
    await this.logActivity({
      teamSubscriptionId: invitation.teamSubscriptionId,
      userId: revokedBy,
      activityType: 'invitation_revoked',
      metadata: { email: invitation.email },
    });
  }

  /**
   * Get team activity feed
   */
  async getTeamActivity(teamSubscriptionId: string, limit: number = 50) {
    const activities = await db
      .select({
        id: teamActivity.id,
        activityType: teamActivity.activityType,
        resourceType: teamActivity.resourceType,
        resourceId: teamActivity.resourceId,
        resourceName: teamActivity.resourceName,
        metadata: teamActivity.metadata,
        createdAt: teamActivity.createdAt,
        user: {
          id: users.id,
          email: users.email,
          firstName: users.firstName,
          lastName: users.lastName,
          profileImageUrl: users.profileImageUrl,
        },
      })
      .from(teamActivity)
      .leftJoin(users, eq(teamActivity.userId, users.id))
      .where(eq(teamActivity.teamSubscriptionId, teamSubscriptionId))
      .orderBy(desc(teamActivity.createdAt))
      .limit(limit);

    return activities;
  }

  /**
   * Log team activity
   */
  async logActivity(activity: InsertTeamActivity) {
    await db.insert(teamActivity).values(activity);
  }

  /**
   * Get total team AI usage for today (for usage pooling)
   */
  async getTeamDailyUsage(teamSubscriptionId: string): Promise<number> {
    const today = new Date().toISOString().split('T')[0];
    
    // Get all team member user IDs
    const members = await db.query.teamMemberships.findMany({
      where: eq(teamMemberships.teamSubscriptionId, teamSubscriptionId),
      columns: { userId: true },
    });

    if (members.length === 0) {
      return 0;
    }

    const memberIds = members.map((m: { userId: string }) => m.userId);

    // Get team owner
    const teamSub = await db.query.userSubscriptions.findFirst({
      where: eq(userSubscriptions.id, teamSubscriptionId),
      columns: { userId: true },
    });

    if (teamSub) {
      memberIds.push(teamSub.userId);
    }

    // Query total usage for all team members today
    const result = await db.execute(sql`
      SELECT COALESCE(SUM(total_operations), 0) as total
      FROM ai_usage_daily_summary
      WHERE user_id = ANY(${memberIds}::varchar[])
      AND date = ${today}
    `);

    return Number(result.rows[0]?.total || 0);
  }

  /**
   * Check if user has permission to perform an action
   */
  async checkPermission(
    userId: string,
    teamSubscriptionId: string,
    permission: 'edit' | 'comment' | 'invite'
  ): Promise<boolean> {
    // Check if user is team owner
    const teamSub = await db.query.userSubscriptions.findFirst({
      where: and(
        eq(userSubscriptions.id, teamSubscriptionId),
        eq(userSubscriptions.userId, userId)
      ),
    });

    if (teamSub) {
      return true; // Owner has all permissions
    }

    // Check member permissions
    const membership = await db.query.teamMemberships.findFirst({
      where: and(
        eq(teamMemberships.teamSubscriptionId, teamSubscriptionId),
        eq(teamMemberships.userId, userId)
      ),
    });

    if (!membership) {
      return false;
    }

    switch (permission) {
      case 'edit':
        return membership.canEdit ?? false;
      case 'comment':
        return membership.canComment ?? false;
      case 'invite':
        return membership.canInvite ?? false;
      default:
        return false;
    }
  }
}

// Export singleton instance
export const teamService = new TeamService();
