import { useState, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useWorkspaceStore } from "@/stores/workspaceStore";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  Folder,
  FileText,
  ChevronRight,
  ChevronDown,
  BookOpen,
  Library,
  MoreVertical,
  Trash2,
  Edit,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface DocumentSidebarProps {
  type: "manuscript" | "guide" | "project";
  currentDocumentId?: string;
  userId: string;
}

interface FolderWithNotes {
  id: string;
  name: string;
  description?: string;
  color?: string;
  parentId?: string;
  sortOrder: number;
  children?: FolderWithNotes[];
  notes?: {
    id: string;
    title: string;
    excerpt?: string;
    folderId?: string;
    sortOrder: number;
  }[];
}

export default function DocumentSidebar({ type, currentDocumentId, userId }: DocumentSidebarProps) {
  const [, setLocation] = useLocation();
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [renameDialog, setRenameDialog] = useState<{ open: boolean; id: string; name: string; type: 'folder' | 'note' }>({ 
    open: false, 
    id: '', 
    name: '', 
    type: 'folder' 
  });
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id: string; name: string; type: 'folder' | 'note' }>({ 
    open: false, 
    id: '', 
    name: '', 
    type: 'folder' 
  });
  const [draggedItem, setDraggedItem] = useState<{ id: string; type: 'folder' | 'note'; parentId?: string } | null>(null);
  const [dragOverItem, setDragOverItem] = useState<{ id: string; type: 'folder' | 'note' } | null>(null);
  const queryClient = useQueryClient();
  const { openPanel } = useWorkspaceStore();

  // Normalize type: 'project' is treated as 'manuscript'
  const normalizedType = type === 'project' ? 'manuscript' : type;

  // Deterministic indentation mapping to avoid dynamic Tailwind class issues
  const getIndentationClass = (level: number): string => {
    const indentationMap: Record<number, string> = {
      0: "pl-0",
      1: "pl-4",
      2: "pl-8", 
      3: "pl-12",
      4: "pl-16",
      5: "pl-20"
    };
    return indentationMap[Math.min(level, 5)] || "pl-20";
  };

  // Fetch folders for the specific document
  const { data: folders = [], isLoading: foldersLoading } = useQuery({
    queryKey: ['/api/folders', userId, type, currentDocumentId],
    queryFn: () => {
      if (currentDocumentId) {
        // Use document-specific endpoint for project, manuscript, or guide folders
        const param = type === 'project' ? 'projectId' : normalizedType === 'manuscript' ? 'manuscriptId' : 'guideId';
        return fetch(`/api/folders?userId=${userId}&${param}=${currentDocumentId}`).then(res => res.json());
      } else {
        // Fallback to type-based folders (for backwards compatibility)
        return fetch(`/api/folders?userId=${userId}&type=${normalizedType}`).then(res => res.json());
      }
    },
    enabled: !!userId,
  });

  // Fetch notes for the document type and specific document
  const { data: notes = [], isLoading: notesLoading } = useQuery({
    queryKey: ['/api/notes', userId, `${normalizedType}_note`, currentDocumentId],
    queryFn: () => {
      const docParam = type === 'project' ? 'projectId' : 'documentId';
      return fetch(`/api/notes?userId=${userId}&type=${normalizedType}_note&${docParam}=${currentDocumentId}`).then(res => res.json());
    },
    enabled: !!userId && !!currentDocumentId,
  });

  // Build hierarchical folder structure with notes
  const buildFolderHierarchy = (folders: any[], notes: any[]): FolderWithNotes[] => {
    const folderMap = new Map<string, FolderWithNotes>();
    const rootFolders: FolderWithNotes[] = [];

    // Create folder objects and map
    folders.forEach(folder => {
      const folderWithNotes: FolderWithNotes = {
        ...folder,
        children: [],
        notes: notes.filter(note => note.folderId === folder.id).sort((a, b) => a.sortOrder - b.sortOrder)
      };
      folderMap.set(folder.id, folderWithNotes);
    });

    // Build hierarchy
    folders.forEach(folder => {
      const folderWithNotes = folderMap.get(folder.id);
      if (!folderWithNotes) return;

      if (folder.parentId && folderMap.has(folder.parentId)) {
        const parent = folderMap.get(folder.parentId);
        parent?.children?.push(folderWithNotes);
      } else {
        rootFolders.push(folderWithNotes);
      }
    });

    // Sort by sortOrder
    const sortFolders = (folders: FolderWithNotes[]) => {
      folders.sort((a, b) => a.sortOrder - b.sortOrder);
      folders.forEach(folder => {
        if (folder.children) {
          sortFolders(folder.children);
        }
      });
    };

    sortFolders(rootFolders);
    return rootFolders;
  };

  const toggleFolder = (folderId: string) => {
    setExpandedFolders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(folderId)) {
        newSet.delete(folderId);
      } else {
        newSet.add(folderId);
      }
      return newSet;
    });
  };

  const navigateToDocument = (docId: string, docType: 'manuscript' | 'guide' | 'note') => {
    if (type === 'project' && docType === 'note') {
      // For projects, open scenes as tabs in the workspace
      openPanel({
        type: 'note',
        entityId: docId,
        title: 'Scene', // Will be updated when note loads
        mode: 'tabbed',
        regionId: 'main'
      });
    } else if (docType === 'manuscript') {
      setLocation(`/projects/${docId}/edit`);
    } else if (docType === 'guide') {
      setLocation(`/guides/${docId}/edit`);
    } else if (docType === 'note') {
      setLocation(`/notes/${docId}/edit`);
    }
  };

  const createNewFolder = async () => {
    try {
      const newFolder = {
        name: normalizedType === 'manuscript' ? 'New Chapter' : 'New Category',
        type: normalizedType,
        userId: userId,
        sortOrder: folders.length,
        // Link the folder to the specific document
        ...(type === 'project' && currentDocumentId ? { projectId: currentDocumentId } : {}),
        ...(normalizedType === 'manuscript' && type !== 'project' && currentDocumentId ? { manuscriptId: currentDocumentId } : {}),
        ...(normalizedType === 'guide' && currentDocumentId ? { guideId: currentDocumentId } : {}),
      };
      
      const response = await fetch('/api/folders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newFolder),
      });
      
      if (response.ok) {
        // Invalidate queries to refresh folder list without hard reload
        queryClient.invalidateQueries({ queryKey: ['/api/folders', userId, type, currentDocumentId] });
        queryClient.invalidateQueries({ queryKey: ['/api/folders', userId] });
      }
    } catch (error) {
      console.error('Failed to create folder:', error);
    }
  };

  const createNewNote = async (folderId?: string) => {
    try {
      const newNote = {
        title: normalizedType === 'manuscript' ? 'New Scene' : 'New Guide',
        content: '',
        type: `${normalizedType}_note`,
        folderId: folderId || null,
        projectId: type === 'project' ? currentDocumentId : null,
        manuscriptId: normalizedType === 'manuscript' && type !== 'project' ? currentDocumentId : null,
        guideId: normalizedType === 'guide' ? currentDocumentId : null,
        userId: userId,
        sortOrder: notes.filter((n: { folderId?: string }) => n.folderId === folderId).length,
      };
      
      const response = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newNote),
      });
      
      if (response.ok) {
        const createdNote = await response.json();
        // Invalidate queries to refresh notes list so new item appears immediately
        queryClient.invalidateQueries({ queryKey: ['/api/notes', userId, `${normalizedType}_note`] });
        // Only navigate away for guides, for projects/manuscripts stay on the current page
        if (type !== 'project') {
          navigateToDocument(createdNote.id, 'note');
        }
      }
    } catch (error) {
      console.error('Failed to create note:', error);
    }
  };

  const handleRename = async () => {
    try {
      const endpoint = renameDialog.type === 'folder' ? '/api/folders' : '/api/notes';
      const response = await fetch(`${endpoint}/${renameDialog.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          renameDialog.type === 'folder' 
            ? { name: renameDialog.name }
            : { title: renameDialog.name }
        ),
      });
      
      if (response.ok) {
        queryClient.invalidateQueries({ queryKey: ['/api/folders', userId, type, currentDocumentId] });
        queryClient.invalidateQueries({ queryKey: ['/api/notes', userId, `${normalizedType}_note`, currentDocumentId] });
        setRenameDialog({ open: false, id: '', name: '', type: 'folder' });
      }
    } catch (error) {
      console.error('Failed to rename:', error);
    }
  };

  const handleDelete = async () => {
    try {
      const endpoint = deleteDialog.type === 'folder' ? '/api/folders' : '/api/notes';
      const response = await fetch(`${endpoint}/${deleteDialog.id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        queryClient.invalidateQueries({ queryKey: ['/api/folders', userId, type, currentDocumentId] });
        queryClient.invalidateQueries({ queryKey: ['/api/notes', userId, `${normalizedType}_note`, currentDocumentId] });
        setDeleteDialog({ open: false, id: '', name: '', type: 'folder' });
      }
    } catch (error) {
      console.error('Failed to delete:', error);
    }
  };

  const handleDragStart = (e: React.DragEvent, id: string, itemType: 'folder' | 'note', parentId?: string) => {
    setDraggedItem({ id, type: itemType, parentId });
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', id);
  };

  const handleDragOver = (e: React.DragEvent, id: string, itemType: 'folder' | 'note') => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverItem({ id, type: itemType });
  };

  const handleDragLeave = () => {
    setDragOverItem(null);
  };

  const handleDrop = async (e: React.DragEvent, targetId: string, targetType: 'folder' | 'note', targetParentId?: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!draggedItem || draggedItem.id === targetId) {
      setDraggedItem(null);
      setDragOverItem(null);
      return;
    }

    // Can only reorder items of same type in same parent
    if (draggedItem.type !== targetType || draggedItem.parentId !== targetParentId) {
      setDraggedItem(null);
      setDragOverItem(null);
      return;
    }

    try {
      // Get the list of items sorted by current sortOrder
      const items = draggedItem.type === 'folder' 
        ? (Array.isArray(folders) ? folders : [])
            .filter((f: any) => f.parentId === draggedItem.parentId)
            .sort((a: any, b: any) => a.sortOrder - b.sortOrder)
        : (Array.isArray(notes) ? notes : [])
            .filter((n: any) => n.folderId === draggedItem.parentId)
            .sort((a: any, b: any) => a.sortOrder - b.sortOrder);

      const draggedIndex = items.findIndex((item: any) => item.id === draggedItem.id);
      const targetIndex = items.findIndex((item: any) => item.id === targetId);

      if (draggedIndex === -1 || targetIndex === -1 || draggedIndex === targetIndex) {
        setDraggedItem(null);
        setDragOverItem(null);
        return;
      }

      // Create new order array by removing dragged item and inserting at target position
      const reorderedItems = [...items];
      const [draggedItemData] = reorderedItems.splice(draggedIndex, 1);
      
      // Adjust insert index when moving down (array shrinks after removal)
      const insertIndex = draggedIndex < targetIndex ? targetIndex - 1 : targetIndex;
      reorderedItems.splice(insertIndex, 0, draggedItemData);

      // Update all items with new sequential sort orders
      const endpoint = draggedItem.type === 'folder' ? '/api/folders' : '/api/notes';
      
      // Update each item's sortOrder
      await Promise.all(
        reorderedItems.map((item: any, index: number) =>
          fetch(`${endpoint}/${item.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sortOrder: index }),
          })
        )
      );

      // Invalidate queries to refresh the list
      queryClient.invalidateQueries({ queryKey: ['/api/folders', userId, type, currentDocumentId] });
      queryClient.invalidateQueries({ queryKey: ['/api/notes', userId, `${normalizedType}_note`, currentDocumentId] });
    } catch (error) {
      console.error('Failed to reorder:', error);
    } finally {
      setDraggedItem(null);
      setDragOverItem(null);
    }
  };

  const renderFolder = (folder: FolderWithNotes, level: number = 0) => {
    const isExpanded = expandedFolders.has(folder.id);
    const hasChildren = folder.children && folder.children.length > 0;
    const hasNotes = folder.notes && folder.notes.length > 0;

    return (
      <div key={folder.id}>
        <SidebarMenuItem
          draggable
          onDragStart={(e) => handleDragStart(e, folder.id, 'folder', folder.parentId)}
          onDragOver={(e) => handleDragOver(e, folder.id, 'folder')}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, folder.id, 'folder', folder.parentId)}
          className={cn(
            "cursor-move",
            dragOverItem?.id === folder.id && dragOverItem?.type === 'folder' && "border-t-2 border-primary"
          )}
        >
          <div className="flex items-center group">
            <SidebarMenuButton
              onClick={() => toggleFolder(folder.id)}
              className={cn(
                "flex-1 justify-start",
                getIndentationClass(level)
              )}
              data-testid={`folder-${folder.id}`}
            >
              <div className="flex items-center gap-2 flex-1">
                {(hasChildren || hasNotes) && (
                  isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />
                )}
                <Folder 
                  className={cn("h-4 w-4", folder.color && `text-${folder.color}`)} 
                  style={{ color: folder.color }}
                />
                <span className="truncate">{folder.name}</span>
                {hasNotes && (
                  <Badge variant="secondary" className="ml-auto">
                    {folder.notes?.length}
                  </Badge>
                )}
              </div>
            </SidebarMenuButton>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 opacity-0 group-hover:opacity-100"
                  onClick={(e) => e.stopPropagation()}
                  data-testid={`folder-menu-${folder.id}`}
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    setRenameDialog({ open: true, id: folder.id, name: folder.name, type: 'folder' });
                  }}
                  data-testid={`rename-folder-${folder.id}`}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Rename
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleteDialog({ open: true, id: folder.id, name: folder.name, type: 'folder' });
                  }}
                  className="text-destructive"
                  data-testid={`delete-folder-${folder.id}`}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </SidebarMenuItem>

        {isExpanded && (
          <>
            {/* Render child folders */}
            {folder.children?.map(child => renderFolder(child, level + 1))}
            
            {/* Render notes in this folder */}
            {folder.notes?.map(note => (
              <SidebarMenuItem 
                key={note.id}
                draggable
                onDragStart={(e) => handleDragStart(e, note.id, 'note', folder.id)}
                onDragOver={(e) => handleDragOver(e, note.id, 'note')}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, note.id, 'note', folder.id)}
                className={cn(
                  "cursor-move",
                  dragOverItem?.id === note.id && dragOverItem?.type === 'note' && "border-t-2 border-primary"
                )}
              >
                <div className="flex items-center group">
                  <SidebarMenuButton
                    onClick={() => navigateToDocument(note.id, 'note')}
                    className={cn(
                      "flex-1 justify-start",
                      getIndentationClass(level + 1),
                      currentDocumentId === note.id && "bg-sidebar-accent text-sidebar-accent-foreground"
                    )}
                    data-testid={`note-${note.id}`}
                  >
                    <FileText className="h-4 w-4" />
                    <span className="truncate">{note.title}</span>
                  </SidebarMenuButton>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 opacity-0 group-hover:opacity-100"
                        onClick={(e) => e.stopPropagation()}
                        data-testid={`note-menu-${note.id}`}
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          setRenameDialog({ open: true, id: note.id, name: note.title, type: 'note' });
                        }}
                        data-testid={`rename-note-${note.id}`}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Rename
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteDialog({ open: true, id: note.id, name: note.title, type: 'note' });
                        }}
                        className="text-destructive"
                        data-testid={`delete-note-${note.id}`}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </SidebarMenuItem>
            ))}

            {/* Add note button for this folder */}
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => createNewNote(folder.id)}
                className={cn(
                  "w-full justify-start text-muted-foreground hover:text-foreground",
                  getIndentationClass(level + 1)
                )}
                data-testid={`add-note-${folder.id}`}
              >
                <FileText className="h-4 w-4" />
                <span>Add {normalizedType === 'manuscript' ? 'Scene' : 'Guide'}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </>
        )}
      </div>
    );
  };

  // Get orphaned notes (notes without folders) - memoized for performance
  const orphanedNotes = useMemo(() => 
    (Array.isArray(notes) ? notes : []).filter((note: { folderId?: string }) => !note.folderId),
    [notes]
  );

  // Build hierarchical folder structure - memoized for performance
  const hierarchicalFolders = useMemo(() => 
    buildFolderHierarchy(Array.isArray(folders) ? folders : [], Array.isArray(notes) ? notes : []),
    [folders, notes]
  );

  return (
    <Sidebar collapsible="offcanvas">
      <SidebarContent className="pt-16">
        <SidebarGroup>
          <SidebarGroupLabel className="flex items-center gap-2">
            {normalizedType === 'manuscript' ? <BookOpen className="h-4 w-4" /> : <Library className="h-4 w-4" />}
            {type === 'project' ? 'Project Outline' : normalizedType === 'manuscript' ? 'Manuscript Structure' : 'Guide Categories'}
          </SidebarGroupLabel>
          
          {/* Action buttons - visible and accessible */}
          <div className="flex items-center gap-2 px-3 py-2 border-b">
            <Button
              variant="outline"
              size="sm"
              onClick={createNewFolder}
              className="flex-1"
              data-testid="add-folder"
            >
              <Folder className="h-4 w-4 mr-2" />
              {normalizedType === 'manuscript' ? 'Chapter' : 'Category'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => createNewNote()}
              className="flex-1"
              data-testid="add-note"
            >
              <FileText className="h-4 w-4 mr-2" />
              {normalizedType === 'manuscript' ? 'Scene' : 'Guide'}
            </Button>
          </div>
          
          <SidebarGroupContent>
            <ScrollArea className="h-[calc(100vh-200px)]">
              <SidebarMenu>
                {foldersLoading || notesLoading ? (
                  <div className="p-4 text-center text-muted-foreground">
                    Loading document structure...
                  </div>
                ) : hierarchicalFolders.length === 0 && orphanedNotes.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground text-sm">
                    No {normalizedType === 'manuscript' ? 'chapters or scenes' : 'categories or guides'} yet.
                    <br />
                    Click the icons above to get started.
                  </div>
                ) : (
                  <>
                    {/* Render hierarchical folders */}
                    {hierarchicalFolders.map(folder => renderFolder(folder, 0))}

                    {/* Render orphaned notes */}
                    {orphanedNotes.map((note: any) => (
                      <SidebarMenuItem 
                        key={note.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, note.id, 'note', undefined)}
                        onDragOver={(e) => handleDragOver(e, note.id, 'note')}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, note.id, 'note', undefined)}
                        className={cn(
                          "cursor-move",
                          dragOverItem?.id === note.id && dragOverItem?.type === 'note' && "border-t-2 border-primary"
                        )}
                      >
                        <div className="flex items-center group">
                          <SidebarMenuButton
                            onClick={() => navigateToDocument(note.id, 'note')}
                            className={cn(
                              "flex-1 justify-start",
                              currentDocumentId === note.id && "bg-sidebar-accent text-sidebar-accent-foreground"
                            )}
                            data-testid={`orphan-note-${note.id}`}
                          >
                            <FileText className="h-4 w-4" />
                            <span className="truncate">{note.title}</span>
                          </SidebarMenuButton>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 opacity-0 group-hover:opacity-100"
                                onClick={(e) => e.stopPropagation()}
                                data-testid={`orphan-note-menu-${note.id}`}
                              >
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setRenameDialog({ open: true, id: note.id, name: note.title, type: 'note' });
                                }}
                                data-testid={`rename-orphan-note-${note.id}`}
                              >
                                <Edit className="h-4 w-4 mr-2" />
                                Rename
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDeleteDialog({ open: true, id: note.id, name: note.title, type: 'note' });
                                }}
                                className="text-destructive"
                                data-testid={`delete-orphan-note-${note.id}`}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </SidebarMenuItem>
                    ))}
                  </>
                )}
              </SidebarMenu>
            </ScrollArea>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Rename Dialog */}
      <Dialog open={renameDialog.open} onOpenChange={(open) => !open && setRenameDialog({ open: false, id: '', name: '', type: 'folder' })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename {renameDialog.type === 'folder' ? (normalizedType === 'manuscript' ? 'Chapter' : 'Category') : (normalizedType === 'manuscript' ? 'Scene' : 'Guide')}</DialogTitle>
            <DialogDescription>
              Enter a new name for this {renameDialog.type === 'folder' ? (normalizedType === 'manuscript' ? 'chapter' : 'category') : (normalizedType === 'manuscript' ? 'scene' : 'guide')}.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="rename-input">Name</Label>
            <Input
              id="rename-input"
              value={renameDialog.name}
              onChange={(e) => setRenameDialog({ ...renameDialog, name: e.target.value })}
              onKeyDown={(e) => e.key === 'Enter' && handleRename()}
              data-testid="input-rename"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRenameDialog({ open: false, id: '', name: '', type: 'folder' })}
              data-testid="button-cancel-rename"
            >
              Cancel
            </Button>
            <Button
              onClick={handleRename}
              data-testid="button-confirm-rename"
            >
              Rename
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog.open} onOpenChange={(open) => !open && setDeleteDialog({ open: false, id: '', name: '', type: 'folder' })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete {deleteDialog.type === 'folder' ? (normalizedType === 'manuscript' ? 'Chapter' : 'Category') : (normalizedType === 'manuscript' ? 'Scene' : 'Guide')}</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{deleteDialog.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialog({ open: false, id: '', name: '', type: 'folder' })}
              data-testid="button-cancel-delete"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              data-testid="button-confirm-delete"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Sidebar>
  );
}