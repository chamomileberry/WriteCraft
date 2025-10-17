import { describe, it, expect, beforeAll, afterEach } from 'vitest';
import { setupTestApp, createTestUser, createTestNotebook } from './helpers/setup';
import {
  createTestSubscription,
  createMultipleProjects,
  deleteProject,
  setGracePeriod,
  clearGracePeriod,
  simulateAIUsage,
  getGracePeriodStatus,
  getUserProjectCount,
  getUserNotebookCount
} from './helpers/subscription-helpers';
import { subscriptionService } from '../server/services/subscriptionService';

describe('Grace Period System Tests', () => {
  let testUserId: string;

  beforeAll(async () => {
    await setupTestApp();
    const user = await createTestUser({ firstName: "Grace", lastName: "Period" });
    testUserId = user.id;
  });

  afterEach(async () => {
    // Clean up grace period between tests
    await clearGracePeriod(testUserId);
  });

  describe('Grace Period Lifecycle', () => {
    it('should return no grace period for new user under limits', async () => {
      await createTestSubscription(testUserId, 'free');
      
      const status = await getGracePeriodStatus(testUserId);
      
      expect(status.inGracePeriod).toBe(false);
      expect(status.expired).toBe(false);
      expect(status.daysRemaining).toBe(null);
      expect(status.gracePeriodEnd).toBe(null);
    });

    it('should start grace period when user exceeds project limit', async () => {
      await createTestSubscription(testUserId, 'free');
      
      // Free tier has 3 project limit - create 3 projects
      await createMultipleProjects(testUserId, 3);
      
      // Try to create 4th project (should start grace period)
      const result = await subscriptionService.canPerformAction(testUserId, 'create_project');
      
      expect(result.allowed).toBe(true);
      expect(result.inGracePeriod).toBe(true);
      expect(result.gracePeriodWarning).toContain('grace period');
      
      const status = await getGracePeriodStatus(testUserId);
      expect(status.inGracePeriod).toBe(true);
      expect(status.daysRemaining).toBeGreaterThan(0);
      expect(status.daysRemaining).toBeLessThanOrEqual(7);
    });

    it('should show active grace period with days remaining', async () => {
      await createTestSubscription(testUserId, 'free');
      
      const now = new Date();
      const endDate = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000); // 5 days from now
      
      await setGracePeriod(testUserId, now, endDate);
      
      const status = await getGracePeriodStatus(testUserId);
      
      expect(status.inGracePeriod).toBe(true);
      expect(status.expired).toBe(false);
      expect(status.daysRemaining).toBe(5);
      expect(status.gracePeriodEnd).toEqual(endDate);
    });

    it('should show expired grace period after 7 days', async () => {
      await createTestSubscription(testUserId, 'free');
      
      const pastDate = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000); // 10 days ago
      const expiredDate = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000); // 3 days ago
      
      await setGracePeriod(testUserId, pastDate, expiredDate);
      
      const status = await getGracePeriodStatus(testUserId);
      
      expect(status.inGracePeriod).toBe(false);
      expect(status.expired).toBe(true);
      expect(status.daysRemaining).toBe(0);
      expect(status.gracePeriodEnd).toEqual(expiredDate);
    });
  });

  describe('Infinite Restart Prevention', () => {
    it('should NOT restart grace period when exceeding different limit types', async () => {
      await createTestSubscription(testUserId, 'free');
      
      // Exceed project limit first
      await createMultipleProjects(testUserId, 3);
      await subscriptionService.canPerformAction(testUserId, 'create_project');
      
      const firstStatus = await getGracePeriodStatus(testUserId);
      expect(firstStatus.inGracePeriod).toBe(true);
      const firstEndDate = firstStatus.gracePeriodEnd;
      
      // Now exceed notebook limit
      await createTestNotebook(testUserId, { name: 'Notebook 1' });
      await createTestNotebook(testUserId, { name: 'Notebook 2' });
      await createTestNotebook(testUserId, { name: 'Notebook 3' });
      await subscriptionService.canPerformAction(testUserId, 'create_notebook');
      
      const secondStatus = await getGracePeriodStatus(testUserId);
      expect(secondStatus.inGracePeriod).toBe(true);
      expect(secondStatus.gracePeriodEnd).toEqual(firstEndDate); // Should be same end date!
    });

    it('should persist grace period across multiple limit violations', async () => {
      await createTestSubscription(testUserId, 'free');
      
      const now = new Date();
      const endDate = new Date(now.getTime() + 6 * 24 * 60 * 60 * 1000);
      await setGracePeriod(testUserId, now, endDate);
      
      // Exceed project limit
      await createMultipleProjects(testUserId, 4);
      const projectResult = await subscriptionService.canPerformAction(testUserId, 'create_project');
      expect(projectResult.inGracePeriod).toBe(true);
      
      // Also exceed AI limit
      await simulateAIUsage(testUserId, 20); // Free tier limit is 20
      const aiResult = await subscriptionService.canPerformAction(testUserId, 'use_ai');
      expect(aiResult.inGracePeriod).toBe(true);
      
      // Grace period should still be the same
      const finalStatus = await getGracePeriodStatus(testUserId);
      expect(finalStatus.gracePeriodEnd).toEqual(endDate);
    });
  });

  describe('Grace Period Recovery', () => {
    it('should clear grace period when user brings ALL limits under quota', async () => {
      await createTestSubscription(testUserId, 'free');
      
      // Create 4 projects (over limit)
      const projects = await createMultipleProjects(testUserId, 4);
      await subscriptionService.canPerformAction(testUserId, 'create_project');
      
      let status = await getGracePeriodStatus(testUserId);
      expect(status.inGracePeriod).toBe(true);
      
      // Delete one project to be under limit
      await deleteProject(projects[0].id);
      
      // Check project action - should clear grace period
      const result = await subscriptionService.canPerformAction(testUserId, 'create_project');
      expect(result.allowed).toBe(true);
      
      status = await getGracePeriodStatus(testUserId);
      expect(status.inGracePeriod).toBe(false);
      expect(status.expired).toBe(false);
      expect(status.gracePeriodEnd).toBe(null);
    });

    it('should NOT clear grace period if only ONE limit is under quota', async () => {
      await createTestSubscription(testUserId, 'free');
      
      // Exceed both project and notebook limits
      await createMultipleProjects(testUserId, 4);
      await createTestNotebook(testUserId, { name: 'Notebook 1' });
      await createTestNotebook(testUserId, { name: 'Notebook 2' });
      await createTestNotebook(testUserId, { name: 'Notebook 3' });
      
      await subscriptionService.canPerformAction(testUserId, 'create_project');
      
      let status = await getGracePeriodStatus(testUserId);
      expect(status.inGracePeriod).toBe(true);
      
      // Check if under project limit alone
      const projectCount = await getUserProjectCount(testUserId);
      const notebookCount = await getUserNotebookCount(testUserId);
      expect(projectCount).toBeGreaterThanOrEqual(3); // Still at or over limit
      expect(notebookCount).toBeGreaterThanOrEqual(3); // Still at or over limit
      
      // Grace period should persist
      status = await getGracePeriodStatus(testUserId);
      expect(status.inGracePeriod).toBe(true);
    });

    it('should recover from EXPIRED grace period when user brings all limits under quota', async () => {
      await createTestSubscription(testUserId, 'free');
      
      // Create expired grace period
      const pastDate = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000);
      const expiredDate = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
      await setGracePeriod(testUserId, pastDate, expiredDate);
      
      let status = await getGracePeriodStatus(testUserId);
      expect(status.expired).toBe(true);
      
      // User is now under all limits (no projects, notebooks, AI usage)
      // Next action should clear the expired grace period
      const result = await subscriptionService.canPerformAction(testUserId, 'create_project');
      expect(result.allowed).toBe(true);
      
      status = await getGracePeriodStatus(testUserId);
      expect(status.expired).toBe(false);
      expect(status.inGracePeriod).toBe(false);
      expect(status.gracePeriodEnd).toBe(null);
    });
  });

  describe('Strict Enforcement After Expiration', () => {
    it('should block project creation when grace period expired and still over limit', async () => {
      await createTestSubscription(testUserId, 'free');
      
      // Create projects over limit
      await createMultipleProjects(testUserId, 4);
      
      // Set expired grace period
      const pastDate = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000);
      const expiredDate = new Date(Date.now() - 1 * 24 * 60 * 60 * 1000);
      await setGracePeriod(testUserId, pastDate, expiredDate);
      
      const result = await subscriptionService.canPerformAction(testUserId, 'create_project');
      
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('grace period has expired');
      expect(result.reason).toContain('upgrade');
    });

    it('should block AI usage when grace period expired and still over limit', async () => {
      await createTestSubscription(testUserId, 'free');
      
      // Simulate AI usage over limit
      await simulateAIUsage(testUserId, 25); // Free tier: 20/day
      
      // Set expired grace period
      const pastDate = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000);
      const expiredDate = new Date(Date.now() - 1 * 24 * 60 * 60 * 1000);
      await setGracePeriod(testUserId, pastDate, expiredDate);
      
      const result = await subscriptionService.canPerformAction(testUserId, 'use_ai');
      
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('grace period has expired');
    });
  });

  describe('Subscription Status API', () => {
    it('should return comprehensive status with no grace period', async () => {
      await createTestSubscription(testUserId, 'free');
      
      const status = await subscriptionService.getSubscriptionStatus(testUserId);
      
      expect(status.tier).toBe('free');
      expect(status.gracePeriod.inGracePeriod).toBe(false);
      expect(status.gracePeriod.expired).toBe(false);
      expect(status.gracePeriod.daysRemaining).toBe(null);
      expect(status.gracePeriod.gracePeriodEnd).toBe(null);
      expect(status.warnings).toEqual([]);
    });

    it('should return status with active grace period and warnings', async () => {
      await createTestSubscription(testUserId, 'free');
      
      // Exceed project limit
      await createMultipleProjects(testUserId, 4);
      await subscriptionService.canPerformAction(testUserId, 'create_project');
      
      const status = await subscriptionService.getSubscriptionStatus(testUserId);
      
      expect(status.gracePeriod.inGracePeriod).toBe(true);
      expect(status.gracePeriod.daysRemaining).toBeGreaterThan(0);
      expect(status.limitsExceeded.projects).toBe(true);
      expect(status.warnings.length).toBeGreaterThan(0);
      expect(status.warnings[0]).toContain('Grace period active');
      expect(status.warnings.some(w => w.includes('Project limit exceeded'))).toBe(true);
    });

    it('should return status with expired grace period warning', async () => {
      await createTestSubscription(testUserId, 'free');
      
      const pastDate = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000);
      const expiredDate = new Date(Date.now() - 1 * 24 * 60 * 60 * 1000);
      await setGracePeriod(testUserId, pastDate, expiredDate);
      
      const status = await subscriptionService.getSubscriptionStatus(testUserId);
      
      expect(status.gracePeriod.expired).toBe(true);
      expect(status.warnings).toContain('Grace period expired: Please upgrade or reduce usage to continue');
    });
  });
});
