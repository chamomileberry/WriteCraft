"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface SidebarDrawerProps {
  children: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  className?: string;
}

const SidebarDrawer = React.forwardRef<
  HTMLDivElement,
  SidebarDrawerProps
>(({ children, isOpen, onClose, title, className, ...props }, ref) => {
  // Prevent body scroll when drawer is open
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop overlay */}
      <div 
        className="fixed inset-0 z-60 bg-black/50"
        onClick={onClose}
        data-testid="sidebar-drawer-overlay"
      />
      
      {/* Sidebar drawer content */}
      <div
        ref={ref}
        className={cn(
          "fixed top-0 left-0 z-60 h-full w-80 max-w-[85vw] bg-background border-r border-border shadow-lg transform transition-transform duration-300 ease-in-out",
          className
        )}
        {...props}
        data-testid="sidebar-drawer"
      >
        {/* Header with close button */}
        {title && (
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h2 className="text-lg font-semibold">{title}</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8"
              data-testid="sidebar-drawer-close"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </div>
    </>
  );
});

SidebarDrawer.displayName = "SidebarDrawer";

export { SidebarDrawer };