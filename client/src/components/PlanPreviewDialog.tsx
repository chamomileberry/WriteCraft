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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Loader2, CreditCard, TrendingUp, TrendingDown, Calendar, Tag, CheckCircle2, XCircle } from 'lucide-react';
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

interface DiscountCodeValidation {
  valid: boolean;
  code?: string;
  type?: 'percentage' | 'fixed';
  value?: number;
  message?: string;
}

interface PlanPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tier: SubscriptionTier;
  billingCycle: 'monthly' | 'annual';
  currentTier: SubscriptionTier;
  hasActiveSubscription: boolean;
  onConfirm: (discountCode?: string) => void;
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
  const [discountCode, setDiscountCode] = useState('');
  const [discountValidation, setDiscountValidation] = useState<DiscountCodeValidation | null>(null);
  const [isValidatingDiscount, setIsValidatingDiscount] = useState(false);

  const previewMutation = useMutation({
    mutationFn: async (variables: { tier: SubscriptionTier; billingCycle: 'monthly' | 'annual'; discountCode?: string }) => {
      const response = await apiRequest('/api/stripe/preview-subscription-change', 'POST', {
        tier: variables.tier,
        billingCycle: variables.billingCycle,
        ...(variables.discountCode && { discountCode: variables.discountCode }),
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

  // Validate discount code
  const validateDiscountCode = async (code: string) => {
    if (!code.trim()) {
      setDiscountValidation(null);
      return;
    }

    setIsValidatingDiscount(true);
    try {
      const response = await apiRequest(
        `/api/discount-codes/validate?code=${encodeURIComponent(code)}&tier=${tier}`,
        'GET'
      ) as unknown as DiscountCodeValidation;
      
      if (response.valid) {
        setDiscountValidation(response);
        toast({
          title: 'Discount code applied',
          description: `${response.type === 'percentage' ? `${response.value}% off` : `$${response.value} off`}`,
        });
        // Refetch preview with discount code for existing subscribers
        if (hasActiveSubscription) {
          previewMutation.mutate({ tier, billingCycle, discountCode: code.trim().toUpperCase() });
        }
      } else {
        setDiscountValidation({ valid: false, message: response.message || 'Invalid discount code' });
      }
    } catch (error: any) {
      setDiscountValidation({ 
        valid: false, 
        message: error.message || 'Failed to validate discount code' 
      });
    } finally {
      setIsValidatingDiscount(false);
    }
  };

  // Debounce discount code validation
  useEffect(() => {
    const timer = setTimeout(() => {
      if (discountCode.trim().length >= 3) {
        validateDiscountCode(discountCode.trim().toUpperCase());
      } else {
        setDiscountValidation(null);
      }
    }, 500);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [discountCode, tier]);

  // Fetch preview when tier or billing cycle changes and dialog is open
  useEffect(() => {
    if (open && hasActiveSubscription) {
      setPreview(null);
      setPreviewError(null);
      const validCode = discountValidation?.valid ? discountCode.trim().toUpperCase() : undefined;
      previewMutation.mutate({ tier, billingCycle, discountCode: validCode });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tier, billingCycle, open, hasActiveSubscription]);

  // Fetch preview when dialog opens and user has active subscription
  const handleOpenChange = (isOpen: boolean) => {
    onOpenChange(isOpen);
    if (isOpen && hasActiveSubscription && !preview && !previewMutation.isPending) {
      const validCode = discountValidation?.valid ? discountCode.trim().toUpperCase() : undefined;
      previewMutation.mutate({ tier, billingCycle, discountCode: validCode });
    }
  };

  const tierInfo = TIER_LIMITS[tier];
  const isUpgrade = getTierRank(tier) > getTierRank(currentTier);
  const planPrice = billingCycle === 'annual' ? tierInfo.annualPrice : tierInfo.price;

  // Calculate discounted price
  const getDiscountedPrice = (basePrice: number) => {
    if (!discountValidation?.valid) return basePrice;
    
    if (discountValidation.type === 'percentage') {
      return basePrice * (1 - (discountValidation.value || 0) / 100);
    } else {
      return Math.max(0, basePrice - (discountValidation.value || 0));
    }
  };

  const discountedPrice = getDiscountedPrice(planPrice);
  const discountAmount = planPrice - discountedPrice;

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

            {/* Discount Code Input */}
            <div className="space-y-2">
              <Label htmlFor="discount-code" className="flex items-center gap-2">
                <Tag className="h-4 w-4" />
                Have a discount code?
              </Label>
              <div className="relative">
                <Input
                  id="discount-code"
                  placeholder="Enter code"
                  value={discountCode}
                  onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                  className="pr-10"
                  data-testid="input-discount-code"
                />
                {isValidatingDiscount && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  </div>
                )}
                {!isValidatingDiscount && discountValidation?.valid && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" data-testid="icon-valid-discount" />
                  </div>
                )}
                {!isValidatingDiscount && discountValidation && !discountValidation.valid && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <XCircle className="h-4 w-4 text-destructive" data-testid="icon-invalid-discount" />
                  </div>
                )}
              </div>
              {discountValidation?.valid && (
                <p className="text-sm text-green-600" data-testid="text-discount-success">
                  {discountValidation.type === 'percentage' 
                    ? `${discountValidation.value}% off applied!` 
                    : `$${discountValidation.value} off applied!`}
                </p>
              )}
              {discountValidation && !discountValidation.valid && (
                <p className="text-sm text-destructive" data-testid="text-discount-error">
                  {discountValidation.message}
                </p>
              )}
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

            {/* Discount Code Input for New Subscriptions */}
            <div className="space-y-2">
              <Label htmlFor="discount-code-new" className="flex items-center gap-2">
                <Tag className="h-4 w-4" />
                Have a discount code?
              </Label>
              <div className="relative">
                <Input
                  id="discount-code-new"
                  placeholder="Enter code"
                  value={discountCode}
                  onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                  className="pr-10"
                  data-testid="input-discount-code-new"
                />
                {isValidatingDiscount && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  </div>
                )}
                {!isValidatingDiscount && discountValidation?.valid && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" data-testid="icon-valid-discount-new" />
                  </div>
                )}
                {!isValidatingDiscount && discountValidation && !discountValidation.valid && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <XCircle className="h-4 w-4 text-destructive" data-testid="icon-invalid-discount-new" />
                  </div>
                )}
              </div>
              {discountValidation?.valid && (
                <p className="text-sm text-green-600" data-testid="text-discount-success-new">
                  {discountValidation.type === 'percentage' 
                    ? `${discountValidation.value}% off applied after trial!` 
                    : `$${discountValidation.value} off applied after trial!`}
                </p>
              )}
              {discountValidation && !discountValidation.valid && (
                <p className="text-sm text-destructive" data-testid="text-discount-error-new">
                  {discountValidation.message}
                </p>
              )}
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
              // Always pass valid discount code regardless of subscription status
              const validCode = discountValidation?.valid && discountCode.trim() 
                ? discountCode.trim().toUpperCase() 
                : undefined;
              onConfirm(validCode);
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
