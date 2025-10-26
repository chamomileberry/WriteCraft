import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSubscription } from '@/hooks/useSubscription';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { TIER_LIMITS } from '@shared/types/subscription';
import { CreditCard, ExternalLink, Loader2, Crown, X, CheckCircle2, BarChart3, DollarSign } from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { formatDistanceToNow } from 'date-fns';
import { CancellationSurveyDialog } from './CancellationSurveyDialog';

export function BillingSettings() {
  const { subscription, isLoading } = useSubscription();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isPortalLoading, setIsPortalLoading] = useState(false);
  const [isCanceling, setIsCanceling] = useState(false);
  const [isReactivating, setIsReactivating] = useState(false);
  const [showCancellationSurvey, setShowCancellationSurvey] = useState(false);

  const handleOpenBillingPortal = async () => {
    setIsPortalLoading(true);
    try {
      const response = await apiRequest('/api/stripe/create-portal', 'POST', {});
      if (response.url) {
        window.location.href = response.url;
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to open billing portal',
        variant: 'destructive',
      });
      setIsPortalLoading(false);
    }
  };

  const handleCancelClick = () => {
    setShowCancellationSurvey(true);
  };

  const handleCancelSubscription = async (reason: string, feedback?: string) => {
    setIsCanceling(true);
    try {
      await apiRequest('/api/stripe/cancel-subscription', 'POST', { reason, feedback });
      toast({
        title: 'Subscription canceled',
        description: 'Your subscription will remain active until the end of your billing period.',
      });
      setShowCancellationSurvey(false);
      // Refresh subscription data
      window.location.reload();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to cancel subscription',
        variant: 'destructive',
      });
      setIsCanceling(false);
    }
  };

  const handleReactivateSubscription = async () => {
    setIsReactivating(true);
    try {
      await apiRequest('/api/stripe/reactivate-subscription', 'POST', {});
      toast({
        title: 'Subscription reactivated',
        description: 'Your subscription has been successfully reactivated.',
      });
      // Refresh subscription data
      window.location.reload();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to reactivate subscription',
        variant: 'destructive',
      });
      setIsReactivating(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Subscription & Billing</CardTitle>
          <CardDescription>Manage your subscription and payment methods</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const tierInfo = TIER_LIMITS[subscription?.tier || 'free'];
  const isFree = subscription?.tier === 'free';
  const isPaid = !isFree && subscription?.stripeSubscriptionId;
  const isTrialing = subscription?.status === 'trialing';
  const isCanceled = subscription?.cancelAtPeriodEnd;

  // Check if subscription is within 7-day refund window
  const isWithinRefundWindow = () => {
    if (!subscription?.currentPeriodStart) return false;
    const periodStart = new Date(subscription.currentPeriodStart);
    const now = new Date();
    const daysSinceStart = (now.getTime() - periodStart.getTime()) / (1000 * 60 * 60 * 24);
    return daysSinceStart <= 7;
  };

  const showRefundButton = isPaid && !isCanceled && isWithinRefundWindow();

  const getStatusBadge = () => {
    if (isTrialing) {
      return <Badge variant="secondary">Trial</Badge>;
    }
    if (isCanceled) {
      return <Badge variant="destructive">Canceling</Badge>;
    }
    if (subscription?.status === 'active') {
      return <Badge variant="default">Active</Badge>;
    }
    if (subscription?.status === 'past_due') {
      return <Badge variant="destructive">Past Due</Badge>;
    }
    return <Badge variant="outline">Free</Badge>;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Subscription & Billing</CardTitle>
        <CardDescription>Manage your subscription and payment methods</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Plan */}
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">{tierInfo.name} Plan</h3>
              {getStatusBadge()}
            </div>
            <p className="text-sm text-muted-foreground">
              {isFree && 'You are currently on the free plan'}
              {isPaid && !isCanceled && `$${tierInfo.price}/month`}
              {isCanceled && 'Subscription ending soon'}
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/analytics">
              <a>
                <Button variant="outline" size="sm" data-testid="button-view-analytics">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Analytics
                </Button>
              </a>
            </Link>
            {!isFree && (
              <Link href="/pricing">
                <a>
                  <Button variant="outline" size="sm" data-testid="button-view-plans">
                    View Plans
                  </Button>
                </a>
              </Link>
            )}
          </div>
        </div>

        {/* Trial Information */}
        {isTrialing && subscription?.trialEnd && (
          <div className="rounded-lg bg-primary/10 p-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="text-sm font-medium">Free trial active</p>
                <p className="text-sm text-muted-foreground">
                  Your trial ends {formatDistanceToNow(new Date(subscription.trialEnd), { addSuffix: true })}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Cancellation Notice */}
        {isCanceled && subscription?.currentPeriodEnd && (
          <div className="rounded-lg bg-destructive/10 p-4">
            <div className="flex items-start gap-3">
              <X className="h-5 w-5 text-destructive mt-0.5" />
              <div>
                <p className="text-sm font-medium">Subscription ending</p>
                <p className="text-sm text-muted-foreground">
                  Access until {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Current Plan Features */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Plan Features</h4>
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li>• {tierInfo.maxProjects === null ? 'Unlimited' : tierInfo.maxProjects} projects</li>
            <li>• {tierInfo.maxNotebooks === null ? 'Unlimited' : tierInfo.maxNotebooks} notebook(s) per project</li>
            <li>• {tierInfo.aiGenerationsPerDay === null ? 'Unlimited' : tierInfo.aiGenerationsPerDay} AI generations per day</li>
            {tierInfo.hasCollaboration && <li>• Up to {tierInfo.maxTeamMembers} team members</li>}
            {tierInfo.hasApiAccess && <li>• API access</li>}
            {tierInfo.hasPrioritySupport && <li>• Priority support</li>}
          </ul>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
          {isFree && (
            <Link href="/pricing">
              <a className="w-full sm:w-auto">
                <Button className="w-full" data-testid="button-upgrade-plan">
                  <Crown className="w-4 h-4 mr-2" />
                  Upgrade Plan
                </Button>
              </a>
            </Link>
          )}

          {isPaid && (
            <>
              <Button
                variant="outline"
                onClick={handleOpenBillingPortal}
                disabled={isPortalLoading}
                data-testid="button-manage-billing"
              >
                {isPortalLoading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <CreditCard className="w-4 h-4 mr-2" />
                )}
                Manage Billing
                <ExternalLink className="w-3 h-3 ml-2" />
              </Button>

              {showRefundButton && (
                <Button
                  variant="outline"
                  onClick={() => setLocation('/refund-request')}
                  data-testid="button-request-refund"
                >
                  <DollarSign className="w-4 h-4 mr-2" />
                  Request Refund
                </Button>
              )}

              {!isCanceled ? (
                <Button
                  variant="destructive"
                  onClick={handleCancelClick}
                  disabled={isCanceling}
                  data-testid="button-cancel-subscription"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel Subscription
                </Button>
              ) : (
                <Button
                  variant="default"
                  onClick={handleReactivateSubscription}
                  disabled={isReactivating}
                  data-testid="button-reactivate-subscription"
                >
                  {isReactivating ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                  )}
                  Reactivate Subscription
                </Button>
              )}
            </>
          )}
        </div>

        {/* Billing Portal Note */}
        {isPaid && (
          <p className="text-xs text-muted-foreground">
            Use the billing portal to update payment methods, view invoices, and manage your subscription details.
          </p>
        )}
      </CardContent>

      <CancellationSurveyDialog
        open={showCancellationSurvey}
        onOpenChange={setShowCancellationSurvey}
        onConfirm={handleCancelSubscription}
        isPending={isCanceling}
      />
    </Card>
  );
}
