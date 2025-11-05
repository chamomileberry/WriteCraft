import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useSubscription } from "@/hooks/useSubscription";
import { Link } from "wouter";
import { TrendingUp, AlertCircle, CheckCircle2, Clock } from "lucide-react";

export function SubscriptionStatusCard() {
  const {
    tier,
    effectiveTier,
    isPaused,
    limits,
    usage,
    limitsExceeded,
    inGracePeriod,
    gracePeriodExpired,
    gracePeriodDaysRemaining,
    isLoading,
  } = useSubscription();

  if (isLoading) {
    return (
      <Card data-testid="card-subscription-status">
        <CardHeader>
          <CardTitle>Subscription Status</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Loading...</p>
        </CardContent>
      </Card>
    );
  }

  const getUsagePercentage = (current: number, max: number | null): number => {
    if (max === null) return 0;
    return Math.min((current / max) * 100, 100);
  };

  const getUsageColor = (
    current: number,
    max: number | null,
    exceeded: boolean,
  ): string => {
    if (exceeded) return "bg-destructive";
    if (max === null) return "bg-primary";
    const percentage = (current / max) * 100;
    if (percentage >= 90) return "bg-orange-500";
    if (percentage >= 75) return "bg-yellow-500";
    return "bg-primary";
  };

  const tierDisplayName =
    {
      free: "Free",
      author: "Author",
      professional: "Professional",
      team: "Team",
    }[tier] || tier;

  const effectiveTierDisplayName =
    {
      free: "Free",
      author: "Author",
      professional: "Professional",
      team: "Team",
    }[effectiveTier] || effectiveTier;

  return (
    <Card data-testid="card-subscription-status">
      <CardHeader className="gap-1">
        <div className="flex items-center justify-between">
          <CardTitle>Subscription Status</CardTitle>
          {isPaused && (
            <Badge
              variant="outline"
              className="text-orange-600 border-orange-600"
              data-testid="badge-paused"
            >
              Paused
            </Badge>
          )}
          {inGracePeriod && (
            <Badge
              variant="outline"
              className="text-orange-600 border-orange-600"
              data-testid="badge-grace-period"
            >
              <Clock className="h-3 w-3 mr-1" />
              Grace Period
            </Badge>
          )}
          {gracePeriodExpired && (
            <Badge variant="destructive" data-testid="badge-grace-expired">
              <AlertCircle className="h-3 w-3 mr-1" />
              Expired
            </Badge>
          )}
        </div>
        <CardDescription>
          {isPaused ? (
            <>
              {tierDisplayName} plan (using {effectiveTierDisplayName} tier
              limits while paused)
            </>
          ) : (
            <>{tierDisplayName} plan</>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Grace Period Warning */}
        {inGracePeriod && gracePeriodDaysRemaining !== null && (
          <div
            className="p-3 bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800 rounded-md"
            data-testid="alert-grace-period"
          >
            <div className="flex items-start gap-2">
              <Clock className="h-5 w-5 text-orange-600 dark:text-orange-400 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold text-sm text-orange-800 dark:text-orange-300">
                  {gracePeriodDaysRemaining}{" "}
                  {gracePeriodDaysRemaining === 1 ? "day" : "days"} remaining
                </p>
                <p className="text-sm text-orange-700 dark:text-orange-400 mt-1">
                  Upgrade or reduce usage to avoid service interruption
                </p>
              </div>
            </div>
          </div>
        )}

        {gracePeriodExpired && (
          <div
            className="p-3 bg-destructive/10 border border-destructive rounded-md"
            data-testid="alert-grace-expired"
          >
            <div className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold text-sm text-destructive">
                  Grace period expired
                </p>
                <p className="text-sm text-destructive/90 mt-1">
                  Please upgrade or reduce usage to continue
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Usage Statistics */}
        <div className="space-y-4">
          {/* Projects */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium flex items-center gap-2">
                Projects
                {limitsExceeded?.projects && (
                  <AlertCircle className="h-4 w-4 text-destructive" />
                )}
              </span>
              <span
                className="text-muted-foreground"
                data-testid="text-projects-usage"
              >
                {usage?.projects || 0} /{" "}
                {limits?.maxProjects === null ? "∞" : limits?.maxProjects}
              </span>
            </div>
            {limits?.maxProjects !== null &&
              limits?.maxProjects !== undefined && (
                <Progress
                  value={getUsagePercentage(
                    usage?.projects || 0,
                    limits.maxProjects,
                  )}
                  className="h-2"
                  indicatorClassName={getUsageColor(
                    usage?.projects || 0,
                    limits.maxProjects,
                    limitsExceeded?.projects || false,
                  )}
                  data-testid="progress-projects"
                />
              )}
          </div>

          {/* Notebooks */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium flex items-center gap-2">
                Notebooks
                {limitsExceeded?.notebooks && (
                  <AlertCircle className="h-4 w-4 text-destructive" />
                )}
              </span>
              <span
                className="text-muted-foreground"
                data-testid="text-notebooks-usage"
              >
                {usage?.notebooks || 0} /{" "}
                {limits?.maxNotebooks === null ? "∞" : limits?.maxNotebooks}
              </span>
            </div>
            {limits?.maxNotebooks !== null &&
              limits?.maxNotebooks !== undefined && (
                <Progress
                  value={getUsagePercentage(
                    usage?.notebooks || 0,
                    limits.maxNotebooks,
                  )}
                  className="h-2"
                  indicatorClassName={getUsageColor(
                    usage?.notebooks || 0,
                    limits.maxNotebooks,
                    limitsExceeded?.notebooks || false,
                  )}
                  data-testid="progress-notebooks"
                />
              )}
          </div>

          {/* AI Generations */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium flex items-center gap-2">
                AI Generations (Today)
                {limitsExceeded?.aiGenerations && (
                  <AlertCircle className="h-4 w-4 text-destructive" />
                )}
              </span>
              <span
                className="text-muted-foreground"
                data-testid="text-ai-usage"
              >
                {usage?.aiGenerationsToday || 0} /{" "}
                {limits?.aiGenerationsPerDay === null
                  ? "∞"
                  : limits?.aiGenerationsPerDay}
              </span>
            </div>
            {limits?.aiGenerationsPerDay !== null &&
              limits?.aiGenerationsPerDay !== undefined && (
                <Progress
                  value={getUsagePercentage(
                    usage?.aiGenerationsToday || 0,
                    limits.aiGenerationsPerDay,
                  )}
                  className="h-2"
                  indicatorClassName={getUsageColor(
                    usage?.aiGenerationsToday || 0,
                    limits.aiGenerationsPerDay,
                    limitsExceeded?.aiGenerations || false,
                  )}
                  data-testid="progress-ai-generations"
                />
              )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-4 border-t">
          {tier === "free" && (
            <Link href="/pricing" className="flex-1">
              <Button
                className="w-full"
                variant="default"
                data-testid="button-upgrade"
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                Upgrade Plan
              </Button>
            </Link>
          )}
          {tier !== "free" && (
            <Link href="/settings?tab=billing" className="flex-1">
              <Button
                className="w-full"
                variant="outline"
                data-testid="button-manage-billing"
              >
                Manage Billing
              </Button>
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
