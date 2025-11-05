import { ReactNode } from "react";
import { useRequireNotebook } from "@/hooks/useRequireNotebook";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, ArrowRight } from "lucide-react";

interface NotebookGuardProps {
  /**
   * Content to render when a notebook is selected
   */
  children: ReactNode;

  /**
   * Custom title for the "no notebook" message
   */
  title?: string;

  /**
   * Custom description for the "no notebook" message
   */
  description?: string;

  /**
   * If true, shows a minimal banner instead of full card
   */
  minimal?: boolean;
}

/**
 * Guard component that ensures a notebook is selected before rendering children.
 * Shows a helpful message with navigation to notebooks page if none is selected.
 *
 * @example
 * ```tsx
 * <NotebookGuard title="Select a Notebook" description="Choose a notebook to save your characters.">
 *   <CharacterForm />
 * </NotebookGuard>
 * ```
 */
export function NotebookGuard({
  children,
  title = "No Notebook Selected",
  description = "Please select or create a notebook to use this feature. Notebooks help you organize all your worldbuilding content in one place.",
  minimal = false,
}: NotebookGuardProps) {
  const { hasNotebook, goToNotebooks } = useRequireNotebook();

  if (hasNotebook) {
    return <>{children}</>;
  }

  if (minimal) {
    return (
      <div
        className="bg-muted/50 border border-dashed rounded-lg p-6 text-center"
        data-testid="notebook-guard-banner"
      >
        <p className="text-sm text-muted-foreground mb-3">{description}</p>
        <Button
          onClick={goToNotebooks}
          size="sm"
          data-testid="button-go-to-notebooks"
        >
          <BookOpen className="w-4 h-4 mr-2" />
          Select Notebook
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    );
  }

  return (
    <div
      className="flex items-center justify-center min-h-[400px] p-4"
      data-testid="notebook-guard"
    >
      <Card className="max-w-md">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <BookOpen className="w-6 h-6 text-primary" />
            </div>
            <div>
              <CardTitle>{title}</CardTitle>
              <CardDescription className="mt-1">{description}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Button
            onClick={goToNotebooks}
            className="w-full"
            data-testid="button-go-to-notebooks"
          >
            <BookOpen className="w-4 h-4 mr-2" />
            Go to Notebooks
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
