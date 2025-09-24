import { useState, useEffect, useCallback, forwardRef, useImperativeHandle, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Mention from '@tiptap/extension-mention';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Bold, 
  Italic, 
  Link as LinkIcon,
  Save,
  Search,
  Eye,
  ArrowLeft,
  Loader2,
  ExternalLink
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { getMappingById } from '@shared/contentTypes';
import { useWorkspaceStore } from '@/stores/workspaceStore';
import { WorkspaceLayout } from './workspace/WorkspaceLayout';
import { nanoid } from 'nanoid';

interface ManuscriptEditorProps {
  manuscriptId: string;
  onBack: () => void;
}

interface SearchResult {
  id: string;
  title: string;
  type: string;
  subtitle?: string;
  description?: string;
}

interface PinnedItem {
  id: string;
  targetType: string;
  targetId: string;
  category?: string;
  notes?: string;
  title: string;
  subtitle?: string;
}

export interface ManuscriptEditorRef {
  saveContent: () => Promise<void>;
}

const ManuscriptEditor = forwardRef<ManuscriptEditorRef, ManuscriptEditorProps>(({ manuscriptId, onBack }, ref) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');
  const [lastSaveTime, setLastSaveTime] = useState<Date | null>(null);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const autosaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Workspace store for managing panels
  const { addPanel, isPanelOpen, setActiveTab } = useWorkspaceStore();

  // Fetch manuscript data
  const { data: manuscript, isLoading: isLoadingManuscript } = useQuery({
    queryKey: ['/api/manuscripts', manuscriptId],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/manuscripts/${manuscriptId}`);
      return response.json();
    },
    enabled: !!manuscriptId && manuscriptId !== 'new',
  });

  // Search across all content types
  const { data: searchResults = [], isLoading: isSearching } = useQuery({
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

  // Initialize TipTap editor
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary underline decoration-primary/30 hover:decoration-primary transition-colors',
        },
      }),
      Mention.configure({
        HTMLAttributes: {
          class: 'bg-primary/10 text-primary px-1 py-0.5 rounded-md border border-primary/20',
        },
      }),
    ],
    content: manuscript?.content || '',
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[500px] p-4',
      },
    },
    onUpdate: ({ editor }) => {
      setSaveStatus('unsaved');
      
      // Debounced autosave
      if (autosaveTimeoutRef.current) {
        clearTimeout(autosaveTimeoutRef.current);
      }
      
      autosaveTimeoutRef.current = setTimeout(() => {
        saveContent();
      }, 2000);
    },
  });

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!editor) throw new Error('Editor not initialized');
      
      const content = editor.getHTML();
      const response = await apiRequest('PUT', `/api/manuscripts/${manuscriptId}`, { content });
      return response.json();
    },
    onSuccess: () => {
      setSaveStatus('saved');
      setLastSaveTime(new Date());
      queryClient.invalidateQueries({ queryKey: ['/api/manuscripts', manuscriptId] });
    },
    onError: (error: any) => {
      setSaveStatus('unsaved');
      toast({ title: 'Save failed', description: error.message, variant: 'destructive' });
    },
  });

  // Title update mutation
  const titleMutation = useMutation({
    mutationFn: async (newTitle: string) => {
      const response = await apiRequest('PUT', `/api/manuscripts/${manuscriptId}`, { title: newTitle });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/manuscripts', manuscriptId] });
      toast({ title: 'Title updated', description: 'Manuscript title has been saved.' });
    },
    onError: (error: any) => {
      toast({ title: 'Update failed', description: error.message, variant: 'destructive' });
    },
  });

  const saveContent = useCallback(async () => {
    if (saveStatus === 'saving') return;
    setSaveStatus('saving');
    
    try {
      await saveMutation.mutateAsync();
    } catch (error) {
      console.error('Save error:', error);
    }
  }, [saveStatus, saveMutation]);

  useImperativeHandle(ref, () => ({
    saveContent
  }), [saveContent]);

  useEffect(() => {
    if (editor && manuscript?.content && editor.getHTML() !== manuscript.content) {
      editor.commands.setContent(manuscript.content);
    }
  }, [editor, manuscript?.content]);

  useEffect(() => {
    if (manuscript?.title) {
      setTitleInput(manuscript.title);
    }
  }, [manuscript?.title]);

  // Auto-create manuscript tab when manuscript loads
  useEffect(() => {
    if (manuscript && !isPanelOpen('manuscript', manuscriptId)) {
      const { addPanel, setActiveTab } = useWorkspaceStore.getState();
      addPanel({
        id: 'manuscript',
        type: 'manuscript',
        title: manuscript.title || 'Untitled Manuscript',
        entityId: manuscriptId,
        mode: 'tabbed',
        regionId: 'main'
      });
      // Set as active tab
      setActiveTab('manuscript', 'main');
    }
  }, [manuscript, manuscriptId, isPanelOpen]);

  useEffect(() => {
    return () => {
      if (autosaveTimeoutRef.current) {
        clearTimeout(autosaveTimeoutRef.current);
      }
    };
  }, []);

  const getSaveStatusText = () => {
    if (saveStatus === 'saving') return 'Saving...';
    if (saveStatus === 'saved' && lastSaveTime) {
      return `Saved ${lastSaveTime.toLocaleTimeString()}`;
    }
    return 'Unsaved changes';
  };

  const handleManualSave = async () => {
    if (autosaveTimeoutRef.current) {
      clearTimeout(autosaveTimeoutRef.current);
      autosaveTimeoutRef.current = null;
    }
    
    setSaveStatus('saving');
    
    try {
      await saveContent();
    } catch (error) {
      // Error handling is already in the mutation
    }
  };

  const handleTitleClick = () => {
    setTitleInput(manuscript?.title || 'Untitled Manuscript');
    setIsEditingTitle(true);
  };

  const handleTitleSave = async () => {
    if (titleInput.trim() !== manuscript?.title) {
      await titleMutation.mutateAsync(titleInput.trim() || 'Untitled Manuscript');
    }
    setIsEditingTitle(false);
  };

  const handleTitleCancel = () => {
    setTitleInput(manuscript?.title || 'Untitled Manuscript');
    setIsEditingTitle(false);
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleTitleSave();
    } else if (e.key === 'Escape') {
      handleTitleCancel();
    }
  };

  const insertLink = (item: SearchResult) => {
    if (editor) {
      const linkText = `[[${item.title}]]`;
      editor.chain().focus().insertContent(linkText).run();
    }
  };

  const openInPanel = (item: SearchResult | PinnedItem) => {
    // Check if this is a pinned item (has targetId) or search result (has type)  
    const isPinnedItem = 'targetId' in item;
    const itemType = isPinnedItem ? (item as PinnedItem).targetType : (item as SearchResult).type;
    const itemId = isPinnedItem ? (item as PinnedItem).targetId : (item as SearchResult).id;
    const itemTitle = item.title;
    
    // Use workspace store to add panel
    const { addPanel, isPanelOpen, focusPanel } = useWorkspaceStore.getState();
    
    // Check if panel is already open
    if (isPanelOpen(itemType === 'character' ? 'characterDetail' : itemType, itemId)) {
      // Focus existing panel instead of creating duplicate
      focusPanel(itemId);
      return;
    }
    
    // Create new panel based on content type
    if (itemType === 'character') {
      addPanel({
        id: nanoid(),
        type: 'characterDetail',
        title: itemTitle || 'Character Details',
        entityId: itemId,
        mode: 'tabbed',
        regionId: 'main'
      });
    } else if (itemType === 'manuscript') {
      // Open manuscript in tab using workspace store
      addPanel({
        id: nanoid(),
        type: 'manuscriptOutline',
        title: itemTitle || 'Manuscript',
        entityId: itemId,
        mode: 'tabbed',
        regionId: 'main'
      });
    } else {
      // For other types, create generic panel in workspace
      addPanel({
        id: nanoid(),
        type: 'notes', // Generic type for now
        title: itemTitle || `${itemType} Details`,
        entityId: itemId,
        mode: 'tabbed',
        regionId: 'main'
      });
    }
  };

  if (isLoadingManuscript) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <WorkspaceLayout>
      <div className="flex h-full bg-background flex-col">
        {/* Header */}
        <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={onBack} data-testid="button-back-to-manuscripts">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Manuscripts
              </Button>
              <div>
                {isEditingTitle ? (
                  <Input
                    value={titleInput}
                    onChange={(e) => setTitleInput(e.target.value)}
                    onKeyDown={handleTitleKeyDown}
                    onBlur={handleTitleSave}
                    className="text-xl font-semibold h-8 px-2 -ml-2"
                    data-testid="input-manuscript-title"
                    autoFocus
                    placeholder="Manuscript title..."
                  />
                ) : (
                  <h1 
                    className="text-xl font-semibold cursor-pointer hover:bg-accent/50 rounded px-2 py-1 -ml-2 transition-colors"
                    onClick={handleTitleClick}
                    data-testid="text-manuscript-title"
                    title="Click to edit title"
                  >
                    {manuscript?.title || 'Untitled Manuscript'}
                  </h1>
                )}
                <p className="text-sm text-muted-foreground">
                  {editor?.storage.characterCount?.words() || 0} words
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center space-x-3">
                <span className="text-sm text-muted-foreground">
                  {getSaveStatusText()}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleManualSave}
                  disabled={saveMutation.isPending || saveStatus === 'saving'}
                  data-testid="button-manual-save"
                >
                  {saveMutation.isPending || saveStatus === 'saving' ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Save
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Editor Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Toolbar */}
          <div className="flex items-center justify-between gap-2 p-4 border-b">
            <div className="flex items-center gap-2">
              <Button
                variant={editor?.isActive('bold') ? 'default' : 'outline'}
                size="sm"
                onClick={() => editor?.chain().focus().toggleBold().run()}
                disabled={!editor?.can().chain().focus().toggleBold().run()}
                data-testid="button-bold"
              >
                <Bold className="h-4 w-4" />
              </Button>
              <Button
                variant={editor?.isActive('italic') ? 'default' : 'outline'}
                size="sm"
                onClick={() => editor?.chain().focus().toggleItalic().run()}
                disabled={!editor?.can().chain().focus().toggleItalic().run()}
                data-testid="button-italic"
              >
                <Italic className="h-4 w-4" />
              </Button>
              <Separator orientation="vertical" className="mx-1 h-6" />
              <Button
                variant="outline"
                size="sm"
                onClick={handleManualSave}
                disabled={saveMutation.isPending || saveStatus === 'saving'}
                data-testid="button-manual-save"
              >
                {saveMutation.isPending || saveStatus === 'saving' ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Save Now
              </Button>
            </div>
            
            {/* Quick Actions */}
            <div className="flex items-center gap-2">
              <Input
                placeholder="Search content to open in tabs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64"
                data-testid="input-search-content"
              />
            </div>
          </div>

          {/* Search Results Dropdown */}
          {searchQuery && (
            <div className="border-b bg-muted/40 max-h-32 overflow-y-auto">
              <div className="p-2">
                {isSearching ? (
                  <div className="flex items-center justify-center py-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                ) : searchResults.length > 0 ? (
                  <div className="space-y-1">
                    {searchResults.slice(0, 5).map((item: SearchResult) => (
                      <div
                        key={`${item.type}-${item.id}`}
                        className="flex items-center justify-between p-2 rounded-md border hover-elevate"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {item.type}
                            </Badge>
                            <span className="text-sm font-medium truncate">{item.title}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => insertLink(item)}
                            data-testid={`button-insert-link-${item.id}`}
                            title="Insert link"
                          >
                            <LinkIcon className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openInPanel(item)}
                            data-testid={`button-open-tab-${item.id}`}
                            title="Open in tab"
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-2">
                    No results found
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Editor */}
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="prose prose-slate dark:prose-invert max-w-none">
              <EditorContent editor={editor} />
            </div>
          </div>
        </div>
      </div>
    </WorkspaceLayout>
  );
});

ManuscriptEditor.displayName = 'ManuscriptEditor';

export default ManuscriptEditor;