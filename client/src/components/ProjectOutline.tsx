import { useState, useEffect } from 'react';
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
import Tree, {
  mutateTree,
  moveItemOnTree,
  RenderItemParams,
  TreeItem,
  TreeData,
  ItemId,
} from '@atlaskit/tree';

interface ProjectOutlineProps {
  projectId: string;
  sections: ProjectSectionWithChildren[];
  activeSectionId: string | null;
  onSectionClick: (section: ProjectSectionWithChildren) => void;
  onClose?: () => void;
}

interface TreeItemData extends ProjectSectionWithChildren {
  isExpanded?: boolean;
  isEditing?: boolean;
  editingTitle?: string;
}

export function ProjectOutline({
  projectId, 
  sections, 
  activeSectionId, 
  onSectionClick,
  onClose
}: ProjectOutlineProps) {
  const [treeData, setTreeData] = useState<TreeData>({ rootId: 'root', items: {} });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');

  const queryClient = useQueryClient();

  // Convert sections to tree data structure
  useEffect(() => {
    const convertToTreeData = (sections: ProjectSectionWithChildren[]): TreeData => {
      const items: { [key: string]: TreeItem } = {
        'root': {
          id: 'root',
          children: sections.map(s => s.id),
          data: { title: 'Root' },
          isExpanded: true,
        }
      };

      const processSection = (section: ProjectSectionWithChildren) => {
        items[section.id] = {
          id: section.id,
          children: section.children?.map(child => child.id) || [],
          data: {
            ...section,
            isExpanded: section.type === 'folder',
          },
          isExpanded: section.type === 'folder',
        };

        // Process children recursively
        if (section.children) {
          section.children.forEach(processSection);
        }
      };

      sections.forEach(processSection);

      return { rootId: 'root', items };
    };

    setTreeData(convertToTreeData(sections));
  }, [sections]);

  const createMutation = useMutation({
    mutationFn: async (data: { parentId: string | null; title: string; type: 'folder' | 'page'; position: number }) => {
      const response = await apiRequest('POST', `/api/projects/${projectId}/sections`, data);
      return response.json();
    },
    onSuccess: (newSection, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects', projectId, 'sections'] });

      if (variables.type === 'page' && newSection) {
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

  const handleCreateFolder = (parentId: string | null = null) => {
    const actualParentId = parentId === 'root' ? null : parentId;
    const title = 'New Folder';
    createMutation.mutate({ parentId: actualParentId, title, type: 'folder', position: 0 });
  };

  const handleCreatePage = (parentId: string | null = null) => {
    const actualParentId = parentId === 'root' ? null : parentId;
    const title = 'New Page';
    createMutation.mutate({ parentId: actualParentId, title, type: 'page', position: 0 });
  };

  const handleStartEdit = (section: TreeItemData) => {
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

  const onExpand = (itemId: ItemId) => {
    setTreeData(mutateTree(treeData, itemId, { isExpanded: true }));
  };

  const onCollapse = (itemId: ItemId) => {
    setTreeData(mutateTree(treeData, itemId, { isExpanded: false }));
  };

  const onDragEnd = (source: any, destination?: any) => {
    if (!destination) return;

    // Calculate new tree structure
    const newTree = moveItemOnTree(treeData, source, destination);
    setTreeData(newTree);

    // Generate reorder payload
    const reorders: Array<{ id: string; parentId: string | null; position: number }> = [];

    // Get the moved item's new parent and position
    const movedItem = newTree.items[source.draggableId];
    const parentItem = newTree.items[destination.parentId];

    if (parentItem && parentItem.children) {
      // Find the position of the moved item in its new parent
      const position = parentItem.children.indexOf(source.draggableId);
      const actualParentId = destination.parentId === 'root' ? null : destination.parentId;

      reorders.push({
        id: source.draggableId,
        parentId: actualParentId,
        position: position,
      });

      console.log('[Tree] Reorder payload:', reorders);
      reorderMutation.mutate(reorders);
    }
  };

  const renderItem = ({ item, onExpand, onCollapse, provided, snapshot }: RenderItemParams) => {
    const section = item.data as TreeItemData;
    const isActive = section.id === activeSectionId;
    const isEditing = editingId === section.id;
    const hasChildren = item.children && item.children.length > 0;

    return (
      <div
        ref={provided.innerRef}
        {...provided.draggableProps}
        className={cn(
          'group flex items-center gap-1 py-1.5 px-2 rounded-md hover-elevate cursor-pointer transition-colors relative',
          isActive && 'bg-accent',
          snapshot.isDragging && 'opacity-50'
        )}
        data-testid={`section-item-${section.id}`}
      >
        <div {...provided.dragHandleProps} className="flex items-center gap-1 flex-1">
          {/* Expand/collapse button */}
          {section.type === 'folder' && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                if (item.isExpanded) {
                  onCollapse(item.id);
                } else {
                  onExpand(item.id);
                }
              }}
              className="p-0.5 hover:bg-accent-foreground/10 rounded z-20 relative"
              data-testid={`button-toggle-${section.id}`}
            >
              {item.isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>
          )}

          {section.type === 'page' && <div className="w-5" />}

          {/* Icon */}
          {section.type === 'folder' ? (
            item.isExpanded ? (
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
              onChange={(e) => setEditingTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSaveEdit();
                if (e.key === 'Escape') handleCancelEdit();
              }}
              onBlur={handleSaveEdit}
              className="h-6 text-sm flex-1"
              autoFocus
              onClick={(e) => e.stopPropagation()}
              data-testid={`input-edit-section-${section.id}`}
            />
          ) : (
            <span
              onClick={(e) => {
                e.stopPropagation();
                onSectionClick(section);
              }}
              className="flex-1 text-sm truncate"
              data-testid={`text-section-${section.id}`}
            >
              {section.title}
            </span>
          )}
        </div>

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
              <DropdownMenuItem onClick={() => handleStartEdit(section)} data-testid={`button-rename-${section.id}`}>
                <Edit2 className="h-4 w-4 mr-2" />
                Rename
              </DropdownMenuItem>
              {section.type === 'folder' && (
                <>
                  <DropdownMenuItem onClick={() => handleCreateFolder(section.id)} data-testid={`button-add-subfolder-${section.id}`}>
                    <Folder className="h-4 w-4 mr-2" />
                    Add Subfolder
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleCreatePage(section.id)} data-testid={`button-add-page-${section.id}`}>
                    <FileText className="h-4 w-4 mr-2" />
                    Add Page
                  </DropdownMenuItem>
                </>
              )}
              <DropdownMenuItem
                onClick={() => handleDelete(section.id)}
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
    );
  };

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
        <Tree
          tree={treeData}
          renderItem={renderItem}
          onExpand={onExpand}
          onCollapse={onCollapse}
          onDragEnd={onDragEnd}
          offsetPerLevel={16}
          isDragEnabled
          isNestingEnabled
        />
      </div>
    </div>
  );
}