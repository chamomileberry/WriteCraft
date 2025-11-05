import { useState } from "react";
import { AlertCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation } from "@tanstack/react-query";

export function BetaBanner() {
  const [isDismissed, setIsDismissed] = useState(false);

  // Fetch user preferences to check if beta banner was dismissed
  const { data: preferences } = useQuery<any>({
    queryKey: ["/api/user/preferences"],
  });

  // Mutation to update preferences when dismissing banner
  const { mutate: updatePreferences } = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/user/preferences", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ betaBannerDismissed: true }),
      });
      if (!res.ok) throw new Error("Failed to update preferences");
      return res.json();
    },
  });

  const handleDismiss = () => {
    setIsDismissed(true);
    updatePreferences();
  };

  // Hide if already dismissed or preferences loaded and user dismissed it
  if (isDismissed || preferences?.betaBannerDismissed) {
    return null;
  }

  return (
    <div className="bg-amber-50 dark:bg-amber-950 border-b border-amber-200 dark:border-amber-800 px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-start gap-3 justify-between">
        <div className="flex items-start gap-3 flex-1">
          <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold text-amber-900 dark:text-amber-100">
              Welcome to WriteCraft Beta!
            </p>
            <p className="text-sm text-amber-800 dark:text-amber-200 mt-1">
              WriteCraft is currently in beta. You may encounter bugs or
              experience changes to features as we improve the application. We
              appreciate your patience and feedback.{" "}
              <a
                href="/feedback"
                className="underline font-semibold hover:no-underline"
              >
                Report issues here
              </a>
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDismiss}
          className="text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900"
          data-testid="button-dismiss-beta-banner"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
