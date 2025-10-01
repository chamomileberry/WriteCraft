
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  ChevronRight, 
  ChevronDown, 
  FileText, 
  Folder, 
  FolderOpen,
  Plus,
  MoreHorizontal,
  Trash2,
  Edit2,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import type { ProjectSectionWithChildren } from '@shared/schema';
import {
  DndContext,
  pointerWithin,
  rectIntersection,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  DragOverEvent,
  UniqueIdentifier,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface ProjectOutlineProps {
  projectId: string;
  sections: ProjectSectionWithChildren[];
  activeSectionId: string | null;
  onSectionClick: (section: ProjectSectionWithChildren) => void;
  onClose?: () => void;
}

interface FlatSection {
  section: ProjectSectionWithChildren;
  depth: number;
  parentId: string | null;
}

// Flatten tree for drag-and-drop
function flattenTree(sections: ProjectSectionWithChildren[], depth = 0, parentId: string | null = null): FlatSection[] {
  const result: FlatSection[] = [];
  
  for (const section of sections) {
    result.push({ section, depth, parentId });
    
    if (section.children && section.children.length > 0) {
      result.push(...flattenTree(section.children, depth + 1, section.id));
    }
  }
  
  return result;
}

interface SortableItemProps {
  flatSection: FlatSection;
  isActive: boolean;
  isExpanded: boolean;
  isEditing: boolean;
  editingTitle: string;
  isDragOver: boolean;
  dropPosition: 'above' | 'below' | 'inside' | null;
  onToggleExpanded: () => void;
  onSectionClick: () => void;
  onStartEdit: () => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onTitleChange: (value: string) => void;
  onCreateFolder: () => void;
  onCreatePage: () => void;
  onDelete: () => void;
}

function SortableItem({
  flatSection,
  isActive,
  isExpanded,
  isEditing,
  editingTitle,
  isDragOver,
  dropPosition,
  onToggleExpanded,
  onSectionClick,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onTitleChange,
  onCreateFolder,
  onCreatePage,
  onDelete,
}: SortableItemProps) {
  const { section, depth } = flatSection;
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: section.id,
    data: {
      type: section.type,
      parentId: flatSection.parentId,
      section: section
    }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="relative">
      {/* Drop indicator line above */}
      {isDragOver && dropPosition === 'above' && (
        <div className="absolute -top-1 left-0 right-0 h-0.5 bg-primary z-10" />
      )}
      
      {/* Drop indicator for folder highlighting */}
      {isDragOver && dropPosition === 'inside' && section.type === 'folder' && (
        <div className="absolute inset-0 bg-primary/20 border-2 border-primary border-dashed rounded-md z-10" />
      )}
      
      <div
        className={cn(
          'group flex items-center gap-1 py-1.5 px-2 rounded-md hover-elevate cursor-pointer transition-colors relative',
          isActive && 'bg-accent',
          isDragOver && dropPosition === 'inside' && section.type === 'folder' && 'bg-primary/10'
        )}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
        {...attributes}
        {...listeners}
        data-testid={`section-item-${section.id}`}
      >
        {/* Expand/collapse button */}
        {section.type === 'folder' && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleExpanded();
            }}
            className="p-0.5 hover:bg-accent-foreground/10 rounded z-20 relative"
            data-testid={`button-toggle-${section.id}`}
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>
        )}
        
        {section.type === 'page' && <div className="w-5" />}

        {/* Icon */}
        {section.type === 'folder' ? (
          isExpanded ? (
            <FolderOpen className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          ) : (
            <Folder className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          )
        ) : (
          <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        )}

        {/* Title or edit input */}
        {isEditing ? (
          <Input
            value={editingTitle}
            onChange={(e) => onTitleChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') onSaveEdit();
              if (e.key === 'Escape') onCancelEdit();
            }}
            onBlur={onSaveEdit}
            className="h-6 text-sm flex-1"
            autoFocus
            onClick={(e) => e.stopPropagation()}
            data-testid={`input-edit-section-${section.id}`}
          />
        ) : (
          <span
            onClick={(e) => {
              e.stopPropagation();
              onSectionClick();
            }}
            className="flex-1 text-sm truncate"
            data-testid={`text-section-${section.id}`}
          >
            {section.title}
          </span>
        )}

        {/* Actions menu */}
        {!isEditing && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 z-20 relative"
                data-testid={`button-section-menu-${section.id}`}
              >
                <MoreHorizontal className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onStartEdit} data-testid={`button-rename-${section.id}`}>
                <Edit2 className="h-4 w-4 mr-2" />
                Rename
              </DropdownMenuItem>
              {section.type === 'folder' && (
                <>
                  <DropdownMenuItem onClick={onCreateFolder} data-testid={`button-add-subfolder-${section.id}`}>
                    <Folder className="h-4 w-4 mr-2" />
                    Add Subfolder
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={onCreatePage} data-testid={`button-add-page-${section.id}`}>
                    <FileText className="h-4 w-4 mr-2" />
                    Add Page
                  </DropdownMenuItem>
                </>
              )}
              <DropdownMenuItem
                onClick={onDelete}
                className="text-destructive"
                data-testid={`button-delete-${section.id}`}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
      
      {/* Drop indicator line below */}
      {isDragOver && dropPosition === 'below' && (
        <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary z-10" />
      )}
    </div>
  );
}

export function ProjectOutline({ 
  projectId, 
  sections, 
  activeSectionId, 
  onSectionClick,
  onClose
}: ProjectOutlineProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  const [overId, setOverId] = useState<UniqueIdentifier | null>(null);
  const [dropPosition, setDropPosition] = useState<'above' | 'below' | 'inside' | null>(null);
  
  const queryClient = useQueryClient();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 3, // Reduced from 8 to 3 for more immediate drag activation
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Use rectangle intersection for more reliable collision detection
  const customCollisionDetection = (args: any) => {
    // Use rectIntersection for accurate collision detection
    const rectIntersections = rectIntersection(args);
    
    if (rectIntersections.length > 0) {
      // If multiple intersections, prefer folders over pages
      // This helps when dragging over an expanded folder with children
      const folderIntersection = rectIntersections.find(collision => {
        const flatList = flattenTree(sections);
        const item = flatList.find(f => f.section.id === collision.id);
        return item?.section.type === 'folder';
      });
      
      // Return folder if found, otherwise return first intersection
      return [folderIntersection || rectIntersections[0]];
    }
    
    // Fallback to pointer detection
    const pointerIntersections = pointerWithin(args);
    return pointerIntersections.length > 0 ? [pointerIntersections[0]] : [];
  };

  const createMutation = useMutation({
    mutationFn: async (data: { parentId: string | null; title: string; type: 'folder' | 'page'; position: number }) => {
      const response = await apiRequest('POST', `/api/projects/${projectId}/sections`, data);
      return response.json();
    },
    onSuccess: (newSection, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects', projectId, 'sections'] });
      
      // If a page was created inside a folder, expand that folder and select the new page
      if (variables.parentId) {
        setExpandedIds(prev => {
          const next = new Set(prev);
          next.add(variables.parentId!);
          return next;
        });
      }
      
      // If a page was created, select it after sections refresh
      if (variables.type === 'page' && newSection) {
        // Wait for query invalidation to complete, then select the new page
        setTimeout(() => {
          onSectionClick(newSection as ProjectSectionWithChildren);
        }, 100);
      }
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: { id: string; title: string }) => {
      const response = await apiRequest('PUT', `/api/projects/${projectId}/sections/${data.id}`, {
        title: data.title,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects', projectId, 'sections'] });
      setEditingId(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest('DELETE', `/api/projects/${projectId}/sections/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects', projectId, 'sections'] });
    },
  });

  const reorderMutation = useMutation({
    mutationFn: async (reorders: Array<{ id: string; parentId: string | null; position: number }>) => {
      const response = await apiRequest('POST', `/api/projects/${projectId}/sections/reorder`, {
        sectionOrders: reorders
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects', projectId, 'sections'] });
    },
  });

  const toggleExpanded = (id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleCreateFolder = (parentId: string | null = null) => {
    const title = 'New Folder';
    createMutation.mutate({ parentId, title, type: 'folder', position: 0 });
  };

  const handleCreatePage = (parentId: string | null = null) => {
    const title = 'New Page';
    createMutation.mutate({ parentId, title, type: 'page', position: 0 });
  };

  const handleStartEdit = (section: ProjectSectionWithChildren) => {
    setEditingId(section.id);
    setEditingTitle(section.title);
  };

  const handleSaveEdit = () => {
    if (editingId && editingTitle.trim()) {
      updateMutation.mutate({ id: editingId, title: editingTitle.trim() });
    } else {
      setEditingId(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingTitle('');
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this item and all its contents? This cannot be undone.')) {
      deleteMutation.mutate(id);
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    
    if (!over) {
      setOverId(null);
      setDropPosition(null);
      return;
    }

    // Find the target section
    const flatList = flattenTree(sections);
    const targetItem = flatList.find(f => f.section.id === over.id);
    
    if (!targetItem) {
      setOverId(null);
      setDropPosition(null);
      return;
    }

    setOverId(over.id);

    // Get the target element rect
    const overElement = document.querySelector(`[data-testid="section-item-${over.id}"]`);
    if (!overElement) {
      setDropPosition(null);
      return;
    }
    const rect = overElement.getBoundingClientRect();

    // Get the current drag position from the active element
    const dragRect = active.rect.current.translated;
    if (!dragRect) {
      setDropPosition(null);
      return;
    }

    // Use the center of the dragged item as the reference point
    const dragCenterY = dragRect.top + (dragRect.height / 2);

    const elementTop = rect.top;
    const elementBottom = rect.bottom;
    const elementHeight = rect.height;

    // Use clear thresholds for drop zones
    const topThreshold = elementTop + (elementHeight * 0.25);
    const bottomThreshold = elementBottom - (elementHeight * 0.25);

    if (targetItem.section.type === 'folder') {
      if (dragCenterY < topThreshold) {
        setDropPosition('above');
      } else if (dragCenterY > bottomThreshold) {
        setDropPosition('below');
      } else {
        setDropPosition('inside');
      }
    } else {
      // For pages, only allow above/below
      if (dragCenterY < elementTop + (elementHeight / 2)) {
        setDropPosition('above');
      } else {
        setDropPosition('below');
      }
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    // Clear drag state
    setActiveId(null);
    setOverId(null);
    setDropPosition(null);

    if (!over || active.id === over.id) {
      return;
    }

    // Find source and target in the full tree
    const flatList = flattenTree(sections);
    const sourceItem = flatList.find(f => f.section.id === active.id);
    const targetItem = flatList.find(f => f.section.id === over.id);

    if (!sourceItem || !targetItem) {
      return;
    }

    console.log('[DND] Drag ended:', {
      source: { id: sourceItem.section.id, title: sourceItem.section.title, parentId: sourceItem.parentId },
      target: { id: targetItem.section.id, title: targetItem.section.title, type: targetItem.section.type, parentId: targetItem.parentId },
      dropPosition
    });

    // Determine new parent and position based on drop position
    let newParentId: string | null;
    let newPosition = 0;
    
    if (dropPosition === 'inside' && targetItem.section.type === 'folder') {
      // Dropping inside a folder
      newParentId = targetItem.section.id;
      console.log('[DND] Dropping into folder:', targetItem.section.title);
      
      // Auto-expand the folder
      setExpandedIds(prev => new Set(prev).add(targetItem.section.id));
      
      // Get existing children of the folder
      const existingChildren = flatList.filter(f => f.parentId === targetItem.section.id && f.section.id !== sourceItem.section.id);
      newPosition = 0; // Always place at the beginning for folder drops
      
      console.log('[DND] Will place as first child in folder');
    } else {
      // Dropping above or below an item - place as sibling
      newParentId = targetItem.parentId;
      
      // Get all siblings at the target level
      const siblings = flatList.filter(f => f.parentId === newParentId && f.section.id !== sourceItem.section.id);
      const targetIndex = siblings.findIndex(f => f.section.id === targetItem.section.id);
      
      if (dropPosition === 'above') {
        newPosition = targetIndex >= 0 ? targetIndex : 0;
      } else {
        newPosition = targetIndex >= 0 ? targetIndex + 1 : siblings.length;
      }
      
      console.log('[DND] Dropping', dropPosition, 'item, using parent:', newParentId, 'position:', newPosition);
    }

    // Check if this is truly a no-op (same parent AND same position)
    if (sourceItem.parentId === newParentId) {
      const currentSiblings = flatList.filter(f => f.parentId === sourceItem.parentId);
      const currentPosition = currentSiblings.findIndex(f => f.section.id === sourceItem.section.id);
      
      // For folder drops, we need to check if it's already the first child
      if (dropPosition === 'inside' && targetItem.section.type === 'folder' && currentPosition === 0) {
        console.log('[DND] No change needed - already at this position');
        return;
      }
      
      // For sibling drops, check exact position
      if (dropPosition !== 'inside' && currentPosition === newPosition) {
        console.log('[DND] No change needed - already at this position');
        return;
      }
    }

    // Build the reorder payload
    const reorders: Array<{ id: string; parentId: string | null; position: number }> = [];
    
    // Get all siblings at the new location (excluding the source item)
    const siblings = flatList.filter(f => f.parentId === newParentId && f.section.id !== sourceItem.section.id);
    
    // Insert the moved item at the new position
    siblings.splice(newPosition, 0, sourceItem);
    
    // Update positions for all siblings in the new parent
    siblings.forEach((item, index) => {
      reorders.push({
        id: item.section.id,
        parentId: newParentId,
        position: index,
      });
    });

    // If moving between different parents, also reorder the old parent's children
    if (sourceItem.parentId !== newParentId) {
      const oldSiblings = flatList.filter(f => 
        f.parentId === sourceItem.parentId && 
        f.section.id !== sourceItem.section.id
      );
      
      oldSiblings.forEach((item, index) => {
        // Only update if not already in reorders
        if (!reorders.find(r => r.id === item.section.id)) {
          reorders.push({
            id: item.section.id,
            parentId: sourceItem.parentId,
            position: index,
          });
        }
      });
    }

    console.log('[DND] Reorder payload:', reorders);
    reorderMutation.mutate(reorders);
  };

  // Filter sections based on expanded state for rendering
  const getVisibleSections = (sectionList: ProjectSectionWithChildren[], depth = 0, parentId: string | null = null): FlatSection[] => {
    const result: FlatSection[] = [];
    
    for (const section of sectionList) {
      result.push({ section, depth, parentId });
      
      if (section.type === 'folder' && expandedIds.has(section.id) && section.children && section.children.length > 0) {
        result.push(...getVisibleSections(section.children, depth + 1, section.id));
      }
    }
    
    return result;
  };

  const visibleSections = getVisibleSections(sections);
  const activeDragSection = visibleSections.find(f => f.section.id === activeId);

  // Empty state
  if (!sections || sections.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4 text-center">
        <p className="text-sm text-muted-foreground mb-4">
          Your project outline currently has no folders or pages.
        </p>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleCreateFolder(null)}
            data-testid="button-create-folder-empty"
          >
            <Folder className="h-4 w-4 mr-2" />
            New Folder
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleCreatePage(null)}
            data-testid="button-create-page-empty"
          >
            <FileText className="h-4 w-4 mr-2" />
            New Page
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header with add buttons */}
      <div className="flex items-center justify-between p-2 border-b">
        <div className="flex items-center gap-2">
          {onClose && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 p-0"
              onClick={onClose}
              data-testid="button-toggle-outline"
              title="Hide outline"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
          <h3 className="text-sm font-semibold">Outline</h3>
        </div>
        <div className="flex gap-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="ghost" className="h-7 w-7 p-0" data-testid="button-add-section">
                <Plus className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleCreateFolder(null)} data-testid="button-create-folder">
                <Folder className="h-4 w-4 mr-2" />
                New Folder
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleCreatePage(null)} data-testid="button-create-page">
                <FileText className="h-4 w-4 mr-2" />
                New Page
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Tree with drag and drop */}
      <div className="flex-1 overflow-y-auto p-2">
        <DndContext
          sensors={sensors}
          collisionDetection={customCollisionDetection}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
          onDragCancel={() => {
            // Clean up on drag cancel
            setActiveId(null);
            setOverId(null);
            setDropPosition(null);
          }}
        >
          <SortableContext
            items={visibleSections.map(f => f.section.id)}
            strategy={verticalListSortingStrategy}
          >
            {visibleSections.map((flatSection) => (
              <SortableItem
                key={flatSection.section.id}
                flatSection={flatSection}
                isActive={flatSection.section.id === activeSectionId}
                isExpanded={expandedIds.has(flatSection.section.id)}
                isEditing={editingId === flatSection.section.id}
                editingTitle={editingTitle}
                isDragOver={overId === flatSection.section.id}
                dropPosition={overId === flatSection.section.id ? dropPosition : null}
                onToggleExpanded={() => toggleExpanded(flatSection.section.id)}
                onSectionClick={() => onSectionClick(flatSection.section)}
                onStartEdit={() => handleStartEdit(flatSection.section)}
                onSaveEdit={handleSaveEdit}
                onCancelEdit={handleCancelEdit}
                onTitleChange={setEditingTitle}
                onCreateFolder={() => handleCreateFolder(flatSection.section.id)}
                onCreatePage={() => handleCreatePage(flatSection.section.id)}
                onDelete={() => handleDelete(flatSection.section.id)}
              />
            ))}
          </SortableContext>
          
          {/* Drag overlay */}
          <DragOverlay>
            {activeDragSection ? (
              <div className="bg-accent rounded-md p-2 shadow-lg flex items-center gap-2 border border-border">
                {activeDragSection.section.type === 'folder' ? (
                  <Folder className="h-4 w-4" />
                ) : (
                  <FileText className="h-4 w-4" />
                )}
                <span className="text-sm font-medium">{activeDragSection.section.title}</span>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  );
}
