import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AlertTriangle } from "lucide-react";
import { useLocation } from "wouter";

interface LimitExceededDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  limitType?: 'projects' | 'notebooks' | 'ai_generations';
  gracePeriodExpired?: boolean;
  daysRemaining?: number | null;
}

export function LimitExceededDialog({
  open,
  onOpenChange,
  limitType = 'projects',
  gracePeriodExpired = false,
  daysRemaining = null,
}: LimitExceededDialogProps) {
  const [, setLocation] = useLocation();

  const limitMessages = {
    projects: {
      title: "Project Limit Reached",
      description: "You've reached your plan's project limit.",
    },
    notebooks: {
      title: "Notebook Limit Reached",
      description: "You've reached your plan's notebook limit.",
    },
    ai_generations: {
      title: "AI Generation Limit Reached",
      description: "You've reached your daily AI generation limit.",
    },
  };

  const message = limitMessages[limitType];

  const handleUpgrade = () => {
    onOpenChange(false);
    setLocation("/pricing");
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent data-testid="dialog-limit-exceeded">
        <AlertDialogHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className={gracePeriodExpired ? "h-6 w-6 text-destructive" : "h-6 w-6 text-orange-500"} />
            <AlertDialogTitle data-testid="text-dialog-title">
              {message.title}
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription className="space-y-3 pt-2" data-testid="text-dialog-description">
            <p>{message.description}</p>
            
            {gracePeriodExpired ? (
              <div className="p-3 bg-destructive/10 border border-destructive rounded-md">
                <p className="font-semibold text-sm text-destructive">Grace Period Expired</p>
                <p className="text-sm text-destructive/90 mt-1">
                  Your grace period has ended. Please upgrade your plan or reduce your usage to continue using this feature.
                </p>
              </div>
            ) : daysRemaining !== null ? (
              <div className="p-3 bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800 rounded-md">
                <p className="font-semibold text-sm text-orange-800 dark:text-orange-300">
                  Grace Period: {daysRemaining} {daysRemaining === 1 ? 'day' : 'days'} remaining
                </p>
                <p className="text-sm text-orange-700 dark:text-orange-400 mt-1">
                  You can still create new {limitType === 'projects' ? 'projects' : limitType === 'notebooks' ? 'notebooks' : 'AI generations'} during the grace period, but please upgrade soon to avoid service interruption.
                </p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Upgrade to a higher tier to get more {limitType === 'projects' ? 'projects' : limitType === 'notebooks' ? 'notebooks' : 'AI generations'}.
              </p>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel data-testid="button-cancel">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleUpgrade}
            className={gracePeriodExpired ? "bg-destructive hover:bg-destructive/90" : ""}
            data-testid="button-view-plans"
          >
            {gracePeriodExpired ? "Upgrade Now" : "View Plans"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
