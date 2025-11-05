import {
  BookOpen,
  FolderKanban,
  Plus,
  Sparkles,
  MoreHorizontal,
} from "lucide-react";
import { useLocation } from "wouter";
import { cn } from "@/lib/utils";

interface MobileBottomNavProps {
  onCreateNew?: () => void;
  onOpenWritingAssistant?: () => void;
  onOpenMore?: () => void;
}

export function MobileBottomNav({
  onCreateNew,
  onOpenWritingAssistant,
  onOpenMore,
}: MobileBottomNavProps) {
  const [location, setLocation] = useLocation();

  const isActive = (path: string) => {
    if (path === "/") {
      return location === "/";
    }
    return location.startsWith(path);
  };

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50 md:hidden safe-area-bottom"
      data-testid="mobile-bottom-nav"
    >
      <div className="flex items-center justify-around h-16 px-2">
        {/* Notebook */}
        <button
          onClick={() => setLocation("/notebook")}
          className={cn(
            "flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-colors flex-1 min-w-0",
            isActive("/notebook")
              ? "text-primary"
              : "text-muted-foreground hover-elevate",
          )}
          data-testid="nav-notebook"
        >
          <BookOpen
            className={cn(
              "h-5 w-5 flex-shrink-0",
              isActive("/notebook") && "fill-primary/20",
            )}
          />
          <span className="text-xs font-medium truncate w-full text-center">
            Notebook
          </span>
        </button>

        {/* Projects */}
        <button
          onClick={() => setLocation("/projects")}
          className={cn(
            "flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-colors flex-1 min-w-0",
            isActive("/projects")
              ? "text-primary"
              : "text-muted-foreground hover-elevate",
          )}
          data-testid="nav-projects"
        >
          <FolderKanban
            className={cn(
              "h-5 w-5 flex-shrink-0",
              isActive("/projects") && "fill-primary/20",
            )}
          />
          <span className="text-xs font-medium truncate w-full text-center">
            Projects
          </span>
        </button>

        {/* Create Button - Centered, Purple */}
        <button
          onClick={onCreateNew}
          className="flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-colors flex-1 min-w-0"
          data-testid="nav-create"
        >
          <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center shadow-lg">
            <Plus className="h-6 w-6 text-primary-foreground" />
          </div>
          <span className="text-xs font-medium text-primary">Create</span>
        </button>

        {/* AI Assistant */}
        <button
          onClick={onOpenWritingAssistant}
          className="flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-colors flex-1 min-w-0 text-muted-foreground hover-elevate"
          data-testid="nav-ai-assistant"
        >
          <Sparkles className="h-5 w-5 flex-shrink-0" />
          <span className="text-xs font-medium truncate w-full text-center">
            AI
          </span>
        </button>

        {/* More */}
        <button
          onClick={onOpenMore}
          className="flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-colors flex-1 min-w-0 text-muted-foreground hover-elevate"
          data-testid="nav-more"
        >
          <MoreHorizontal className="h-5 w-5 flex-shrink-0" />
          <span className="text-xs font-medium truncate w-full text-center">
            More
          </span>
        </button>
      </div>
    </nav>
  );
}
