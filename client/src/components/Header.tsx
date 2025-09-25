import { Search, BookOpen, Menu, Moon, Sun, Plus, StickyNote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useWorkspaceStore } from "@/stores/workspaceStore";

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
  const [, setLocation] = useLocation();
  
  // Quick note functionality
  const { toggleQuickNote, isQuickNoteOpen } = useWorkspaceStore();

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDarkMode = savedTheme === 'dark' || (!savedTheme && systemDark);
    
    setIsDark(isDarkMode);
    document.documentElement.classList.toggle('dark', isDarkMode);
  }, []);

  // Sync search input with searchQuery prop when it changes
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
    console.log('Search triggered:', searchValue);
  };

  return (
    <header className="bg-background border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button 
            onClick={() => setLocation('/')} 
            className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
            data-testid="button-logo-home"
          >
            <BookOpen className="h-8 w-8 text-primary" />
            <h1 className="text-xl font-serif font-bold text-foreground">WriteCraft</h1>
          </button>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <button 
              onClick={() => setLocation('/generators')}
              className="text-foreground hover:text-primary transition-colors" 
              data-testid="link-generators"
            >
              Generators
            </button>
            <button 
              onClick={() => setLocation('/guides')}
              className="text-foreground hover:text-primary transition-colors" 
              data-testid="link-guides"
            >
              Guides
            </button>
            <button 
              onClick={() => onNavigate?.('notebook')}
              className="text-foreground hover:text-primary transition-colors" 
              data-testid="link-notebook"
            >
              Notebook
            </button>
            <button 
              onClick={() => onNavigate?.('manuscripts')}
              className="text-foreground hover:text-primary transition-colors" 
              data-testid="link-manuscripts"
            >
              Manuscripts
            </button>
          </nav>

          {/* Search and Actions */}
          <div className="flex items-center space-x-4">
            <form onSubmit={handleSearch} className="hidden sm:flex items-center">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search tools and guides..."
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  className="pl-10 w-64"
                  data-testid="input-search"
                />
              </div>
            </form>
            
            {/* Create New Button */}
            <Button
              variant="default"
              size="default"
              onClick={() => onCreateNew?.()}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
              data-testid="button-create-new"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create
            </Button>
            
            {/* Quick Note Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleQuickNote}
              className={`${isQuickNoteOpen() ? 'bg-primary/10 text-primary' : ''}`}
              data-testid="button-quick-note"
              title="Quick Note"
            >
              <StickyNote className="h-4 w-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              data-testid="button-theme-toggle"
            >
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>

            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden" 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              data-testid="button-menu"
            >
              <Menu className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      
      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-background border-b border-border">
          <div className="px-4 py-4 space-y-4">
            <button 
              onClick={() => {
                toggleQuickNote();
                setIsMobileMenuOpen(false);
              }}
              className={`flex items-center gap-2 w-full text-left transition-colors py-2 ${
                isQuickNoteOpen() ? 'text-primary' : 'text-foreground hover:text-primary'
              }`}
              data-testid="mobile-button-quick-note"
            >
              <StickyNote className="h-4 w-4" />
              Quick Note
            </button>
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
                onNavigate?.('manuscripts');
                setIsMobileMenuOpen(false);
              }}
              className="block w-full text-left text-foreground hover:text-primary transition-colors py-2" 
              data-testid="mobile-link-manuscripts"
            >
              Manuscripts
            </button>
            <button 
              onClick={() => {
                setLocation('/generators');
                setIsMobileMenuOpen(false);
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