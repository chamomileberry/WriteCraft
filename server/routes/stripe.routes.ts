import { Router } from 'express';
import Stripe from 'stripe';
import { stripeService } from '../services/stripeService';
import { subscriptionService } from '../services/subscriptionService';
import { isAuthenticated } from '../replitAuth';
import { storage } from '../storage';
import { emailService } from '../services/emailService';
import { billingRateLimiter, subscriptionChangeRateLimiter, readRateLimiter, writeRateLimiter } from '../security/rateLimiters';

const router = Router();

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-09-30.clover',
});

// Type guard to check if subscription has Stripe fields
function hasStripeData(sub: any): sub is { stripeCustomerId?: string | null; stripeSubscriptionId?: string | null; pausedAt?: Date | null; cancelAtPeriodEnd?: boolean } {
  return 'stripeCustomerId' in sub || 'stripeSubscriptionId' in sub;
}

/**
 * Create Stripe checkout session for subscription
 * POST /api/stripe/create-checkout
 */
router.post('/create-checkout', isAuthenticated, billingRateLimiter, async (req: any, res) => {
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

    // Get optional discount code
    const discountCode = req.body.discountCode as string | undefined;

    // Create checkout session
    const session = await stripeService.createCheckoutSession({
      userId,
      email,
      tier,
      billingCycle,
      discountCode,
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
router.post('/create-portal', isAuthenticated, billingRateLimiter, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;

    // Get user's subscription
    const subscription = await subscriptionService.getUserSubscription(userId);

    if (!('stripeCustomerId' in subscription) || !subscription.stripeCustomerId) {
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
router.post('/cancel-subscription', isAuthenticated, subscriptionChangeRateLimiter, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const { reason, feedback } = req.body;

    // Get user's subscription
    const subscription = await subscriptionService.getUserSubscription(userId);

    if (!hasStripeData(subscription) || !subscription.stripeSubscriptionId) {
      return res.status(400).json({ error: 'No active subscription found' });
    }

    // Cancel subscription
    await stripeService.cancelSubscription(subscription.stripeSubscriptionId);

    // Log cancellation reason for analytics
    console.log('[Stripe] Subscription canceled for user:', {
      userId,
      reason,
      feedback: feedback || 'No additional feedback',
      tier: subscription.tier || 'unknown',
    });

    // Submit cancellation survey to admin feedback inbox
    const userEmail = req.user.claims.email || 'unknown@example.com';
    const reasonLabels: Record<string, string> = {
      'too-expensive': 'Too expensive',
      'missing-features': 'Missing features I need',
      'technical-issues': 'Technical issues',
      'not-using': 'Not using it enough',
      'switching': 'Switching to another service',
      'temporary': 'Temporary pause',
      'other': 'Other reason',
    };

    // Sanitize user input by removing control characters
    const sanitize = (str: string) => str.replace(/[\x00-\x1F\x7F]/g, '');
    const sanitizedReason = sanitize(String(reason || ''));
    const sanitizedFeedback = sanitize(String(feedback || ''));
    const reasonLabel = reasonLabels[sanitizedReason] || 'Other reason';

    await storage.createFeedback({
      userId,
      type: 'cancellation',
      title: `Subscription Cancellation: ${reasonLabel}`,
      description: `**Cancellation Reason:** ${reasonLabel}\n**Tier:** ${subscription.tier || 'unknown'}\n\n**Feedback:**\n${sanitizedFeedback || 'No additional feedback provided.'}`,
      userEmail,
      status: 'new',
    });

    // Send cancellation confirmation email
    if (userEmail && subscription.currentPeriodEnd) {
      const userName = req.user.claims.name || userEmail.split('@')[0];
      const tierName = (subscription.tier || 'Unknown').charAt(0).toUpperCase() + (subscription.tier || 'unknown').slice(1);
      
      await emailService.sendSubscriptionCanceled(userEmail, {
        userName,
        planName: tierName,
        periodEnd: subscription.currentPeriodEnd,
        cancelAtPeriodEnd: true,
      });
    }

    res.json({ success: true, message: 'Subscription will be canceled at the end of the billing period' });
  } catch (error: any) {
    console.error('[Stripe] Error canceling subscription:', error);
    res.status(500).json({ error: 'Failed to cancel subscription', message: error.message });
  }
});

/**
 * Get customer invoices
 * GET /api/stripe/invoices
 */
router.get('/invoices', isAuthenticated, readRateLimiter, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;

    // Get user's subscription
    const subscription = await subscriptionService.getUserSubscription(userId);

    if (!hasStripeData(subscription) || !subscription.stripeCustomerId) {
      return res.json({ invoices: [] });
    }

    // Get invoices
    const invoices = await stripeService.getCustomerInvoices(subscription.stripeCustomerId);

    res.json({ invoices });
  } catch (error: any) {
    console.error('[Stripe] Error fetching invoices:', error);
    res.status(500).json({ error: 'Failed to fetch invoices', message: error.message });
  }
});

/**
 * Get specific invoice (for PDF download)
 * GET /api/stripe/invoices/:id
 */
router.get('/invoices/:id', isAuthenticated, readRateLimiter, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const { id } = req.params;

    // Get user's subscription to verify ownership
    const subscription = await subscriptionService.getUserSubscription(userId);

    if (!hasStripeData(subscription) || !subscription.stripeCustomerId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Get invoice
    const invoice = await stripeService.getInvoice(id);

    // Verify the invoice belongs to this customer
    if (invoice.customer !== subscription.stripeCustomerId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    res.json({
      id: invoice.id,
      number: invoice.number,
      pdfUrl: invoice.invoice_pdf,
      hostedUrl: invoice.hosted_invoice_url,
    });
  } catch (error: any) {
    console.error('[Stripe] Error fetching invoice:', error);
    res.status(500).json({ error: 'Failed to fetch invoice', message: error.message });
  }
});

/**
 * Reactivate a canceled subscription
 * POST /api/stripe/reactivate-subscription
 */
router.post('/reactivate-subscription', isAuthenticated, subscriptionChangeRateLimiter, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;

    // Get user's subscription
    const subscription = await subscriptionService.getUserSubscription(userId);

    if (!hasStripeData(subscription) || !subscription.stripeSubscriptionId) {
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
 * Pause subscription
 * POST /api/stripe/pause-subscription
 */
router.post('/pause-subscription', isAuthenticated, subscriptionChangeRateLimiter, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const { resumeAt, reason } = req.body;

    // Get user's subscription
    const subscription = await subscriptionService.getUserSubscription(userId);

    if (!hasStripeData(subscription) || !subscription.stripeSubscriptionId) {
      return res.status(400).json({ error: 'No active subscription found' });
    }

    // Check if already paused
    if (subscription.pausedAt) {
      return res.status(400).json({ error: 'Subscription is already paused' });
    }

    // Validate resumeAt if provided
    let resumeDate: Date | undefined;
    if (resumeAt) {
      resumeDate = new Date(resumeAt);
      if (isNaN(resumeDate.getTime())) {
        return res.status(400).json({ error: 'Invalid resume date' });
      }
      if (resumeDate <= new Date()) {
        return res.status(400).json({ error: 'Resume date must be in the future' });
      }
    }

    // Pause subscription
    await stripeService.pauseSubscription({
      subscriptionId: subscription.stripeSubscriptionId,
      resumeAt: resumeDate,
      reason,
    });

    res.json({ success: true, message: 'Subscription paused successfully' });
  } catch (error: any) {
    console.error('[Stripe] Error pausing subscription:', error);
    res.status(500).json({ error: 'Failed to pause subscription', message: error.message });
  }
});

/**
 * Resume paused subscription
 * POST /api/stripe/resume-subscription
 */
router.post('/resume-subscription', isAuthenticated, subscriptionChangeRateLimiter, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;

    // Get user's subscription
    const subscription = await subscriptionService.getUserSubscription(userId);

    if (!hasStripeData(subscription) || !subscription.stripeSubscriptionId) {
      return res.status(400).json({ error: 'No subscription found' });
    }

    if (!subscription.pausedAt) {
      return res.status(400).json({ error: 'Subscription is not paused' });
    }

    // Resume subscription
    await stripeService.resumeSubscription(subscription.stripeSubscriptionId);

    res.json({ success: true, message: 'Subscription resumed successfully' });
  } catch (error: any) {
    console.error('[Stripe] Error resuming subscription:', error);
    res.status(500).json({ error: 'Failed to resume subscription', message: error.message });
  }
});

/**
 * Get pause status of subscription
 * GET /api/stripe/pause-status
 */
router.get('/pause-status', isAuthenticated, readRateLimiter, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;

    // Get user's subscription
    const subscription = await subscriptionService.getUserSubscription(userId);

    if (!hasStripeData(subscription) || !subscription.stripeSubscriptionId) {
      return res.json({ isPaused: false });
    }

    // Get pause status
    const pauseStatus = await stripeService.getPauseStatus(subscription.stripeSubscriptionId);

    res.json(pauseStatus);
  } catch (error: any) {
    console.error('[Stripe] Error getting pause status:', error);
    res.status(500).json({ error: 'Failed to get pause status', message: error.message });
  }
});

/**
 * Preview subscription change with proration
 * POST /api/stripe/preview-subscription-change
 */
router.post('/preview-subscription-change', isAuthenticated, billingRateLimiter, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const { tier, billingCycle, discountCode } = req.body;

    // Validate tier
    if (!['author', 'professional', 'team'].includes(tier)) {
      return res.status(400).json({ error: 'Invalid tier' });
    }

    // Validate billing cycle
    if (!['monthly', 'annual'].includes(billingCycle)) {
      return res.status(400).json({ error: 'Invalid billing cycle' });
    }

    // Get user's subscription
    const subscription = await subscriptionService.getUserSubscription(userId);

    if (!hasStripeData(subscription) || !subscription.stripeSubscriptionId) {
      return res.status(400).json({ error: 'No active subscription to change' });
    }

    // Get the price ID for the new tier and billing cycle
    const { STRIPE_PRICE_IDS } = await import('../services/stripeService');
    const newPriceId = STRIPE_PRICE_IDS[tier as 'author' | 'professional' | 'team'][billingCycle as 'monthly' | 'annual'];

    // Preview the subscription change with discount code if provided
    const preview = await stripeService.previewSubscriptionChange({
      subscriptionId: subscription.stripeSubscriptionId,
      newPriceId,
      discountCode,
    });

    res.json(preview);
  } catch (error: any) {
    console.error('[Stripe] Error previewing subscription change:', error);
    res.status(500).json({ error: 'Failed to preview subscription change', message: error.message });
  }
});

/**
 * Create setup intent for adding a new payment method
 * POST /api/stripe/create-setup-intent
 */
router.post('/create-setup-intent', isAuthenticated, billingRateLimiter, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;

    // Get user's subscription
    const subscription = await subscriptionService.getUserSubscription(userId);

    let customerId = hasStripeData(subscription) ? subscription.stripeCustomerId : undefined;

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
router.get('/payment-methods', isAuthenticated, readRateLimiter, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;

    // Get user's subscription
    const subscription = await subscriptionService.getUserSubscription(userId);

    if (!hasStripeData(subscription) || !subscription.stripeCustomerId) {
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
router.delete('/payment-methods/:id', isAuthenticated, writeRateLimiter, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const paymentMethodId = req.params.id;

    // Get user's subscription
    const subscription = await subscriptionService.getUserSubscription(userId);

    if (!hasStripeData(subscription) || !subscription.stripeCustomerId) {
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
router.post('/payment-methods/:id/set-default', isAuthenticated, writeRateLimiter, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const paymentMethodId = req.params.id;

    // Get user's subscription
    const subscription = await subscriptionService.getUserSubscription(userId);

    if (!hasStripeData(subscription) || !subscription.stripeCustomerId) {
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

  // Critical: Fail fast if webhook secret is not configured
  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    console.error('[Stripe] STRIPE_WEBHOOK_SECRET is not configured - webhook verification cannot proceed');
    return res.status(500).send('Webhook configuration error');
  }

  let event: Stripe.Event;

  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
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
