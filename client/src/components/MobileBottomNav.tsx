import { Home, BookOpen, Wand2, FileText, FolderKanban, User } from "lucide-react";
import { useLocation } from "wouter";
import { cn } from "@/lib/utils";

export function MobileBottomNav() {
  const [location, setLocation] = useLocation();

  const navItems = [
    {
      icon: Home,
      label: "Home",
      path: "/",
      testId: "nav-home"
    },
    {
      icon: BookOpen,
      label: "Notebook",
      path: "/notebook",
      testId: "nav-notebook"
    },
    {
      icon: Wand2,
      label: "Generators",
      path: "/generators",
      testId: "nav-generators"
    },
    {
      icon: FileText,
      label: "Guides",
      path: "/guides",
      testId: "nav-guides"
    },
    {
      icon: FolderKanban,
      label: "Projects",
      path: "/projects",
      testId: "nav-projects"
    }
  ];

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
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          
          return (
            <button
              key={item.path}
              onClick={() => setLocation(item.path)}
              className={cn(
                "flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-colors flex-1 min-w-0",
                active 
                  ? "text-primary" 
                  : "text-muted-foreground hover-elevate"
              )}
              data-testid={item.testId}
            >
              <Icon className={cn("h-5 w-5 flex-shrink-0", active && "fill-primary/20")} />
              <span className="text-xs font-medium truncate w-full text-center">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
