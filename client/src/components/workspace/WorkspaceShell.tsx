import { useEffect, useRef } from 'react';
import { Rnd } from 'react-rnd';
import { useWorkspaceStore, type PanelDescriptor } from '@/stores/workspaceStore';
import CharacterDetailPanel from './CharacterDetailPanel';
import QuickNotePanel from './QuickNotePanel';
import WritingAssistantPanel from './WritingAssistantPanel';
import { X, GripHorizontal, Pin, Save, Minimize2, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface WorkspaceShellProps {
  children: React.ReactNode;
}

const WorkspaceShell = ({ children }: WorkspaceShellProps) => {
  const { currentLayout, removePanel, updatePanel, attachToTabBar, minimizePanel, isInManuscriptEditor } = useWorkspaceStore();
  const workspaceRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Store save and clear functions for quick note panels
  const quickNoteSaveFunctions = useRef<{ [panelId: string]: () => Promise<{ content: string; id: string }> }>({});
  const quickNoteClearFunctions = useRef<{ [panelId: string]: () => void }>({});
  
  // Only render floating panels that are not minimized (tabbed panels are rendered in tab bars)
  const floatingPanels = currentLayout.panels.filter(panel => panel.mode === 'floating' && !panel.minimized);
  
  // Get docked panels for sidebar
  const dockedPanels = currentLayout.panels.filter(panel => panel.mode === 'docked' && !panel.minimized);

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
            onRegisterSaveFunction={(fn) => {
              quickNoteSaveFunctions.current[panel.id] = fn;
            }}
            onRegisterClearFunction={(fn) => {
              quickNoteClearFunctions.current[panel.id] = fn;
            }}
          />
        );
      case 'writingAssistant':
        return (
          <WritingAssistantPanel
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
      case 'writingAssistant':
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

  return (
    <div ref={workspaceRef} className="relative w-full h-full bg-background">
      <div className="flex w-full h-full">
        {/* Main Content Area */}
        <div className={`flex-1 min-w-0 ${dockedPanels.length > 0 ? 'pr-2' : ''}`}>
          {children}
        </div>
        
        {/* Docked Sidebar */}
        {dockedPanels.length > 0 && (
          <div className="w-96 border-l border-border bg-background flex-shrink-0">
            {dockedPanels.map((panel) => (
              <div
                key={panel.id}
                className="h-full flex flex-col"
                data-testid={`docked-panel-${panel.type}-${panel.entityId || panel.id}`}
              >
                {/* Docked Panel Header */}
                <div className="flex items-center justify-between p-3 border-b border-border bg-muted/30">
                  <div className="flex items-center space-x-2">
                    <h3 className="text-sm font-medium">{panel.title}</h3>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => attachToTabBar(panel.id, 'main')}
                      className="h-6 w-6 p-0"
                      data-testid={`button-undock-${panel.id}`}
                      title="Convert to Tab"
                    >
                      <Pin className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removePanel(panel.id)}
                      className="h-6 w-6 p-0"
                      data-testid={`button-close-${panel.id}`}
                      title="Close"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                
                {/* Docked Panel Content */}
                <div className="flex-1 overflow-hidden">
                  {renderPanelContent(panel)}
                </div>
              </div>
            ))}
          </div>
        )}
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
              <div className="flex items-center justify-between p-2 border-b bg-muted/50 rounded-t-lg">
                <div className="flex items-center gap-2 flex-1 panel-drag-handle cursor-move">
                  <GripHorizontal className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium truncate">{panel.title}</span>
                </div>
                <div className="flex items-center gap-1 relative z-10">
                  {panel.type === 'quickNote' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={async (e) => {
                        // Save quick note to notebook
                        const saveFunction = quickNoteSaveFunctions.current[panel.id];
                        if (!saveFunction) {
                          toast({
                            title: 'Error',
                            description: 'Quick note panel not ready.',
                            variant: 'destructive',
                          });
                          return;
                        }

                        try {
                          // Get the current content after forcing a save
                          const quickNoteData = await saveFunction();
                          
                          if (quickNoteData && quickNoteData.content) {
                            try {
                              // Save to saved items as a quick note
                              await apiRequest('POST', '/api/saved-items', {
                                userId: 'guest',
                                itemType: 'quickNote',
                                itemId: quickNoteData.id,
                                itemData: {
                                  title: 'Quick Note',
                                  content: quickNoteData.content,
                                  savedAt: new Date().toISOString()
                                }
                              });
                              
                              toast({
                                title: 'Quick Note saved',
                                description: 'Your note has been saved to your Notebook.',
                              });
                              
                              // Clear the quick note after saving
                              await apiRequest('POST', '/api/quick-note', {
                                userId: 'guest',
                                title: 'Quick Note',
                                content: '',
                              });
                              
                              // Clear the UI content directly using the registered clear function
                              const clearFunction = quickNoteClearFunctions.current[panel.id];
                              if (clearFunction) {
                                clearFunction();
                              }
                              
                              // Only invalidate saved-items
                              queryClient.invalidateQueries({ queryKey: ['/api/saved-items'] });
                            } catch (error) {
                              toast({
                                title: 'Save failed',
                                description: 'Could not save to Notebook.',
                                variant: 'destructive',
                              });
                            }
                          } else {
                            toast({
                              title: 'Nothing to save',
                              description: 'Write something in your Quick Note first.',
                              variant: 'destructive',
                            });
                          }
                        } catch (error) {
                          console.error('Error saving quick note:', error);
                          toast({
                            title: 'Error',
                            description: 'Could not save quick note.',
                            variant: 'destructive',
                          });
                        }
                      }}
                      className="h-6 w-6 p-0"
                      data-testid={`button-save-${panel.id}`}
                      title="Save to Notebook"
                    >
                      <Save className="h-3 w-3" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      if (panel.type === 'quickNote' && !isInManuscriptEditor()) {
                        // Minimize the quick note panel instead of pinning
                        minimizePanel(panel.id);
                      } else {
                        attachToTabBar(panel.id, 'main');
                      }
                    }}
                    className="h-6 w-6 p-0"
                    data-testid={`button-dock-${panel.id}`}
                    title={panel.type === 'quickNote' && !isInManuscriptEditor() ? "Minimize" : "Pin to tab bar"}
                  >
                    {panel.type === 'quickNote' && !isInManuscriptEditor() ? (
                      <Minimize2 className="h-3 w-3" />
                    ) : (
                      <Pin className="h-3 w-3" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      removePanel(panel.id);
                    }}
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