import { useState, useEffect, useCallback, forwardRef, useImperativeHandle, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Mention from '@tiptap/extension-mention';
// import { suggestion } from '@/lib/suggestion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Bold, 
  Italic, 
  Underline,
  Link as LinkIcon,
  Save,
  Search,
  Pin,
  Eye,
  ArrowLeft,
  Loader2,
  ExternalLink
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { getMappingById } from '@shared/contentTypes';

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
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [selectedContent, setSelectedContent] = useState<SearchResult | null>(null);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');
  const [lastSaveTime, setLastSaveTime] = useState<Date | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

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

  // Fetch pinned content
  const { data: pinnedItems = [] } = useQuery({
    queryKey: ['/api/pinned-content'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/pinned-content');
      return response.json();
    },
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
        // suggestion: suggestion,
      }),
    ],
    content: manuscript?.content || '',
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[500px] p-4',
      },
    },
    onUpdate: ({ editor }) => {
      const content = editor.getHTML();
      debouncedSave(content);
    },
  });

  // Update editor content when manuscript loads
  useEffect(() => {
    if (manuscript?.content && editor && !editor.isFocused) {
      editor.commands.setContent(manuscript.content);
    }
  }, [manuscript?.content, editor]);

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async (content: string) => {
      setSaveStatus('saving');
      const response = await apiRequest('PUT', `/api/manuscripts/${manuscriptId}`, {
        content,
        wordCount: editor?.storage.characterCount?.words() || 0,
      });
      return response.json();
    },
    onSuccess: () => {
      setSaveStatus('saved');
      setLastSaveTime(new Date());
      queryClient.invalidateQueries({ queryKey: ['/api/manuscripts', manuscriptId] });
    },
    onError: () => {
      setSaveStatus('unsaved');
      toast({
        title: "Error",
        description: "Failed to save manuscript. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Extract [[links]] from content and update manuscript links
  const updateManuscriptLinks = useCallback(async (content: string) => {
    try {
      // Extract [[double bracket]] links from content
      const linkRegex = /\[\[([^\]]+)\]\]/g;
      const links: { linkText: string; position: number }[] = [];
      let match;
      
      const plainText = content.replace(/<[^>]*>/g, ''); // Strip HTML tags to get position in plain text
      
      while ((match = linkRegex.exec(plainText)) !== null) {
        links.push({
          linkText: match[1],
          position: match.index,
        });
      }

      // Get current links for this manuscript
      const currentLinksResponse = await apiRequest('GET', `/api/manuscripts/${manuscriptId}/links`);
      const currentLinks = await currentLinksResponse.json();

      // Create new links that don't exist yet
      for (const link of links) {
        const existingLink = currentLinks.find((l: any) => 
          l.linkText === link.linkText && l.position === link.position
        );
        
        if (!existingLink) {
          // Search for the target content to determine targetType and targetId
          const searchResponse = await fetch(`/api/search?q=${encodeURIComponent(link.linkText)}`, {
            credentials: 'include'
          });
          const searchResults = await searchResponse.json();
          
          // Find exact match or best match
          const target = searchResults.find((r: any) => 
            r.title.toLowerCase() === link.linkText.toLowerCase()
          ) || searchResults[0];
          
          if (target) {
            await apiRequest('POST', `/api/manuscripts/${manuscriptId}/links`, {
              targetType: target.type,
              targetId: target.id,
              linkText: link.linkText,
              position: link.position,
              contextText: plainText.substring(
                Math.max(0, link.position - 50), 
                link.position + link.linkText.length + 50
              )
            });
          }
        }
      }

      // Remove links that no longer exist in the content
      for (const currentLink of currentLinks) {
        const stillExists = links.some(l => 
          l.linkText === currentLink.linkText && l.position === currentLink.position
        );
        
        if (!stillExists) {
          await apiRequest('DELETE', `/api/manuscript-links/${currentLink.id}`);
        }
      }

    } catch (error) {
      console.error('Failed to update manuscript links:', error);
      // Don't throw here to avoid breaking the save process
    }
  }, [manuscriptId]);

  // Autosave functionality
  const autosaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const debouncedSave = useCallback((content: string) => {
    if (autosaveTimeoutRef.current) {
      clearTimeout(autosaveTimeoutRef.current);
    }
    
    // Only update status to 'unsaved' if not currently saving
    if (saveStatus !== 'saving') {
      setSaveStatus('unsaved');
    }
    
    autosaveTimeoutRef.current = setTimeout(async () => {
      // Double-check we're not currently saving before triggering autosave
      if (!saveMutation.isPending) {
        try {
          setSaveStatus('saving');
          await saveMutation.mutateAsync(content);
          // Update links after successful autosave
          await updateManuscriptLinks(content);
          setSaveStatus('saved');
          setLastSaveTime(new Date());
        } catch (error) {
          setSaveStatus('unsaved');
          console.error('Autosave failed:', error);
        }
      }
    }, 2000); // Save after 2 seconds of inactivity
  }, [saveMutation, saveStatus, updateManuscriptLinks]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (autosaveTimeoutRef.current) {
        clearTimeout(autosaveTimeoutRef.current);
      }
    };
  }, []);

  // Pin content mutation
  const pinMutation = useMutation({
    mutationFn: async (item: SearchResult) => {
      const response = await apiRequest('POST', '/api/pinned-content', {
        targetType: item.type,
        targetId: item.id,
        category: item.type,
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Pinned",
        description: "Item has been pinned to your reference panel.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/pinned-content'] });
    },
  });

  // Unpin content mutation
  const unpinMutation = useMutation({
    mutationFn: async (pinnedId: string) => {
      await apiRequest('DELETE', `/api/pinned-content/${pinnedId}`);
    },
    onSuccess: () => {
      toast({
        title: "Unpinned",
        description: "Item has been removed from your reference panel.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/pinned-content'] });
    },
  });

  const saveContent = useCallback(async () => {
    if (editor) {
      const content = editor.getHTML();
      
      try {
        await saveMutation.mutateAsync(content);
        
        // Extract and update manuscript links
        await updateManuscriptLinks(content);
        
      } catch (error) {
        console.error('Save failed:', error);
        throw error;
      }
    }
  }, [editor, saveMutation]);

  // Expose saveContent method via ref
  useImperativeHandle(ref, () => ({
    saveContent,
  }));

  // Format save status for display
  const getSaveStatusText = () => {
    switch (saveStatus) {
      case 'saving':
        return 'Saving...';
      case 'saved':
        return lastSaveTime ? `Saved ${lastSaveTime.toLocaleTimeString()}` : 'Saved';
      case 'unsaved':
        return 'Unsaved changes';
      default:
        return '';
    }
  };

  const handleManualSave = async () => {
    // Cancel any pending autosave
    if (autosaveTimeoutRef.current) {
      clearTimeout(autosaveTimeoutRef.current);
      autosaveTimeoutRef.current = null;
    }
    
    // Immediately set status to saving
    setSaveStatus('saving');
    
    try {
      await saveContent();
    } catch (error) {
      // Error handling is already in the mutation
    }
  };

  const insertLink = (item: SearchResult) => {
    if (editor) {
      const linkText = `[[${item.title}]]`;
      editor.chain().focus().insertContent(linkText).run();
    }
  };

  const handlePinItem = (item: SearchResult) => {
    pinMutation.mutate(item);
  };

  const handleUnpinItem = (pinnedId: string) => {
    unpinMutation.mutate(pinnedId);
  };

  const navigateToContent = (item: SearchResult | PinnedItem) => {
    const itemType = (item as SearchResult).type || (item as PinnedItem).targetType;
    const itemId = (item as SearchResult).id || (item as PinnedItem).targetId;
    const mapping = getMappingById(itemType);
    if (mapping) {
      const urlSegment = mapping.urlSegment;
      window.open(`/${urlSegment}/${itemId}/edit`, '_blank');
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
    <div className="flex h-screen bg-background">
      {/* Main Editor Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={onBack} data-testid="button-back-to-manuscripts">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Manuscripts
              </Button>
              <div>
                <h1 className="text-xl font-semibold">{manuscript?.title || 'Untitled Manuscript'}</h1>
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
                  disabled={saveStatus === 'saving'}
                  data-testid="button-save-manuscript"
                >
                  {saveStatus === 'saving' ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  Save
                </Button>
              </div>
            </div>
          </div>

          {/* Editor Toolbar */}
          {editor && (
            <div className="border-t px-4 py-2">
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => editor.chain().focus().toggleBold().run()}
                  className={editor.isActive('bold') ? 'bg-accent' : ''}
                  data-testid="button-bold"
                >
                  <Bold className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => editor.chain().focus().toggleItalic().run()}
                  className={editor.isActive('italic') ? 'bg-accent' : ''}
                  data-testid="button-italic"
                >
                  <Italic className="h-4 w-4" />
                </Button>
                <Separator orientation="vertical" className="h-6 mx-2" />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    const url = window.prompt('Enter URL:');
                    if (url) {
                      editor.chain().focus().setLink({ href: url }).run();
                    }
                  }}
                  data-testid="button-link"
                >
                  <LinkIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Editor Content */}
        <div className="flex-1 overflow-auto">
          <div className="max-w-4xl mx-auto py-8">
            <EditorContent editor={editor} className="min-h-[600px]" />
          </div>
        </div>
      </div>

      {/* Right Sidebar */}
      <div className="w-80 border-l bg-background/50 flex flex-col">
        {/* Search Panel */}
        <Card className="m-4 mb-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Search className="h-4 w-4" />
              Search Content
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input
              placeholder="Search characters, locations, etc..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-8"
              data-testid="input-search-content"
            />
            {searchQuery && (
              <div className="h-32 overflow-y-auto">
                <div className="space-y-2">
                  {isSearching ? (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                  ) : searchResults.length > 0 ? (
                    searchResults.map((item: SearchResult) => (
                      <div
                        key={`${item.type}-${item.id}`}
                        className="flex items-center justify-between p-2 rounded-md border hover-elevate"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {item.type}
                            </Badge>
                          </div>
                          <p className="text-sm font-medium truncate">{item.title}</p>
                          {item.subtitle && (
                            <p className="text-xs text-muted-foreground truncate">{item.subtitle}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => insertLink(item)}
                            data-testid={`button-insert-link-${item.id}`}
                          >
                            <LinkIcon className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handlePinItem(item)}
                            disabled={pinMutation.isPending}
                            data-testid={`button-pin-${item.id}`}
                          >
                            <Pin className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigateToContent(item)}
                            data-testid={`button-view-${item.id}`}
                          >
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No results found
                    </p>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pinned Content Panel */}
        <Card className="m-4 mt-2 flex-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Pin className="h-4 w-4" />
              Pinned References
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-full overflow-y-auto">
              <div className="space-y-2">
                {pinnedItems.length > 0 ? (
                  pinnedItems.map((item: PinnedItem) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-2 rounded-md border hover-elevate"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {item.targetType}
                          </Badge>
                        </div>
                        <p className="text-sm font-medium truncate">{item.title}</p>
                        {item.subtitle && (
                          <p className="text-xs text-muted-foreground truncate">{item.subtitle}</p>
                        )}
                        {item.notes && (
                          <p className="text-xs text-muted-foreground mt-1">{item.notes}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigateToContent(item)}
                          data-testid={`button-view-pinned-${item.id}`}
                        >
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleUnpinItem(item.id)}
                          disabled={unpinMutation.isPending}
                          data-testid={`button-unpin-${item.id}`}
                        >
                          <Pin className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No pinned content yet. Use the search above to find and pin items for quick reference.
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
});

ManuscriptEditor.displayName = 'ManuscriptEditor';

export default ManuscriptEditor;