import { ReactNode } from "react";

interface LayoutProps {
  children: ReactNode;
  hideNavigation?: boolean;
  onCreateNew?: () => void;
}

export default function Layout({ children, hideNavigation = false, onCreateNew }: LayoutProps) {
  // Header is now rendered at the App.tsx level for site-wide consistency
  // Layout component now just provides the container structure
  
  return (
    <div className="min-h-screen bg-background">
      {children}
    </div>
  );
}