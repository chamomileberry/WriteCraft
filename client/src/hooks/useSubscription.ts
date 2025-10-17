import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { SubscriptionTier, TierLimits } from "@shared/types/subscription";

interface UserSubscriptionData {
  id: string;
  userId: string;
  tier: SubscriptionTier;
  status: string;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  currentPeriodStart?: Date;
  currentPeriodEnd?: Date;
  cancelAtPeriodEnd: boolean;
  trialStart?: Date;
  trialEnd?: Date;
  createdAt: Date;
  updatedAt: Date;
  limits: TierLimits;
}

interface LimitCheckResult {
  allowed: boolean;
  reason?: string;
  inGracePeriod?: boolean;
  gracePeriodWarning?: string;
}

interface GracePeriodStatus {
  inGracePeriod: boolean;
  expired: boolean;
  daysRemaining: number | null;
  gracePeriodEnd: string | null;
}

interface SubscriptionStatus {
  tier: SubscriptionTier;
  effectiveTier: SubscriptionTier;
  isPaused: boolean;
  limits: TierLimits;
  usage: {
    projects: number;
    notebooks: number;
    aiGenerationsToday: number;
  };
  limitsExceeded: {
    projects: boolean;
    notebooks: boolean;
    aiGenerations: boolean;
  };
  gracePeriod: GracePeriodStatus;
  warnings: string[];
}

export function useSubscription() {
  const { data: subscription, isLoading, error, refetch } = useQuery<UserSubscriptionData>({
    queryKey: ["/api/subscription"],
    retry: 1,
  });

  const { data: status, isLoading: isLoadingStatus, refetch: refetchStatus } = useQuery<SubscriptionStatus>({
    queryKey: ["/api/subscription/status"],
    retry: 1,
  });

  /**
   * Server-side limit check mutation
   * REQUIRED for all count-based actions (projects, notebooks, AI generations)
   */
  const checkLimitMutation = useMutation({
    mutationFn: async (action: string) => {
      const response = await apiRequest("POST", "/api/subscription/check-limit", { action });
      return response.json() as Promise<LimitCheckResult>;
    },
  });

  /**
   * Check if user has access to a BOOLEAN feature
   * ONLY use for: collaboration, api_access, priority_support
   * DO NOT use for count-based limits - use checkLimit() instead
   */
  const hasFeature = (feature: 'collaboration' | 'api_access' | 'priority_support'): boolean => {
    if (!subscription) return false;

    switch (feature) {
      case 'collaboration':
        return subscription.limits.hasCollaboration;
      case 'api_access':
        return subscription.limits.hasApiAccess;
      case 'priority_support':
        return subscription.limits.hasPrioritySupport;
    }
  };

  /**
   * Check if user can perform an action (calls server API)
   * MUST be used for count-based limits: 'create_project', 'create_notebook', 'ai_generation'
   * Returns a promise that resolves to { allowed: boolean, reason?: string }
   * 
   * @example
   * const result = await checkLimit('create_project');
   * if (!result.allowed) {
   *   toast.error(result.reason);
   *   return;
   * }
   */
  const checkLimit = async (action: string): Promise<LimitCheckResult> => {
    return checkLimitMutation.mutateAsync(action);
  };

  /**
   * Store last limit check result for caching
   */
  const [lastLimitCheck, setLastLimitCheck] = useState<{ action: string; result: LimitCheckResult } | null>(null);

  /**
   * Check limit with caching
   */
  const checkLimitWithCache = async (action: string): Promise<LimitCheckResult> => {
    const result = await checkLimitMutation.mutateAsync(action);
    setLastLimitCheck({ action, result });
    return result;
  };

  /**
   * Get the maximum limit for a resource (for display purposes)
   * Does NOT include current usage - use checkLimit() for actual validation
   */
  const getMaxLimit = (resource: 'projects' | 'notebooks' | 'ai_generations'): { max: number | null; unlimited: boolean } => {
    if (!subscription) {
      return { max: 0, unlimited: false };
    }

    const limits = subscription.limits;
    
    switch (resource) {
      case 'projects':
        return {
          max: limits.maxProjects,
          unlimited: limits.maxProjects === null
        };
      case 'notebooks':
        return {
          max: limits.maxNotebooks,
          unlimited: limits.maxNotebooks === null
        };
      case 'ai_generations':
        return {
          max: limits.aiGenerationsPerDay,
          unlimited: limits.aiGenerationsPerDay === null
        };
    }
  };

  return {
    // Subscription data
    subscription,
    isLoading: isLoading || isLoadingStatus,
    error,
    refetch: () => {
      refetch();
      refetchStatus();
    },
    tier: subscription?.tier || 'free',
    effectiveTier: status?.effectiveTier || subscription?.tier || 'free',
    limits: subscription?.limits,
    
    // Status data (comprehensive)
    status,
    usage: status?.usage,
    limitsExceeded: status?.limitsExceeded,
    warnings: status?.warnings || [],
    isPaused: status?.isPaused || false,
    
    // Grace period data
    gracePeriod: status?.gracePeriod || {
      inGracePeriod: false,
      expired: false,
      daysRemaining: null,
      gracePeriodEnd: null,
    },
    inGracePeriod: status?.gracePeriod?.inGracePeriod || false,
    gracePeriodExpired: status?.gracePeriod?.expired || false,
    gracePeriodDaysRemaining: status?.gracePeriod?.daysRemaining || null,
    
    // Feature checking
    hasFeature,
    checkLimit: checkLimitWithCache,
    
    // Mutation state for checkLimit
    isCheckingLimit: checkLimitMutation.isPending,
    checkLimitError: checkLimitMutation.error,
    lastLimitCheck,
    
    // Helper methods
    getMaxLimit,
    
    // Tier helpers
    isPro: subscription?.tier === 'professional' || subscription?.tier === 'team',
    isTeam: subscription?.tier === 'team',
    isFree: subscription?.tier === 'free' || !subscription,
  };
}
