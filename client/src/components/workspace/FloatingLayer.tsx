import { DragEvent } from 'react';
import { Rnd } from 'react-rnd';
import { X, Pin, GripHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { PanelDescriptor, useWorkspaceStore } from '@/stores/workspaceStore';
import CharacterDetailPanel from './CharacterDetailPanel';
import { cn } from '@/lib/utils';

interface FloatingWindowProps {
  panel: PanelDescriptor;
}

function FloatingWindow({ panel }: FloatingWindowProps) {
  const { removePanel, updatePanel, attachToTabBar } = useWorkspaceStore();

  const handleDragStart = (e: DragEvent<HTMLDivElement>) => {
    e.dataTransfer?.setData('application/json', JSON.stringify({
      type: 'panel',
      panelId: panel.id,
      source: 'floating'
    }));
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragStop = (e: any, data: { x: number; y: number }) => {
    updatePanel(panel.id, { 
      position: { x: data.x, y: data.y } 
    });
  };

  const handleResizeStop = (
    e: any,
    direction: any,
    ref: HTMLElement,
    delta: any,
    position: { x: number; y: number }
  ) => {
    updatePanel(panel.id, {
      size: { 
        width: ref.offsetWidth, 
        height: ref.offsetHeight 
      },
      position
    });
  };

  const handleAttachToTab = () => {
    attachToTabBar(panel.id, 'main');
  };

  const renderPanelContent = () => {
    switch (panel.type) {
      case 'characterDetail':
        return <CharacterDetailPanel panelId={panel.id} characterId={panel.entityId!} />;
      // Add other panel types here as needed
      default:
        return <div className="p-4">Panel type: {panel.type}</div>;
    }
  };

  return (
    <Rnd
      default={{
        x: panel.position?.x ?? 400,
        y: panel.position?.y ?? 100,
        width: panel.size?.width ?? 350,
        height: panel.size?.height ?? 500,
      }}
      bounds="window"
      dragHandleClassName="drag-handle"
      onDragStop={handleDragStop}
      onResizeStop={handleResizeStop}
      className="z-50"
      data-testid={`floating-window-${panel.id}`}
    >
      <Card className="w-full h-full shadow-lg border-2 hover:border-primary/20">
        <CardHeader 
          className="flex flex-row items-center justify-between space-y-0 pb-2 drag-handle cursor-move"
          draggable
          onDragStart={handleDragStart}
        >
          <div className="flex items-center gap-2 min-w-0">
            <GripHorizontal className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium truncate">{panel.title}</span>
          </div>
          
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleAttachToTab}
              className="h-6 w-6 p-0"
              data-testid={`button-attach-tab-${panel.id}`}
              title="Attach to tab bar"
            >
              <Pin className="h-3 w-3" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => removePanel(panel.id)}
              className="h-6 w-6 p-0 hover:bg-destructive hover:text-destructive-foreground"
              data-testid={`button-close-floating-${panel.id}`}
              title="Close window"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="p-0 flex-1 overflow-hidden">
          {renderPanelContent()}
        </CardContent>
      </Card>
    </Rnd>
  );
}

export function FloatingLayer() {
  const { getFloatingPanels } = useWorkspaceStore();
  const floatingPanels = getFloatingPanels();

  if (floatingPanels.length === 0) {
    return null;
  }

  return (
    <div className="fixed inset-0 pointer-events-none z-40">
      {floatingPanels.map((panel) => (
        <div key={panel.id} className="pointer-events-auto">
          <FloatingWindow panel={panel} />
        </div>
      ))}
    </div>
  );
}