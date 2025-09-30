import { DragEvent, useState, useRef, useEffect } from 'react';
import { X, Copy, SplitSquareHorizontal, Plus, Search, ExternalLink, Pin, Minimize2, FileText } from 'lucide-react';
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
  projectInfo?: {
    id: string;
    title: string;
    onRename?: (newTitle: string) => void;
  };
}

export function TabStrip({ regionId, className, onDrop, onDragOver, projectInfo }: TabStripProps) {
  const { 
    getTabsInRegion, 
    getActiveTab, 
    setActiveTab, 
    removePanel, 
    detachToFloating,
    assignToSplit,
    reorderTabs,
    attachToTabBar,
    minimizePanel,
    isInManuscriptEditor
  } = useWorkspaceStore();
  
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; panelId: string } | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isEditingProject, setIsEditingProject] = useState(false);
  const [editProjectTitle, setEditProjectTitle] = useState('');
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

  // Filter out manuscript-related panels - only show reference/secondary panels
  const allTabs = getTabsInRegion(regionId);
  const tabs = allTabs.filter(tab => 
    tab.type !== 'manuscript' && 
    tab.type !== 'manuscriptOutline'
  );
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

  // Plus button and search handlers
  const handlePlusClick = () => {
    setShowSearchDropdown(!showSearchDropdown);
  };

  const handleSearchResultClick = (item: any) => {
    const itemType = item.type;
    const itemId = item.id;
    const itemTitle = item.title;
    const itemNotebookId = item.notebookId;  // Extract notebookId from search result
    
    // Create new panel based on content type
    if (itemType === 'character') {
      addPanel({
        id: nanoid(),
        type: 'characterDetail',
        title: itemTitle || 'Character Details',
        entityId: itemId,
        notebookId: itemNotebookId,  // Pass notebookId to panel
        mode: 'tabbed',
        regionId: regionId
      });
    } else {
      addPanel({
        id: nanoid(),
        type: 'contentDetail',  // Changed from 'notes' to 'contentDetail'
        title: itemTitle || `${itemType} Details`,
        entityId: itemId,
        contentType: itemType,  // Pass the actual content type
        notebookId: itemNotebookId,
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

  // No longer show manuscript tabs - only secondary reference panels

  const handleStartProjectEdit = () => {
    setIsEditingProject(true);
    setEditProjectTitle(projectInfo?.title || '');
  };

  const handleSaveProjectTitle = () => {
    if (editProjectTitle.trim() && editProjectTitle !== projectInfo?.title) {
      projectInfo?.onRename?.(editProjectTitle.trim());
    }
    setIsEditingProject(false);
  };

  const handleCancelProjectEdit = () => {
    setIsEditingProject(false);
    setEditProjectTitle('');
  };

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
      {/* Project Tab (if in project mode) */}
      {projectInfo && (
        <div
          className={cn(
            "flex items-center gap-2 px-3 py-2 border-r cursor-pointer relative",
            "min-w-0 max-w-48",
            !activeTab 
              ? "bg-background text-foreground" 
              : "bg-muted/40 text-muted-foreground hover-elevate"
          )}
          onClick={() => !isEditingProject && !activeTab ? handleStartProjectEdit() : !isEditingProject && setActiveTab('', 'main')}
          data-testid="tab-project"
        >
          {/* Active tab indicator - absolute positioned to not affect layout */}
          {!activeTab && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
          )}
          <FileText className="h-3.5 w-3.5 flex-shrink-0" />
          {isEditingProject && !activeTab ? (
            <Input
              value={editProjectTitle}
              onChange={(e) => setEditProjectTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSaveProjectTitle();
                if (e.key === 'Escape') handleCancelProjectEdit();
              }}
              onBlur={handleSaveProjectTitle}
              className="h-6 text-sm px-1 min-w-[120px]"
              autoFocus
              onClick={(e) => e.stopPropagation()}
              data-testid="input-edit-project-title"
            />
          ) : (
            <span className="truncate text-sm font-medium" data-testid="text-project-title">
              {projectInfo.title}
            </span>
          )}
        </div>
      )}
      
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
              ? "bg-background text-foreground" 
              : "bg-muted/40 text-muted-foreground hover:bg-muted/60",
            dragOverIndex === index && "border-l-2 border-l-primary"
          )}
          onClick={() => handleTabClick(tab.id)}
          onContextMenu={(e) => handleContextMenu(e, tab.id)}
          data-testid={`tab-${tab.id}`}
        >
          {/* Active tab indicator - absolute positioned to not affect layout */}
          {activeTab?.id === tab.id && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
          )}
          <Button
            variant="ghost"
            size="sm"
            className="h-4 w-4 p-0 opacity-30 group-hover:opacity-100 hover:bg-primary/20"
            onClick={(e) => {
              e.stopPropagation();
              if (tab.type === 'quickNote' && !isInManuscriptEditor()) {
                // Convert Quick Note to floating window
                handleDetachTab(tab.id);
              } else if (tab.type === 'writingAssistant') {
                minimizePanel(tab.id);
              } else {
                handleDetachTab(tab.id);
              }
            }}
            data-testid={`button-${(tab.type === 'quickNote' && !isInManuscriptEditor()) ? 'float' : tab.type === 'writingAssistant' ? 'minimize' : 'pin'}-tab-${tab.id}`}
            title={(tab.type === 'quickNote' && !isInManuscriptEditor()) ? "Pop out to floating window" : tab.type === 'writingAssistant' ? "Minimize" : "Pin to floating window"}
          >
            {(tab.type === 'quickNote' && !isInManuscriptEditor()) || tab.type === 'writingAssistant' ? (
              <Minimize2 className="h-3 w-3" />
            ) : (
              <Pin className="h-3 w-3" />
            )}
          </Button>
          
          <span className="truncate text-sm font-medium">
            {tab.title}
          </span>
          
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 ml-auto">
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