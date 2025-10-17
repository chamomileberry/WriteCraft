import { AlertTriangle, Clock, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useSubscription } from "@/hooks/useSubscription";
import { useState } from "react";
import { Link } from "wouter";

export function GracePeriodBanner() {
  const { inGracePeriod, gracePeriodExpired, gracePeriodDaysRemaining, warnings, limitsExceeded } = useSubscription();
  const [dismissed, setDismissed] = useState(false);

  if (!inGracePeriod && !gracePeriodExpired) return null;
  if (dismissed) return null;

  const hasExceededLimits = limitsExceeded?.projects || limitsExceeded?.notebooks || limitsExceeded?.aiGenerations;

  if (gracePeriodExpired) {
    return (
      <div className="border-b border-destructive bg-destructive/10" data-testid="banner-grace-expired">
        <div className="container mx-auto">
          <Alert className="border-0 bg-transparent rounded-none">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <AlertDescription className="flex items-center justify-between gap-4 ml-2">
              <div className="flex-1">
                <p className="font-semibold text-destructive">Grace Period Expired</p>
                <p className="text-sm text-destructive/90 mt-1">
                  Your grace period has ended. Please upgrade your plan or reduce your usage to continue using WriteCraft.
                </p>
                {warnings.length > 0 && (
                  <ul className="text-sm text-destructive/80 mt-2 space-y-1">
                    {warnings.slice(0, 3).map((warning, idx) => (
                      <li key={idx}>• {warning}</li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Link href="/pricing">
                  <Button variant="destructive" size="sm" data-testid="button-upgrade-now">
                    Upgrade Now
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setDismissed(true)}
                  className="h-8 w-8"
                  data-testid="button-dismiss-banner"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  if (inGracePeriod && hasExceededLimits) {
    return (
      <div className="border-b border-orange-500 bg-orange-50 dark:bg-orange-950/30" data-testid="banner-grace-active">
        <div className="container mx-auto">
          <Alert className="border-0 bg-transparent rounded-none">
            <Clock className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            <AlertDescription className="flex items-center justify-between gap-4 ml-2">
              <div className="flex-1">
                <p className="font-semibold text-orange-800 dark:text-orange-300">
                  Grace Period Active: {gracePeriodDaysRemaining} {gracePeriodDaysRemaining === 1 ? 'day' : 'days'} remaining
                </p>
                <p className="text-sm text-orange-700 dark:text-orange-400 mt-1">
                  You've exceeded your plan limits. Upgrade or reduce usage before the grace period ends to avoid service interruption.
                </p>
                {warnings.length > 0 && (
                  <ul className="text-sm text-orange-600 dark:text-orange-500 mt-2 space-y-1">
                    {warnings.slice(0, 3).map((warning, idx) => (
                      <li key={idx}>• {warning}</li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Link href="/pricing">
                  <Button 
                    variant="default" 
                    size="sm"
                    className="bg-orange-600 hover:bg-orange-700 dark:bg-orange-600 dark:hover:bg-orange-700"
                    data-testid="button-view-plans"
                  >
                    View Plans
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setDismissed(true)}
                  className="h-8 w-8"
                  data-testid="button-dismiss-banner"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return null;
}
