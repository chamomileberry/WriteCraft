import { useState, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
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
} from "lucide-react";
import { cn } from "@/lib/utils";

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
  const queryClient = useQueryClient();

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
    queryKey: ['/api/folders', userId, normalizedType, currentDocumentId],
    queryFn: () => {
      if (currentDocumentId) {
        // Use document-specific endpoint for manuscript or guide folders
        const param = normalizedType === 'manuscript' ? 'manuscriptId' : 'guideId';
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
    queryFn: () => fetch(`/api/notes?userId=${userId}&type=${normalizedType}_note&documentId=${currentDocumentId}`).then(res => res.json()),
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
    if (docType === 'manuscript') {
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
        ...(normalizedType === 'manuscript' && currentDocumentId ? { manuscriptId: currentDocumentId } : {}),
        ...(normalizedType === 'guide' && currentDocumentId ? { guideId: currentDocumentId } : {}),
      };
      
      const response = await fetch('/api/folders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newFolder),
      });
      
      if (response.ok) {
        // Invalidate queries to refresh folder list without hard reload
        queryClient.invalidateQueries({ queryKey: ['/api/folders', userId, normalizedType, currentDocumentId] });
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
        manuscriptId: normalizedType === 'manuscript' ? currentDocumentId : null,
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
        navigateToDocument(createdNote.id, 'note');
      }
    } catch (error) {
      console.error('Failed to create note:', error);
    }
  };

  const renderFolder = (folder: FolderWithNotes, level: number = 0) => {
    const isExpanded = expandedFolders.has(folder.id);
    const hasChildren = folder.children && folder.children.length > 0;
    const hasNotes = folder.notes && folder.notes.length > 0;

    return (
      <div key={folder.id}>
        <SidebarMenuItem>
          <SidebarMenuButton
            onClick={() => toggleFolder(folder.id)}
            className={cn(
              "w-full justify-start",
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
        </SidebarMenuItem>

        {isExpanded && (
          <>
            {/* Render child folders */}
            {folder.children?.map(child => renderFolder(child, level + 1))}
            
            {/* Render notes in this folder */}
            {folder.notes?.map(note => (
              <SidebarMenuItem key={note.id}>
                <SidebarMenuButton
                  onClick={() => navigateToDocument(note.id, 'note')}
                  className={cn(
                    "w-full justify-start",
                    getIndentationClass(level + 1),
                    currentDocumentId === note.id && "bg-sidebar-accent text-sidebar-accent-foreground"
                  )}
                  data-testid={`note-${note.id}`}
                >
                  <FileText className="h-4 w-4" />
                  <span className="truncate">{note.title}</span>
                </SidebarMenuButton>
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
            {normalizedType === 'manuscript' ? 'Manuscript Structure' : 'Guide Categories'}
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
                      <SidebarMenuItem key={note.id}>
                        <SidebarMenuButton
                          onClick={() => navigateToDocument(note.id, 'note')}
                          className={cn(
                            "w-full justify-start",
                            currentDocumentId === note.id && "bg-sidebar-accent text-sidebar-accent-foreground"
                          )}
                          data-testid={`orphan-note-${note.id}`}
                        >
                          <FileText className="h-4 w-4" />
                          <span className="truncate">{note.title}</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </>
                )}
              </SidebarMenu>
            </ScrollArea>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}