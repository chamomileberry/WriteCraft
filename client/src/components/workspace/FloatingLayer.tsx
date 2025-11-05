import { DragEvent } from "react";
import { Rnd } from "react-rnd";
import { X, Pin, GripHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { PanelDescriptor, useWorkspaceStore } from "@/stores/workspaceStore";
import CharacterDetailPanel from "./CharacterDetailPanel";
import { ContentDetailPanel } from "./ContentDetailPanel";
import QuickNotePanel from "./QuickNotePanel";
import WritingAssistantPanel from "./WritingAssistantPanel";
import { EditableTitle } from "./EditableTitle";

interface FloatingWindowProps {
  panel: PanelDescriptor;
}

function FloatingWindow({ panel }: FloatingWindowProps) {
  const { removePanel, updatePanel, attachToTabBar } = useWorkspaceStore();

  const handleTitleChange = (newTitle: string) => {
    updatePanel(panel.id, { title: newTitle });
  };

  const handleDragStart = (e: DragEvent<HTMLDivElement>) => {
    e.dataTransfer?.setData(
      "application/json",
      JSON.stringify({
        type: "panel",
        panelId: panel.id,
        source: "floating",
      }),
    );
    e.dataTransfer.effectAllowed = "move";

    // Create a custom drag preview that looks like a tab
    const dragPreview = document.createElement("div");
    dragPreview.style.cssText = `
      position: absolute;
      top: -9999px;
      left: -9999px;
      padding: 8px 16px;
      background: hsl(var(--primary));
      color: hsl(var(--primary-foreground));
      border-radius: 6px;
      font-size: 14px;
      font-weight: 500;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      white-space: nowrap;
      max-width: 200px;
      overflow: hidden;
      text-overflow: ellipsis;
      pointer-events: none;
    `;
    dragPreview.textContent = panel.title;
    document.body.appendChild(dragPreview);

    // Set the custom preview
    e.dataTransfer.setDragImage(dragPreview, 100, 20);

    // Clean up after a short delay
    setTimeout(() => {
      document.body.removeChild(dragPreview);
    }, 0);
  };

  const handleDragStop = (_e: any, data: { x: number; y: number }) => {
    updatePanel(panel.id, {
      position: { x: data.x, y: data.y },
    });
  };

  const handleResizeStop = (
    _e: any,
    _direction: any,
    ref: HTMLElement,
    _delta: any,
    position: { x: number; y: number },
  ) => {
    updatePanel(panel.id, {
      size: {
        width: ref.offsetWidth,
        height: ref.offsetHeight,
      },
      position,
    });
  };

  const handleAttachToTab = () => {
    attachToTabBar(panel.id, "main");
  };

  const renderPanelContent = () => {
    switch (panel.type) {
      case "characterDetail":
        return (
          <CharacterDetailPanel
            panelId={panel.id}
            characterId={panel.entityId!}
            notebookId={panel.notebookId}
          />
        );
      case "contentDetail":
        return (
          <ContentDetailPanel
            panelId={panel.id}
            contentType={panel.contentType!}
            entityId={panel.entityId!}
            notebookId={panel.notebookId}
          />
        );
      case "quickNote":
        return <QuickNotePanel panelId={panel.id} />;
      case "writingAssistant":
        return <WritingAssistantPanel panelId={panel.id} />;
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
      enableUserSelectHack={false}
      disableDragging={false}
      className="z-50"
      data-testid={`floating-window-${panel.id}`}
    >
      <Card className="w-full h-full shadow-lg hover:border-primary/20 flex flex-col overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 flex-shrink-0 border-b">
          <div className="flex items-center gap-2 min-w-0">
            {/* Window drag handle - for moving the floating window */}
            <div
              className="drag-handle cursor-move p-1 hover:bg-accent rounded"
              title="Drag to move window"
            >
              <GripHorizontal className="h-4 w-4 text-muted-foreground" />
            </div>

            {/* Title - editable for quick notes, draggable for tab creation */}
            {panel.type === "quickNote" ? (
              <EditableTitle
                title={panel.title}
                onTitleChange={handleTitleChange}
                placeholder="Quick Note"
              />
            ) : (
              <span
                className="text-sm font-medium truncate cursor-pointer hover:bg-accent/50 px-2 py-1 rounded transition-colors"
                draggable
                onDragStart={handleDragStart}
                title="Drag to tab bar to dock"
              >
                {panel.title}
              </span>
            )}
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

        <CardContent className="p-0 flex-1 overflow-hidden min-h-0">
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
