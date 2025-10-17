import { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Loader2, CreditCard, TrendingUp, TrendingDown, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import type { SubscriptionTier } from '@shared/types/subscription';
import { TIER_LIMITS } from '@shared/types/subscription';

interface ProrationPreview {
  immediateCharge: number;
  subtotal: number;
  credits: number;
  newCharges: number;
  nextBillingDate: Date;
  nextBillingAmount: number;
  currency: string;
  lineItems: Array<{
    description: string;
    amount: number;
    isProration: boolean;
  }>;
}

interface PlanPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tier: SubscriptionTier;
  billingCycle: 'monthly' | 'annual';
  currentTier: SubscriptionTier;
  hasActiveSubscription: boolean;
  onConfirm: () => void;
}

export function PlanPreviewDialog({
  open,
  onOpenChange,
  tier,
  billingCycle,
  currentTier,
  hasActiveSubscription,
  onConfirm,
}: PlanPreviewDialogProps) {
  const { toast } = useToast();
  const [preview, setPreview] = useState<ProrationPreview | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);

  const previewMutation = useMutation({
    mutationFn: async (variables: { tier: SubscriptionTier; billingCycle: 'monthly' | 'annual' }) => {
      const response = await apiRequest('/api/stripe/preview-subscription-change', 'POST', {
        tier: variables.tier,
        billingCycle: variables.billingCycle,
      }) as unknown as ProrationPreview;
      return response;
    },
    onSuccess: (data) => {
      setPreview({
        ...data,
        nextBillingDate: new Date(data.nextBillingDate),
      });
      setPreviewError(null);
    },
    onError: (error: any) => {
      setPreviewError(error.message || 'Failed to preview subscription change');
      setPreview(null);
      toast({
        title: 'Error',
        description: error.message || 'Failed to preview subscription change',
        variant: 'destructive',
      });
    },
  });

  // Fetch preview when tier or billing cycle changes and dialog is open
  useEffect(() => {
    if (open && hasActiveSubscription) {
      setPreview(null);
      setPreviewError(null);
      previewMutation.mutate({ tier, billingCycle });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tier, billingCycle, open, hasActiveSubscription]);

  // Fetch preview when dialog opens and user has active subscription
  const handleOpenChange = (isOpen: boolean) => {
    onOpenChange(isOpen);
    if (isOpen && hasActiveSubscription && !preview && !previewMutation.isPending) {
      previewMutation.mutate({ tier, billingCycle });
    }
  };

  const tierInfo = TIER_LIMITS[tier];
  const isUpgrade = getTierRank(tier) > getTierRank(currentTier);
  const planPrice = billingCycle === 'annual' ? tierInfo.annualPrice : tierInfo.price;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]" data-testid="dialog-plan-preview">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isUpgrade ? (
              <TrendingUp className="h-5 w-5 text-primary" />
            ) : (
              <TrendingDown className="h-5 w-5 text-orange-500" />
            )}
            {isUpgrade ? 'Upgrade' : 'Change'} to {tierInfo.name}
          </DialogTitle>
          <DialogDescription>
            Review the cost breakdown for your plan change
          </DialogDescription>
        </DialogHeader>

        {previewMutation.isPending ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" data-testid="loader-preview" />
          </div>
        ) : previewError ? (
          <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-4">
            <p className="text-sm text-destructive" data-testid="text-preview-error">
              {previewError}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => previewMutation.mutate({ tier, billingCycle })}
              className="mt-3"
              data-testid="button-retry-preview"
            >
              Try Again
            </Button>
          </div>
        ) : hasActiveSubscription && preview ? (
          <div className="space-y-4">
            {/* Plan Details */}
            <div className="rounded-lg border p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">New Plan</span>
                <span className="font-medium">{tierInfo.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Billing Cycle</span>
                <Badge variant="secondary" data-testid="badge-billing-cycle">
                  {billingCycle === 'annual' ? 'Annual' : 'Monthly'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Plan Price</span>
                <span className="font-medium">
                  ${planPrice.toFixed(2)}/{billingCycle === 'annual' ? 'year' : 'month'}
                </span>
              </div>
            </div>

            <Separator />

            {/* Proration Details */}
            <div className="space-y-3">
              <h4 className="font-semibold text-sm">Cost Breakdown</h4>
              
              {preview.lineItems.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between text-sm"
                  data-testid={`lineitem-${index}`}
                >
                  <span className={item.isProration ? 'text-muted-foreground' : ''}>
                    {item.description}
                  </span>
                  <span className={item.amount < 0 ? 'text-green-600 dark:text-green-400' : ''}>
                    {item.amount < 0 ? '-' : ''}${Math.abs(item.amount).toFixed(2)}
                  </span>
                </div>
              ))}

              <Separator />

              {/* Immediate Charge */}
              <div className="flex items-center justify-between font-semibold">
                <span>Due Today</span>
                <span className="text-lg" data-testid="text-due-today">
                  ${preview.immediateCharge.toFixed(2)}
                </span>
              </div>

              {/* Next Billing */}
              <div className="rounded-lg bg-muted p-3 space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Next Billing Date</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">
                    {format(preview.nextBillingDate, 'MMM dd, yyyy')}
                  </span>
                  <span className="font-medium" data-testid="text-next-billing">
                    ${preview.nextBillingAmount.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* For new subscriptions (no active subscription) */}
            <div className="rounded-lg border p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Plan</span>
                <span className="font-medium">{tierInfo.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Billing Cycle</span>
                <Badge variant="secondary" data-testid="badge-billing-cycle-new">
                  {billingCycle === 'annual' ? 'Annual' : 'Monthly'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Price</span>
                <span className="font-medium">
                  ${planPrice.toFixed(2)}/{billingCycle === 'annual' ? 'year' : 'month'}
                </span>
              </div>
            </div>

            <div className="rounded-lg bg-primary/10 border border-primary/20 p-4">
              <p className="text-sm text-center">
                Start your 14-day free trial with no payment required today.
              </p>
            </div>
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            data-testid="button-cancel-preview"
          >
            Cancel
          </Button>
          <Button
            onClick={() => {
              onOpenChange(false);
              onConfirm();
            }}
            disabled={previewMutation.isPending}
            data-testid="button-confirm-change"
          >
            <CreditCard className="h-4 w-4 mr-2" />
            {hasActiveSubscription ? 'Confirm Change' : 'Start Trial'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Helper function to rank tiers
function getTierRank(tier: SubscriptionTier): number {
  const ranks: Record<SubscriptionTier, number> = {
    free: 0,
    author: 1,
    professional: 2,
    team: 3,
  };
  return ranks[tier];
}
