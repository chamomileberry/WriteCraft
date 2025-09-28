import { useState, useEffect, useCallback, forwardRef, useImperativeHandle, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import { Extension } from '@tiptap/core';
import { NodeSelection } from '@tiptap/pm/state';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Mention from '@tiptap/extension-mention';
import CharacterCount from '@tiptap/extension-character-count';
import { TextAlign } from '@tiptap/extension-text-align';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import { Highlight } from '@tiptap/extension-highlight';
import { FontFamily } from '@tiptap/extension-font-family';
import { BulletList } from '@tiptap/extension-bullet-list';
import { OrderedList } from '@tiptap/extension-ordered-list';
import { ListItem } from '@tiptap/extension-list-item';
import Image from '@tiptap/extension-image';
import { Table as TiptapTable } from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import HorizontalRule from '@tiptap/extension-horizontal-rule';
import Youtube from '@tiptap/extension-youtube';
import Focus from '@tiptap/extension-focus';
import Typography from '@tiptap/extension-typography';
import { createLowlight } from 'lowlight';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Bold, 
  Italic, 
  Link as LinkIcon,
  Save,
  Eye,
  ArrowLeft,
  Loader2,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Highlighter,
  Heading1,
  Heading2,
  Heading3,
  Undo,
  Redo,
  Image as ImageIcon,
  Table as TableIcon,
  Code,
  Minus,
  Printer,
  Eye as FocusIcon,
  Download,
  Video,
  Hash,
  Type as SpecialChar
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useWorkspaceStore } from '@/stores/workspaceStore';
import { WorkspaceLayout } from './workspace/WorkspaceLayout';
import { nanoid } from 'nanoid';

// Custom HorizontalRule extension with proper backspace handling
const CustomHorizontalRule = HorizontalRule.extend({
  addKeyboardShortcuts() {
    return {
      'Backspace': () => {
        const { state, dispatch } = this.editor.view;
        const { selection } = state;
        
        // Check if we're selecting a horizontal rule directly
        if (selection instanceof NodeSelection && selection.node.type.name === 'horizontalRule') {
          const tr = state.tr.deleteSelection();
          dispatch(tr);
          return true;
        }
        
        // Check if cursor is at the start of a paragraph that follows a horizontal rule
        if (selection.empty && selection.$from.pos > 0) {
          const $pos = selection.$from;
          
          // Look for horizontal rule immediately before current position
          const before = $pos.nodeBefore;
          if (before && before.type.name === 'horizontalRule') {
            const hrPos = $pos.pos - before.nodeSize;
            const tr = state.tr.delete(hrPos, $pos.pos);
            dispatch(tr);
            return true;
          }
        }
        
        return false;
      },
      'Delete': () => {
        const { state, dispatch } = this.editor.view;
        const { selection } = state;
        const { $from } = selection;
        
        // Check if cursor is right before a horizontal rule
        if ($from.pos < state.doc.content.size) {
          const nodeAtPos = state.doc.nodeAt($from.pos);
          if (nodeAtPos?.type.name === 'horizontalRule') {
            const tr = state.tr.delete($from.pos, $from.pos + nodeAtPos.nodeSize);
            dispatch(tr);
            return true;
          }
        }
        
        // Check if we're selecting a horizontal rule
        if (selection instanceof NodeSelection && selection.node.type.name === 'horizontalRule') {
          const tr = state.tr.deleteSelection();
          dispatch(tr);
          return true;
        }
        
        return false;
      }
    };
  }
});

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

// Custom FontSize extension - same as GuideEditor
declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    fontSize: {
      setFontSize: (size: string) => ReturnType
      unsetFontSize: () => ReturnType
    }
  }
}

const FontSize = Extension.create({
  name: 'fontSize',

  addOptions() {
    return {
      types: ['textStyle'],
    }
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          fontSize: {
            default: null,
            parseHTML: element => element.style.fontSize.replace(/['"]+/g, ''),
            renderHTML: attributes => {
              if (!attributes.fontSize) {
                return {}
              }
              return {
                style: `font-size: ${attributes.fontSize}`,
              }
            },
          },
        },
      },
    ]
  },

  addCommands() {
    return {
      setFontSize: fontSize => ({ chain }) => {
        return chain()
          .setMark('textStyle', { fontSize: fontSize })
          .run()
      },
      unsetFontSize: () => ({ chain }) => {
        return chain()
          .setMark('textStyle', { fontSize: null })
          .removeEmptyTextStyle()
          .run()
      },
    }
  },
});

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
  const lowlight = createLowlight();
  
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // Disable built-in extensions we're replacing
        bulletList: false,
        orderedList: false,
        listItem: false,
        link: false,
        codeBlock: false,
        horizontalRule: false, // Disable built-in horizontal rule since we use CustomHorizontalRule
      }),
      CharacterCount,
      TextStyle,
      FontSize,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Color.configure({
        types: ['textStyle'],
      }),
      Highlight.configure({
        multicolor: true,
        HTMLAttributes: {
          class: 'my-custom-highlight',
        },
      }),
      FontFamily.configure({
        types: ['textStyle'],
      }),
      BulletList.configure({
        HTMLAttributes: {
          class: 'prose-ul',
        },
      }),
      OrderedList.configure({
        HTMLAttributes: {
          class: 'prose-ol',
        },
      }),
      ListItem,
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
      // New Media Extensions
      Image.configure({
        HTMLAttributes: {
          class: 'rounded-lg max-w-full h-auto',
        },
      }),
      TiptapTable.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      CodeBlockLowlight.configure({
        lowlight,
      }),
      CustomHorizontalRule.configure({
        HTMLAttributes: {
          class: 'my-4 border-border',
        },
      }),
      Youtube.configure({
        controls: false,
        nocookie: true,
        HTMLAttributes: {
          class: 'rounded-lg my-4',
        },
      }),
      Focus.configure({
        className: 'has-focus',
        mode: 'all',
      }),
      Typography,
    ],
    content: manuscript?.content || '',
    editorProps: {
      attributes: {
        class: 'prose dark:prose-invert mx-auto focus:outline-none min-h-[500px] p-4 prose-headings:text-foreground prose-p:text-foreground prose-strong:text-foreground prose-ul:text-foreground prose-ol:text-foreground prose-li:text-foreground prose-blockquote:text-foreground/80',
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
      queryClient.invalidateQueries({ queryKey: ['/api/manuscripts'] });
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
      queryClient.invalidateQueries({ queryKey: ['/api/manuscripts'] });
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
    if (manuscript && !isPanelOpen(`manuscript-${manuscriptId}`, manuscriptId)) {
      const { addPanel, setActiveTab, removePanel } = useWorkspaceStore.getState();
      
      // Clean up any old manuscript panels with hardcoded 'manuscript' ID
      const oldPanel = useWorkspaceStore.getState().currentLayout.panels.find(p => p.id === 'manuscript' && p.type === 'manuscript');
      if (oldPanel) {
        removePanel('manuscript');
      }
      addPanel({
        id: `manuscript-${manuscriptId}`, // Make ID unique per manuscript
        type: 'manuscript',
        title: manuscript.title || 'Untitled Manuscript',
        entityId: manuscriptId,
        mode: 'tabbed',
        regionId: 'main'
      });
      // Set as active tab
      setActiveTab(`manuscript-${manuscriptId}`, 'main');
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
              <Button variant="ghost" size="sm" onClick={onBack} data-testid="button-back" title="Back to Manuscripts">
                <ArrowLeft className="h-4 w-4" />
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
          {/* Rich Text Toolbar */}
          <div className="border-b bg-background/95 backdrop-blur">
            <div className="flex items-center justify-between gap-2 p-4">
              {/* Formatting Tools */}
              <div className="flex items-center gap-1 flex-wrap">
                {/* Basic Formatting */}
                <Button
                  variant={editor?.isActive('bold') ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => editor?.chain().focus().toggleBold().run()}
                  disabled={!editor?.can().chain().focus().toggleBold().run()}
                  data-testid="button-bold"
                  title="Bold"
                >
                  <Bold className="h-4 w-4" />
                </Button>
                <Button
                  variant={editor?.isActive('italic') ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => editor?.chain().focus().toggleItalic().run()}
                  disabled={!editor?.can().chain().focus().toggleItalic().run()}
                  data-testid="button-italic"
                  title="Italic"
                >
                  <Italic className="h-4 w-4" />
                </Button>
                <Button
                  variant={editor?.isActive('highlight') ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => editor?.chain().focus().toggleHighlight({ color: '#ffff00' }).run()}
                  disabled={!editor?.can().chain().focus().toggleHighlight().run()}
                  data-testid="button-highlight"
                  title="Highlight"
                >
                  <Highlighter className="h-4 w-4" />
                </Button>

                <Separator orientation="vertical" className="mx-1 h-6" />

                {/* Headings */}
                <Button
                  variant={editor?.isActive('heading', { level: 1 }) ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
                  data-testid="button-h1"
                  title="Heading 1"
                >
                  <Heading1 className="h-4 w-4" />
                </Button>
                <Button
                  variant={editor?.isActive('heading', { level: 2 }) ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
                  data-testid="button-h2"
                  title="Heading 2"
                >
                  <Heading2 className="h-4 w-4" />
                </Button>
                <Button
                  variant={editor?.isActive('heading', { level: 3 }) ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
                  data-testid="button-h3"
                  title="Heading 3"
                >
                  <Heading3 className="h-4 w-4" />
                </Button>

                <Separator orientation="vertical" className="mx-1 h-6" />

                {/* Font Size */}
                <select
                  className="px-2 py-1 text-sm border rounded-md bg-background min-w-16"
                  onChange={(e) => {
                    if (e.target.value === 'unset') {
                      editor?.chain().focus().unsetFontSize().run();
                    } else {
                      editor?.chain().focus().setFontSize(e.target.value).run();
                    }
                  }}
                  value={editor?.getAttributes('textStyle').fontSize || '12pt'}
                  data-testid="select-font-size"
                  title="Font Size"
                >
                  <option value="8pt">8pt</option>
                  <option value="9pt">9pt</option>
                  <option value="10pt">10pt</option>
                  <option value="11pt">11pt</option>
                  <option value="12pt">12pt</option>
                  <option value="14pt">14pt</option>
                  <option value="16pt">16pt</option>
                  <option value="18pt">18pt</option>
                  <option value="20pt">20pt</option>
                  <option value="24pt">24pt</option>
                  <option value="28pt">28pt</option>
                  <option value="32pt">32pt</option>
                  <option value="36pt">36pt</option>
                </select>

                <Separator orientation="vertical" className="mx-1 h-6" />

                {/* Undo/Redo */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => editor?.chain().focus().undo().run()}
                  disabled={!editor?.can().chain().focus().undo().run()}
                  data-testid="button-undo"
                  title="Undo (Ctrl+Z)"
                >
                  <Undo className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => editor?.chain().focus().redo().run()}
                  disabled={!editor?.can().chain().focus().redo().run()}
                  data-testid="button-redo"
                  title="Redo (Ctrl+Y)"
                >
                  <Redo className="h-4 w-4" />
                </Button>

                <Separator orientation="vertical" className="mx-1 h-6" />

                {/* Lists */}
                <Button
                  variant={editor?.isActive('bulletList') ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => editor?.chain().focus().toggleBulletList().run()}
                  disabled={!editor?.can().chain().focus().toggleBulletList().run()}
                  data-testid="button-bullet-list"
                  title="Bullet List"
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button
                  variant={editor?.isActive('orderedList') ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => editor?.chain().focus().toggleOrderedList().run()}
                  disabled={!editor?.can().chain().focus().toggleOrderedList().run()}
                  data-testid="button-ordered-list"
                  title="Numbered List"
                >
                  <ListOrdered className="h-4 w-4" />
                </Button>

                <Separator orientation="vertical" className="mx-1 h-6" />

                {/* Text Alignment */}
                <Button
                  variant={editor?.isActive({ textAlign: 'left' }) ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => editor?.chain().focus().setTextAlign('left').run()}
                  data-testid="button-align-left"
                  title="Align Left"
                >
                  <AlignLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant={editor?.isActive({ textAlign: 'center' }) ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => editor?.chain().focus().setTextAlign('center').run()}
                  data-testid="button-align-center"
                  title="Align Center"
                >
                  <AlignCenter className="h-4 w-4" />
                </Button>
                <Button
                  variant={editor?.isActive({ textAlign: 'right' }) ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => editor?.chain().focus().setTextAlign('right').run()}
                  data-testid="button-align-right"
                  title="Align Right"
                >
                  <AlignRight className="h-4 w-4" />
                </Button>
                <Button
                  variant={editor?.isActive({ textAlign: 'justify' }) ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => editor?.chain().focus().setTextAlign('justify').run()}
                  data-testid="button-align-justify"
                  title="Justify"
                >
                  <AlignJustify className="h-4 w-4" />
                </Button>

                <Separator orientation="vertical" className="mx-1 h-6" />

                {/* Media Insertion */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const url = prompt('Enter image URL:');
                    if (url) {
                      editor?.chain().focus().setImage({ src: url }).run();
                    }
                  }}
                  data-testid="button-insert-image"
                  title="Insert Image"
                >
                  <ImageIcon className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    editor?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
                  }}
                  data-testid="button-insert-table"
                  title="Insert Table"
                >
                  <TableIcon className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    editor?.chain().focus().toggleCodeBlock().run();
                  }}
                  data-testid="button-code-block"
                  title="Code Block"
                >
                  <Code className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    editor?.chain().focus().setHorizontalRule().run();
                  }}
                  data-testid="button-horizontal-rule"
                  title="Horizontal Rule"
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const url = prompt('Enter YouTube URL:');
                    if (url) {
                      editor?.chain().focus().setYoutubeVideo({
                        src: url,
                        width: 640,
                        height: 480,
                      }).run();
                    }
                  }}
                  data-testid="button-insert-video"
                  title="Insert YouTube Video"
                >
                  <Video className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const footnoteText = prompt('Enter footnote text:');
                    if (footnoteText) {
                      const footnoteId = Date.now();
                      const footnoteRef = `<sup><a href="#footnote-${footnoteId}" id="ref-${footnoteId}">${footnoteId}</a></sup>`;
                      const footnote = `<div id="footnote-${footnoteId}" class="footnote" style="border-top: 1px solid #ccc; margin-top: 2rem; padding-top: 1rem; font-size: 0.875rem;"><p><a href="#ref-${footnoteId}">${footnoteId}.</a> ${footnoteText}</p></div>`;
                      editor?.chain().focus().insertContent(footnoteRef).run();
                      // Insert footnote at end of document
                      editor?.commands.insertContentAt(editor.state.doc.content.size, footnote);
                    }
                  }}
                  data-testid="button-insert-footnote"
                  title="Insert Footnote"
                >
                  <Hash className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const specialChars = ['©', '®', '™', '§', '¶', '†', '‡', '•', '…', '"', '"', "'", "'", '—', '–', '½', '¼', '¾', '±', '×', '÷', '°', 'α', 'β', 'γ', 'δ', 'π', 'Σ', '∞'];
                    const selectedChar = prompt('Select special character:\n' + specialChars.map((char, i) => (i + 1) + '. ' + char).join(' ') + '\n\nEnter character number or the character directly:');
                    if (selectedChar) {
                      const charIndex = parseInt(selectedChar) - 1;
                      const charToInsert = (!isNaN(charIndex) && specialChars[charIndex]) ? specialChars[charIndex] : selectedChar;
                      editor?.chain().focus().insertContent(charToInsert).run();
                    }
                  }}
                  data-testid="button-special-chars"
                  title="Insert Special Characters"
                >
                  <SpecialChar className="h-4 w-4" />
                </Button>

                <Separator orientation="vertical" className="mx-1 h-6" />

                {/* Print, Zoom, Focus, Export */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.print()}
                  data-testid="button-print"
                  title="Print Document"
                >
                  <Printer className="h-4 w-4" />
                </Button>
                <select
                  className="px-2 py-1 text-sm border rounded-md bg-background min-w-20"
                  onChange={(e) => {
                    const zoom = parseInt(e.target.value) / 100;
                    const editorElement = document.querySelector('.ProseMirror');
                    if (editorElement) {
                      (editorElement as HTMLElement).style.transform = `scale(${zoom})`;
                      (editorElement as HTMLElement).style.transformOrigin = 'top left';
                    }
                  }}
                  defaultValue="100"
                  data-testid="select-zoom"
                  title="Zoom Level"
                >
                  <option value="50">50%</option>
                  <option value="75">75%</option>
                  <option value="100">100%</option>
                  <option value="125">125%</option>
                  <option value="150">150%</option>
                  <option value="200">200%</option>
                </select>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const toolbar = document.querySelector('.border-b.bg-background\\/95');
                    const sidebar = document.querySelector('[data-sidebar]');
                    if (toolbar) {
                      toolbar.classList.toggle('hidden');
                    }
                    if (sidebar) {
                      sidebar.classList.toggle('hidden');
                    }
                  }}
                  data-testid="button-focus-mode"
                  title="Focus Mode"
                >
                  <FocusIcon className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const exportOptions = [
                      '1. Export as HTML',
                      '2. Export as PDF (Preview)',
                      '3. Export as DOCX (Preview)', 
                      '4. Send via Email (Coming Soon)',
                      '5. Share for Collaboration (Coming Soon)'
                    ].join('\n');
                    
                    const choice = prompt(`Choose export option:\n\n${exportOptions}\n\nEnter option number (1-5):`);
                    const content = editor?.getHTML() || '';
                    const title = manuscript?.title || 'Untitled';
                    
                    switch(choice) {
                      case '1':
                        // HTML Export
                        const htmlFile = new Blob([content], { type: 'text/html' });
                        const htmlLink = document.createElement('a');
                        htmlLink.href = URL.createObjectURL(htmlFile);
                        htmlLink.download = `${title}.html`;
                        htmlLink.click();
                        break;
                        
                      case '2':
                        // PDF Export (Preview)
                        alert('PDF Export: This feature uses browser print-to-PDF.\nClick OK to open print dialog, then select "Save as PDF".');
                        setTimeout(() => window.print(), 500);
                        break;
                        
                      case '3':
                        // DOCX Export (Preview)
                        try {
                          const textContent = editor?.getText() || '';
                          const docxBlob = new Blob([`${title}\n\n${textContent}`], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
                          const docxLink = document.createElement('a');
                          docxLink.href = URL.createObjectURL(docxBlob);
                          docxLink.download = `${title}.docx`;
                          docxLink.click();
                        } catch (error) {
                          alert('DOCX Export: Feature in development. Using text export for now.');
                          const textBlob = new Blob([editor?.getText() || ''], { type: 'text/plain' });
                          const textLink = document.createElement('a');
                          textLink.href = URL.createObjectURL(textBlob);
                          textLink.download = `${title}.txt`;
                          textLink.click();
                        }
                        break;
                        
                      case '4':
                        alert('Email Export: Coming soon! This will allow you to email your document directly to recipients.');
                        break;
                        
                      case '5':
                        alert('Collaboration Sharing: Coming soon! This will generate shareable links for collaborative editing.');
                        break;
                        
                      default:
                        if (choice) alert('Invalid option selected. Please choose 1-5.');
                        break;
                    }
                  }}
                  data-testid="button-export"
                  title="Export & Share Document"
                >
                  <Download className="h-4 w-4" />
                </Button>

                <Separator orientation="vertical" className="mx-1 h-6" />

                {/* Font Family */}
                <select
                  className="px-3 py-1 text-sm border rounded-md bg-background"
                  onChange={(e) => {
                    if (e.target.value === 'unset') {
                      editor?.chain().focus().unsetFontFamily().run();
                    } else {
                      editor?.chain().focus().setFontFamily(e.target.value).run();
                    }
                  }}
                  value={editor?.getAttributes('textStyle').fontFamily || 'default'}
                  data-testid="select-font-family"
                >
                  <option value="default">Default</option>
                  <option value="Inter">Inter</option>
                  <option value="serif">Times New Roman</option>
                  <option value="Georgia">Georgia</option>
                  <option value="Arial">Arial</option>
                  <option value="Helvetica">Helvetica</option>
                  <option value="monospace">Monospace</option>
                  <option value="cursive">Cursive</option>
                </select>

                {/* Text Color */}
                <input
                  type="color"
                  className="w-8 h-8 border rounded cursor-pointer"
                  onChange={(e) => editor?.chain().focus().setColor(e.target.value).run()}
                  value={editor?.getAttributes('textStyle').color || '#000000'}
                  data-testid="input-text-color"
                  title="Text Color"
                />

                {/* Highlight Color */}
                <input
                  type="color"
                  className="w-8 h-8 border rounded cursor-pointer bg-yellow-200"
                  onChange={(e) => editor?.chain().focus().setHighlight({ color: e.target.value }).run()}
                  value={editor?.getAttributes('highlight').color || '#ffff00'}
                  data-testid="input-highlight-color"
                  title="Highlight Color"
                />
              </div>
              
              {/* Search Actions */}
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
            <div className="prose dark:prose-invert max-w-none prose-headings:text-foreground prose-p:text-foreground prose-strong:text-foreground prose-ul:text-foreground prose-ol:text-foreground prose-li:text-foreground prose-blockquote:text-foreground/80">
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