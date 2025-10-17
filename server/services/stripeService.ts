import Stripe from 'stripe';
import { db } from '../db';
import { userSubscriptions, users } from '@shared/schema';
import { eq } from 'drizzle-orm';
import type { SubscriptionTier } from '@shared/types/subscription';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-09-30.clover',
});

// Stripe Price IDs for each tier and billing cycle
// You'll need to create these in Stripe Dashboard and set them as environment variables
export const STRIPE_PRICE_IDS = {
  author: {
    monthly: process.env.STRIPE_PRICE_ID_AUTHOR_MONTHLY || 'price_author_monthly',
    annual: process.env.STRIPE_PRICE_ID_AUTHOR_ANNUAL || 'price_author_annual',
  },
  professional: {
    monthly: process.env.STRIPE_PRICE_ID_PRO_MONTHLY || 'price_pro_monthly',
    annual: process.env.STRIPE_PRICE_ID_PRO_ANNUAL || 'price_pro_annual',
  },
  team: {
    monthly: process.env.STRIPE_PRICE_ID_TEAM_MONTHLY || 'price_team_monthly',
    annual: process.env.STRIPE_PRICE_ID_TEAM_ANNUAL || 'price_team_annual',
  },
};

export class StripeService {
  /**
   * Create Stripe checkout session for subscription
   */
  async createCheckoutSession(params: {
    userId: string;
    email: string;
    tier: Exclude<SubscriptionTier, 'free'>;
    billingCycle: 'monthly' | 'annual';
  }) {
    const priceId = STRIPE_PRICE_IDS[params.tier][params.billingCycle];

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer_email: params.email,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.BASE_URL || 'http://localhost:5000'}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.BASE_URL || 'http://localhost:5000'}/pricing`,
      metadata: {
        userId: params.userId,
        tier: params.tier,
      },
      subscription_data: {
        trial_period_days: 14,
        metadata: {
          userId: params.userId,
          tier: params.tier,
        },
      },
      allow_promotion_codes: true,
    });

    return session;
  }

  /**
   * Create customer portal session for managing billing
   */
  async createPortalSession(customerId: string) {
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${process.env.BASE_URL || 'http://localhost:5000'}/settings/billing`,
    });

    return session;
  }

  /**
   * Handle Stripe webhook events
   */
  async handleWebhook(event: Stripe.Event) {
    console.log(`[Stripe] Processing webhook event: ${event.type}`);

    try {
      switch (event.type) {
        case 'checkout.session.completed':
          await this.handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
          break;

        case 'customer.subscription.updated':
          await this.handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
          break;

        case 'customer.subscription.deleted':
          await this.handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
          break;

        case 'invoice.payment_failed':
          await this.handlePaymentFailed(event.data.object as Stripe.Invoice);
          break;

        case 'customer.subscription.trial_will_end':
          await this.handleTrialWillEnd(event.data.object as Stripe.Subscription);
          break;

        default:
          console.log(`[Stripe] Unhandled webhook event type: ${event.type}`);
      }
    } catch (error) {
      console.error(`[Stripe] Error handling webhook ${event.type}:`, error);
      throw error;
    }
  }

  /**
   * Handle successful checkout completion
   */
  private async handleCheckoutCompleted(session: Stripe.Checkout.Session) {
    const userId = session.metadata!.userId;
    const tier = session.metadata!.tier as SubscriptionTier;

    // Get subscription details from Stripe
    const subscription = await stripe.subscriptions.retrieve(session.subscription as string);

    // Get user email for logging
    const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);

    console.log(`[Stripe] Checkout completed for user ${userId} (${user?.email}), tier: ${tier}`);

    // Create or update user subscription in database
    await db
      .insert(userSubscriptions)
      .values({
        userId,
        tier,
        status: subscription.status === 'trialing' ? 'trialing' : 'active',
        stripeCustomerId: session.customer as string,
        stripeSubscriptionId: subscription.id,
        stripePriceId: subscription.items.data[0].price.id,
        currentPeriodStart: new Date((subscription as any).current_period_start * 1000),
        currentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
        trialStart: subscription.trial_start ? new Date(subscription.trial_start * 1000) : null,
        trialEnd: subscription.trial_end ? new Date(subscription.trial_end * 1000) : null,
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
      })
      .onConflictDoUpdate({
        target: userSubscriptions.userId,
        set: {
          tier,
          status: subscription.status === 'trialing' ? 'trialing' : 'active',
          stripeCustomerId: session.customer as string,
          stripeSubscriptionId: subscription.id,
          stripePriceId: subscription.items.data[0].price.id,
          currentPeriodStart: new Date((subscription as any).current_period_start * 1000),
          currentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
          trialStart: subscription.trial_start ? new Date(subscription.trial_start * 1000) : null,
          trialEnd: subscription.trial_end ? new Date(subscription.trial_end * 1000) : null,
          cancelAtPeriodEnd: subscription.cancel_at_period_end,
          updatedAt: new Date(),
        },
      });

    console.log(`[Stripe] Subscription created/updated for user ${userId}`);
  }

  /**
   * Handle subscription update (upgrade, downgrade, renewal)
   */
  private async handleSubscriptionUpdated(subscription: Stripe.Subscription) {
    const userId = subscription.metadata.userId;
    const tier = subscription.metadata.tier as SubscriptionTier;

    console.log(`[Stripe] Subscription updated for user ${userId}, status: ${subscription.status}`);

    // Map Stripe status to our status
    let status: 'active' | 'past_due' | 'canceled' | 'trialing' = 'active';
    if (subscription.status === 'past_due') status = 'past_due';
    else if (subscription.status === 'canceled') status = 'canceled';
    else if (subscription.status === 'trialing') status = 'trialing';

    await db
      .update(userSubscriptions)
      .set({
        tier,
        status,
        stripePriceId: subscription.items.data[0].price.id,
        currentPeriodStart: new Date((subscription as any).current_period_start * 1000),
        currentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        updatedAt: new Date(),
      })
      .where(eq(userSubscriptions.stripeSubscriptionId, subscription.id));

    console.log(`[Stripe] Subscription updated in database for user ${userId}`);
  }

  /**
   * Handle subscription deletion (cancellation or non-payment)
   */
  private async handleSubscriptionDeleted(subscription: Stripe.Subscription) {
    const userId = subscription.metadata.userId;

    console.log(`[Stripe] Subscription deleted for user ${userId}`);

    // Downgrade to free tier
    await db
      .update(userSubscriptions)
      .set({
        tier: 'free',
        status: 'canceled',
        cancelAtPeriodEnd: false,
        updatedAt: new Date(),
      })
      .where(eq(userSubscriptions.stripeSubscriptionId, subscription.id));

    console.log(`[Stripe] User ${userId} downgraded to free tier`);
  }

  /**
   * Handle payment failure
   */
  private async handlePaymentFailed(invoice: Stripe.Invoice) {
    const subscriptionId = (invoice as any).subscription as string;

    console.log(`[Stripe] Payment failed for subscription ${subscriptionId}`);

    // Mark subscription as past_due
    await db
      .update(userSubscriptions)
      .set({
        status: 'past_due',
        updatedAt: new Date(),
      })
      .where(eq(userSubscriptions.stripeSubscriptionId, subscriptionId));

    // TODO: Send email notification to user about payment failure
  }

  /**
   * Handle trial ending soon (3 days before)
   */
  private async handleTrialWillEnd(subscription: Stripe.Subscription) {
    const userId = subscription.metadata.userId;

    console.log(`[Stripe] Trial ending soon for user ${userId}`);

    // TODO: Send email notification to user about trial ending
    // This is a good opportunity to remind them of the value they're getting
  }

  /**
   * Cancel subscription at period end
   */
  async cancelSubscription(subscriptionId: string) {
    const subscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    });

    await db
      .update(userSubscriptions)
      .set({
        cancelAtPeriodEnd: true,
        updatedAt: new Date(),
      })
      .where(eq(userSubscriptions.stripeSubscriptionId, subscriptionId));

    return subscription;
  }

  /**
   * Reactivate a canceled subscription
   */
  async reactivateSubscription(subscriptionId: string) {
    const subscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: false,
    });

    await db
      .update(userSubscriptions)
      .set({
        cancelAtPeriodEnd: false,
        status: 'active',
        updatedAt: new Date(),
      })
      .where(eq(userSubscriptions.stripeSubscriptionId, subscriptionId));

    return subscription;
  }

  /**
   * Get subscription from Stripe
   */
  async getStripeSubscription(subscriptionId: string) {
    return await stripe.subscriptions.retrieve(subscriptionId);
  }

  /**
   * Preview subscription change with proration details
   * Returns breakdown of charges/credits when upgrading or downgrading
   */
  async previewSubscriptionChange(params: {
    subscriptionId: string;
    newPriceId: string;
  }) {
    try {
      const subscription = await stripe.subscriptions.retrieve(params.subscriptionId);
      
      // Get the upcoming invoice with the proposed changes
      const upcomingInvoice = await stripe.invoices.retrieveUpcoming({
        customer: subscription.customer as string,
        subscription: params.subscriptionId,
        subscription_items: [
          {
            id: subscription.items.data[0].id,
            price: params.newPriceId,
          },
        ],
        subscription_proration_behavior: 'always_invoice',
        subscription_proration_date: Math.floor(Date.now() / 1000),
      });

      // Calculate proration details
      const prorationLineItems = upcomingInvoice.lines.data.filter(
        line => line.proration
      );

      const immediateCharge = upcomingInvoice.amount_due;
      const subtotal = upcomingInvoice.subtotal;
      const credits = prorationLineItems
        .filter(line => line.amount < 0)
        .reduce((sum, line) => sum + Math.abs(line.amount), 0);
      const newCharges = prorationLineItems
        .filter(line => line.amount > 0)
        .reduce((sum, line) => sum + line.amount, 0);

      return {
        immediateCharge: immediateCharge / 100, // Convert to dollars
        subtotal: subtotal / 100,
        credits: credits / 100,
        newCharges: newCharges / 100,
        nextBillingDate: new Date(subscription.current_period_end * 1000),
        nextBillingAmount: upcomingInvoice.total / 100,
        currency: upcomingInvoice.currency,
        lineItems: upcomingInvoice.lines.data.map(line => ({
          description: line.description || '',
          amount: line.amount / 100,
          isProration: line.proration || false,
        })),
      };
    } catch (error) {
      console.error('[Stripe] Error previewing subscription change:', error);
      throw error;
    }
  }
}

export const stripeService = new StripeService();
