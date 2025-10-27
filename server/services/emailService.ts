import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import { logger } from '../utils/logger';
import * as emailTemplates from '../templates/email/emailTemplates';

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text: string;
  from?: string;
}

export interface SubscriptionEmailData {
  userName: string;
  planName: string;
  amount?: string;
  periodEnd?: Date;
  cancelAtPeriodEnd?: boolean;
}

export interface PaymentEmailData {
  userName: string;
  amount: string;
  last4?: string;
  invoiceUrl?: string;
  failureReason?: string;
}

export interface SecurityEmailData {
  userName: string;
  device?: string;
  location?: string;
  ipAddress?: string;
  timestamp?: Date;
}

export interface TeamEmailData {
  recipientName: string;
  teamName: string;
  inviterName?: string;
  role?: string;
  inviteToken?: string;
}

export interface UsageLimitEmailData {
  userName: string;
  limitType: string;
  currentUsage: number;
  limit: number;
  percentageUsed: number;
  gracePeriodDays?: number;
}

class EmailService {
  private transporter: Transporter | null = null;
  private from: string;
  private testMode: boolean;
  private initialized = false;

  constructor() {
    // Default "from" address
    this.from = process.env.EMAIL_FROM || 'WriteCraft <admin@writecraft.app>';
    
    // Test mode: if true, emails are logged instead of sent
    this.testMode = process.env.EMAIL_TEST_MODE === 'true';
    
    this.initializeTransporter();
  }

  private initializeTransporter() {
    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = process.env.SMTP_PORT;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;

    if (this.testMode) {
      logger.info('[EmailService] Running in TEST MODE - emails will be logged but not sent');
      this.initialized = true;
      return;
    }

    if (!smtpHost || !smtpPort || !smtpUser || !smtpPass) {
      logger.warn('[EmailService] SMTP credentials not configured - email notifications disabled');
      logger.warn('[EmailService] Required env vars: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS');
      return;
    }

    try {
      this.transporter = nodemailer.createTransport({
        host: smtpHost,
        port: parseInt(smtpPort),
        secure: parseInt(smtpPort) === 465, // true for 465, false for other ports
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
        // Zoho-specific settings
        connectionTimeout: 10000,
        greetingTimeout: 10000,
      });

      this.initialized = true;
      logger.info('[EmailService] Email service initialized successfully');
    } catch (error) {
      logger.error('[EmailService] Failed to initialize email service:', error);
    }
  }

  private async sendEmail(options: EmailOptions): Promise<boolean> {
    if (!this.initialized) {
      logger.warn('[EmailService] Email service not initialized - skipping email to:', options.to);
      return false;
    }

    if (this.testMode) {
      logger.info('[EmailService] TEST MODE - Would send email:', {
        to: options.to,
        subject: options.subject,
        from: options.from || this.from,
        textPreview: options.text.substring(0, 100),
      });
      return true;
    }

    if (!this.transporter) {
      logger.error('[EmailService] Transporter not available');
      return false;
    }

    try {
      const info = await this.transporter.sendMail({
        from: options.from || this.from,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
      });

      logger.info('[EmailService] Email sent successfully:', {
        to: options.to,
        subject: options.subject,
        messageId: info.messageId,
      });

      return true;
    } catch (error) {
      logger.error('[EmailService] Failed to send email:', {
        to: options.to,
        subject: options.subject,
        error,
      });
      return false;
    }
  }

  // Subscription & Billing Emails

  async sendWelcomeEmail(email: string, userName: string): Promise<boolean> {
    const subject = 'Welcome to WriteCraft!';
    const { html, text } = this.renderWelcomeEmail(userName);
    
    return this.sendEmail({ to: email, subject, html, text });
  }

  async sendSubscriptionActivated(email: string, data: SubscriptionEmailData): Promise<boolean> {
    const subject = `Your ${data.planName} subscription is now active`;
    const { html, text } = this.renderSubscriptionActivatedEmail(data);
    
    return this.sendEmail({ to: email, subject, html, text });
  }

  async sendSubscriptionCanceled(email: string, data: SubscriptionEmailData): Promise<boolean> {
    const subject = 'Your WriteCraft subscription has been canceled';
    const { html, text } = this.renderSubscriptionCanceledEmail(data);
    
    return this.sendEmail({ to: email, subject, html, text });
  }

  async sendSubscriptionReactivated(email: string, data: SubscriptionEmailData): Promise<boolean> {
    const subject = 'Your WriteCraft subscription has been reactivated';
    const { html, text } = this.renderSubscriptionReactivatedEmail(data);
    
    return this.sendEmail({ to: email, subject, html, text });
  }

  async sendPaymentSuccessful(email: string, data: PaymentEmailData): Promise<boolean> {
    const subject = 'Payment receipt from WriteCraft';
    const { html, text } = this.renderPaymentSuccessfulEmail(data);
    
    return this.sendEmail({ to: email, subject, html, text });
  }

  async sendPaymentFailed(email: string, data: PaymentEmailData): Promise<boolean> {
    const subject = 'Payment failed - Action required';
    const { html, text } = this.renderPaymentFailedEmail(data);
    
    return this.sendEmail({ to: email, subject, html, text });
  }

  async sendRefundProcessed(email: string, data: PaymentEmailData): Promise<boolean> {
    const subject = 'Your refund has been processed';
    const { html, text } = this.renderRefundProcessedEmail(data);
    
    return this.sendEmail({ to: email, subject, html, text });
  }

  // Security Emails

  async sendMfaEnabled(email: string, data: SecurityEmailData): Promise<boolean> {
    const subject = 'Two-factor authentication enabled';
    const { html, text } = this.renderMfaEnabledEmail(data);
    
    return this.sendEmail({ to: email, subject, html, text });
  }

  async sendMfaDisabled(email: string, data: SecurityEmailData): Promise<boolean> {
    const subject = 'Two-factor authentication disabled';
    const { html, text } = this.renderMfaDisabledEmail(data);
    
    return this.sendEmail({ to: email, subject, html, text });
  }

  async sendNewDeviceLogin(email: string, data: SecurityEmailData): Promise<boolean> {
    const subject = 'New login to your WriteCraft account';
    const { html, text } = this.renderNewDeviceLoginEmail(data);
    
    return this.sendEmail({ to: email, subject, html, text });
  }

  async sendPasswordChanged(email: string, data: SecurityEmailData): Promise<boolean> {
    const subject = 'Your WriteCraft password was changed';
    const { html, text } = this.renderPasswordChangedEmail(data);
    
    return this.sendEmail({ to: email, subject, html, text });
  }

  async sendAccountDeletionScheduled(email: string, userName: string, deletionDate: Date): Promise<boolean> {
    const subject = 'Your WriteCraft account will be deleted';
    const { html, text } = this.renderAccountDeletionScheduledEmail(userName, deletionDate);
    
    return this.sendEmail({ to: email, subject, html, text });
  }

  // Team Emails

  async sendTeamInvitation(email: string, data: TeamEmailData): Promise<boolean> {
    const subject = `You've been invited to join ${data.teamName} on WriteCraft`;
    const { html, text } = this.renderTeamInvitationEmail(data);
    
    return this.sendEmail({ to: email, subject, html, text });
  }

  async sendTeamMemberRemoved(email: string, data: TeamEmailData): Promise<boolean> {
    const subject = `You've been removed from ${data.teamName}`;
    const { html, text } = this.renderTeamMemberRemovedEmail(data);
    
    return this.sendEmail({ to: email, subject, html, text });
  }

  async sendTeamRoleChanged(email: string, data: TeamEmailData): Promise<boolean> {
    const subject = `Your role in ${data.teamName} has changed`;
    const { html, text } = this.renderTeamRoleChangedEmail(data);
    
    return this.sendEmail({ to: email, subject, html, text });
  }

  // Usage Limit Emails

  async sendUsageLimitWarning(email: string, data: UsageLimitEmailData): Promise<boolean> {
    const subject = `You've used ${data.percentageUsed}% of your ${data.limitType} limit`;
    const { html, text } = this.renderUsageLimitWarningEmail(data);
    
    return this.sendEmail({ to: email, subject, html, text });
  }

  async sendGracePeriodStarted(email: string, data: UsageLimitEmailData): Promise<boolean> {
    const subject = 'You have exceeded your plan limits';
    const { html, text } = this.renderGracePeriodStartedEmail(data);
    
    return this.sendEmail({ to: email, subject, html, text });
  }

  async sendGracePeriodEnding(email: string, data: UsageLimitEmailData): Promise<boolean> {
    const subject = 'Your grace period is ending soon';
    const { html, text } = this.renderGracePeriodEndingEmail(data);
    
    return this.sendEmail({ to: email, subject, html, text });
  }

  async sendLimitExceeded(email: string, data: UsageLimitEmailData): Promise<boolean> {
    const subject = 'You have reached your plan limits';
    const { html, text } = this.renderLimitExceededEmail(data);
    
    return this.sendEmail({ to: email, subject, html, text });
  }

  // Template rendering methods
  private renderWelcomeEmail(userName: string): { html: string; text: string } {
    return emailTemplates.renderWelcomeEmail(userName);
  }

  private renderSubscriptionActivatedEmail(data: SubscriptionEmailData): { html: string; text: string } {
    return emailTemplates.renderSubscriptionActivatedEmail(data);
  }

  private renderSubscriptionCanceledEmail(data: SubscriptionEmailData): { html: string; text: string } {
    return emailTemplates.renderSubscriptionCanceledEmail(data);
  }

  private renderSubscriptionReactivatedEmail(data: SubscriptionEmailData): { html: string; text: string } {
    return emailTemplates.renderSubscriptionReactivatedEmail(data);
  }

  private renderPaymentSuccessfulEmail(data: PaymentEmailData): { html: string; text: string } {
    return emailTemplates.renderPaymentSuccessfulEmail(data);
  }

  private renderPaymentFailedEmail(data: PaymentEmailData): { html: string; text: string } {
    return emailTemplates.renderPaymentFailedEmail(data);
  }

  private renderRefundProcessedEmail(data: PaymentEmailData): { html: string; text: string } {
    return emailTemplates.renderRefundProcessedEmail(data);
  }

  private renderMfaEnabledEmail(data: SecurityEmailData): { html: string; text: string } {
    return emailTemplates.renderMfaEnabledEmail(data);
  }

  private renderMfaDisabledEmail(data: SecurityEmailData): { html: string; text: string } {
    return emailTemplates.renderMfaDisabledEmail(data);
  }

  private renderNewDeviceLoginEmail(data: SecurityEmailData): { html: string; text: string } {
    return emailTemplates.renderNewDeviceLoginEmail(data);
  }

  private renderPasswordChangedEmail(data: SecurityEmailData): { html: string; text: string } {
    return emailTemplates.renderPasswordChangedEmail(data);
  }

  private renderAccountDeletionScheduledEmail(userName: string, deletionDate: Date): { html: string; text: string } {
    return emailTemplates.renderAccountDeletionScheduledEmail(userName, deletionDate);
  }

  private renderTeamInvitationEmail(data: TeamEmailData): { html: string; text: string } {
    return emailTemplates.renderTeamInvitationEmail(data);
  }

  private renderTeamMemberRemovedEmail(data: TeamEmailData): { html: string; text: string } {
    return emailTemplates.renderTeamMemberRemovedEmail(data);
  }

  private renderTeamRoleChangedEmail(data: TeamEmailData): { html: string; text: string } {
    return emailTemplates.renderTeamRoleChangedEmail(data);
  }

  private renderUsageLimitWarningEmail(data: UsageLimitEmailData): { html: string; text: string } {
    return emailTemplates.renderUsageLimitWarningEmail(data);
  }

  private renderGracePeriodStartedEmail(data: UsageLimitEmailData): { html: string; text: string } {
    return emailTemplates.renderGracePeriodStartedEmail(data);
  }

  private renderGracePeriodEndingEmail(data: UsageLimitEmailData): { html: string; text: string } {
    return emailTemplates.renderGracePeriodEndingEmail(data);
  }

  private renderLimitExceededEmail(data: UsageLimitEmailData): { html: string; text: string } {
    return emailTemplates.renderLimitExceededEmail(data);
  }
}

// Export singleton instance
export const emailService = new EmailService();
