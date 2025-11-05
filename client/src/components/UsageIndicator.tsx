import { useQuery } from "@tanstack/react-query";
import { useSubscription } from "@/hooks/useSubscription";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Infinity } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface UsageIndicatorProps {
  type: "ai_generations";
  showLabel?: boolean;
  compact?: boolean;
}

export function UsageIndicator({
  type,
  showLabel = true,
  compact = false,
}: UsageIndicatorProps) {
  const { subscription, getMaxLimit } = useSubscription();

  // Fetch AI usage stats
  const { data: usage, isLoading } = useQuery<{
    count: number;
    limit: number | null;
    remaining: number | null;
  }>({
    queryKey: ["/api/subscription/usage", type],
    enabled: type === "ai_generations",
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  if (isLoading || !subscription) {
    return null;
  }

  const limits = getMaxLimit("ai_generations");

  if (limits.unlimited) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-2">
              {showLabel && (
                <span className="text-sm text-muted-foreground">
                  AI Generations:
                </span>
              )}
              <Badge variant="secondary" className="gap-1">
                <Infinity className="h-3 w-3" />
                Unlimited
              </Badge>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>Your plan includes unlimited AI generations</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  const count = usage?.count || 0;
  const limit = limits.max || 0;
  const remaining = usage?.remaining ?? limit - count;
  const percentage = limit > 0 ? (count / limit) * 100 : 0;
  const isNearLimit = percentage >= 80;
  const isAtLimit = remaining <= 0;

  if (compact) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge
              variant={
                isAtLimit
                  ? "destructive"
                  : isNearLimit
                    ? "secondary"
                    : "outline"
              }
              className="gap-1"
              data-testid="badge-ai-usage-compact"
            >
              {isAtLimit && <AlertCircle className="h-3 w-3" />}
              {remaining}/{limit}
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p>
              {remaining} AI generation{remaining !== 1 ? "s" : ""} remaining
              today
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <div className="space-y-2" data-testid="usage-indicator-ai">
      <div className="flex items-center justify-between gap-4">
        {showLabel && (
          <span className="text-sm font-medium">AI Generations Today</span>
        )}
        <span className="text-sm text-muted-foreground">
          {count} / {limit}
        </span>
      </div>
      <Progress
        value={percentage}
        className={
          isAtLimit ? "bg-destructive/20" : isNearLimit ? "bg-warning/20" : ""
        }
      />
      {isNearLimit && (
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          {isAtLimit
            ? "Daily limit reached. Upgrade for unlimited generations."
            : `${remaining} generation${remaining !== 1 ? "s" : ""} remaining today.`}
        </p>
      )}
    </div>
  );
}
