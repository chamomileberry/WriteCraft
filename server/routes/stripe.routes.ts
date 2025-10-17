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
 * Create setup intent for adding a new payment method
 * POST /api/stripe/create-setup-intent
 */
router.post('/create-setup-intent', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;

    // Get user's subscription
    const subscription = await subscriptionService.getUserSubscription(userId);

    let customerId = subscription.stripeCustomerId;

    // If no customer exists, create one
    if (!customerId) {
      const email = req.user.claims.email;
      const customer = await stripe.customers.create({
        email,
        metadata: { userId },
      });
      customerId = customer.id;

      // Update subscription with customer ID
      await subscriptionService.updateSubscription(userId, {
        stripeCustomerId: customerId,
      });
    }

    // Create setup intent
    const setupIntent = await stripe.setupIntents.create({
      customer: customerId,
      payment_method_types: ['card'],
    });

    res.json({ clientSecret: setupIntent.client_secret });
  } catch (error: any) {
    console.error('[Stripe] Error creating setup intent:', error);
    res.status(500).json({ error: 'Failed to create setup intent', message: error.message });
  }
});

/**
 * List payment methods for current user
 * GET /api/stripe/payment-methods
 */
router.get('/payment-methods', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;

    // Get user's subscription
    const subscription = await subscriptionService.getUserSubscription(userId);

    if (!subscription.stripeCustomerId) {
      return res.json({ paymentMethods: [] });
    }

    // Get payment methods from Stripe
    const paymentMethods = await stripe.paymentMethods.list({
      customer: subscription.stripeCustomerId,
      type: 'card',
    });

    // Get customer to find default payment method
    const customer = await stripe.customers.retrieve(subscription.stripeCustomerId);
    const defaultPaymentMethodId = (customer && !customer.deleted)
      ? customer.invoice_settings?.default_payment_method 
      : null;

    res.json({
      paymentMethods: paymentMethods.data.map(pm => ({
        id: pm.id,
        brand: pm.card?.brand,
        last4: pm.card?.last4,
        expMonth: pm.card?.exp_month,
        expYear: pm.card?.exp_year,
        isDefault: pm.id === defaultPaymentMethodId,
      })),
    });
  } catch (error: any) {
    console.error('[Stripe] Error listing payment methods:', error);
    res.status(500).json({ error: 'Failed to list payment methods', message: error.message });
  }
});

/**
 * Delete a payment method
 * DELETE /api/stripe/payment-methods/:id
 */
router.delete('/payment-methods/:id', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const paymentMethodId = req.params.id;

    // Get user's subscription
    const subscription = await subscriptionService.getUserSubscription(userId);

    if (!subscription.stripeCustomerId) {
      return res.status(400).json({ error: 'No customer found' });
    }

    // Verify payment method belongs to this customer
    const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId);
    if (paymentMethod.customer !== subscription.stripeCustomerId) {
      return res.status(403).json({ error: 'Payment method does not belong to this customer' });
    }

    // Detach payment method
    await stripe.paymentMethods.detach(paymentMethodId);

    res.json({ success: true });
  } catch (error: any) {
    console.error('[Stripe] Error deleting payment method:', error);
    res.status(500).json({ error: 'Failed to delete payment method', message: error.message });
  }
});

/**
 * Set default payment method
 * POST /api/stripe/payment-methods/:id/set-default
 */
router.post('/payment-methods/:id/set-default', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const paymentMethodId = req.params.id;

    // Get user's subscription
    const subscription = await subscriptionService.getUserSubscription(userId);

    if (!subscription.stripeCustomerId) {
      return res.status(400).json({ error: 'No customer found' });
    }

    // Verify payment method belongs to this customer
    const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId);
    if (paymentMethod.customer !== subscription.stripeCustomerId) {
      return res.status(403).json({ error: 'Payment method does not belong to this customer' });
    }

    // Set as default payment method
    await stripe.customers.update(subscription.stripeCustomerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });

    res.json({ success: true });
  } catch (error: any) {
    console.error('[Stripe] Error setting default payment method:', error);
    res.status(500).json({ error: 'Failed to set default payment method', message: error.message });
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
