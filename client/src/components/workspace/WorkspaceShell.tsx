import { useEffect, useRef } from 'react';
import { Rnd } from 'react-rnd';
import { useWorkspaceStore, type PanelDescriptor } from '@/stores/workspaceStore';
import CharacterDetailPanel from './CharacterDetailPanel';
import QuickNotePanel from './QuickNotePanel';
import { X, GripHorizontal, Pin, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface WorkspaceShellProps {
  children: React.ReactNode;
}

const WorkspaceShell = ({ children }: WorkspaceShellProps) => {
  const { currentLayout, removePanel, updatePanel, attachToTabBar } = useWorkspaceStore();
  const workspaceRef = useRef<HTMLDivElement>(null);
  
  // Only render floating panels (tabbed panels are rendered in tab bars)
  const floatingPanels = currentLayout.panels.filter(panel => panel.mode === 'floating');

  const renderPanelContent = (panel: PanelDescriptor) => {
    switch (panel.type) {
      case 'characterDetail':
        return (
          <CharacterDetailPanel
            characterId={panel.entityId!}
            panelId={panel.id}
          />
        );
      case 'quickNote':
        return (
          <QuickNotePanel
            panelId={panel.id}
            onClose={() => removePanel(panel.id)}
            onPin={() => attachToTabBar(panel.id, 'main')}
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
      case 'characterDetail':
        return { width: 350, height: 500 };
      case 'searchResults':
        return { width: 300, height: 400 };
      case 'quickNote':
        return { width: 300, height: 400 };
      default:
        return { width: 300, height: 400 };
    }
  };

  const getDefaultPosition = (index: number) => {
    // Stagger panels so they don't overlap completely
    const offset = index * 30;
    return { x: 400 + offset, y: 100 + offset };
  };

  return (
    <div ref={workspaceRef} className="relative w-full h-full bg-background">
      {/* Main Content Area */}
      <div className="w-full h-full">
        {children}
      </div>

      {/* Floating Panels Only */}
      {floatingPanels.map((panel, index) => {
        const defaultSize = getDefaultPanelSize(panel.type);
        const defaultPos = getDefaultPosition(index);
        
        return (
          <Rnd
            key={panel.id}
            default={{
              x: panel.position?.x || defaultPos.x,
              y: panel.position?.y || defaultPos.y,
              width: panel.size?.width || defaultSize.width,
              height: panel.size?.height || defaultSize.height,
            }}
            minWidth={250}
            minHeight={200}
            bounds="parent"
            dragHandleClassName="panel-drag-handle"
            className="z-50"
            data-testid={`panel-${panel.type}-${panel.entityId || panel.id}`}
            onDragStop={(e, d) => {
              updatePanel(panel.id, { position: { x: d.x, y: d.y } });
            }}
            onResizeStop={(e, direction, ref, delta, position) => {
              updatePanel(panel.id, {
                size: { width: parseInt(ref.style.width), height: parseInt(ref.style.height) },
                position
              });
            }}
          >
            <div className="w-full h-full bg-background border border-border rounded-lg shadow-lg flex flex-col">
              {/* Panel Header */}
              <div className="flex items-center justify-between p-2 border-b bg-muted/50 rounded-t-lg panel-drag-handle cursor-move">
                <div className="flex items-center gap-2">
                  <GripHorizontal className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium truncate">{panel.title}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => attachToTabBar(panel.id, 'main')}
                    className="h-6 w-6 p-0"
                    data-testid={`button-dock-${panel.id}`}
                    title="Pin to tab bar"
                  >
                    <Pin className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removePanel(panel.id)}
                    className="h-6 w-6 p-0 hover:bg-destructive/10"
                    data-testid={`button-close-${panel.type}-${panel.entityId || panel.id}`}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              
              {/* Panel Content */}
              <div className="flex-1 overflow-hidden">
                {renderPanelContent(panel)}
              </div>
            </div>
          </Rnd>
        );
      })}
    </div>
  );
};

export default WorkspaceShell;