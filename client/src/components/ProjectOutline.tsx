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

interface ProjectOutlineProps {
  projectId: string;
  sections: ProjectSectionWithChildren[];
  activeSectionId: string | null;
  onSectionClick: (section: ProjectSectionWithChildren) => void;
}

export function ProjectOutline({ 
  projectId, 
  sections, 
  activeSectionId, 
  onSectionClick 
}: ProjectOutlineProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: async (data: { parentId: string | null; title: string; type: 'folder' | 'page'; position: number }) => {
      const response = await apiRequest('POST', `/api/projects/${projectId}/sections`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects', projectId, 'sections'] });
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

  const renderSection = (section: ProjectSectionWithChildren, depth: number = 0) => {
    const isExpanded = expandedIds.has(section.id);
    const isActive = section.id === activeSectionId;
    const hasChildren = section.children && section.children.length > 0;
    const isEditing = editingId === section.id;

    return (
      <div key={section.id}>
        <div
          className={cn(
            'group flex items-center gap-1 py-1.5 px-2 rounded-md hover-elevate cursor-pointer transition-colors',
            isActive && 'bg-accent',
          )}
          style={{ paddingLeft: `${depth * 16 + 8}px` }}
        >
          {/* Expand/collapse button */}
          {section.type === 'folder' && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleExpanded(section.id);
              }}
              className="p-0.5 hover-elevate rounded"
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
              onClick={() => onSectionClick(section)}
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
                  className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
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

        {/* Render children */}
        {section.type === 'folder' && isExpanded && hasChildren && (
          <div>
            {section.children!.map((child) => renderSection(child, depth + 1))}
          </div>
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
        <h3 className="text-sm font-semibold">Outline</h3>
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

      {/* Tree */}
      <div className="flex-1 overflow-y-auto p-2">
        {sections.map((section) => renderSection(section, 0))}
      </div>
    </div>
  );
}
