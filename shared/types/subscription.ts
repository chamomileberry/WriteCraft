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
  aiGenerationsPerDay: number | null;
  hasCollaboration: boolean;
  maxTeamMembers: number;
  hasApiAccess: boolean;
  hasPrioritySupport: boolean;
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
    hasCollaboration: false,
    maxTeamMembers: 1,
    hasApiAccess: false,
    hasPrioritySupport: false,
    exportFormats: ['txt', 'docx']
  },
  author: {
    name: 'Author',
    price: 19,
    annualPrice: 180, // 21% discount
    maxProjects: null,
    maxNotebooks: null,
    aiGenerationsPerDay: 100,
    hasCollaboration: false,
    maxTeamMembers: 1,
    hasApiAccess: false,
    hasPrioritySupport: false,
    exportFormats: ['txt', 'docx', 'epub', 'pdf', 'markdown', 'fdx']
  },
  professional: {
    name: 'Professional',
    price: 39,
    annualPrice: 372, // 21% discount
    maxProjects: null,
    maxNotebooks: null,
    aiGenerationsPerDay: null, // Unlimited
    hasCollaboration: true,
    maxTeamMembers: 3,
    hasApiAccess: true,
    hasPrioritySupport: true,
    exportFormats: ['txt', 'docx', 'epub', 'pdf', 'markdown', 'fdx']
  },
  team: {
    name: 'Team',
    price: 79,
    annualPrice: 756, // 20% discount
    maxProjects: null,
    maxNotebooks: null,
    aiGenerationsPerDay: null,
    hasCollaboration: true,
    maxTeamMembers: 10,
    hasApiAccess: true,
    hasPrioritySupport: true,
    exportFormats: ['txt', 'docx', 'epub', 'pdf', 'markdown', 'fdx']
  }
};
