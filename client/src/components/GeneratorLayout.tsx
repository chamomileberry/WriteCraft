import { Button } from "@/components/ui/button";
import { ReactNode } from "react";

interface GeneratorLayoutProps {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  onGenerate: () => void;
  generateButtonText?: string;
  isGenerating?: boolean;
  showNotebookControls?: boolean;
  notebookControls?: ReactNode;
  generateButtonTestId?: string;
}

export function GeneratorLayout({
  title,
  subtitle,
  children,
  onGenerate,
  generateButtonText = "Generate",
  isGenerating = false,
  showNotebookControls = true,
  notebookControls,
  generateButtonTestId,
}: GeneratorLayoutProps) {
  return (
    <div className="space-y-6">
      {(title || subtitle) && (
        <div className="space-y-2">
          {title && <h3 className="text-lg font-semibold">{title}</h3>}
          {subtitle && (
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          )}
        </div>
      )}

      {showNotebookControls && notebookControls && (
        <div>{notebookControls}</div>
      )}

      <div className="space-y-4">{children}</div>

      <div className="flex justify-end pt-4">
        <Button
          onClick={onGenerate}
          disabled={isGenerating}
          data-testid={generateButtonTestId}
        >
          {isGenerating ? "Generating..." : generateButtonText}
        </Button>
      </div>
    </div>
  );
}
