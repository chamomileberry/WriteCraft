import { Search, BookOpen, Menu, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";

interface HeaderProps {
  onSearch?: (query: string) => void;
  searchQuery?: string;
  onNavigate?: (view: string) => void;
}

export default function Header({ onSearch, searchQuery = "", onNavigate }: HeaderProps) {
  const [searchValue, setSearchValue] = useState(searchQuery);
  const [isDark, setIsDark] = useState(false);

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
              onClick={() => onNavigate?.('saved-items')}
              className="text-foreground hover:text-primary transition-colors" 
              data-testid="link-collection"
            >
              Collection
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
            
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              data-testid="button-theme-toggle"
            >
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>

            <Button variant="ghost" size="icon" className="md:hidden" data-testid="button-menu">
              <Menu className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}