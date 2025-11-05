import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Save, Loader2, ChevronRight, Menu } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { Project } from "@shared/schema";

interface ProjectHeaderProps {
  project?: Project;
  breadcrumb?: string[];
  wordCount: number;
  saveStatus: "saved" | "saving" | "unsaved";
  lastSaveTime: Date | null;
  onBack: () => void;
  onManualSave: () => void;
  isSaving: boolean;
  sidebarOpen?: boolean;
  onToggleSidebar?: () => void;
}

export function ProjectHeader({
  project,
  breadcrumb = [],
  wordCount,
  saveStatus,
  lastSaveTime,
  onBack,
  onManualSave,
  isSaving,
  sidebarOpen = true,
  onToggleSidebar,
}: ProjectHeaderProps) {
  return (
    <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Left: Breadcrumb navigation */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {/* Hamburger menu button (only shown when sidebar is closed) */}
          {!sidebarOpen && onToggleSidebar && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleSidebar}
              className="flex-shrink-0 h-8 w-8"
              data-testid="button-show-outline"
              title="Show outline"
            >
              <Menu className="h-4 w-4" />
            </Button>
          )}

          <div className="flex items-center gap-2 min-w-0 text-sm">
            {/* Project title */}
            <span
              className="font-semibold truncate"
              data-testid="text-project-title"
            >
              {project?.title || "Untitled Project"}
            </span>

            {/* Breadcrumb trail */}
            {breadcrumb.length > 0 && (
              <>
                <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                {breadcrumb.map((crumb, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <span
                      className={
                        index === breadcrumb.length - 1
                          ? "font-medium"
                          : "text-muted-foreground"
                      }
                      data-testid={`text-breadcrumb-${index}`}
                    >
                      {crumb}
                    </span>
                    {index < breadcrumb.length - 1 && (
                      <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    )}
                  </div>
                ))}
              </>
            )}
          </div>
        </div>

        {/* Right: Stats and save button */}
        <div className="flex items-center gap-4 flex-shrink-0">
          {/* Word count */}
          <div
            className="text-sm text-muted-foreground"
            data-testid="text-word-count"
          >
            {wordCount.toLocaleString()} words
          </div>

          {/* Save status */}
          <div className="flex items-center gap-2">
            {saveStatus === "saving" && (
              <Badge
                variant="secondary"
                className="gap-1"
                data-testid="badge-save-status"
              >
                <Loader2 className="h-3 w-3 animate-spin" />
                Saving...
              </Badge>
            )}
            {saveStatus === "saved" && lastSaveTime && (
              <Badge
                variant="secondary"
                className="gap-1"
                data-testid="badge-save-status"
              >
                Saved {formatDistanceToNow(lastSaveTime, { addSuffix: true })}
              </Badge>
            )}
            {saveStatus === "unsaved" && (
              <Badge variant="destructive" data-testid="badge-save-status">
                Unsaved changes
              </Badge>
            )}
          </div>

          {/* Manual save button */}
          <Button
            size="sm"
            onClick={onManualSave}
            disabled={isSaving || saveStatus === "saved"}
            data-testid="button-manual-save"
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save
          </Button>
        </div>
      </div>
    </div>
  );
}
