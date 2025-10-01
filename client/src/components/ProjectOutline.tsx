
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
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
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

type DropPosition = 'above' | 'below' | 'inside';

interface SortableItemProps {
  flatSection: FlatSection;
  isActive: boolean;
  isExpanded: boolean;
  isEditing: boolean;
  editingTitle: string;
  isDragOver: boolean;
  dropPosition: DropPosition | null;
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
              e.preventDefault();
              onToggleExpanded();
            }}
            onPointerDown={(e) => {
              e.stopPropagation();
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
  const [lastOverId, setLastOverId] = useState<UniqueIdentifier | null>(null);
  const [dropIndicator, setDropIndicator] = useState<{
    id: UniqueIdentifier;
    position: DropPosition;
  } | null>(null);
  
  const queryClient = useQueryClient();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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
    setLastOverId(null);
    setDropIndicator(null);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;

    if (!over || over.id === active.id) {
      setDropIndicator(null);
      return;
    }

    setLastOverId(over.id);

    const overData = over.data.current as
      | {
          section: ProjectSectionWithChildren;
        }
      | undefined;
    const overSection = overData?.section;
    const isFolder = overSection?.type === 'folder';

    const overRect = over.rect;
    const activeRect = event.active.rect.current.translated ?? event.active.rect.current.initial;

    if (!overRect || !activeRect) {
      setDropIndicator(null);
      return;
    }

    const pointerY = activeRect.top + activeRect.height / 2;
    const topBoundary = overRect.top + overRect.height * 0.25;
    const bottomBoundary = overRect.bottom - overRect.height * 0.25;

    let position: DropPosition;

    if (pointerY < topBoundary) {
      position = 'above';
    } else if (pointerY > bottomBoundary) {
      position = 'below';
    } else if (isFolder) {
      position = 'inside';
    } else {
      position = pointerY < overRect.top + overRect.height / 2 ? 'above' : 'below';
    }

    setDropIndicator({ id: over.id, position });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    setLastOverId(null);
    setDropIndicator(null);

    let overId: UniqueIdentifier | null = over?.id ?? null;

    if (!overId || overId === active.id) {
      if (lastOverId && lastOverId !== active.id) {
        overId = lastOverId;
      } else {
        return;
      }
    }

    // Find source and target in the full tree
    const flatList = flattenTree(sections);
    const sourceItem = flatList.find(f => f.section.id === active.id);
    const targetItem = flatList.find(f => f.section.id === overId);

    if (!sourceItem || !targetItem) {
      return;
    }

    console.log('[DND] Drag ended:', {
      source: { id: sourceItem.section.id, title: sourceItem.section.title, parentId: sourceItem.parentId },
      target: { id: targetItem.section.id, title: targetItem.section.title, type: targetItem.section.type, parentId: targetItem.parentId }
    });

    const indicatorPosition = dropIndicator && dropIndicator.id === overId ? dropIndicator.position : null;

    // Determine new parent and desired ordering
    let newParentId: string | null = targetItem.parentId;
    let dropPosition: DropPosition = indicatorPosition ?? (targetItem.section.type === 'folder' ? 'inside' : 'below');

    if (dropPosition === 'inside' && targetItem.section.type === 'folder') {
      newParentId = targetItem.section.id;
      console.log('[DND] Dropping into folder:', targetItem.section.title);
      // Auto-expand the folder
      setExpandedIds(prev => new Set(prev).add(targetItem.section.id));
    } else {
      newParentId = targetItem.parentId;
      console.log('[DND] Dropping next to item, using parent:', newParentId, 'position:', dropPosition);
      if (dropPosition === 'inside') {
        dropPosition = 'below';
      }
    }

    // Check if this is truly a no-op (same parent AND same position)
    if (sourceItem.parentId === newParentId && dropPosition === 'inside') {
      // When dropping on a folder that's already the parent, check if there are siblings to reorder
      const currentSiblings = flatList.filter(
        f => f.parentId === newParentId && f.section.id !== sourceItem.section.id
      );

      // Only skip if dropping on the exact same item
      if (targetItem.section.id === sourceItem.section.id) {
        console.log('[DND] No change needed - dropping on self');
        return;
      }

      // If there are other items in the folder, allow reordering to the end
      console.log('[DND] Dropping into same parent folder - will reorder to end');
    } else if (sourceItem.parentId === newParentId && dropPosition !== 'inside') {
      // For same parent page drops, only skip if dropping on the exact same item
      if (targetItem.section.id === sourceItem.section.id) {
        console.log('[DND] No change needed - dropping on self');
        return;
      }
      console.log('[DND] Reordering within same parent');
    }

    // Build the reorder payload keeping the relative ordering of the target parent's children
    const siblings = flatList.filter(
      f => f.parentId === newParentId && f.section.id !== sourceItem.section.id
    );

    let orderedIds: string[] = [];

    if (dropPosition === 'inside' && targetItem.section.type === 'folder') {
      // When dropping directly on a folder, append the moved item to the end of that folder
      orderedIds = [...siblings.map(item => item.section.id), sourceItem.section.id];
      console.log(`[DND] Will place as ${siblings.length === 0 ? 'first' : 'last'} child in folder`);
    } else {
      // When dropping on a page, insert before the target page (matching the visual cue)
      const targetIndex = siblings.findIndex(item => item.section.id === targetItem.section.id);

      if (targetIndex === -1) {
        orderedIds = [...siblings.map(item => item.section.id), sourceItem.section.id];
        console.log('[DND] Target not found, placing at end');
      } else {
        const insertIndex = dropPosition === 'below' ? targetIndex + 1 : targetIndex;
        orderedIds = [
          ...siblings.slice(0, insertIndex).map(item => item.section.id),
          sourceItem.section.id,
          ...siblings.slice(insertIndex).map(item => item.section.id),
        ];
        console.log(`[DND] Inserting ${dropPosition === 'below' ? 'after' : 'before'} target at position ${insertIndex}`);
      }
    }

    const reorders: Array<{ id: string; parentId: string | null; position: number }> = orderedIds.map((id, index) => ({
      id,
      parentId: newParentId,
      position: index,
    }));

    if (sourceItem.parentId !== newParentId) {
      const sourceSiblings = flatList
        .filter(f => f.parentId === sourceItem.parentId && f.section.id !== sourceItem.section.id)
        .map((item, index) => ({
          id: item.section.id,
          parentId: sourceItem.parentId,
          position: index,
        }));

      reorders.push(...sourceSiblings);
    }

    console.log('[DND] Reorder payload:', reorders);
    reorderMutation.mutate(reorders);
  };

  const handleDragCancel = () => {
    setActiveId(null);
    setLastOverId(null);
    setDropIndicator(null);
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
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
          onDragCancel={handleDragCancel}
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
                isDragOver={dropIndicator?.id === flatSection.section.id}
                dropPosition={dropIndicator?.id === flatSection.section.id ? dropIndicator.position : null}
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
