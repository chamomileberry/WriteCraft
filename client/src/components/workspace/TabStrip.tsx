import { DragEvent, useState, useRef, useEffect } from 'react';
import { X, GripVertical, Copy, SplitSquareHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PanelDescriptor, useWorkspaceStore } from '@/stores/workspaceStore';
import { cn } from '@/lib/utils';

interface TabStripProps {
  regionId: 'main' | 'split';
  className?: string;
}

export function TabStrip({ regionId, className }: TabStripProps) {
  const { 
    getTabsInRegion, 
    getActiveTab, 
    setActiveTab, 
    removePanel, 
    detachToFloating,
    assignToSplit,
    toggleSplitMode,
    currentLayout,
    reorderTabs,
    attachToTabBar
  } = useWorkspaceStore();
  
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; panelId: string } | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const contextMenuRef = useRef<HTMLDivElement>(null);

  const tabs = getTabsInRegion(regionId);
  const activeTab = getActiveTab(regionId);

  const handleTabClick = (panelId: string) => {
    setActiveTab(panelId, regionId);
  };

  const handleTabClose = (panelId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    removePanel(panelId);
  };

  const handleTabDragStart = (e: DragEvent<HTMLDivElement>, panel: PanelDescriptor) => {
    e.dataTransfer.setData('application/json', JSON.stringify({
      type: 'panel',
      panelId: panel.id,
      source: 'tab',
      fromRegion: regionId
    }));
    e.dataTransfer.effectAllowed = 'move';
    
    // Store drag start position for reordering
    const tabElement = e.currentTarget;
    const tabIndex = Array.from(tabElement.parentElement?.children || []).indexOf(tabElement);
    e.dataTransfer.setData('text/tab-index', tabIndex.toString());
  };

  const handleTabDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const data = JSON.parse(e.dataTransfer.getData('application/json'));
    
    if (data.type === 'panel') {
      if (data.source === 'floating') {
        // Attach floating panel to tab bar
        attachToTabBar(data.panelId, regionId);
      } else if (data.source === 'tab' && data.fromRegion !== regionId) {
        // Cross-region tab movement
        attachToTabBar(data.panelId, regionId);
      }
    }
  };

  const handleDetachTab = (panelId: string) => {
    const rect = document.querySelector(`[data-tab-id="${panelId}"]`)?.getBoundingClientRect();
    detachToFloating(panelId, {
      x: rect ? rect.left + 20 : 400,
      y: rect ? rect.bottom + 20 : 100
    });
  };

  const handleContextMenu = (e: React.MouseEvent, panelId: string) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      panelId
    });
  };

  const handleSplitView = (panelId: string) => {
    if (regionId === 'main') {
      assignToSplit(panelId);
    }
    setContextMenu(null);
  };

  // Handle tab bar level drag over (for floating panels)
  const handleTabBarDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  // Handle tab reordering by drag over specific tabs
  const handleTabDragOver = (e: DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault();
    const data = JSON.parse(e.dataTransfer.getData('application/json') || '{}');
    
    // Only show drop indicator for tab-to-tab reordering within same region
    if (data.source === 'tab' && data.fromRegion === regionId) {
      setDragOverIndex(index);
      e.dataTransfer.dropEffect = 'move';
    }
  };

  const handleTabDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleTabDropOnTab = (e: DragEvent<HTMLDivElement>, dropIndex: number) => {
    e.preventDefault();
    e.stopPropagation();
    
    const data = JSON.parse(e.dataTransfer.getData('application/json'));
    const dragIndex = parseInt(e.dataTransfer.getData('text/tab-index') || '0');
    
    if (data.type === 'panel' && data.source === 'tab' && data.fromRegion === regionId) {
      // Reorder tabs within same region
      if (dragIndex !== dropIndex) {
        reorderTabs(regionId, dragIndex, dropIndex);
      }
    }
    
    setDragOverIndex(null);
  };

  // Close context menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (contextMenuRef.current && !contextMenuRef.current.contains(e.target as Node)) {
        setContextMenu(null);
      }
    };
    
    if (contextMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [contextMenu]);

  if (tabs.length === 0) {
    return (
      <div 
        className={cn(
          "h-10 border-b bg-muted/20 flex items-center px-4 text-sm text-muted-foreground",
          className
        )}
        onDrop={handleTabDrop}
        onDragOver={handleTabBarDragOver}
      >
        Drop tabs here or open a reference to get started
      </div>
    );
  }

  return (
    <div 
      className={cn("h-10 border-b bg-muted/20 flex items-center overflow-x-auto", className)}
      onDrop={handleTabDrop}
      onDragOver={handleTabBarDragOver}
    >
      {tabs.map((tab, index) => (
        <div
          key={tab.id}
          data-tab-id={tab.id}
          draggable
          onDragStart={(e) => handleTabDragStart(e, tab)}
          onDragOver={(e) => handleTabDragOver(e, index)}
          onDragLeave={handleTabDragLeave}
          onDrop={(e) => handleTabDropOnTab(e, index)}
          className={cn(
            "flex items-center gap-1 px-3 py-2 border-r cursor-pointer select-none hover-elevate",
            "min-w-0 max-w-48 group relative",
            activeTab?.id === tab.id 
              ? "bg-background text-foreground border-b-2 border-b-primary" 
              : "bg-muted/40 text-muted-foreground hover:bg-muted/60",
            dragOverIndex === index && "border-l-2 border-l-primary"
          )}
          onClick={() => handleTabClick(tab.id)}
          onContextMenu={(e) => handleContextMenu(e, tab.id)}
          data-testid={`tab-${tab.id}`}
        >
          <GripVertical className="h-3 w-3 opacity-30 group-hover:opacity-60" />
          
          <Badge variant="outline" className="text-xs px-1">
            {tab.type === 'characterDetail' ? 'char' : tab.type.slice(0, 4)}
          </Badge>
          
          <span className="truncate text-sm font-medium">
            {tab.title}
          </span>
          
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 ml-auto">
            <Button
              variant="ghost"
              size="sm"
              className="h-4 w-4 p-0 hover:bg-muted-foreground/20"
              onClick={(e) => {
                e.stopPropagation();
                handleDetachTab(tab.id);
              }}
              data-testid={`button-detach-tab-${tab.id}`}
              title="Detach to floating window"
            >
              <GripVertical className="h-3 w-3" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
              onClick={(e) => handleTabClose(tab.id, e)}
              data-testid={`button-close-tab-${tab.id}`}
              title="Close tab"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
      ))}
      
      {/* Context Menu */}
      {contextMenu && (
        <div
          ref={contextMenuRef}
          className="fixed bg-popover border rounded-md shadow-md py-1 z-50 min-w-[160px]"
          style={{ left: contextMenu.x, top: contextMenu.y }}
          data-testid="tab-context-menu"
        >
          <button
            className="w-full px-3 py-2 text-sm hover-elevate text-left flex items-center gap-2"
            onClick={() => handleDetachTab(contextMenu.panelId)}
            data-testid="context-menu-detach"
          >
            <Copy className="h-3 w-3" />
            Detach to Window
          </button>
          {regionId === 'main' && (
            <button
              className="w-full px-3 py-2 text-sm hover-elevate text-left flex items-center gap-2"
              onClick={() => handleSplitView(contextMenu.panelId)}
              data-testid="context-menu-split"
            >
              <SplitSquareHorizontal className="h-3 w-3" />
              Open in Split View
            </button>
          )}
        </div>
      )}
    </div>
  );
}