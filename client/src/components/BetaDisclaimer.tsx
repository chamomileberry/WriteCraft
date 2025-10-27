import { AlertCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";

export function BetaDisclaimer() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [localDismissed, setLocalDismissed] = useState(false);

  const { data: preferences } = useQuery<{ betaBannerDismissed?: boolean }>({
    queryKey: ['/api/user/preferences'],
    enabled: !!user,
  });

  const dismissMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('/api/user/preferences', 'PATCH', {
        betaBannerDismissed: true,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user/preferences'] });
      setLocalDismissed(true);
    },
  });

  useEffect(() => {
    if (preferences?.betaBannerDismissed) {
      setLocalDismissed(true);
    }
  }, [preferences]);

  const handleDismiss = () => {
    dismissMutation.mutate();
  };

  if (!user || preferences?.betaBannerDismissed || localDismissed) {
    return null;
  }

  return (
    <div className="border-b border-primary/30 bg-primary/5" data-testid="banner-beta-disclaimer">
      <div className="container mx-auto">
        <Alert className="border-0 bg-transparent rounded-none">
          <AlertCircle className="h-5 w-5 text-primary" />
          <AlertDescription className="flex items-center justify-between gap-4 ml-2">
            <div className="flex-1">
              <p className="text-sm text-foreground">
                <strong className="font-semibold">WriteCraft is in BETA.</strong> You may encounter bugs or changes.{' '}
                <Link href="/feedback">
                  <span className="underline hover:text-primary cursor-pointer" data-testid="link-report-issues">
                    Report issues
                  </span>
                </Link>
                {' '}to help us improve.
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDismiss}
              className="h-8 w-8 shrink-0"
              data-testid="button-dismiss-beta-banner"
              disabled={dismissMutation.isPending}
            >
              <X className="h-4 w-4" />
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}
