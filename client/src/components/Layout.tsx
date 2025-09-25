import { ReactNode } from "react";
import Header from "./Header";
import { useLocation } from "wouter";
import WorkspaceShell from "./workspace/WorkspaceShell";

interface LayoutProps {
  children: ReactNode;
  hideNavigation?: boolean;
}

export default function Layout({ children, hideNavigation = false }: LayoutProps) {
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
      case 'manuscripts':
        setLocation('/manuscripts');
        break;
      default:
        setLocation('/');
    }
  };
  
  const handleCreateNew = () => {
    // Navigate to home and trigger create modal
    setLocation('/?create=true');
  };
  
  return (
    <WorkspaceShell>
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
    </WorkspaceShell>
  );
}