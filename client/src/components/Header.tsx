import { Search, BookOpen, Menu, Moon, Sun, Plus, StickyNote, Sparkles, User, Settings, ChevronDown, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useWorkspaceStore } from "@/stores/workspaceStore";
import { useMobileWorkspaceMenu } from "@/components/workspace/WorkspaceShell";
import { GeneratorDropdown, GENERATORS } from "@/components/GeneratorDropdown";
import { GeneratorModals, GeneratorType } from "@/components/GeneratorModals";
import { CommandPalette } from "@/components/CommandPalette";
import { BillingAlertsDropdown } from "@/components/BillingAlertsDropdown";
import { useIsMobile } from "@/hooks/use-mobile";

interface HeaderProps {
  onSearch?: (query: string) => void;
  searchQuery?: string;
  onNavigate?: (view: string) => void;
  onCreateNew?: () => void;
}

export default function Header({ onSearch, searchQuery = "", onNavigate, onCreateNew }: HeaderProps) {
  const [isDark, setIsDark] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileGeneratorsExpanded, setIsMobileGeneratorsExpanded] = useState(false);
  const [activeGenerator, setActiveGenerator] = useState<GeneratorType>(null);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [, setLocation] = useLocation();
  const { user } = useAuth();

  const { toggleQuickNote, isQuickNoteOpen, addPanel, findPanel, focusPanel, updatePanel, openMobileDrawer, restorePanel, isInManuscriptEditor } = useWorkspaceStore();

  const { isMobile: isWorkspaceMobile, hasPanels, MobileMenuButton } = useMobileWorkspaceMenu();
  const isMobile = useIsMobile();

  const userInitials = user ? `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase() || user.email?.[0]?.toUpperCase() || "U" : "U";

  const openWritingAssistant = () => {
    const existingPanel = findPanel('writingAssistant', 'writing-assistant');

    if (existingPanel) {
      if (existingPanel.mode === 'docked') {
        if (existingPanel.minimized) {
          restorePanel(existingPanel.id);
        }
        focusPanel(existingPanel.id);
        if (isWorkspaceMobile) {
          openMobileDrawer();
        }
        return;
      }
      if (existingPanel.mode === 'tabbed' || existingPanel.mode === 'floating') {
        updatePanel(existingPanel.id, {
          mode: 'docked',
          regionId: 'docked',
          minimized: false
        });
        if (isWorkspaceMobile) {
          openMobileDrawer();
        }
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

    if (isWorkspaceMobile) {
      openMobileDrawer();
    }
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDarkMode = savedTheme === 'dark' || (!savedTheme && systemDark);

    setIsDark(isDarkMode);
    document.documentElement.classList.toggle('dark', isDarkMode);
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', newTheme);
    console.log('Theme toggled to:', newTheme ? 'dark' : 'light');
  };

  return (
    <header className="bg-background border-b border-border sticky top-0 z-40">
      <div className={`px-4 sm:px-6 lg:px-8 ${isMobile ? 'h-14' : 'h-16'}`}>
        <div className="flex items-center justify-between gap-2 h-full">
          <button
            onClick={() => setLocation('/')}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity flex-shrink-0"
            data-testid="button-logo-home"
          >
            <BookOpen className="h-7 w-7 text-primary flex-shrink-0" />
            <h1 className={`font-serif font-bold text-foreground whitespace-nowrap ${isMobile ? 'text-lg' : 'text-lg lg:text-xl'}`}>WriteCraft</h1>
          </button>

          <nav className="hidden md:flex items-center gap-8 flex-shrink-0">
            <GeneratorDropdown onSelectGenerator={setActiveGenerator} />
            <button
              onClick={() => setLocation('/guides')}
              className="text-foreground hover:text-primary transition-colors whitespace-nowrap"
              data-testid="link-guides"
            >
              Guides
            </button>
            <button
              onClick={() => onNavigate?.('notebook')}
              className="text-foreground hover:text-primary transition-colors whitespace-nowrap"
              data-testid="link-notebook"
            >
              Notebook
            </button>
            <button
              onClick={() => onNavigate?.('projects')}
              className="text-foreground hover:text-primary transition-colors whitespace-nowrap"
              data-testid="link-projects"
            >
              Projects
            </button>
            <button
              onClick={() => setLocation('/canvases')}
              className="text-foreground hover:text-primary transition-colors whitespace-nowrap"
              data-testid="link-canvases"
            >
              Canvas
            </button>
          </nav>

          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            {/* Search Button - Opens Command Palette */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsCommandPaletteOpen(true)}
              data-testid="button-search"
              title="Search (⌘K)"
              aria-label="Search"
            >
              <Search className="h-4 w-4" />
            </Button>

            <Button
              variant="default"
              size="sm"
              onClick={() => onCreateNew?.()}
              className="flex bg-primary hover:bg-primary/90 text-primary-foreground"
              data-testid="button-create-new"
            >
              <Plus className="h-4 w-4 sm:mr-1" />
              <span className="hidden sm:inline">Create</span>
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={toggleQuickNote}
              className={`${isQuickNoteOpen() ? 'bg-primary/10 text-primary' : ''}`}
              data-testid="button-quick-note"
              title="Quick Note"
              aria-label="Quick Note"
            >
              <StickyNote className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={openWritingAssistant}
              className="hover:bg-primary/10 hover:text-primary"
              style={{
                background: 'linear-gradient(135deg, hsl(270, 75%, 75%) 0%, hsl(255, 69%, 71%) 100%)',
                color: 'white'
              }}
              data-testid="button-writing-assistant"
              title="Writing Assistant"
              aria-label="Writing Assistant"
            >
              <Sparkles className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              data-testid="button-theme-toggle"
            >
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>

            <BillingAlertsDropdown />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" data-testid="button-user-menu">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.profileImageUrl || undefined} />
                    <AvatarFallback className="text-xs">{userInitials}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setLocation('/import')} data-testid="menu-import">
                  <Upload className="mr-2 h-4 w-4" />
                  <span>Import</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLocation('/account')} data-testid="menu-account-settings">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Account Settings</span>
                </DropdownMenuItem>
                {user?.isAdmin && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setLocation('/admin/discount-codes')} data-testid="menu-admin-discounts">
                      <Sparkles className="mr-2 h-4 w-4" />
                      <span>Discount Codes</span>
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              data-testid="button-menu"
              title="Menu"
              aria-label="Menu"
            >
              <Menu className="h-4 w-4" />
            </Button>

            {isWorkspaceMobile && hasPanels && isInManuscriptEditor() && <MobileMenuButton />}
          </div>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden bg-background border-b border-border max-h-[calc(100vh-4rem)] overflow-y-auto">
          <div className="px-4 py-4 space-y-4">
            <button
              onClick={() => {
                onNavigate?.('notebook');
                setIsMobileMenuOpen(false);
              }}
              className="block w-full text-left text-foreground hover:text-primary transition-colors py-2"
              data-testid="mobile-link-notebook"
            >
              Notebook
            </button>
            <button
              onClick={() => {
                onNavigate?.('projects');
                setIsMobileMenuOpen(false);
              }}
              className="block w-full text-left text-foreground hover:text-primary transition-colors py-2"
              data-testid="mobile-link-projects"
            >
              Projects
            </button>

            <div className="space-y-2">
              <button
                onClick={() => setIsMobileGeneratorsExpanded(!isMobileGeneratorsExpanded)}
                className="flex items-center justify-between w-full text-left text-foreground hover:text-primary transition-colors py-2"
                data-testid="mobile-link-generators"
              >
                <span>Generators</span>
                <ChevronDown className={`h-4 w-4 transition-transform ${isMobileGeneratorsExpanded ? 'rotate-180' : ''}`} />
              </button>

              {isMobileGeneratorsExpanded && (
                <div className="pl-4 space-y-2">
                  {GENERATORS.map((generator) => {
                    const Icon = generator.icon;
                    return (
                      <button
                        key={generator.id}
                        onClick={() => {
                          setActiveGenerator(generator.id);
                          setIsMobileMenuOpen(false);
                          setIsMobileGeneratorsExpanded(false);
                        }}
                        className="flex items-center gap-2 w-full text-left text-sm text-foreground hover:text-primary transition-colors py-2"
                        data-testid={`mobile-${generator.id}`}
                      >
                        <Icon className="h-4 w-4 text-muted-foreground" />
                        <span>{generator.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <button
              onClick={() => {
                setLocation('/guides');
                setIsMobileMenuOpen(false);
              }}
              className="block w-full text-left text-foreground hover:text-primary transition-colors py-2"
              data-testid="mobile-link-guides"
            >
              Guides
            </button>
          </div>
        </div>
      )}

      <GeneratorModals
        activeGenerator={activeGenerator}
        onClose={() => setActiveGenerator(null)}
      />

      <CommandPalette
        open={isCommandPaletteOpen}
        onOpenChange={setIsCommandPaletteOpen}
      />
    </header>
  );
}