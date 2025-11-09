import { renderBaseTemplate, renderPlainText } from "./baseTemplate";
import type {
  SubscriptionEmailData,
  PaymentEmailData,
  SecurityEmailData,
  TeamEmailData,
  UsageLimitEmailData,
} from "../../services/emailService";

// Subscription & Billing Templates

export function renderWelcomeEmail(userName: string): {
  html: string;
  text: string;
} {
  const content = `
    <h2>Welcome to WriteCraft, ${userName}!</h2>
    <p>We're excited to have you join our community of creative writers. WriteCraft is designed to help you bring your stories to life with powerful tools and AI assistance.</p>
    
    <p><strong>Here's what you can do with WriteCraft:</strong></p>
    <ul style="color: #4a5568; line-height: 1.8;">
      <li>Create and organize characters, locations, and plot points</li>
      <li>Build rich story worlds with our project management tools</li>
      <li>Get AI-powered writing assistance and suggestions</li>
      <li>Collaborate with other writers on shared projects</li>
      <li>Track your writing progress with timelines and canvases</li>
    </ul>
    
    <a href="https://writecraft.app/dashboard" class="button">Get Started</a>
    
    <p>If you have any questions or need help getting started, don't hesitate to reach out to our support team.</p>
    
    <p>Happy writing!<br>The WriteCraft Team</p>
  `;

  const html = renderBaseTemplate({
    title: "Welcome to WriteCraft",
    preheader: "Start your creative writing journey",
    content,
  });

  const text = `
Welcome to WriteCraft, ${userName}!

We're excited to have you join our community of creative writers. WriteCraft is designed to help you bring your stories to life with powerful tools and AI assistance.

Here's what you can do with WriteCraft:
• Create and organize characters, locations, and plot points
• Build rich story worlds with our project management tools
• Get AI-powered writing assistance and suggestions
• Collaborate with other writers on shared projects
• Track your writing progress with timelines and canvases

Get started: https://writecraft.app/dashboard

If you have any questions or need help getting started, don't hesitate to reach out to our support team at support@writecraft.app.

Happy writing!
The WriteCraft Team

WriteCraft - Tools for Creative Writers
https://writecraft.app
  `.trim();

  return { html, text };
}

export function renderSubscriptionActivatedEmail(data: SubscriptionEmailData): {
  html: string;
  text: string;
} {
  const content = `
    <h2>Your ${data.planName} Plan is Now Active!</h2>
    <p>Hi ${data.userName},</p>
    
    <p>Your subscription to WriteCraft <strong>${data.planName}</strong> has been successfully activated.</p>
    
    <div class="info-box">
      <p style="margin-bottom: 8px;"><strong>Plan Details:</strong></p>
      <p style="margin-bottom: 4px;">Plan: ${data.planName}</p>
      ${data.amount ? `<p style="margin-bottom: 4px;">Amount: ${data.amount}</p>` : ""}
      ${data.periodEnd ? `<p>Renews: ${data.periodEnd.toLocaleDateString()}</p>` : ""}
    </div>
    
    <p>You now have access to all ${data.planName} features, including:</p>
    <ul style="color: #4a5568; line-height: 1.8;">
      <li>Increased AI generation limits</li>
      <li>Advanced project management tools</li>
      <li>Premium writing templates</li>
      <li>Priority support</li>
    </ul>
    
    <a href="https://writecraft.app/dashboard" class="button">Start Creating</a>
    
    <p>Thank you for supporting WriteCraft!</p>
  `;

  const html = renderBaseTemplate({
    title: "Subscription Activated",
    preheader: `Your ${data.planName} subscription is now active`,
    content,
  });

  const text =
    renderPlainText(content) +
    "\n\nWriteCraft - Tools for Creative Writers\nhttps://writecraft.app";

  return { html, text };
}

export function renderSubscriptionCanceledEmail(data: SubscriptionEmailData): {
  html: string;
  text: string;
} {
  const content = `
    <h2>Your Subscription Has Been Canceled</h2>
    <p>Hi ${data.userName},</p>
    
    <p>We've confirmed the cancellation of your WriteCraft ${data.planName} subscription.</p>
    
    ${
      data.periodEnd && data.cancelAtPeriodEnd
        ? `
      <div class="info-box">
        <p><strong>Your subscription will remain active until ${data.periodEnd.toLocaleDateString()}</strong></p>
        <p style="margin-top: 8px;">You'll continue to have access to all ${data.planName} features until this date.</p>
      </div>
    `
        : ""
    }
    
    <p>We're sorry to see you go! If there's anything we could have done better, we'd love to hear from you.</p>
    
    <p>Changed your mind? You can reactivate your subscription anytime from your account settings.</p>
    
    <a href="https://writecraft.app/settings/billing" class="button-secondary">Reactivate Subscription</a>
    
    <p>Thank you for being part of WriteCraft.</p>
  `;

  const html = renderBaseTemplate({
    title: "Subscription Canceled",
    preheader: "Your subscription has been canceled",
    content,
  });

  const text =
    renderPlainText(content) +
    "\n\nWriteCraft - Tools for Creative Writers\nhttps://writecraft.app";

  return { html, text };
}

export function renderSubscriptionReactivatedEmail(
  data: SubscriptionEmailData,
): { html: string; text: string } {
  const content = `
    <h2>Welcome Back!</h2>
    <p>Hi ${data.userName},</p>
    
    <p>Great news! Your WriteCraft ${data.planName} subscription has been reactivated.</p>
    
    <div class="info-box">
      <p style="margin-bottom: 8px;"><strong>Subscription Details:</strong></p>
      <p style="margin-bottom: 4px;">Plan: ${data.planName}</p>
      ${data.periodEnd ? `<p>Next renewal: ${data.periodEnd.toLocaleDateString()}</p>` : ""}
    </div>
    
    <p>You now have full access to all ${data.planName} features again. We're glad to have you back!</p>
    
    <a href="https://writecraft.app/dashboard" class="button">Continue Writing</a>
  `;

  const html = renderBaseTemplate({
    title: "Subscription Reactivated",
    preheader: "Your subscription is active again",
    content,
  });

  const text =
    renderPlainText(content) +
    "\n\nWriteCraft - Tools for Creative Writers\nhttps://writecraft.app";

  return { html, text };
}

export function renderPaymentSuccessfulEmail(data: PaymentEmailData): {
  html: string;
  text: string;
} {
  const content = `
    <h2>Payment Receipt</h2>
    <p>Hi ${data.userName},</p>
    
    <p>Thank you! We've successfully processed your payment.</p>
    
    <div class="info-box">
      <p style="margin-bottom: 8px;"><strong>Payment Details:</strong></p>
      <p style="margin-bottom: 4px;">Amount: ${data.amount}</p>
      ${data.last4 ? `<p style="margin-bottom: 4px;">Card ending in: ••••${data.last4}</p>` : ""}
      <p>Date: ${new Date().toLocaleDateString()}</p>
    </div>
    
    ${
      data.invoiceUrl
        ? `
      <a href="${data.invoiceUrl}" class="button">View Invoice</a>
    `
        : ""
    }
    
    <p>Your subscription will continue uninterrupted. Thank you for your continued support!</p>
  `;

  const html = renderBaseTemplate({
    title: "Payment Receipt",
    preheader: `Payment of ${data.amount} received`,
    content,
  });

  const text =
    renderPlainText(content) +
    "\n\nWriteCraft - Tools for Creative Writers\nhttps://writecraft.app";

  return { html, text };
}

export function renderPaymentFailedEmail(data: PaymentEmailData): {
  html: string;
  text: string;
} {
  const content = `
    <h2>Payment Failed - Action Required</h2>
    <p>Hi ${data.userName},</p>
    
    <div class="alert-box">
      <p style="margin-bottom: 8px;"><strong>We couldn't process your payment</strong></p>
      <p>Amount: ${data.amount}</p>
      ${data.failureReason ? `<p style="margin-top: 8px;">Reason: ${data.failureReason}</p>` : ""}
    </div>
    
    <p>To continue enjoying WriteCraft without interruption, please update your payment method as soon as possible.</p>
    
    <p><strong>What happens next?</strong></p>
    <ul style="color: #4a5568; line-height: 1.8;">
      <li>We'll automatically retry your payment in 3 days</li>
      <li>Your subscription will remain active during this time</li>
      <li>If payment fails again, your subscription may be paused</li>
    </ul>
    
    <a href="https://writecraft.app/settings/billing" class="button">Update Payment Method</a>
    
    <p>If you have any questions, please contact our support team.</p>
  `;

  const html = renderBaseTemplate({
    title: "Payment Failed",
    preheader: "Action required: Update your payment method",
    content,
  });

  const text =
    renderPlainText(content) +
    "\n\nWriteCraft - Tools for Creative Writers\nhttps://writecraft.app";

  return { html, text };
}

export function renderRefundProcessedEmail(data: PaymentEmailData): {
  html: string;
  text: string;
} {
  const content = `
    <h2>Refund Processed</h2>
    <p>Hi ${data.userName},</p>
    
    <p>Your refund has been processed successfully.</p>
    
    <div class="info-box">
      <p style="margin-bottom: 8px;"><strong>Refund Details:</strong></p>
      <p style="margin-bottom: 4px;">Amount: ${data.amount}</p>
      ${data.last4 ? `<p style="margin-bottom: 4px;">Refunded to card ending in: ••••${data.last4}</p>` : ""}
      <p>Processing time: 5-10 business days</p>
    </div>
    
    <p>The refund will appear on your statement within 5-10 business days, depending on your bank's processing time.</p>
    
    <p>If you have any questions about this refund, please contact our support team.</p>
  `;

  const html = renderBaseTemplate({
    title: "Refund Processed",
    preheader: `Refund of ${data.amount} has been processed`,
    content,
  });

  const text =
    renderPlainText(content) +
    "\n\nWriteCraft - Tools for Creative Writers\nhttps://writecraft.app";

  return { html, text };
}

// Security Templates

export function renderMfaEnabledEmail(data: SecurityEmailData): {
  html: string;
  text: string;
} {
  const content = `
    <h2>Two-Factor Authentication Enabled</h2>
    <p>Hi ${data.userName},</p>
    
    <div class="info-box">
      <p><strong>Two-factor authentication (2FA) has been enabled on your WriteCraft account.</strong></p>
      <p style="margin-top: 8px;">Your account is now more secure. You'll need both your password and an authentication code to sign in.</p>
    </div>
    
    <p><strong>What this means:</strong></p>
    <ul style="color: #4a5568; line-height: 1.8;">
      <li>You'll need your authenticator app to sign in</li>
      <li>Your account is protected from unauthorized access</li>
      <li>Keep your backup codes in a safe place</li>
    </ul>
    
    <p>If you didn't enable this, please contact our support team immediately.</p>
    
    <a href="https://writecraft.app/settings/security" class="button">View Security Settings</a>
  `;

  const html = renderBaseTemplate({
    title: "2FA Enabled",
    preheader: "Two-factor authentication is now active",
    content,
  });

  const text =
    renderPlainText(content) +
    "\n\nWriteCraft - Tools for Creative Writers\nhttps://writecraft.app";

  return { html, text };
}

export function renderMfaDisabledEmail(data: SecurityEmailData): {
  html: string;
  text: string;
} {
  const content = `
    <h2>Two-Factor Authentication Disabled</h2>
    <p>Hi ${data.userName},</p>
    
    <div class="warning-box">
      <p><strong>Two-factor authentication has been disabled on your WriteCraft account.</strong></p>
      <p style="margin-top: 8px;">Your account is less secure without 2FA. We recommend re-enabling it.</p>
    </div>
    
    <p>If you didn't disable 2FA, please secure your account immediately and contact our support team.</p>
    
    <a href="https://writecraft.app/settings/security" class="button">Re-enable 2FA</a>
  `;

  const html = renderBaseTemplate({
    title: "2FA Disabled",
    preheader: "Two-factor authentication has been disabled",
    content,
  });

  const text =
    renderPlainText(content) +
    "\n\nWriteCraft - Tools for Creative Writers\nhttps://writecraft.app";

  return { html, text };
}

export function renderNewDeviceLoginEmail(data: SecurityEmailData): {
  html: string;
  text: string;
} {
  const content = `
    <h2>New Login Detected</h2>
    <p>Hi ${data.userName},</p>
    
    <div class="info-box">
      <p><strong>A new login to your WriteCraft account was detected.</strong></p>
      ${data.device ? `<p style="margin-top: 8px;">Device: ${data.device}</p>` : ""}
      ${data.location ? `<p>Location: ${data.location}</p>` : ""}
      ${data.ipAddress ? `<p>IP Address: ${data.ipAddress}</p>` : ""}
      ${data.timestamp ? `<p>Time: ${data.timestamp.toLocaleString()}</p>` : ""}
    </div>
    
    <p>If this was you, no action is needed.</p>
    
    <p><strong>If this wasn't you:</strong></p>
    <ul style="color: #4a5568; line-height: 1.8;">
      <li>Change your password immediately</li>
      <li>Enable two-factor authentication</li>
      <li>Review your active sessions</li>
      <li>Contact our support team</li>
    </ul>
    
    <a href="https://writecraft.app/settings/security" class="button">Secure Your Account</a>
  `;

  const html = renderBaseTemplate({
    title: "New Login Detected",
    preheader: "New login to your account",
    content,
  });

  const text =
    renderPlainText(content) +
    "\n\nWriteCraft - Tools for Creative Writers\nhttps://writecraft.app";

  return { html, text };
}

export function renderPasswordChangedEmail(data: SecurityEmailData): {
  html: string;
  text: string;
} {
  const content = `
    <h2>Password Changed</h2>
    <p>Hi ${data.userName},</p>
    
    <div class="info-box">
      <p><strong>Your WriteCraft password was successfully changed.</strong></p>
      ${data.timestamp ? `<p style="margin-top: 8px;">Time: ${data.timestamp.toLocaleString()}</p>` : ""}
    </div>
    
    <p>If you made this change, no action is needed.</p>
    
    <p><strong>If you didn't change your password:</strong></p>
    <ul style="color: #4a5568; line-height: 1.8;">
      <li>Contact our support team immediately</li>
      <li>Someone may have unauthorized access to your account</li>
    </ul>
    
    <a href="mailto:support@writecraft.app" class="button">Contact Support</a>
  `;

  const html = renderBaseTemplate({
    title: "Password Changed",
    preheader: "Your password was changed",
    content,
  });

  const text =
    renderPlainText(content) +
    "\n\nWriteCraft - Tools for Creative Writers\nhttps://writecraft.app";

  return { html, text };
}

export function renderAccountDeletionScheduledEmail(
  userName: string,
  deletionDate: Date,
): { html: string; text: string } {
  const content = `
    <h2>Account Deletion Scheduled</h2>
    <p>Hi ${userName},</p>
    
    <div class="warning-box">
      <p><strong>Your WriteCraft account is scheduled for deletion on ${deletionDate.toLocaleDateString()}.</strong></p>
      <p style="margin-top: 8px;">After this date, all your data will be permanently deleted and cannot be recovered.</p>
    </div>
    
    <p><strong>What will be deleted:</strong></p>
    <ul style="color: #4a5568; line-height: 1.8;">
      <li>All characters, locations, and projects</li>
      <li>All notebooks and writing content</li>
      <li>Timeline and canvas data</li>
      <li>AI conversation history</li>
      <li>Account settings and preferences</li>
    </ul>
    
    <p>If you changed your mind, you can cancel the deletion before this date.</p>
    
    <a href="https://writecraft.app/settings/account" class="button-secondary">Cancel Deletion</a>
    
    <p>If you'd like to export your data before deletion, you can do so from your account settings.</p>
  `;

  const html = renderBaseTemplate({
    title: "Account Deletion Scheduled",
    preheader: `Your account will be deleted on ${deletionDate.toLocaleDateString()}`,
    content,
  });

  const text =
    renderPlainText(content) +
    "\n\nWriteCraft - Tools for Creative Writers\nhttps://writecraft.app";

  return { html, text };
}

// Team Management Templates

export function renderTeamInvitationEmail(data: TeamEmailData): {
  html: string;
  text: string;
} {
  const appUrl = getEnvOptional('APP_URL') || "https://writecraft.app";
  const inviteUrl = data.inviteToken
    ? `${appUrl}/team/invite/${data.inviteToken}`
    : `${appUrl}/teams`;

  const content = `
    <h2>You're Invited to Join a Team!</h2>
    <p>Hi ${data.recipientName},</p>
    
    <p>${data.inviterName || "Someone"} has invited you to join the <strong>${data.teamName}</strong> team on WriteCraft.</p>
    
    <div class="info-box">
      <p style="margin-bottom: 8px;"><strong>Invitation Details:</strong></p>
      <p style="margin-bottom: 4px;">Team: ${data.teamName}</p>
      ${data.role ? `<p>Your role: ${data.role}</p>` : ""}
    </div>
    
    <p><strong>As a team member, you'll be able to:</strong></p>
    <ul style="color: #4a5568; line-height: 1.8;">
      <li>Collaborate on shared projects</li>
      <li>Access team resources and templates</li>
      <li>Share characters, locations, and plots</li>
      <li>Work together with other writers</li>
    </ul>
    
    <a href="${inviteUrl}" class="button">Accept Invitation</a>
    
    <p style="font-size: 14px; color: #64748b;">If you don't want to join this team, you can ignore this email.</p>
  `;

  const html = renderBaseTemplate({
    title: "Team Invitation",
    preheader: `You've been invited to join ${data.teamName}`,
    content,
  });

  const text = `
You're Invited to Join a Team!

Hi ${data.recipientName},

${data.inviterName || "Someone"} has invited you to join the ${data.teamName} team on WriteCraft.

Invitation Details:
• Team: ${data.teamName}
${data.role ? `• Your role: ${data.role}` : ""}

As a team member, you'll be able to:
• Collaborate on shared projects
• Access team resources and templates
• Share characters, locations, and plots
• Work together with other writers

Accept invitation: ${inviteUrl}

If you don't want to join this team, you can ignore this email.

WriteCraft - Tools for Creative Writers
https://writecraft.app
  `.trim();

  return { html, text };
}

export function renderTeamMemberRemovedEmail(data: TeamEmailData): {
  html: string;
  text: string;
} {
  const content = `
    <h2>Removed from Team</h2>
    <p>Hi ${data.recipientName},</p>
    
    <p>You have been removed from the <strong>${data.teamName}</strong> team on WriteCraft.</p>
    
    <p>You no longer have access to:</p>
    <ul style="color: #4a5568; line-height: 1.8;">
      <li>Shared team projects</li>
      <li>Team resources and templates</li>
      <li>Collaborative workspaces</li>
    </ul>
    
    <p>Your personal projects and content remain unaffected.</p>
    
    <p>If you believe this was done in error, please contact the team owner or our support team.</p>
  `;

  const html = renderBaseTemplate({
    title: "Removed from Team",
    preheader: `You've been removed from ${data.teamName}`,
    content,
  });

  const text =
    renderPlainText(content) +
    "\n\nWriteCraft - Tools for Creative Writers\nhttps://writecraft.app";

  return { html, text };
}

export function renderTeamRoleChangedEmail(data: TeamEmailData): {
  html: string;
  text: string;
} {
  const content = `
    <h2>Your Team Role Has Changed</h2>
    <p>Hi ${data.recipientName},</p>
    
    <p>Your role in the <strong>${data.teamName}</strong> team has been updated.</p>
    
    <div class="info-box">
      <p><strong>New Role: ${data.role || "Member"}</strong></p>
    </div>
    
    <p>Your permissions and access level have been adjusted according to your new role.</p>
    
    <a href="https://writecraft.app/teams" class="button">View Team</a>
    
    <p>If you have questions about your new role, please contact the team owner.</p>
  `;

  const html = renderBaseTemplate({
    title: "Team Role Changed",
    preheader: `Your role in ${data.teamName} has changed`,
    content,
  });

  const text =
    renderPlainText(content) +
    "\n\nWriteCraft - Tools for Creative Writers\nhttps://writecraft.app";

  return { html, text };
}

// Usage Limit Templates

export function renderUsageLimitWarningEmail(data: UsageLimitEmailData): {
  html: string;
  text: string;
} {
  const content = `
    <h2>Usage Limit Warning</h2>
    <p>Hi ${data.userName},</p>
    
    <div class="warning-box">
      <p><strong>You've used ${data.percentageUsed}% of your ${data.limitType} limit</strong></p>
      <p style="margin-top: 8px;">Current usage: ${data.currentUsage.toLocaleString()} / ${data.limit.toLocaleString()}</p>
    </div>
    
    <p>You're approaching your monthly ${data.limitType} limit. Once you reach the limit, you'll need to wait until your quota resets or upgrade your plan.</p>
    
    <p><strong>Options to continue:</strong></p>
    <ul style="color: #4a5568; line-height: 1.8;">
      <li>Upgrade to a higher plan for more capacity</li>
      <li>Wait for your monthly quota to reset</li>
      <li>Optimize your usage patterns</li>
    </ul>
    
    <a href="https://writecraft.app/settings/billing" class="button">Upgrade Plan</a>
  `;

  const html = renderBaseTemplate({
    title: "Usage Limit Warning",
    preheader: `You've used ${data.percentageUsed}% of your ${data.limitType} limit`,
    content,
  });

  const text =
    renderPlainText(content) +
    "\n\nWriteCraft - Tools for Creative Writers\nhttps://writecraft.app";

  return { html, text };
}

export function renderGracePeriodStartedEmail(data: UsageLimitEmailData): {
  html: string;
  text: string;
} {
  const content = `
    <h2>Grace Period Started</h2>
    <p>Hi ${data.userName},</p>
    
    <div class="warning-box">
      <p><strong>You have exceeded your ${data.limitType} limit</strong></p>
      <p style="margin-top: 8px;">Current usage: ${data.currentUsage.toLocaleString()} / ${data.limit.toLocaleString()}</p>
      <p>Grace period: ${data.gracePeriodDays} days remaining</p>
    </div>
    
    <p>You have ${data.gracePeriodDays} days to either upgrade your plan or reduce your usage. After the grace period, access to certain features may be restricted.</p>
    
    <p><strong>What happens after the grace period:</strong></p>
    <ul style="color: #4a5568; line-height: 1.8;">
      <li>Features may be temporarily disabled</li>
      <li>You can still access your existing content</li>
      <li>Upgrade anytime to restore full access</li>
    </ul>
    
    <a href="https://writecraft.app/settings/billing" class="button">Upgrade Now</a>
  `;

  const html = renderBaseTemplate({
    title: "Grace Period Started",
    preheader: `${data.gracePeriodDays} days to upgrade or reduce usage`,
    content,
  });

  const text =
    renderPlainText(content) +
    "\n\nWriteCraft - Tools for Creative Writers\nhttps://writecraft.app";

  return { html, text };
}

export function renderGracePeriodEndingEmail(data: UsageLimitEmailData): {
  html: string;
  text: string;
} {
  const content = `
    <h2>Grace Period Ending Soon</h2>
    <p>Hi ${data.userName},</p>
    
    <div class="alert-box">
      <p><strong>Your grace period ends in ${data.gracePeriodDays} days</strong></p>
      <p style="margin-top: 8px;">After this, some features will be temporarily restricted.</p>
    </div>
    
    <p>You've exceeded your ${data.limitType} limit and your grace period is about to expire.</p>
    
    <p><strong>To avoid service interruption:</strong></p>
    <ul style="color: #4a5568; line-height: 1.8;">
      <li>Upgrade to a higher plan</li>
      <li>Wait for your monthly quota to reset</li>
      <li>Reduce your current usage</li>
    </ul>
    
    <a href="https://writecraft.app/settings/billing" class="button">Upgrade Now</a>
    
    <p>If you have any questions, our support team is here to help.</p>
  `;

  const html = renderBaseTemplate({
    title: "Grace Period Ending",
    preheader: `Only ${data.gracePeriodDays} days left in your grace period`,
    content,
  });

  const text =
    renderPlainText(content) +
    "\n\nWriteCraft - Tools for Creative Writers\nhttps://writecraft.app";

  return { html, text };
}

export function renderLimitExceededEmail(data: UsageLimitEmailData): {
  html: string;
  text: string;
} {
  const content = `
    <h2>Usage Limit Reached</h2>
    <p>Hi ${data.userName},</p>
    
    <div class="alert-box">
      <p><strong>You have reached your ${data.limitType} limit</strong></p>
      <p style="margin-top: 8px;">Current usage: ${data.currentUsage.toLocaleString()} / ${data.limit.toLocaleString()}</p>
    </div>
    
    <p>You've reached your monthly ${data.limitType} limit. To continue using this feature, you'll need to upgrade your plan or wait for your quota to reset.</p>
    
    <p><strong>What you can do:</strong></p>
    <ul style="color: #4a5568; line-height: 1.8;">
      <li>Upgrade to a plan with higher limits</li>
      <li>Wait for your monthly quota to reset</li>
      <li>Access your existing content (always available)</li>
    </ul>
    
    <a href="https://writecraft.app/settings/billing" class="button">View Upgrade Options</a>
  `;

  const html = renderBaseTemplate({
    title: "Limit Reached",
    preheader: `You've reached your ${data.limitType} limit`,
    content,
  });

  const text =
    renderPlainText(content) +
    "\n\nWriteCraft - Tools for Creative Writers\nhttps://writecraft.app";

  return { html, text };
}
