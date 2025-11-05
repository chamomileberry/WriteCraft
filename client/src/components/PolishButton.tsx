import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2 } from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";
import { UpgradePrompt } from "@/components/UpgradePrompt";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface PolishButtonProps {
  content: string;
  onPolished: (polishedContent: string) => void;
  contentType?: string;
  disabled?: boolean;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
}

export function PolishButton({
  content,
  onPolished,
  contentType = "text",
  disabled = false,
  variant = "outline",
  size = "sm",
}: PolishButtonProps) {
  const [isPolishing, setIsPolishing] = useState(false);
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
  const { hasPremiumAccess, polishRemaining, premiumQuota, refetch } =
    useSubscription();
  const { toast } = useToast();

  const handlePolish = async () => {
    // Check premium access
    if (!hasPremiumAccess()) {
      setShowUpgradePrompt(true);
      return;
    }

    // Check quota
    if (polishRemaining <= 0) {
      toast({
        title: "Quota Exceeded",
        description: `You've used all ${premiumQuota?.polish.limit || 0} Polish uses this month. Resets next billing cycle.`,
        variant: "destructive",
      });
      return;
    }

    if (!content || content.trim().length === 0) {
      toast({
        title: "No Content",
        description: "Please provide content to polish.",
        variant: "destructive",
      });
      return;
    }

    setIsPolishing(true);
    try {
      const response = await apiRequest("POST", "/api/ai/polish", {
        content,
        contentType,
      });

      const result = await response.json();

      if (result.polishedContent) {
        onPolished(result.polishedContent);
        toast({
          title: "Content Polished!",
          description: `${polishRemaining - 1} Polish uses remaining this month.`,
        });

        // Refetch quota to update UI
        refetch();
      } else {
        throw new Error("No polished content received");
      }
    } catch (error: any) {
      console.error("Polish error:", error);
      toast({
        title: "Polish Failed",
        description:
          error.message || "Failed to polish content. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsPolishing(false);
    }
  };

  const tooltipContent = hasPremiumAccess()
    ? `Enhance with higher quality AI (${polishRemaining}/${premiumQuota?.polish.limit || 0} remaining)`
    : "Professional/Team feature - Upgrade to access";

  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={variant}
            size={size}
            onClick={handlePolish}
            disabled={disabled || isPolishing}
            data-testid="button-polish"
          >
            {isPolishing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            {size !== "icon" && (
              <span className="ml-2">
                {isPolishing ? "Polishing..." : "Polish"}
              </span>
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-xs">{tooltipContent}</p>
        </TooltipContent>
      </Tooltip>

      <UpgradePrompt
        open={showUpgradePrompt}
        onOpenChange={setShowUpgradePrompt}
        title="Premium Feature"
        description="Polish uses advanced AI to enhance your content with higher quality and creativity. Available on Professional and Team plans."
        feature="Polish (Premium AI)"
      />
    </>
  );
}
