import { Search, BookOpen, Menu, Moon, Sun, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";

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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.(searchValue);
    console.log('Search triggered:', searchValue);
  };

  return (
    <header className="bg-background border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <BookOpen className="h-8 w-8 text-primary" />
            <h1 className="text-xl font-serif font-bold text-foreground">WriteCraft</h1>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#generators" className="text-foreground hover:text-primary transition-colors" data-testid="link-generators">
              Generators
            </a>
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
            <a href="#guides" className="text-foreground hover:text-primary transition-colors" data-testid="link-guides">
              Guides
            </a>
            <a href="#prompts" className="text-foreground hover:text-primary transition-colors" data-testid="link-prompts">
              Prompts
            </a>
            <a href="#resources" className="text-foreground hover:text-primary transition-colors" data-testid="link-resources">
              Resources
            </a>
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
            <a 
              href="#generators" 
              className="block text-foreground hover:text-primary transition-colors py-2" 
              data-testid="mobile-link-generators"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Generators
            </a>
            <a 
              href="#guides" 
              className="block text-foreground hover:text-primary transition-colors py-2" 
              data-testid="mobile-link-guides"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Guides
            </a>
            <a 
              href="#prompts" 
              className="block text-foreground hover:text-primary transition-colors py-2" 
              data-testid="mobile-link-prompts"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Prompts
            </a>
            <a 
              href="#resources" 
              className="block text-foreground hover:text-primary transition-colors py-2" 
              data-testid="mobile-link-resources"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Resources
            </a>
          </div>
        </div>
      )}
    </header>
  );
}