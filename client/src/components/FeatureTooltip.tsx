import { HelpCircle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface FeatureTooltipProps {
  title: string;
  description: string;
  children: React.ReactNode;
  comparison?: {
    free?: string;
    author?: string;
    professional?: string;
    team?: string;
  };
}

export function FeatureTooltip({
  title,
  description,
  children,
  comparison,
}: FeatureTooltipProps) {
  return (
    <TooltipProvider>
      <Tooltip delayDuration={200}>
        <TooltipTrigger asChild>
          <div className="flex items-start gap-2 cursor-help group">
            {children}
            <HelpCircle className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </TooltipTrigger>
        <TooltipContent
          side="right"
          className="max-w-xs"
          data-testid="tooltip-feature-info"
        >
          <div className="space-y-2">
            <div>
              <p className="font-semibold text-sm">{title}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {description}
              </p>
            </div>

            {comparison && (
              <div className="border-t pt-2 mt-2">
                <p className="text-xs font-semibold mb-1">Tier Comparison:</p>
                <div className="space-y-1 text-xs">
                  {comparison.free && (
                    <div className="flex justify-between gap-4">
                      <span className="text-muted-foreground">Free:</span>
                      <span>{comparison.free}</span>
                    </div>
                  )}
                  {comparison.author && (
                    <div className="flex justify-between gap-4">
                      <span className="text-muted-foreground">Author:</span>
                      <span>{comparison.author}</span>
                    </div>
                  )}
                  {comparison.professional && (
                    <div className="flex justify-between gap-4">
                      <span className="text-muted-foreground">
                        Professional:
                      </span>
                      <span>{comparison.professional}</span>
                    </div>
                  )}
                  {comparison.team && (
                    <div className="flex justify-between gap-4">
                      <span className="text-muted-foreground">Team:</span>
                      <span>{comparison.team}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
