import { describe, it, expect, beforeAll } from "vitest";
import { setupTestApp, createTestUser } from "./helpers/setup";
import {
  createTestSubscription,
  createMultipleProjects,
} from "./helpers/subscription-helpers";
import { subscriptionService } from "../server/services/subscriptionService";
import { db } from "../server/db";
import { userSubscriptions } from "../shared/schema";
import { eq } from "drizzle-orm";

describe("Paused Subscription Tests", () => {
  beforeAll(async () => {
    await setupTestApp();
  });

  describe("Pause/Resume Functionality", () => {
    it("should treat paused Author subscription as Free tier", async () => {
      const user = await createTestUser();
      await createTestSubscription(user.id, "author");

      // Pause the subscription
      await db
        .update(userSubscriptions)
        .set({ pausedAt: new Date() })
        .where(eq(userSubscriptions.userId, user.id));

      const subscription = await subscriptionService.getUserSubscription(
        user.id,
      );

      expect(subscription.tier).toBe("author"); // Original tier
      expect(subscription.effectiveTier).toBe("free"); // Effective tier while paused
      expect(subscription.limits.maxProjects).toBe(3); // Free tier limits
    });

    it("should enforce Free tier limits while paused", async () => {
      const user = await createTestUser();
      await createTestSubscription(user.id, "author");

      // Pause the Author subscription
      await db
        .update(userSubscriptions)
        .set({ pausedAt: new Date() })
        .where(eq(userSubscriptions.userId, user.id));

      // Create 3 projects (free tier limit)
      await createMultipleProjects(user.id, 3);

      // Try to create 4th project - should start grace period (paused = free tier limits)
      const result = await subscriptionService.canPerformAction(
        user.id,
        "create_project",
      );

      expect(result.allowed).toBe(true);
      expect(result.inGracePeriod).toBe(true); // Exceeds free tier limit
    });

    it("should restore Author tier limits when unpaused", async () => {
      const user = await createTestUser();
      await createTestSubscription(user.id, "author");

      // Pause then unpause
      await db
        .update(userSubscriptions)
        .set({ pausedAt: new Date() })
        .where(eq(userSubscriptions.userId, user.id));

      await db
        .update(userSubscriptions)
        .set({ pausedAt: null })
        .where(eq(userSubscriptions.userId, user.id));

      const subscription = await subscriptionService.getUserSubscription(
        user.id,
      );

      expect(subscription.tier).toBe("author");
      expect(subscription.effectiveTier).toBe("author");
      expect(subscription.limits.maxProjects).toBe(10); // Author tier limits restored
    });
  });

  describe("Paused Professional Subscription", () => {
    it("should enforce Free tier AI limits while Professional subscription paused", async () => {
      const user = await createTestUser();
      await createTestSubscription(user.id, "professional");

      // Pause Professional subscription
      await db
        .update(userSubscriptions)
        .set({ pausedAt: new Date() })
        .where(eq(userSubscriptions.userId, user.id));

      const subscription = await subscriptionService.getUserSubscription(
        user.id,
      );

      expect(subscription.tier).toBe("professional");
      expect(subscription.effectiveTier).toBe("free");
      expect(subscription.limits.aiGenerationsPerDay).toBe(20); // Free tier AI limit
    });

    it("should restore unlimited AI when Professional subscription unpaused", async () => {
      const user = await createTestUser();
      await createTestSubscription(user.id, "professional");

      // Pause then unpause
      await db
        .update(userSubscriptions)
        .set({ pausedAt: new Date() })
        .where(eq(userSubscriptions.userId, user.id));

      await db
        .update(userSubscriptions)
        .set({ pausedAt: null })
        .where(eq(userSubscriptions.userId, user.id));

      const subscription = await subscriptionService.getUserSubscription(
        user.id,
      );

      expect(subscription.tier).toBe("professional");
      expect(subscription.effectiveTier).toBe("professional");
      expect(subscription.limits.aiGenerationsPerDay).toBe(null); // Unlimited
    });
  });

  describe("Paused Status API", () => {
    it("should include isPaused flag in subscription status", async () => {
      const user = await createTestUser();
      await createTestSubscription(user.id, "author");

      await db
        .update(userSubscriptions)
        .set({ pausedAt: new Date() })
        .where(eq(userSubscriptions.userId, user.id));

      const status = await subscriptionService.getSubscriptionStatus(user.id);

      expect(status.isPaused).toBe(true);
      expect(status.effectiveTier).toBe("free");
    });

    it("should show isPaused as false for active subscription", async () => {
      const user = await createTestUser();
      await createTestSubscription(user.id, "author");

      const status = await subscriptionService.getSubscriptionStatus(user.id);

      expect(status.isPaused).toBe(false);
      expect(status.tier).toBe(status.effectiveTier);
    });
  });
});
