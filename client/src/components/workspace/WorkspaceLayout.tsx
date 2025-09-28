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
    attachToTabBar
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
      case 'manuscript':
      case 'manuscriptOutline':
        // Manuscript content should not be rendered as tabs - they are filtered out in TabStrip
        return null;
      case 'notes':
        return (
          <div className="h-full p-4 bg-background overflow-y-auto">
            <div className="mb-4 pb-4 border-b">
              <h3 className="text-lg font-semibold">{panel.title}</h3>
              <p className="text-sm text-muted-foreground">Content Reference</p>
              <div className="flex items-center gap-2 mt-2">
                <button
                  onClick={() => {
                    // Check if this is a character reference by looking at the entity ID
                    // and see if we can find it in the professions table (character references)
                    // For now, assume all IDs that look like UUIDs for content references are characters
                    const isCharacterReference = panel.entityId && panel.entityId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
                    
                    if (isCharacterReference) {
                      // This is likely a character reference, open character edit page
                      window.open(`/characters/${panel.entityId}/edit`, '_blank');
                    } else {
                      // For other content types, try to determine correct route
                      window.open(`/editor/content/${panel.entityId}`, '_blank');
                    }
                  }}
                  className="text-xs px-2 py-1 bg-primary text-primary-foreground rounded hover:bg-primary/90"
                >
                  View Full Content
                </button>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Reference Summary</h4>
                <p className="text-sm text-muted-foreground">
                  This is a reference panel for "{panel.title}". 
                  Use this as a quick reference while working on your manuscript.
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Content Details</h4>
                <div className="text-sm space-y-1">
                  <p><span className="font-medium">ID:</span> {panel.entityId}</p>
                  <p><span className="font-medium">Type:</span> Content Reference</p>
                  <p><span className="font-medium">Purpose:</span> Side-by-side reference for writing</p>
                </div>
              </div>
            </div>
          </div>
        );
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
              <div>
                <TabStrip 
                  regionId="main" 
                  onDrop={(e) => handleTabBarDrop(e, 'main')}
                  onDragOver={handleTabBarDragOver}
                />
              </div>
              
              <div className="flex-1 overflow-hidden">
                {mainActiveTab ? (
                  <div className="h-full">
                    {renderTabContent(mainActiveTab)}
                  </div>
                ) : (
                  children // Primary manuscript content
                )}
              </div>
            </div>
          </ResizablePanel>

          <ResizableHandle />

          {/* Split Region */}
          <ResizablePanel defaultSize={50} minSize={30}>
            <div className="h-full flex flex-col">
              <div>
                <TabStrip 
                  regionId="split" 
                  onDrop={(e) => handleTabBarDrop(e, 'split')}
                  onDragOver={handleTabBarDragOver}
                />
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
          <div>
            <TabStrip 
              regionId="main" 
              onDrop={(e) => handleTabBarDrop(e, 'main')}
              onDragOver={handleTabBarDragOver}
            />
          </div>
          
          <div className="flex-1 overflow-hidden">
            {mainActiveTab ? (
              // Show active tab content as reference
              <div className="h-full bg-muted/20">
                {renderTabContent(mainActiveTab)}
              </div>
            ) : (
              // Always show primary manuscript content when no reference tabs are active
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