import React, { useRef, useState } from "react";
import { Rnd } from "react-rnd";
import {
  useWorkspaceStore,
  type PanelDescriptor,
} from "@/stores/workspaceStore";
import CharacterDetailPanel from "./CharacterDetailPanel";
import { ContentDetailPanel } from "./ContentDetailPanel";
import QuickNotePanel from "./QuickNotePanel";
import WritingAssistantPanel from "./WritingAssistantPanel";
import { FloatingLayer } from "./FloatingLayer";
import {
  X,
  GripHorizontal,
  Pin,
  Save,
  Minimize2,
  MessageSquarePlus,
  History,
  Menu,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useQueryClient } from "@tanstack/react-query";
import { useMobileDetection } from "@/hooks/useMobileDetection";
import { SidebarDrawer } from "@/components/ui/sidebar-drawer";

interface WorkspaceShellProps {
  children: React.ReactNode;
}

// Mobile menu hook for external components
export const useMobileWorkspaceMenu = () => {
  const { isMobile } = useMobileDetection();
  const { currentLayout, isMobileDrawerOpen, toggleMobileDrawer } =
    useWorkspaceStore();

  const dockedPanels = currentLayout.panels.filter(
    (panel) => panel.mode === "docked" && !panel.minimized,
  );
  const hasPanels = dockedPanels.length > 0;

  const MobileMenuButton = () => (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleMobileDrawer}
      className="md:hidden"
      data-testid="mobile-menu-button"
      title="Open menu"
    >
      <Menu className="h-5 w-5" />
    </Button>
  );

  return {
    isMobile,
    hasPanels,
    isDrawerOpen: isMobileDrawerOpen,
    MobileMenuButton,
  };
};

const WorkspaceShell = ({ children }: WorkspaceShellProps) => {
  const {
    currentLayout,
    removePanel,
    updatePanel,
    attachToTabBar,
    minimizePanel,
    isInManuscriptEditor,
    isMobileDrawerOpen,
    closeMobileDrawer,
  } = useWorkspaceStore();
  const workspaceRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { isMobile } = useMobileDetection();

  // Store save and clear functions for quick note panels
  const quickNoteSaveFunctions = useRef<{
    [panelId: string]: () => Promise<{ content: string; id: string }>;
  }>({});
  const quickNoteClearFunctions = useRef<{ [panelId: string]: () => void }>({});

  // Store functions for writing assistant panels
  const writingAssistantClearChatFunctions = useRef<{
    [panelId: string]: () => void;
  }>({});
  const writingAssistantToggleHistoryFunctions = useRef<{
    [panelId: string]: () => void;
  }>({});

  // Get docked panels for sidebar
  const dockedPanels = currentLayout.panels.filter(
    (panel) => panel.mode === "docked" && !panel.minimized,
  );

  const renderPanelContent = (panel: PanelDescriptor) => {
    switch (panel.type) {
      case "characterDetail":
        return (
          <CharacterDetailPanel
            characterId={panel.entityId!}
            panelId={panel.id}
            notebookId={panel.notebookId}
          />
        );
      case "contentDetail":
        return (
          <ContentDetailPanel
            contentType={panel.contentType!}
            entityId={panel.entityId!}
            panelId={panel.id}
            notebookId={panel.notebookId}
          />
        );
      case "quickNote":
        return (
          <QuickNotePanel
            panelId={panel.id}
            onRegisterSaveFunction={(fn) => {
              quickNoteSaveFunctions.current[panel.id] = fn;
            }}
            onRegisterClearFunction={(fn) => {
              quickNoteClearFunctions.current[panel.id] = fn;
            }}
          />
        );
      case "writingAssistant":
        return (
          <WritingAssistantPanel
            panelId={panel.id}
            onRegisterClearChatFunction={(fn) => {
              writingAssistantClearChatFunctions.current[panel.id] = fn;
            }}
            onRegisterToggleHistoryFunction={(fn) => {
              writingAssistantToggleHistoryFunctions.current[panel.id] = fn;
            }}
          />
        );
      default:
        return (
          <div className="p-4 border rounded bg-background">
            <p>Panel type "{panel.type}" not implemented yet</p>
          </div>
        );
    }
  };

  const getDefaultPanelSize = (type: string) => {
    switch (type) {
      case "characterDetail":
        return { width: 350, height: 500 };
      case "searchResults":
        return { width: 300, height: 400 };
      case "quickNote":
        return { width: 300, height: 400 };
      case "writingAssistant":
        return { width: 400, height: 600 };
      default:
        return { width: 300, height: 400 };
    }
  };

  const getDefaultPosition = (index: number) => {
    // Stagger panels so they don't overlap completely
    const offset = index * 30;
    return { x: 400 + offset, y: 100 + offset };
  };

  // Render sidebar content for both desktop and mobile
  const renderSidebarContent = () => (
    <>
      {dockedPanels.map((panel, index) => (
        <div
          key={`${panel.type}-${panel.entityId || panel.id}-${index}`}
          className="h-full flex flex-col w-full"
          data-testid={`docked-panel-${panel.type}-${panel.entityId || panel.id}`}
        >
          {/* Docked Panel Header */}
          <div className="flex items-center justify-between p-3 border-b border-border bg-muted/30 flex-shrink-0">
            <div className="flex items-center space-x-2">
              {panel.type === "writingAssistant" && (
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{
                    background:
                      "linear-gradient(135deg, hsl(270, 75%, 75%) 0%, hsl(255, 69%, 71%) 100%)",
                  }}
                >
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium">{panel.title}</h3>
                {panel.type === "writingAssistant" && (
                  <p className="text-xs text-muted-foreground">
                    AI-powered writing help
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-1">
              {panel.type === "writingAssistant" && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const clearChatFunction =
                        writingAssistantClearChatFunctions.current[panel.id];
                      if (clearChatFunction) {
                        clearChatFunction();
                      }
                    }}
                    className="h-6 w-6 p-0"
                    data-testid={`button-new-chat-${panel.id}`}
                    title="New Chat"
                  >
                    <MessageSquarePlus className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const toggleHistoryFunction =
                        writingAssistantToggleHistoryFunctions.current[
                          panel.id
                        ];
                      if (toggleHistoryFunction) {
                        toggleHistoryFunction();
                      }
                    }}
                    className="h-6 w-6 p-0"
                    data-testid={`button-chat-history-${panel.id}`}
                    title="History"
                  >
                    <History className="h-3 w-3" />
                  </Button>
                </>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  if (panel.type === "writingAssistant") {
                    minimizePanel(panel.id);
                  } else {
                    attachToTabBar(panel.id, "main");
                  }
                  // Close mobile drawer after action
                  if (isMobile) {
                    closeMobileDrawer();
                  }
                }}
                className="h-6 w-6 p-0"
                data-testid={`button-undock-${panel.id}`}
                title={
                  panel.type === "writingAssistant"
                    ? "Minimize"
                    : "Convert to Tab"
                }
              >
                {panel.type === "writingAssistant" ? (
                  <Minimize2 className="h-3 w-3" />
                ) : (
                  <Pin className="h-3 w-3" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  removePanel(panel.id);
                  // Close mobile drawer after action
                  if (isMobile) {
                    closeMobileDrawer();
                  }
                }}
                className="h-6 w-6 p-0"
                data-testid={`button-close-${panel.id}`}
                title="Close"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>

          {/* Docked Panel Content */}
          <div className="flex-1 overflow-hidden min-h-0">
            {renderPanelContent(panel)}
          </div>
        </div>
      ))}
    </>
  );

  return (
    <div
      ref={workspaceRef}
      className="relative w-full min-h-screen bg-background"
    >
      {isMobile ? (
        /* Mobile Layout - Full screen with drawer */
        <>
          {/* Full-width main content for mobile with bottom padding for nav */}
          <div className="w-full min-h-screen pb-mobile-nav">{children}</div>

          {/* Mobile Sidebar Drawer */}
          {dockedPanels.length > 0 && (
            <SidebarDrawer
              isOpen={isMobileDrawerOpen}
              onClose={closeMobileDrawer}
              title={dockedPanels[0]?.title || "Tools"}
            >
              {renderSidebarContent()}
            </SidebarDrawer>
          )}
        </>
      ) : (
        /* Desktop Layout - Full width main content with overlay sidebar */
        <>
          {/* Main Content Area - Always full width */}
          <div className="w-full min-h-screen">{children}</div>

          {/* Desktop Docked Sidebar - Fixed positioned overlay */}
          {dockedPanels.length > 0 && (
            <div
              className="fixed top-16 right-0 w-96 h-[calc(100vh-4rem)] border-l border-border bg-background z-40 overflow-y-auto shadow-lg"
              data-testid="docked-sidebar-container"
            >
              {renderSidebarContent()}
            </div>
          )}
        </>
      )}

      {/* Floating Panels */}
      <FloatingLayer />
    </div>
  );
};

export default WorkspaceShell;
