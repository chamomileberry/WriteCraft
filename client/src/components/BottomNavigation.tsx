import { BookOpen, FileText, Sparkles, User, Plus } from "lucide-react";
import { useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useWorkspaceStore } from "@/stores/workspaceStore";

interface BottomNavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  path?: string;
  onClick?: () => void;
  badge?: number;
}

interface BottomNavigationProps {
  onCreateNew?: () => void;
}

export function BottomNavigation({ onCreateNew }: BottomNavigationProps) {
  const [location, setLocation] = useLocation();
  const { addPanel, findPanel, updatePanel, restorePanel, focusPanel, openMobileDrawer } = useWorkspaceStore();

  const openWritingAssistant = () => {
    const existingPanel = findPanel('writingAssistant', 'writing-assistant');

    if (existingPanel) {
      if (existingPanel.mode === 'docked') {
        if (existingPanel.minimized) {
          restorePanel(existingPanel.id);
        }
        focusPanel(existingPanel.id);
        openMobileDrawer();
        return;
      }
      if (existingPanel.mode === 'tabbed' || existingPanel.mode === 'floating') {
        updatePanel(existingPanel.id, {
          mode: 'docked',
          regionId: 'docked',
          minimized: false
        });
        openMobileDrawer();
        return;
      }
    }

    addPanel({
      id: `writing-assistant-${Date.now()}`,
      type: 'writingAssistant' as const,
      title: 'Writing Assistant',
      mode: 'docked' as const,
      regionId: 'docked' as const,
      size: { width: 400, height: 600 },
      entityId: 'writing-assistant',
    });

    openMobileDrawer();
  };

  const navItems: BottomNavItem[] = [
    {
      id: 'home',
      label: 'Home',
      icon: BookOpen,
      path: '/',
    },
    {
      id: 'notebook',
      label: 'Notebook',
      icon: FileText,
      path: '/notebook',
    },
    {
      id: 'create',
      label: 'Create',
      icon: Plus,
      onClick: onCreateNew,
    },
    {
      id: 'assistant',
      label: 'Assistant',
      icon: Sparkles,
      onClick: openWritingAssistant,
    },
    {
      id: 'account',
      label: 'Account',
      icon: User,
      path: '/account',
    },
  ];

  const handleNavClick = (item: BottomNavItem) => {
    if (item.onClick) {
      item.onClick();
    } else if (item.path) {
      setLocation(item.path);
    }
  };

  const isActive = (item: BottomNavItem) => {
    if (!item.path) return false;
    if (item.path === '/') {
      return location === '/';
    }
    return location.startsWith(item.path);
  };

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border shadow-lg"
      aria-label="Mobile bottom navigation"
    >
      <div className="grid grid-cols-5 h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item);

          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item)}
              className={cn(
                "flex flex-col items-center justify-center gap-1 relative touch-safe",
                "transition-colors duration-200",
                "active:bg-accent",
                active
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
              aria-label={item.label}
              aria-current={active ? "page" : undefined}
              data-testid={`bottom-nav-${item.id}`}
            >
              <Icon className="h-5 w-5" />
              <span className="text-[10px] font-medium leading-none">
                {item.label}
              </span>
              {item.badge && item.badge > 0 && (
                <span className="absolute top-1 right-1/4 h-4 w-4 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center">
                  {item.badge > 9 ? '9+' : item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
