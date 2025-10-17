import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import { setupTestApp, createTestUser } from './helpers/setup';
import {
  createTestSubscription,
  createMultipleProjects,
  simulateAIUsage
} from './helpers/subscription-helpers';
import { subscriptionService } from '../server/services/subscriptionService';
import { db } from '../server/db';
import { userSubscriptions } from '../shared/schema';
import { eq } from 'drizzle-orm';

describe('Paused Subscription Tests', () => {
  let testUserId: string;

  beforeAll(async () => {
    await setupTestApp();
  });

  beforeEach(async () => {
    const user = await createTestUser({ firstName: "Paused", lastName: "User" });
    testUserId = user.id;
    await createTestSubscription(testUserId, 'author');
  });

  describe('Pause/Resume Functionality', () => {
    it('should treat paused Author subscription as Free tier', async () => {
      // Pause the subscription
      await db
        .update(userSubscriptions)
        .set({ pausedAt: new Date() })
        .where(eq(userSubscriptions.userId, testUserId));

      const subscription = await subscriptionService.getUserSubscription(testUserId);

      expect(subscription.tier).toBe('author'); // Original tier
      expect(subscription.effectiveTier).toBe('free'); // Effective tier while paused
      expect(subscription.limits.maxProjects).toBe(3); // Free tier limits
    });

    it('should enforce Free tier limits while paused', async () => {
      // Pause the Author subscription
      await db
        .update(userSubscriptions)
        .set({ pausedAt: new Date() })
        .where(eq(userSubscriptions.userId, testUserId));

      // Create 3 projects (free tier limit)
      await createMultipleProjects(testUserId, 3);

      // Try to create 4th project - should start grace period (paused = free tier limits)
      const result = await subscriptionService.canPerformAction(testUserId, 'create_project');

      expect(result.allowed).toBe(true);
      expect(result.inGracePeriod).toBe(true); // Exceeds free tier limit
    });

    it('should restore Author tier limits when unpaused', async () => {
      // Pause then unpause
      await db
        .update(userSubscriptions)
        .set({ pausedAt: new Date() })
        .where(eq(userSubscriptions.userId, testUserId));

      await db
        .update(userSubscriptions)
        .set({ pausedAt: null })
        .where(eq(userSubscriptions.userId, testUserId));

      const subscription = await subscriptionService.getUserSubscription(testUserId);

      expect(subscription.tier).toBe('author');
      expect(subscription.effectiveTier).toBe('author');
      expect(subscription.limits.maxProjects).toBe(10); // Author tier limits restored
    });
  });

  describe('Paused Professional Subscription', () => {
    it('should enforce Free tier AI limits while Professional subscription paused', async () => {
      // Create Professional subscription
      await db
        .update(userSubscriptions)
        .set({ tier: 'professional', pausedAt: new Date() })
        .where(eq(userSubscriptions.userId, testUserId));

      const subscription = await subscriptionService.getUserSubscription(testUserId);

      expect(subscription.tier).toBe('professional');
      expect(subscription.effectiveTier).toBe('free');
      expect(subscription.limits.aiGenerationsPerDay).toBe(20); // Free tier AI limit
    });

    it('should restore unlimited AI when Professional subscription unpaused', async () => {
      // Professional subscription, paused then unpaused
      await db
        .update(userSubscriptions)
        .set({ tier: 'professional', pausedAt: new Date() })
        .where(eq(userSubscriptions.userId, testUserId));

      await db
        .update(userSubscriptions)
        .set({ pausedAt: null })
        .where(eq(userSubscriptions.userId, testUserId));

      const subscription = await subscriptionService.getUserSubscription(testUserId);

      expect(subscription.tier).toBe('professional');
      expect(subscription.effectiveTier).toBe('professional');
      expect(subscription.limits.aiGenerationsPerDay).toBe(null); // Unlimited
    });
  });

  describe('Paused Status API', () => {
    it('should include isPaused flag in subscription status', async () => {
      await db
        .update(userSubscriptions)
        .set({ pausedAt: new Date() })
        .where(eq(userSubscriptions.userId, testUserId));

      const status = await subscriptionService.getSubscriptionStatus(testUserId);

      expect(status.isPaused).toBe(true);
      expect(status.effectiveTier).toBe('free');
    });

    it('should show isPaused as false for active subscription', async () => {
      const status = await subscriptionService.getSubscriptionStatus(testUserId);

      expect(status.isPaused).toBe(false);
      expect(status.tier).toBe(status.effectiveTier);
    });
  });
});
