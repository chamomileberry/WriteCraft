import { Router } from 'express';
import { isAuthenticated } from '../replitAuth';
import { requireAdmin } from '../security/middleware';
import * as emailTemplates from '../templates/email/emailTemplates';
import { readRateLimiter } from '../security/rateLimiters';

const router = Router();

/**
 * GET /api/email-preview/:templateType
 * Preview email templates with sample data (admin only)
 */
router.get('/:templateType', isAuthenticated, requireAdmin, readRateLimiter, async (req, res) => {
  try {
    const { templateType } = req.params;
    const { format = 'html' } = req.query;

    let emailContent: { html: string; text: string } | null = null;

    // Sample data for different email types
    switch (templateType) {
      case 'subscription-activated':
        emailContent = emailTemplates.renderSubscriptionActivatedEmail({
          userName: 'Jane Doe',
          planName: 'Professional',
          amount: '$19.99',
          periodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          cancelAtPeriodEnd: false,
        });
        break;

      case 'subscription-canceled':
        emailContent = emailTemplates.renderSubscriptionCanceledEmail({
          userName: 'Jane Doe',
          planName: 'Professional',
          periodEnd: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
          cancelAtPeriodEnd: true,
        });
        break;

      case 'subscription-reactivated':
        emailContent = emailTemplates.renderSubscriptionReactivatedEmail({
          userName: 'Jane Doe',
          planName: 'Professional',
          periodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        });
        break;

      case 'payment-failed':
        emailContent = emailTemplates.renderPaymentFailedEmail({
          userName: 'Jane Doe',
          amount: '$19.99',
          failureReason: 'Your card was declined',
          invoiceUrl: 'https://writecraft.app/billing/invoices/inv_123',
        });
        break;

      case 'trial-ending':
        emailContent = emailTemplates.renderTrialEndingEmail({
          userName: 'Jane Doe',
          planName: 'Professional',
          trialEndDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
          daysRemaining: 3,
        });
        break;

      case 'mfa-enabled':
        emailContent = emailTemplates.renderMfaEnabledEmail({
          userName: 'Jane Doe',
          timestamp: new Date(),
          ipAddress: '192.168.1.1',
        });
        break;

      case 'mfa-disabled':
        emailContent = emailTemplates.renderMfaDisabledEmail({
          userName: 'Jane Doe',
          timestamp: new Date(),
          ipAddress: '192.168.1.1',
        });
        break;

      case 'new-device-login':
        emailContent = emailTemplates.renderNewDeviceLoginEmail({
          userName: 'Jane Doe',
          timestamp: new Date(),
          ipAddress: '192.168.1.1',
          deviceInfo: 'Chrome on MacOS',
          location: 'San Francisco, CA',
        });
        break;

      case 'password-changed':
        emailContent = emailTemplates.renderPasswordChangedEmail({
          userName: 'Jane Doe',
          timestamp: new Date(),
          ipAddress: '192.168.1.1',
        });
        break;

      case 'team-invitation':
        emailContent = emailTemplates.renderTeamInvitationEmail({
          recipientName: 'Jane Doe',
          teamName: 'Awesome Writers Team',
          inviterName: 'John Smith',
          role: 'member',
          inviteToken: 'sample-token-123',
        });
        break;

      case 'team-member-removed':
        emailContent = emailTemplates.renderTeamMemberRemovedEmail({
          recipientName: 'Jane Doe',
          teamName: 'Awesome Writers Team',
        });
        break;

      case 'team-role-changed':
        emailContent = emailTemplates.renderTeamRoleChangedEmail({
          recipientName: 'Jane Doe',
          teamName: 'Awesome Writers Team',
          role: 'admin',
        });
        break;

      case 'usage-limit-warning':
        emailContent = emailTemplates.renderUsageLimitWarningEmail({
          userName: 'Jane Doe',
          limitType: 'AI generations',
          currentUsage: 8000,
          limit: 10000,
          percentageUsed: 80,
        });
        break;

      case 'grace-period-started':
        emailContent = emailTemplates.renderGracePeriodStartedEmail({
          userName: 'Jane Doe',
          limitType: 'projects',
          currentUsage: 6,
          limit: 5,
          percentageUsed: 120,
          gracePeriodDays: 7,
        });
        break;

      case 'grace-period-ending':
        emailContent = emailTemplates.renderGracePeriodEndingEmail({
          userName: 'Jane Doe',
          limitType: 'AI generations',
          currentUsage: 12000,
          limit: 10000,
          percentageUsed: 120,
          gracePeriodDays: 2,
        });
        break;

      case 'limit-exceeded':
        emailContent = emailTemplates.renderLimitExceededEmail({
          userName: 'Jane Doe',
          limitType: 'notebooks',
          currentUsage: 11,
          limit: 10,
          percentageUsed: 110,
        });
        break;

      default:
        return res.status(404).json({ 
          error: 'Template not found',
          availableTemplates: [
            'subscription-activated',
            'subscription-canceled',
            'subscription-reactivated',
            'payment-failed',
            'trial-ending',
            'mfa-enabled',
            'mfa-disabled',
            'new-device-login',
            'password-changed',
            'team-invitation',
            'team-member-removed',
            'team-role-changed',
            'usage-limit-warning',
            'grace-period-started',
            'grace-period-ending',
            'limit-exceeded',
          ]
        });
    }

    // Return HTML or text format
    if (format === 'text') {
      res.type('text/plain').send(emailContent.text);
    } else {
      res.type('text/html').send(emailContent.html);
    }
  } catch (error) {
    console.error('Error previewing email template:', error);
    res.status(500).json({ error: 'Failed to preview email template' });
  }
});

/**
 * GET /api/email-preview
 * List all available email templates
 */
router.get('/', isAuthenticated, requireAdmin, async (req, res) => {
  res.json({
    templates: [
      { id: 'subscription-activated', name: 'Subscription Activated', category: 'billing' },
      { id: 'subscription-canceled', name: 'Subscription Canceled', category: 'billing' },
      { id: 'subscription-reactivated', name: 'Subscription Reactivated', category: 'billing' },
      { id: 'payment-failed', name: 'Payment Failed', category: 'billing' },
      { id: 'trial-ending', name: 'Trial Ending Soon', category: 'billing' },
      { id: 'mfa-enabled', name: 'MFA Enabled', category: 'security' },
      { id: 'mfa-disabled', name: 'MFA Disabled', category: 'security' },
      { id: 'new-device-login', name: 'New Device Login', category: 'security' },
      { id: 'password-changed', name: 'Password Changed', category: 'security' },
      { id: 'team-invitation', name: 'Team Invitation', category: 'team' },
      { id: 'team-member-removed', name: 'Team Member Removed', category: 'team' },
      { id: 'team-role-changed', name: 'Team Role Changed', category: 'team' },
      { id: 'usage-limit-warning', name: 'Usage Limit Warning (80%)', category: 'usage' },
      { id: 'grace-period-started', name: 'Grace Period Started', category: 'usage' },
      { id: 'grace-period-ending', name: 'Grace Period Ending', category: 'usage' },
      { id: 'limit-exceeded', name: 'Limit Exceeded', category: 'usage' },
    ],
    usage: {
      listTemplates: 'GET /api/email-preview',
      previewTemplate: 'GET /api/email-preview/:templateType?format=html|text',
    },
  });
});

export default router;
