import { DragEvent, useState, useRef, useEffect } from 'react';
import { X, Copy, SplitSquareHorizontal, Plus, Search, ExternalLink, Pin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { PanelDescriptor, useWorkspaceStore } from '@/stores/workspaceStore';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { nanoid } from 'nanoid';

interface TabStripProps {
  regionId: 'main' | 'split';
  className?: string;
  onDrop?: (e: DragEvent<HTMLDivElement>) => void;
  onDragOver?: (e: DragEvent<HTMLDivElement>) => void;
}

export function TabStrip({ regionId, className, onDrop, onDragOver }: TabStripProps) {
  const { 
    getTabsInRegion, 
    getActiveTab, 
    setActiveTab, 
    removePanel, 
    detachToFloating,
    assignToSplit,
    reorderTabs,
    attachToTabBar
  } = useWorkspaceStore();
  
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; panelId: string } | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const contextMenuRef = useRef<HTMLDivElement>(null);
  const searchDropdownRef = useRef<HTMLDivElement>(null);
  const { addPanel } = useWorkspaceStore();

  // Search functionality for plus button
  const { data: searchResults = [] } = useQuery({
    queryKey: ['/api/search', searchQuery],
    queryFn: async () => {
      if (!searchQuery.trim()) return [];
      const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`, {
        credentials: 'include'
      });
      if (!response.ok) return [];
      return response.json();
    },
    enabled: searchQuery.trim().length > 0,
  });

  const tabs = getTabsInRegion(regionId);
  const activeTab = getActiveTab(regionId);

  const handleTabClick = (panelId: string) => {
    setActiveTab(panelId, regionId);
  };

  const handleTabClose = (panelId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    // Don't allow closing manuscript tabs
    const panel = tabs.find(tab => tab.id === panelId);
    if (panel?.type === 'manuscript') {
      return;
    }
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

  // Plus button and search handlers
  const handlePlusClick = () => {
    setShowSearchDropdown(!showSearchDropdown);
  };

  const handleSearchResultClick = (item: any) => {
    const itemType = item.type;
    const itemId = item.id;
    const itemTitle = item.title;
    
    // Create new panel based on content type
    if (itemType === 'character') {
      addPanel({
        id: nanoid(),
        type: 'characterDetail',
        title: itemTitle || 'Character Details',
        entityId: itemId,
        mode: 'tabbed',
        regionId: regionId
      });
    } else if (itemType === 'manuscript') {
      addPanel({
        id: nanoid(),
        type: 'manuscriptOutline',
        title: itemTitle || 'Manuscript',
        entityId: itemId,
        mode: 'tabbed',
        regionId: regionId
      });
    } else {
      addPanel({
        id: nanoid(),
        type: 'notes',
        title: itemTitle || `${itemType} Details`,
        entityId: itemId,
        mode: 'tabbed',
        regionId: regionId
      });
    }
    
    // Close search dropdown
    setShowSearchDropdown(false);
    setSearchQuery('');
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
      if (searchDropdownRef.current && !searchDropdownRef.current.contains(e.target as Node)) {
        setShowSearchDropdown(false);
      }
    };
    
    if (contextMenu || showSearchDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [contextMenu, showSearchDropdown]);

  // Show manuscript tab when there are reference tabs
  const showManuscriptTab = regionId === 'main' && tabs.length > 0;
  const manuscriptTabActive = !activeTab || activeTab.type === 'manuscript';

  return (
    <div 
      className={cn("h-10 border-b bg-muted/20 flex items-center", className)}
      onDrop={(e) => {
        handleTabDrop(e);
        onDrop?.(e);
      }}
      onDragOver={(e) => {
        handleTabBarDragOver(e);
        onDragOver?.(e);
      }}
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
          <Button
            variant="ghost"
            size="sm"
            className="h-4 w-4 p-0 opacity-30 group-hover:opacity-100 hover:bg-primary/20"
            onClick={(e) => {
              e.stopPropagation();
              handleDetachTab(tab.id);
            }}
            data-testid={`button-pin-tab-${tab.id}`}
            title="Pin to floating window"
          >
            <Pin className="h-3 w-3" />
          </Button>
          
          <span className="truncate text-sm font-medium">
            {tab.title}
          </span>
          
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 ml-auto">
            {tab.type !== 'manuscript' && (
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 hover:bg-primary/30 hover:text-primary-foreground rounded-full"
                onClick={(e) => handleTabClose(tab.id, e)}
                data-testid={`button-close-tab-${tab.id}`}
                title="Close tab"
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
      ))}
      
      {/* Plus button for adding new references */}
      <div className="relative">
        <Button
          variant="ghost"
          size="sm"
          className="h-10 w-10 p-0 border-r hover:bg-accent"
          onClick={handlePlusClick}
          data-testid="button-add-reference"
          title="Add reference"
        >
          <Plus className="h-4 w-4" />
        </Button>
        
        {/* Search dropdown */}
        {showSearchDropdown && (
          <div
            ref={searchDropdownRef}
            className="absolute top-full left-0 bg-popover border rounded-md shadow-lg py-2 z-50 w-80"
            data-testid="search-dropdown"
          >
            <div className="px-3 pb-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search content to reference..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                  data-testid="input-search-references"
                  autoFocus
                />
              </div>
            </div>
            
            {searchQuery.trim() && (
              <div className="max-h-64 overflow-y-auto">
                {searchResults.length > 0 ? (
                  searchResults.map((item: any) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 px-3 py-2 hover:bg-accent cursor-pointer"
                      onClick={() => handleSearchResultClick(item)}
                      data-testid={`search-result-${item.id}`}
                    >
                      <Badge variant="outline" className="text-xs">
                        {item.type}
                      </Badge>
                      <div className="min-w-0 flex-1">
                        <div className="font-medium truncate">{item.title}</div>
                        {item.subtitle && (
                          <div className="text-sm text-muted-foreground truncate">{item.subtitle}</div>
                        )}
                      </div>
                      <ExternalLink className="h-4 w-4 text-muted-foreground" />
                    </div>
                  ))
                ) : (
                  <div className="px-3 py-4 text-center text-muted-foreground text-sm">
                    No results found
                  </div>
                )}
              </div>
            )}
            
            {!searchQuery.trim() && (
              <div className="px-3 py-4 text-center text-muted-foreground text-sm">
                Type to search for references...
              </div>
            )}
          </div>
        )}
      </div>
      
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