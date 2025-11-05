# Stripe Payment Integration Testing Guide

## Overview

This guide provides step-by-step instructions for testing the Stripe payment integration in WriteCraft's freemium model.

## Prerequisites

- Stripe account with test mode enabled
- STRIPE_SECRET_KEY and VITE_STRIPE_PUBLIC_KEY configured in Replit Secrets
- Application running locally or on Replit

## Test Cards

Use these Stripe test cards for different scenarios:

| Scenario           | Card Number         | CVC          | Date            | ZIP          |
| ------------------ | ------------------- | ------------ | --------------- | ------------ |
| Successful payment | 4242 4242 4242 4242 | Any 3 digits | Any future date | Any 5 digits |
| Payment declined   | 4000 0000 0000 0002 | Any 3 digits | Any future date | Any 5 digits |
| Insufficient funds | 4000 0000 0000 9995 | Any 3 digits | Any future date | Any 5 digits |
| 3D Secure required | 4000 0025 0000 3155 | Any 3 digits | Any future date | Any 5 digits |

## Test Scenarios

### 1. Pricing Page & Checkout Flow

**Steps:**

1. Navigate to `/pricing` (or click "Upgrade" in account settings)
2. Verify all 4 tiers are displayed:
   - Free: $0/month
   - Author: $9/month or $100/year
   - Professional: $29/month or $300/year
   - Team: $99/month or $1,000/year
3. Toggle between Monthly and Annual billing
   - Verify "Save 17%" badge appears for annual plans
4. Click "Get Started" on Author plan
5. Fill in test card details (use 4242 4242 4242 4242)
6. Complete checkout
7. Verify:
   - Redirected to success page
   - Subscription created in Stripe Dashboard (Test mode)
   - User tier updated in database
   - Trial period starts (14 days)

**Expected Results:**

- ✅ Checkout session created successfully
- ✅ Subscription shows "trialing" status in Stripe
- ✅ User's tier updated to "author" in database
- ✅ Trial end date set to 14 days from now

### 2. AI Generation Limits

**Free Tier Limits:**

1. As a free user, go to Character Generator
2. Verify usage indicator shows "X/20 AI generations today"
3. Generate 20 characters
4. On the 21st attempt, verify:
   - UpgradePrompt dialog appears
   - Generation is blocked
   - Dialog shows upgrade options

**Paid Tier Unlimited:**

1. Upgrade to Author plan (using test card)
2. Go to Character Generator
3. Verify usage indicator shows "Unlimited AI generations"
4. Generate multiple characters (no limit)

**Expected Results:**

- ✅ Free users hit limit at 20 generations
- ✅ Paid users have unlimited generations
- ✅ Usage indicator shows correct count and limit

### 3. Billing Management

**View Subscription:**

1. Navigate to Account Settings → Billing
2. Verify displayed information:
   - Current plan name (e.g., "Author Plan")
   - Billing period (Monthly/Annual)
   - Next billing date
   - Trial status (if applicable)
   - Payment method

**Manage Subscription via Customer Portal:**

1. Click "Manage Billing" button
2. Verify redirected to Stripe Customer Portal
3. In portal, test:
   - Update payment method
   - View invoice history
   - Change plan (upgrade/downgrade)
   - Cancel subscription

**Expected Results:**

- ✅ All subscription details displayed correctly
- ✅ Customer portal accessible and functional
- ✅ Changes in portal sync to app

### 4. Subscription Lifecycle

**Trial Period:**

1. Subscribe to any paid plan
2. Verify trial status in billing settings
3. Check database: `trial_end_date` set correctly
4. Access paid features during trial

**Active Subscription:**

1. Wait for trial to end (or manually update in Stripe)
2. Verify subscription becomes "active"
3. Ensure features remain accessible
4. Check invoice created and payment processed

**Cancellation:**

1. In Customer Portal or via API, cancel subscription
2. Verify:
   - Subscription marked for cancellation
   - Access continues until period end
   - "Cancel Subscription" button disabled
   - "Reactivate Subscription" button appears

**Reactivation:**

1. After canceling, click "Reactivate Subscription"
2. Verify:
   - Subscription reactivated in Stripe
   - Access continues
   - Cancellation notice removed

**Expected Results:**

- ✅ Trial → Active transition works
- ✅ Cancellation scheduled correctly
- ✅ Reactivation restores subscription
- ✅ Access controlled properly throughout lifecycle

### 5. Webhook Events

**Test webhook delivery:**

1. Use Stripe CLI: `stripe listen --forward-to localhost:5000/api/stripe/webhook`
2. Trigger events:
   ```bash
   stripe trigger checkout.session.completed
   stripe trigger customer.subscription.updated
   stripe trigger customer.subscription.deleted
   stripe trigger invoice.payment_failed
   ```
3. Verify in logs:
   - Webhook signature verified
   - Event processed correctly
   - Database updated

**Expected Results:**

- ✅ All webhook events processed successfully
- ✅ Subscription status updated in database
- ✅ User tier changes reflected immediately

### 6. Payment Failures

**Declined Card:**

1. Start checkout with declined card (4000 0000 0000 0002)
2. Verify error message displayed
3. Ensure no subscription created

**Insufficient Funds:**

1. Use card 4000 0000 0000 9995
2. Verify appropriate error handling

**3D Secure:**

1. Use card 4000 0025 0000 3155
2. Complete 3D Secure challenge
3. Verify payment succeeds after authentication

**Expected Results:**

- ✅ Error messages clear and helpful
- ✅ Failed payments don't create subscriptions
- ✅ 3D Secure flow works correctly

### 7. Edge Cases

**Upgrade Between Tiers:**

1. Subscribe to Author plan
2. Upgrade to Professional plan
3. Verify:
   - Prorated credit applied
   - New tier features accessible
   - Billing updated correctly

**Downgrade:**

1. Subscribe to Professional plan
2. Downgrade to Author plan
3. Verify:
   - Change scheduled for period end
   - Access to Professional features continues until then
   - Downgrade completes at period end

**Multiple Sessions:**

1. Start checkout but don't complete
2. Start another checkout
3. Complete second checkout
4. Verify only one subscription created

**Expected Results:**

- ✅ Prorated upgrades work correctly
- ✅ Downgrades scheduled properly
- ✅ No duplicate subscriptions

## Monitoring & Debugging

### Check Logs

- View server logs for webhook events
- Check Stripe Dashboard → Developers → Logs
- Monitor database for subscription updates

### Database Queries

```sql
-- Check user subscription
SELECT * FROM user_subscriptions WHERE user_id = 'USER_ID';

-- Check AI usage
SELECT * FROM ai_usage_logs WHERE user_id = 'USER_ID' ORDER BY created_at DESC;

-- Check daily usage summary
SELECT * FROM ai_usage_daily_summary WHERE user_id = 'USER_ID';
```

### Stripe Dashboard

- Test mode subscriptions: Subscriptions → All subscriptions
- Webhook logs: Developers → Webhooks → [your webhook] → Events
- Test clocks: Developers → Test clocks (for time-based testing)

## Common Issues

### Issue: Webhook not received

**Solution:**

- Check webhook endpoint URL in Stripe Dashboard
- Verify webhook signing secret matches
- Use Stripe CLI to test locally

### Issue: Subscription not updating

**Solution:**

- Check webhook event logs
- Verify database connection
- Check server logs for errors

### Issue: Payment fails silently

**Solution:**

- Check Stripe Dashboard for error details
- Verify API keys are correct
- Check browser console for frontend errors

### Issue: Usage limits not enforced

**Solution:**

- Verify 'ai_generations' key used consistently
- Check subscription tier limits in code
- Verify usage tracking working

## Success Criteria

Before considering testing complete, verify:

- ✅ All 4 subscription tiers functional
- ✅ Checkout flow works for monthly and annual plans
- ✅ Trials start correctly (14 days)
- ✅ AI generation limits enforced (20/day free, unlimited paid)
- ✅ Upgrade prompts appear at limits
- ✅ Customer portal accessible and functional
- ✅ Webhooks processed correctly
- ✅ Subscription lifecycle managed (trial → active → canceled → reactivated)
- ✅ Payment failures handled gracefully
- ✅ Usage tracking accurate
- ✅ Tier upgrades/downgrades work
- ✅ No duplicate subscriptions possible

## Production Checklist

Before going live:

1. Switch Stripe to live mode
2. Update STRIPE_SECRET_KEY and VITE_STRIPE_PUBLIC_KEY to live keys
3. Update webhook endpoint to production URL
4. Test one complete flow in live mode with real card
5. Monitor first few real transactions closely
6. Set up Stripe email notifications for failures
7. Configure Stripe Radar for fraud prevention

## Resources

- [Stripe Testing Documentation](https://stripe.com/docs/testing)
- [Stripe Webhooks Guide](https://stripe.com/docs/webhooks)
- [Stripe Customer Portal](https://stripe.com/docs/billing/subscriptions/customer-portal)
