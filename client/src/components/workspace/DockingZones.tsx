import { useWorkspaceStore, PanelDescriptor } from '@/stores/workspaceStore';
import { Layers, Pin, X, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import CharacterDetailPanel from './CharacterDetailPanel';
// import { useDrop } from 'react-dnd'; // Will implement drag drop later

interface DockingZoneProps {
  slot: string;
  className?: string;
}

export const DockingZone = ({ slot, className = '' }: DockingZoneProps) => {
  const { getDockedPanels, undockPanel } = useWorkspaceStore();
  const dockedPanels = getDockedPanels(slot);
  
  // Drag and drop will be implemented later - for now use buttons
  const isOver = false;
  
  const renderPanelContent = (panel: PanelDescriptor) => {
    switch (panel.type) {
      case 'characterDetail':
        return (
          <CharacterDetailPanel
            characterId={panel.entityId!}
            panelId={panel.id}
            isCompact={true}
          />
        );
      default:
        return (
          <div className="p-2 text-sm text-muted-foreground">
            {panel.type} panel content
          </div>
        );
    }
  };
  
  const getSlotLabel = (slot: string) => {
    switch (slot) {
      case 'sidebar-top': return 'Top Dock';
      case 'sidebar-middle': return 'Middle Dock';  
      case 'sidebar-bottom': return 'Bottom Dock';
      default: return slot;
    }
  };
  
  return (
    <div 
      className={`${className} min-h-[60px] border-2 border-dashed transition-colors ${
        isOver 
          ? 'border-primary bg-primary/5' 
          : dockedPanels.length > 0 
            ? 'border-border bg-background' 
            : 'border-muted bg-muted/20'
      }`}
      data-testid={`dock-slot-${slot}`}
    >
      {dockedPanels.length === 0 ? (
        <div className="p-4 text-center">
          <Layers className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            {getSlotLabel(slot)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Drag panels here to dock
          </p>
        </div>
      ) : (
        <div className="space-y-2 p-2">
          {dockedPanels.map((panel) => (
            <Card key={panel.id} className="relative">
              <CardHeader className="pb-2 pr-20">
                <div className="flex items-center gap-2">
                  <Pin className="h-3 w-3 text-primary" />
                  <span className="text-sm font-medium truncate">{panel.title}</span>
                </div>
                <div className="absolute top-2 right-2 flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => undockPanel(panel.id)}
                    className="h-6 w-6 p-0"
                    data-testid={`button-undock-${panel.id}`}
                  >
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => useWorkspaceStore.getState().removePanel(panel.id)}
                    className="h-6 w-6 p-0"
                    data-testid={`button-close-docked-${panel.id}`}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                {renderPanelContent(panel)}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

// Main docking zones container for sidebar
export const SidebarDockingZones = () => {
  return (
    <div className="space-y-4">
      <DockingZone slot="sidebar-top" className="rounded-md" />
      <DockingZone slot="sidebar-middle" className="rounded-md" />
      <DockingZone slot="sidebar-bottom" className="rounded-md" />
    </div>
  );
};