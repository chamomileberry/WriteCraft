import { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Check, Sparkles, Users, Zap } from 'lucide-react';
import { TIER_LIMITS, type SubscriptionTier } from '@shared/types/subscription';
import { useSubscription } from '@/hooks/useSubscription';
import { useAuth } from '@/hooks/useAuth';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { FeatureTooltip } from '@/components/FeatureTooltip';
import { FEATURE_DESCRIPTIONS } from '@/lib/featureDescriptions';
import { PlanPreviewDialog } from '@/components/PlanPreviewDialog';

const TIER_ORDER: SubscriptionTier[] = ['free', 'author', 'professional', 'team'];

const TIER_ICONS = {
  free: Sparkles,
  author: Sparkles,
  professional: Zap,
  team: Users,
};

const TIER_HIGHLIGHTS = {
  free: 'Perfect for trying out WriteCraft',
  author: 'Everything you need to write your next bestseller',
  professional: 'Advanced features for serious writers',
  team: 'Collaborate with your writing team',
};

export default function Pricing() {
  const [, setLocation] = useLocation();
  const [isAnnual, setIsAnnual] = useState(false);
  const [loadingTier, setLoadingTier] = useState<SubscriptionTier | null>(null);
  const [previewTier, setPreviewTier] = useState<SubscriptionTier | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const { subscription, isLoading } = useSubscription();
  const { user } = useAuth();
  const { toast } = useToast();

  const handleUpgrade = async (tier: SubscriptionTier) => {
    if (!user) {
      setLocation('/');
      return;
    }

    if (tier === 'free') {
      setLocation('/dashboard');
      return;
    }

    // Show preview dialog first
    setPreviewTier(tier);
    setShowPreview(true);
  };

  const handleConfirmUpgrade = async () => {
    if (!previewTier) return;

    setLoadingTier(previewTier);

    try {
      const response = await apiRequest('/api/stripe/create-checkout', 'POST', {
        tier: previewTier,
        billingCycle: isAnnual ? 'annual' : 'monthly',
      });

      if (response.url) {
        window.location.href = response.url;
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to start checkout. Please try again.',
        variant: 'destructive',
      });
      setLoadingTier(null);
    }
  };

  const getButtonText = (tier: SubscriptionTier) => {
    if (!user) return 'Sign in to upgrade';
    if (subscription?.tier === tier) return 'Current plan';
    if (tier === 'free') return 'Get started';
    return 'Upgrade';
  };

  const isCurrentTier = (tier: SubscriptionTier) => subscription?.tier === tier;

  const formatPrice = (tier: SubscriptionTier) => {
    const limits = TIER_LIMITS[tier];
    if (limits.price === 0) return 'Free';
    
    const price = isAnnual ? limits.annualPrice / 12 : limits.price;
    return `$${price.toFixed(0)}`;
  };

  const getSavingsText = (tier: SubscriptionTier) => {
    const limits = TIER_LIMITS[tier];
    if (!isAnnual || limits.price === 0) return null;
    
    const monthlyCost = limits.price * 12;
    const savings = monthlyCost - limits.annualPrice;
    const percentage = Math.round((savings / monthlyCost) * 100);
    
    return `Save ${percentage}%`;
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Choose Your Writing Journey</h1>
          <p className="text-lg text-muted-foreground mb-8">
            Start free, upgrade when you need more power
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-3">
            <Label htmlFor="billing-toggle" className={!isAnnual ? 'font-semibold' : ''}>
              Monthly
            </Label>
            <Switch
              id="billing-toggle"
              data-testid="switch-billing-toggle"
              checked={isAnnual}
              onCheckedChange={setIsAnnual}
            />
            <Label htmlFor="billing-toggle" className={isAnnual ? 'font-semibold' : ''}>
              Annual
            </Label>
            <Badge variant="secondary" className="ml-2">
              Save up to 21%
            </Badge>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {TIER_ORDER.map((tier) => {
            const limits = TIER_LIMITS[tier];
            const Icon = TIER_ICONS[tier];
            const isCurrent = isCurrentTier(tier);
            const isPending = loadingTier === tier;
            const savings = getSavingsText(tier);

            return (
              <Card
                key={tier}
                className={`relative ${
                  tier === 'professional' ? 'border-primary shadow-lg' : ''
                } ${isCurrent ? 'ring-2 ring-primary' : ''}`}
                data-testid={`card-pricing-${tier}`}
              >
                {tier === 'professional' && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2" variant="default">
                    Most Popular
                  </Badge>
                )}

                {isCurrent && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2" variant="secondary">
                    Current Plan
                  </Badge>
                )}

                <CardHeader>
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className="h-5 w-5 text-primary" />
                    <CardTitle className="text-xl">{limits.name}</CardTitle>
                  </div>
                  <CardDescription className="min-h-[40px]">
                    {TIER_HIGHLIGHTS[tier]}
                  </CardDescription>
                  <div className="mt-4">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-bold">{formatPrice(tier)}</span>
                      {limits.price > 0 && (
                        <span className="text-muted-foreground">/month</span>
                      )}
                    </div>
                    {savings && (
                      <Badge variant="secondary" className="mt-2">
                        {savings}
                      </Badge>
                    )}
                    {isAnnual && limits.price > 0 && (
                      <p className="text-xs text-muted-foreground mt-1">
                        ${limits.annualPrice}/year billed annually
                      </p>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <FeatureTooltip
                      title={FEATURE_DESCRIPTIONS.projects.title}
                      description={FEATURE_DESCRIPTIONS.projects.description}
                      comparison={FEATURE_DESCRIPTIONS.projects.comparison}
                    >
                      <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                      <span className="text-sm">
                        {limits.maxProjects === null ? 'Unlimited' : limits.maxProjects} projects
                      </span>
                    </FeatureTooltip>

                    <FeatureTooltip
                      title={FEATURE_DESCRIPTIONS.notebooks.title}
                      description={FEATURE_DESCRIPTIONS.notebooks.description}
                      comparison={FEATURE_DESCRIPTIONS.notebooks.comparison}
                    >
                      <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                      <span className="text-sm">
                        {limits.maxNotebooks === null ? 'Unlimited' : limits.maxNotebooks} notebook{limits.maxNotebooks === 1 ? '' : 's'} per project
                      </span>
                    </FeatureTooltip>

                    <FeatureTooltip
                      title={FEATURE_DESCRIPTIONS.aiGenerations.title}
                      description={FEATURE_DESCRIPTIONS.aiGenerations.description}
                      comparison={FEATURE_DESCRIPTIONS.aiGenerations.comparison}
                    >
                      <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                      <span className="text-sm">
                        {limits.aiGenerationsPerDay === null ? 'Unlimited' : limits.aiGenerationsPerDay} AI generations/day
                      </span>
                    </FeatureTooltip>

                    {limits.hasCollaboration && (
                      <FeatureTooltip
                        title={FEATURE_DESCRIPTIONS.collaboration.title}
                        description={FEATURE_DESCRIPTIONS.collaboration.description}
                        comparison={FEATURE_DESCRIPTIONS.collaboration.comparison}
                      >
                        <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                        <span className="text-sm">
                          {limits.maxTeamMembers} team member{limits.maxTeamMembers === 1 ? '' : 's'}
                        </span>
                      </FeatureTooltip>
                    )}

                    {limits.hasApiAccess && (
                      <FeatureTooltip
                        title={FEATURE_DESCRIPTIONS.apiAccess.title}
                        description={FEATURE_DESCRIPTIONS.apiAccess.description}
                        comparison={FEATURE_DESCRIPTIONS.apiAccess.comparison}
                      >
                        <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                        <span className="text-sm">API access</span>
                      </FeatureTooltip>
                    )}

                    {limits.hasPrioritySupport && (
                      <FeatureTooltip
                        title={FEATURE_DESCRIPTIONS.prioritySupport.title}
                        description={FEATURE_DESCRIPTIONS.prioritySupport.description}
                        comparison={FEATURE_DESCRIPTIONS.prioritySupport.comparison}
                      >
                        <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                        <span className="text-sm">Priority support</span>
                      </FeatureTooltip>
                    )}

                    <FeatureTooltip
                      title={FEATURE_DESCRIPTIONS.exportFormats.title}
                      description={FEATURE_DESCRIPTIONS.exportFormats.description}
                      comparison={FEATURE_DESCRIPTIONS.exportFormats.comparison}
                    >
                      <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                      <span className="text-sm">
                        Export: {limits.exportFormats.slice(0, 3).join(', ')}
                        {limits.exportFormats.length > 3 && ` +${limits.exportFormats.length - 3} more`}
                      </span>
                    </FeatureTooltip>
                  </div>
                </CardContent>

                <CardFooter>
                  <Button
                    className="w-full"
                    variant={tier === 'professional' ? 'default' : 'outline'}
                    onClick={() => handleUpgrade(tier)}
                    disabled={isCurrent || isPending || isLoading}
                    data-testid={`button-upgrade-${tier}`}
                  >
                    {isPending ? 'Loading...' : getButtonText(tier)}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>

        {/* FAQ or Additional Info */}
        <div className="mt-16 text-center max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold mb-4">All plans include:</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
            <div className="flex items-start gap-2">
              <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
              <span>Character & world building tools</span>
            </div>
            <div className="flex items-start gap-2">
              <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
              <span>Plot & story structure generators</span>
            </div>
            <div className="flex items-start gap-2">
              <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
              <span>Writing prompts & guides</span>
            </div>
            <div className="flex items-start gap-2">
              <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
              <span>Rich text editor with autosave</span>
            </div>
            <div className="flex items-start gap-2">
              <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
              <span>Timeline & relationship mapping</span>
            </div>
            <div className="flex items-start gap-2">
              <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
              <span>Project organization</span>
            </div>
          </div>
          <p className="mt-8 text-sm text-muted-foreground">
            All paid plans include a 14-day free trial. Cancel anytime.
          </p>
        </div>
      </div>

      {/* Plan Preview Dialog */}
      {previewTier && (
        <PlanPreviewDialog
          open={showPreview}
          onOpenChange={setShowPreview}
          tier={previewTier}
          billingCycle={isAnnual ? 'annual' : 'monthly'}
          currentTier={subscription?.tier || 'free'}
          hasActiveSubscription={!!subscription?.stripeSubscriptionId}
          onConfirm={handleConfirmUpgrade}
        />
      )}
    </div>
  );
}
