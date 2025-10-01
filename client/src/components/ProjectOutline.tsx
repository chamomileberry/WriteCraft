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
import { ReactSortable } from 'react-sortablejs';

interface ProjectOutlineProps {
  projectId: string;
  sections: ProjectSectionWithChildren[];
  activeSectionId: string | null;
  onSectionClick: (section: ProjectSectionWithChildren) => void;
  onClose?: () => void;
}

interface SortableSection extends ProjectSectionWithChildren {
  id: string;
  chosen?: boolean;
  selected?: boolean;
}

interface SortableItemProps {
  section: SortableSection;
  depth: number;
  isActive: boolean;
  isExpanded: boolean;
  isEditing: boolean;
  editingTitle: string;
  onToggleExpanded: () => void;
  onSectionClick: () => void;
  onStartEdit: () => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onTitleChange: (value: string) => void;
  onCreateFolder: () => void;
  onCreatePage: () => void;
  onDelete: () => void;
  onChildrenChange: (newChildren: SortableSection[]) => void;
}

function SortableItem({
  section,
  depth,
  isActive,
  isExpanded,
  isEditing,
  editingTitle,
  onToggleExpanded,
  onSectionClick,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onTitleChange,
  onCreateFolder,
  onCreatePage,
  onDelete,
  onChildrenChange,
}: SortableItemProps) {
  return (
    <div className="relative">
      <div
        className={cn(
          'group flex items-center gap-1 py-1.5 px-2 rounded-md hover-elevate cursor-pointer transition-colors relative',
          isActive && 'bg-accent',
          section.chosen && 'opacity-50'
        )}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
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

      {/* Nested children for folders */}
      {section.type === 'folder' && isExpanded && section.children && section.children.length > 0 && (
        <div className="ml-4">
          <ReactSortable
            list={section.children as SortableSection[]}
            setList={onChildrenChange}
            group="nested"
            animation={150}
            fallbackOnBody={true}
            swapThreshold={0.65}
            ghostClass="opacity-30"
            chosenClass="bg-primary/10"
            dragClass="rotate-3"
          >
            {section.children.map((child) => (
              <SortableItemWrapper
                key={child.id}
                section={child as SortableSection}
                depth={depth + 1}
                projectId={section.id}
                activeSectionId={isActive ? section.id : null}
                onSectionClick={onSectionClick}
                expandedIds={new Set()}
                setExpandedIds={() => {}}
                editingId={null}
                editingTitle=""
                setEditingId={() => {}}
                setEditingTitle={() => {}}
                handleCreateFolder={onCreateFolder}
                handleCreatePage={onCreatePage}
                handleStartEdit={onStartEdit}
                handleSaveEdit={onSaveEdit}
                handleCancelEdit={onCancelEdit}
                handleDelete={onDelete}
                updateChildrenInParent={() => {}}
              />
            ))}
          </ReactSortable>
        </div>
      )}
    </div>
  );
}

// Wrapper component to handle individual section logic
function SortableItemWrapper({
  section,
  depth,
  projectId,
  activeSectionId,
  onSectionClick,
  expandedIds,
  setExpandedIds,
  editingId,
  editingTitle,
  setEditingId,
  setEditingTitle,
  handleCreateFolder,
  handleCreatePage,
  handleStartEdit,
  handleSaveEdit,
  handleCancelEdit,
  handleDelete,
  updateChildrenInParent,
}: {
  section: SortableSection;
  depth: number;
  projectId: string;
  activeSectionId: string | null;
  onSectionClick: (section: ProjectSectionWithChildren) => void;
  expandedIds: Set<string>;
  setExpandedIds: React.Dispatch<React.SetStateAction<Set<string>>>;
  editingId: string | null;
  editingTitle: string;
  setEditingId: React.Dispatch<React.SetStateAction<string | null>>;
  setEditingTitle: React.Dispatch<React.SetStateAction<string>>;
  handleCreateFolder: (parentId: string | null) => void;
  handleCreatePage: (parentId: string | null) => void;
  handleStartEdit: (section: ProjectSectionWithChildren) => void;
  handleSaveEdit: () => void;
  handleCancelEdit: () => void;
  handleDelete: (id: string) => void;
  updateChildrenInParent: (sectionId: string, newChildren: SortableSection[]) => void;
}) {
  const isActive = section.id === activeSectionId;
  const isExpanded = expandedIds.has(section.id);
  const isEditing = editingId === section.id;

  const toggleExpanded = () => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(section.id)) {
        next.delete(section.id);
      } else {
        next.add(section.id);
      }
      return next;
    });
  };

  const handleChildrenChange = (newChildren: SortableSection[]) => {
    updateChildrenInParent(section.id, newChildren);
  };

  return (
    <SortableItem
      section={section}
      depth={depth}
      isActive={isActive}
      isExpanded={isExpanded}
      isEditing={isEditing}
      editingTitle={editingTitle}
      onToggleExpanded={toggleExpanded}
      onSectionClick={() => onSectionClick(section)}
      onStartEdit={() => handleStartEdit(section)}
      onSaveEdit={handleSaveEdit}
      onCancelEdit={handleCancelEdit}
      onTitleChange={setEditingTitle}
      onCreateFolder={() => handleCreateFolder(section.id)}
      onCreatePage={() => handleCreatePage(section.id)}
      onDelete={() => handleDelete(section.id)}
      onChildrenChange={handleChildrenChange}
    />
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
  const [sortableSections, setSortableSections] = useState<SortableSection[]>([]);

  const queryClient = useQueryClient();

  // Convert sections to sortable format
  useState(() => {
    const convertToSortable = (sections: ProjectSectionWithChildren[]): SortableSection[] => {
      return sections.map(section => ({
        ...section,
        children: section.children ? convertToSortable(section.children) : undefined,
      }));
    };
    setSortableSections(convertToSortable(sections));
  }, [sections]);

  const createMutation = useMutation({
    mutationFn: async (data: { parentId: string | null; title: string; type: 'folder' | 'page'; position: number }) => {
      const response = await apiRequest('POST', `/api/projects/${projectId}/sections`, data);
      return response.json();
    },
    onSuccess: (newSection, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects', projectId, 'sections'] });

      if (variables.parentId) {
        setExpandedIds(prev => {
          const next = new Set(prev);
          next.add(variables.parentId!);
          return next;
        });
      }

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

  const handleSortChange = (newSections: SortableSection[]) => {
    setSortableSections(newSections);

    // Convert the new structure to reorder payload
    const generateReorders = (sections: SortableSection[], parentId: string | null = null): Array<{ id: string; parentId: string | null; position: number }> => {
      const reorders: Array<{ id: string; parentId: string | null; position: number }> = [];

      sections.forEach((section, index) => {
        reorders.push({
          id: section.id,
          parentId,
          position: index,
        });

        if (section.children && section.children.length > 0) {
          reorders.push(...generateReorders(section.children, section.id));
        }
      });

      return reorders;
    };

    const reorders = generateReorders(newSections);
    console.log('[SortableJS] Reorder payload:', reorders);
    reorderMutation.mutate(reorders);
  };

  const updateChildrenInParent = (sectionId: string, newChildren: SortableSection[]) => {
    const updateSectionChildren = (sections: SortableSection[]): SortableSection[] => {
      return sections.map(section => {
        if (section.id === sectionId) {
          return { ...section, children: newChildren };
        }
        if (section.children) {
          return { ...section, children: updateSectionChildren(section.children) };
        }
        return section;
      });
    };

    const updatedSections = updateSectionChildren(sortableSections);
    setSortableSections(updatedSections);

    // Generate reorder payload for just this branch
    const generateReorders = (sections: SortableSection[], parentId: string | null = null): Array<{ id: string; parentId: string | null; position: number }> => {
      const reorders: Array<{ id: string; parentId: string | null; position: number }> = [];

      sections.forEach((section, index) => {
        reorders.push({
          id: section.id,
          parentId,
          position: index,
        });

        if (section.children && section.children.length > 0) {
          reorders.push(...generateReorders(section.children, section.id));
        }
      });

      return reorders;
    };

    const reorders = generateReorders(updatedSections);
    reorderMutation.mutate(reorders);
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
        <ReactSortable
          list={sortableSections}
          setList={handleSortChange}
          group="nested"
          animation={150}
          fallbackOnBody={true}
          swapThreshold={0.65}
          ghostClass="opacity-30"
          chosenClass="bg-primary/10"
          dragClass="rotate-3"
        >
          {sortableSections.map((section) => (
            <SortableItemWrapper
              key={section.id}
              section={section}
              depth={0}
              projectId={projectId}
              activeSectionId={activeSectionId}
              onSectionClick={onSectionClick}
              expandedIds={expandedIds}
              setExpandedIds={setExpandedIds}
              editingId={editingId}
              editingTitle={editingTitle}
              setEditingId={setEditingId}
              setEditingTitle={setEditingTitle}
              handleCreateFolder={handleCreateFolder}
              handleCreatePage={handleCreatePage}
              handleStartEdit={handleStartEdit}
              handleSaveEdit={handleSaveEdit}
              handleCancelEdit={handleCancelEdit}
              handleDelete={handleDelete}
              updateChildrenInParent={updateChildrenInParent}
            />
          ))}
        </ReactSortable>
      </div>
    </div>
  );
}