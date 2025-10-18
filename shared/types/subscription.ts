export type SubscriptionTier = 'free' | 'author' | 'professional' | 'team';
export type SubscriptionStatus = 'active' | 'past_due' | 'canceled' | 'trialing';

export interface UserSubscription {
  id: string;
  userId: string;
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  currentPeriodStart?: Date;
  currentPeriodEnd?: Date;
  cancelAtPeriodEnd: boolean;
  trialStart?: Date;
  trialEnd?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface TierLimits {
  name: string;
  price: number; // Monthly price in dollars
  annualPrice: number;
  maxProjects: number | null; // null = unlimited
  maxNotebooks: number | null;
  aiGenerationsPerDay: number | null; // null = unlimited
  polishUsesPerMonth: number; // Premium Opus feature for polishing content
  extendedThinkingPerMonth: number; // Premium Opus feature for deep reasoning chat
  hasCollaboration: boolean;
  maxTeamMembers: number;
  hasApiAccess: boolean;
  apiCallsPerMonth: number | null; // API calls limit (null if no API access)
  hasPrioritySupport: boolean;
  hasAuditLogs: boolean; // Team-exclusive
  hasTeamAnalytics: boolean; // Team-exclusive
  hasRoleBasedPermissions: boolean; // Team-exclusive
  hasTeamResourceLibrary: boolean; // Team-exclusive
  exportFormats: string[]; // ['txt', 'docx', 'epub', 'pdf']
}

export const TIER_LIMITS: Record<SubscriptionTier, TierLimits> = {
  free: {
    name: 'Writer',
    price: 0,
    annualPrice: 0,
    maxProjects: 3,
    maxNotebooks: 1,
    aiGenerationsPerDay: 20,
    polishUsesPerMonth: 0,
    extendedThinkingPerMonth: 0,
    hasCollaboration: false,
    maxTeamMembers: 1,
    hasApiAccess: false,
    apiCallsPerMonth: null,
    hasPrioritySupport: false,
    hasAuditLogs: false,
    hasTeamAnalytics: false,
    hasRoleBasedPermissions: false,
    hasTeamResourceLibrary: false,
    exportFormats: ['txt', 'docx']
  },
  author: {
    name: 'Author',
    price: 19,
    annualPrice: 180, // 21% discount (~21%)
    maxProjects: null,
    maxNotebooks: null,
    aiGenerationsPerDay: 100, // Limited, not unlimited
    polishUsesPerMonth: 0,
    extendedThinkingPerMonth: 0,
    hasCollaboration: false,
    maxTeamMembers: 1,
    hasApiAccess: false,
    apiCallsPerMonth: null,
    hasPrioritySupport: false,
    hasAuditLogs: false,
    hasTeamAnalytics: false,
    hasRoleBasedPermissions: false,
    hasTeamResourceLibrary: false,
    exportFormats: ['txt', 'docx', 'epub', 'pdf', 'markdown', 'fdx']
  },
  professional: {
    name: 'Professional',
    price: 39,
    annualPrice: 372, // 21% discount (~21%)
    maxProjects: null,
    maxNotebooks: null,
    aiGenerationsPerDay: null, // Unlimited
    polishUsesPerMonth: 20,
    extendedThinkingPerMonth: 100,
    hasCollaboration: true,
    maxTeamMembers: 3,
    hasApiAccess: true,
    apiCallsPerMonth: 5000, // 5,000 API calls/month
    hasPrioritySupport: true,
    hasAuditLogs: false,
    hasTeamAnalytics: false,
    hasRoleBasedPermissions: false,
    hasTeamResourceLibrary: false,
    exportFormats: ['txt', 'docx', 'epub', 'pdf', 'markdown', 'fdx']
  },
  team: {
    name: 'Team',
    price: 79,
    annualPrice: 756, // 20% discount (~20%)
    maxProjects: null,
    maxNotebooks: null,
    aiGenerationsPerDay: null, // Unlimited
    polishUsesPerMonth: 50,
    extendedThinkingPerMonth: 500,
    hasCollaboration: true,
    maxTeamMembers: 10,
    hasApiAccess: true,
    apiCallsPerMonth: 25000, // 25,000 API calls/month (5x more than Professional)
    hasPrioritySupport: true,
    hasAuditLogs: true, // Team-exclusive
    hasTeamAnalytics: true, // Team-exclusive
    hasRoleBasedPermissions: true, // Team-exclusive
    hasTeamResourceLibrary: true, // Team-exclusive
    exportFormats: ['txt', 'docx', 'epub', 'pdf', 'markdown', 'fdx']
  }
};
