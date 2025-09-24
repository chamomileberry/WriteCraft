import { useEffect, useRef } from 'react';
import { Rnd } from 'react-rnd';
import { useWorkspaceStore, type PanelDescriptor } from '@/stores/workspaceStore';
import CharacterDetailPanel from './CharacterDetailPanel';
import { X, GripHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface WorkspaceShellProps {
  children: React.ReactNode;
}

const WorkspaceShell = ({ children }: WorkspaceShellProps) => {
  const { currentLayout, removePanel } = useWorkspaceStore();
  const workspaceRef = useRef<HTMLDivElement>(null);

  const renderPanelContent = (panel: PanelDescriptor) => {
    switch (panel.type) {
      case 'characterDetail':
        return (
          <CharacterDetailPanel
            characterId={panel.entityId!}
            panelId={panel.id}
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

      {/* Floating Panels */}
      {currentLayout.panels.map((panel, index) => {
        const defaultSize = getDefaultPanelSize(panel.type);
        const defaultPos = getDefaultPosition(index);
        
        return (
          <Rnd
            key={panel.id}
            default={{
              ...defaultPos,
              ...defaultSize,
            }}
            minWidth={250}
            minHeight={200}
            bounds="parent"
            dragHandleClassName="panel-drag-handle"
            className="z-50"
            data-testid={`panel-${panel.type}-${panel.entityId || panel.id}`}
          >
            <div className="w-full h-full bg-background border border-border rounded-lg shadow-lg flex flex-col">
              {/* Panel Header */}
              <div className="flex items-center justify-between p-2 border-b bg-muted/50 rounded-t-lg panel-drag-handle cursor-move">
                <div className="flex items-center gap-2">
                  <GripHorizontal className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium truncate">{panel.title}</span>
                </div>
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