import { ReactNode } from "react";
import Header from "./Header";
import Footer from "./Footer";
import { useIsMobile } from "@/hooks/use-mobile";

interface LayoutProps {
  children: ReactNode;
  hideNavigation?: boolean;
  onCreateNew?: () => void;
}

export default function Layout({
  children,
  hideNavigation = false,
  onCreateNew,
}: LayoutProps) {
  const isMobile = useIsMobile();

  // Header is now rendered at the App.tsx level for site-wide consistency
  // Layout component now just provides the container structure

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main
        className={`flex-1 container mx-auto ${isMobile ? "px-3 py-4" : "px-4 py-8"}`}
      >
        {children}
      </main>
      <Footer />
    </div>
  );
}
