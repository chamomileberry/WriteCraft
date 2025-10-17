import { db } from '../db';
import { billingAlerts, type InsertBillingAlert } from '@shared/schema';
import { eq, and, desc } from 'drizzle-orm';

export class BillingAlertsService {
  /**
   * Create a new billing alert
   */
  async createAlert(alertData: InsertBillingAlert) {
    const [alert] = await db
      .insert(billingAlerts)
      .values(alertData)
      .returning();
    
    return alert;
  }

  /**
   * Get all alerts for a user
   */
  async getUserAlerts(userId: string, status?: string) {
    const conditions = [eq(billingAlerts.userId, userId)];
    
    if (status) {
      conditions.push(eq(billingAlerts.status, status));
    }
    
    const alerts = await db
      .select()
      .from(billingAlerts)
      .where(and(...conditions))
      .orderBy(desc(billingAlerts.createdAt));
    
    return alerts;
  }

  /**
   * Get unread alert count for a user
   */
  async getUnreadCount(userId: string) {
    const alerts = await db
      .select()
      .from(billingAlerts)
      .where(
        and(
          eq(billingAlerts.userId, userId),
          eq(billingAlerts.status, 'unread')
        )
      );
    
    return alerts.length;
  }

  /**
   * Mark an alert as read
   */
  async markAsRead(alertId: string, userId: string) {
    const [alert] = await db
      .update(billingAlerts)
      .set({ status: 'read', updatedAt: new Date() })
      .where(
        and(
          eq(billingAlerts.id, alertId),
          eq(billingAlerts.userId, userId)
        )
      )
      .returning();
    
    return alert;
  }

  /**
   * Dismiss an alert
   */
  async dismissAlert(alertId: string, userId: string) {
    const [alert] = await db
      .update(billingAlerts)
      .set({ 
        status: 'dismissed', 
        dismissedAt: new Date(),
        updatedAt: new Date()
      })
      .where(
        and(
          eq(billingAlerts.id, alertId),
          eq(billingAlerts.userId, userId)
        )
      )
      .returning();
    
    return alert;
  }

  /**
   * Resolve an alert
   */
  async resolveAlert(alertId: string, userId: string) {
    const [alert] = await db
      .update(billingAlerts)
      .set({ 
        status: 'resolved', 
        resolvedAt: new Date(),
        updatedAt: new Date()
      })
      .where(
        and(
          eq(billingAlerts.id, alertId),
          eq(billingAlerts.userId, userId)
        )
      )
      .returning();
    
    return alert;
  }

  /**
   * Create a payment failed alert
   */
  async createPaymentFailedAlert(
    userId: string, 
    invoiceId: string, 
    subscriptionId: string,
    amount: number,
    currency: string
  ) {
    return this.createAlert({
      userId,
      type: 'payment_failed',
      severity: 'critical',
      title: 'Payment Failed',
      message: `Your payment of ${(amount / 100).toFixed(2)} ${currency.toUpperCase()} failed. Please update your payment method to continue your subscription.`,
      stripeInvoiceId: invoiceId,
      stripeSubscriptionId: subscriptionId,
      status: 'unread',
      metadata: { amount, currency }
    });
  }

  /**
   * Create a trial expiring alert
   */
  async createTrialExpiringAlert(
    userId: string,
    subscriptionId: string,
    daysRemaining: number
  ) {
    return this.createAlert({
      userId,
      type: 'trial_expiring',
      severity: 'medium',
      title: 'Trial Ending Soon',
      message: `Your trial ends in ${daysRemaining} day${daysRemaining === 1 ? '' : 's'}. Add a payment method to continue enjoying premium features.`,
      stripeSubscriptionId: subscriptionId,
      status: 'unread',
      metadata: { daysRemaining }
    });
  }

  /**
   * Create a trial expired alert
   */
  async createTrialExpiredAlert(
    userId: string,
    subscriptionId: string
  ) {
    return this.createAlert({
      userId,
      type: 'trial_expired',
      severity: 'high',
      title: 'Trial Expired',
      message: 'Your trial has expired. Upgrade to a paid plan to continue using premium features.',
      stripeSubscriptionId: subscriptionId,
      status: 'unread'
    });
  }

  /**
   * Create an invoice due alert
   */
  async createInvoiceDueAlert(
    userId: string,
    invoiceId: string,
    subscriptionId: string,
    amount: number,
    currency: string,
    dueDate: Date
  ) {
    return this.createAlert({
      userId,
      type: 'invoice_due',
      severity: 'medium',
      title: 'Upcoming Payment',
      message: `Your payment of ${(amount / 100).toFixed(2)} ${currency.toUpperCase()} is due on ${dueDate.toLocaleDateString()}.`,
      stripeInvoiceId: invoiceId,
      stripeSubscriptionId: subscriptionId,
      status: 'unread',
      metadata: { amount, currency, dueDate: dueDate.toISOString() }
    });
  }
}

export const billingAlertsService = new BillingAlertsService();
