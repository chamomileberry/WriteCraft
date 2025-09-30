import { ReactNode } from "react";
import Header from "./Header";
import { useLocation } from "wouter";

interface LayoutProps {
  children: ReactNode;
  hideNavigation?: boolean;
  onCreateNew?: () => void;
}

export default function Layout({ children, hideNavigation = false, onCreateNew }: LayoutProps) {
  const [, setLocation] = useLocation();
  
  const handleSearch = (query: string) => {
    // Navigate to home with search query
    setLocation(`/?search=${encodeURIComponent(query)}`);
  };
  
  const handleNavigate = (view: string) => {
    switch (view) {
      case 'notebook':
        setLocation('/notebook');
        break;
      case 'projects':
        setLocation('/projects');
        break;
      default:
        setLocation('/');
    }
  };
  
  const handleCreateNew = () => {
    if (onCreateNew) {
      onCreateNew();
    } else {
      // Fallback: Navigate to home and trigger create modal
      setLocation('/?create=true');
    }
  };
  
  return (
    <div className="min-h-screen bg-background">
      {!hideNavigation && (
        <Header 
          onSearch={handleSearch}
          onNavigate={handleNavigate}
          onCreateNew={handleCreateNew}
        />
      )}
      {children}
    </div>
  );
}