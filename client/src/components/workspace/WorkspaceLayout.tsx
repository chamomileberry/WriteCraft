import { DragEvent } from 'react';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { useWorkspaceStore } from '@/stores/workspaceStore';
import { TabStrip } from './TabStrip';
import { FloatingLayer } from './FloatingLayer';
import CharacterDetailPanel from './CharacterDetailPanel';
import { cn } from '@/lib/utils';

interface WorkspaceLayoutProps {
  children: React.ReactNode; // The main manuscript editor content
  className?: string;
}

export function WorkspaceLayout({ children, className }: WorkspaceLayoutProps) {
  const { 
    currentLayout, 
    getActiveTab, 
    attachToTabBar, 
    detachToFloating 
  } = useWorkspaceStore();

  const mainActiveTab = getActiveTab('main');
  const splitActiveTab = getActiveTab('split');
  const hasSplitMode = currentLayout.splitMode && currentLayout.regions.split.length > 0;

  // Handle drop events for tab attachment
  const handleTabBarDrop = (e: DragEvent<HTMLDivElement>, regionId: 'main' | 'split') => {
    e.preventDefault();
    try {
      const data = JSON.parse(e.dataTransfer.getData('application/json'));
      if (data.type === 'panel' && data.source === 'floating') {
        attachToTabBar(data.panelId, regionId);
      }
    } catch (error) {
      console.warn('Failed to parse drop data:', error);
    }
  };

  const handleTabBarDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const renderTabContent = (panel: any) => {
    if (!panel) return null;

    switch (panel.type) {
      case 'characterDetail':
        return <CharacterDetailPanel panelId={panel.id} characterId={panel.entityId!} />;
      default:
        return (
          <div className="p-4 text-center text-muted-foreground">
            Panel type: {panel.type}
          </div>
        );
    }
  };

  return (
    <div className={cn("h-full flex flex-col", className)}>
      {hasSplitMode ? (
        // Split screen layout with main + split regions
        <ResizablePanelGroup direction="horizontal" className="flex-1">
          {/* Main Region */}
          <ResizablePanel defaultSize={50} minSize={30}>
            <div className="h-full flex flex-col">
              <div
                onDrop={(e) => handleTabBarDrop(e, 'main')}
                onDragOver={handleTabBarDragOver}
              >
                <TabStrip regionId="main" />
              </div>
              
              <div className="flex-1 overflow-hidden">
                {mainActiveTab ? (
                  <div className="h-full">
                    {renderTabContent(mainActiveTab)}
                  </div>
                ) : (
                  children // Default manuscript content
                )}
              </div>
            </div>
          </ResizablePanel>

          <ResizableHandle />

          {/* Split Region */}
          <ResizablePanel defaultSize={50} minSize={30}>
            <div className="h-full flex flex-col">
              <div
                onDrop={(e) => handleTabBarDrop(e, 'split')}
                onDragOver={handleTabBarDragOver}
              >
                <TabStrip regionId="split" />
              </div>
              
              <div className="flex-1 overflow-hidden bg-muted/20">
                {splitActiveTab ? (
                  renderTabContent(splitActiveTab)
                ) : (
                  <div className="p-4 text-center text-muted-foreground">
                    Drop a tab here to create split view
                  </div>
                )}
              </div>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      ) : (
        // Single region layout
        <div className="flex-1 flex flex-col">
          <div
            onDrop={(e) => handleTabBarDrop(e, 'main')}
            onDragOver={handleTabBarDragOver}
          >
            <TabStrip regionId="main" />
          </div>
          
          <div className="flex-1 overflow-hidden">
            {mainActiveTab ? (
              // Show active tab content in place of manuscript (Obsidian-style)
              <div className="h-full bg-muted/20">
                {renderTabContent(mainActiveTab)}
              </div>
            ) : (
              // Default manuscript-only layout
              children
            )}
          </div>
        </div>
      )}

      {/* Floating windows layer */}
      <FloatingLayer />
    </div>
  );
}