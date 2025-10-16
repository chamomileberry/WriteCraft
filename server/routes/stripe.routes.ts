import { Router } from 'express';
import Stripe from 'stripe';
import { stripeService } from '../services/stripeService';
import { subscriptionService } from '../services/subscriptionService';
import { isAuthenticated } from '../replitAuth';

const router = Router();

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-09-30.clover',
});

/**
 * Create Stripe checkout session for subscription
 * POST /api/stripe/create-checkout
 */
router.post('/create-checkout', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const { tier, billingCycle } = req.body;

    // Validate tier
    if (!['author', 'professional', 'team'].includes(tier)) {
      return res.status(400).json({ error: 'Invalid tier' });
    }

    // Validate billing cycle
    if (!['monthly', 'annual'].includes(billingCycle)) {
      return res.status(400).json({ error: 'Invalid billing cycle' });
    }

    // Get user email
    const email = req.user.claims.email;
    if (!email) {
      return res.status(400).json({ error: 'User email not found' });
    }

    // Create checkout session
    const session = await stripeService.createCheckoutSession({
      userId,
      email,
      tier,
      billingCycle,
    });

    res.json({ url: session.url });
  } catch (error: any) {
    console.error('[Stripe] Error creating checkout session:', error);
    res.status(500).json({ error: 'Failed to create checkout session', message: error.message });
  }
});

/**
 * Create customer portal session for billing management
 * POST /api/stripe/create-portal
 */
router.post('/create-portal', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;

    // Get user's subscription
    const subscription = await subscriptionService.getUserSubscription(userId);

    if (!subscription.stripeCustomerId) {
      return res.status(400).json({ error: 'No active subscription found' });
    }

    // Create portal session
    const session = await stripeService.createPortalSession(subscription.stripeCustomerId);

    res.json({ url: session.url });
  } catch (error: any) {
    console.error('[Stripe] Error creating portal session:', error);
    res.status(500).json({ error: 'Failed to create portal session', message: error.message });
  }
});

/**
 * Cancel subscription at period end
 * POST /api/stripe/cancel-subscription
 */
router.post('/cancel-subscription', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;

    // Get user's subscription
    const subscription = await subscriptionService.getUserSubscription(userId);

    if (!subscription.stripeSubscriptionId) {
      return res.status(400).json({ error: 'No active subscription found' });
    }

    // Cancel subscription
    await stripeService.cancelSubscription(subscription.stripeSubscriptionId);

    res.json({ success: true, message: 'Subscription will be canceled at the end of the billing period' });
  } catch (error: any) {
    console.error('[Stripe] Error canceling subscription:', error);
    res.status(500).json({ error: 'Failed to cancel subscription', message: error.message });
  }
});

/**
 * Reactivate a canceled subscription
 * POST /api/stripe/reactivate-subscription
 */
router.post('/reactivate-subscription', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;

    // Get user's subscription
    const subscription = await subscriptionService.getUserSubscription(userId);

    if (!subscription.stripeSubscriptionId) {
      return res.status(400).json({ error: 'No subscription found' });
    }

    if (!subscription.cancelAtPeriodEnd) {
      return res.status(400).json({ error: 'Subscription is not scheduled for cancellation' });
    }

    // Reactivate subscription
    await stripeService.reactivateSubscription(subscription.stripeSubscriptionId);

    res.json({ success: true, message: 'Subscription reactivated successfully' });
  } catch (error: any) {
    console.error('[Stripe] Error reactivating subscription:', error);
    res.status(500).json({ error: 'Failed to reactivate subscription', message: error.message });
  }
});

/**
 * Stripe webhook endpoint
 * POST /api/stripe/webhook
 * 
 * IMPORTANT: This endpoint must be registered in Stripe Dashboard:
 * https://dashboard.stripe.com/webhooks
 * 
 * Events to listen for:
 * - checkout.session.completed
 * - customer.subscription.updated
 * - customer.subscription.deleted
 * - invoice.payment_failed
 * - customer.subscription.trial_will_end
 */
router.post('/webhook', async (req, res) => {
  const sig = req.headers['stripe-signature'] as string;

  let event: Stripe.Event;

  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET || ''
    );
  } catch (err: any) {
    console.error('[Stripe] Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    // Handle the event
    await stripeService.handleWebhook(event);

    res.json({ received: true });
  } catch (error: any) {
    console.error('[Stripe] Webhook handler error:', error);
    res.status(500).json({ error: 'Webhook handler failed', message: error.message });
  }
});

export default router;
