import { Search, BookOpen, Menu, Moon, Sun, Plus, StickyNote, Sparkles, User, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useWorkspaceStore } from "@/stores/workspaceStore";
import { useMobileWorkspaceMenu } from "@/components/workspace/WorkspaceShell";

interface HeaderProps {
  onSearch?: (query: string) => void;
  searchQuery?: string;
  onNavigate?: (view: string) => void;
  onCreateNew?: () => void;
}

export default function Header({ onSearch, searchQuery = "", onNavigate, onCreateNew }: HeaderProps) {
  const [searchValue, setSearchValue] = useState(searchQuery);
  const [isDark, setIsDark] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  
  const { toggleQuickNote, isQuickNoteOpen, addPanel, findPanel, focusPanel, updatePanel, openMobileDrawer, restorePanel, isInManuscriptEditor } = useWorkspaceStore();
  
  const { isMobile, hasPanels, MobileMenuButton } = useMobileWorkspaceMenu();
  
  const userInitials = user ? `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase() || user.email?.[0]?.toUpperCase() || "U" : "U";
  
  const openWritingAssistant = () => {
    const existingPanel = findPanel('writingAssistant', 'writing-assistant');
    
    if (existingPanel) {
      if (existingPanel.mode === 'docked') {
        if (existingPanel.minimized) {
          restorePanel(existingPanel.id);
        }
        focusPanel(existingPanel.id);
        if (isMobile) {
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
        if (isMobile) {
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
    
    if (isMobile) {
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

  useEffect(() => {
    setSearchValue(searchQuery);
  }, [searchQuery]);

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', newTheme);
    console.log('Theme toggled to:', newTheme ? 'dark' : 'light');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchValue.trim()) {
      setLocation(`/search?q=${encodeURIComponent(searchValue.trim())}`);
    } else {
      setLocation('/search');
    }
    onSearch?.(searchValue);
    setIsMobileSearchOpen(false);
    console.log('Search triggered:', searchValue);
  };

  return (
    <header className="bg-background border-b border-border sticky top-0 z-50">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-2 h-16">
          <button 
            onClick={() => setLocation('/')} 
            className="flex items-center gap-2 hover:opacity-80 transition-opacity flex-shrink-0"
            data-testid="button-logo-home"
          >
            <BookOpen className="h-7 w-7 text-primary flex-shrink-0" />
            <h1 className="text-lg lg:text-xl font-serif font-bold text-foreground whitespace-nowrap">WriteCraft</h1>
          </button>

          <nav className="hidden md:flex items-center gap-8 flex-shrink-0">
            <button 
              onClick={() => setLocation('/generators')}
              className="text-foreground hover:text-primary transition-colors whitespace-nowrap" 
              data-testid="link-generators"
            >
              Generators
            </button>
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
          </nav>

          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            {/* Desktop Search Bar - Larger and more prominent */}
            <form onSubmit={handleSearch} className="hidden lg:flex items-center">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search..."
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  className="pl-10 w-64 lg:w-72"
                  data-testid="input-search-desktop"
                />
              </div>
            </form>

            {/* Mobile/Tablet Search Icon */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setIsMobileSearchOpen(!isMobileSearchOpen);
                if (!isMobileSearchOpen) {
                  setIsMobileMenuOpen(false); // Close menu when opening search
                }
              }}
              className="lg:hidden"
              data-testid="button-search-mobile"
              title="Search"
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
                <DropdownMenuItem onClick={() => setLocation('/account')} data-testid="menu-account-settings">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Account Settings</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {isMobile && hasPanels && isInManuscriptEditor() && <MobileMenuButton />}

            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden" 
              onClick={() => {
                setIsMobileMenuOpen(!isMobileMenuOpen);
                if (!isMobileMenuOpen) {
                  setIsMobileSearchOpen(false); // Close search when opening menu
                }
              }}
              data-testid="button-menu"
            >
              <Menu className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile/Tablet Search Dropdown */}
      {isMobileSearchOpen && (
        <div className="lg:hidden bg-background border-b border-border">
          <div className="px-4 py-4">
            <form onSubmit={handleSearch} className="w-full">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search..."
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  className="pl-10 w-full"
                  data-testid="input-search-mobile"
                  autoFocus
                />
              </div>
            </form>
          </div>
        </div>
      )}
      
      {isMobileMenuOpen && (
        <div className="md:hidden bg-background border-b border-border">
          <div className="px-4 py-4 space-y-4">
            <button 
              onClick={() => {
                onNavigate?.('notebook');
                setIsMobileMenuOpen(false);
                setIsMobileSearchOpen(false);
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
                setIsMobileSearchOpen(false);
              }}
              className="block w-full text-left text-foreground hover:text-primary transition-colors py-2" 
              data-testid="mobile-link-projects"
            >
              Projects
            </button>
            <button 
              onClick={() => {
                setLocation('/generators');
                setIsMobileMenuOpen(false);
                setIsMobileSearchOpen(false);
              }}
              className="block w-full text-left text-foreground hover:text-primary transition-colors py-2" 
              data-testid="mobile-link-generators"
            >
              Generators
            </button>
            <button 
              onClick={() => {
                setLocation('/guides');
                setIsMobileMenuOpen(false);
                setIsMobileSearchOpen(false);
              }}
              className="block w-full text-left text-foreground hover:text-primary transition-colors py-2" 
              data-testid="mobile-link-guides"
            >
              Guides
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
