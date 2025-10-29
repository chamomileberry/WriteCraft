import { useState, useReducer, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { useEditor, EditorContent, type Editor as TiptapEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import { ClickableMention } from '@/lib/clickableMention';
import { guideSuggestion } from '@/lib/guide-suggestion';
import CharacterCount from '@tiptap/extension-character-count';
import { TextStyle } from '@tiptap/extension-text-style';
import { Extension } from '@tiptap/core';
import { TextAlign } from '@tiptap/extension-text-align';
import { Color } from '@tiptap/extension-color';
import { Highlight } from '@tiptap/extension-highlight';
import { FontFamily } from '@tiptap/extension-font-family';
import { BulletList } from '@tiptap/extension-bullet-list';
import { OrderedList } from '@tiptap/extension-ordered-list';
import { ListItem } from '@tiptap/extension-list-item';
import { ImageResize } from '@/lib/image-resize-extension';
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
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { EditorToolbar } from '@/components/ui/editor-toolbar';
import { 
  Save,
  ArrowLeft,
  Loader2,
  Clock,
  AlignJustify,
  Link as LinkIcon,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useAutosave } from '@/hooks/useAutosave';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import type { Guide } from '@shared/schema';
import AIBubbleMenu from '@/components/AIBubbleMenu';
import { AISuggestionsExtension } from '@/lib/ai-suggestions-plugin';
import { Switch } from '@/components/ui/switch';
import { useWorkspaceStore, type EditorActions } from '@/stores/workspaceStore';
import { marked } from 'marked';
import { useCollaboration } from '@/hooks/useCollaboration';
import { CollaborationIndicator } from '@/components/CollaborationIndicator';

interface GuideEditorProps {
  guideId: string;
  onBack: () => void;
  onGuideCreated?: (guideId: string) => void;
}

export interface GuideEditorRef {
  saveContent: () => Promise<void>;
}

const difficulties = ['Beginner', 'Intermediate', 'Advanced'];

interface GuideCategory {
  id: string;
  name: string;
  parentId: string | null;
  order: number;
  userId: string;
  createdAt: string;
  updatedAt: string;
  children: GuideCategory[];
}

// Helper function to convert markdown to HTML if needed
const convertMarkdownToHTML = (content: string): string => {
  // Check if content has markdown headings wrapped in paragraph tags
  // Pattern: <p>### Heading</p> or <p>## Heading</p>
  const hasWrappedMarkdownHeadings = /<p>\s*(#{1,6})\s+([^<]+)<\/p>/g.test(content);
  
  if (hasWrappedMarkdownHeadings) {
    // Replace markdown headings inside <p> tags with proper heading tags
    let convertedContent = content.replace(/<p>\s*(#{1,6})\s+([^<]+)<\/p>/g, (match, hashes, text) => {
      const level = hashes.length;
      return `<h${level}>${text.trim()}</h${level}>`;
    });
    return convertedContent;
  }
  
  // Check if content looks like pure markdown (contains markdown heading patterns at root level)
  const hasMarkdownHeadings = /^#{1,6}\s+.+$/m.test(content);
  
  if (hasMarkdownHeadings) {
    // Content looks like markdown, convert it to HTML
    return marked.parse(content) as string;
  }
  
  // Content is already HTML or plain text
  return content;
};

// Guide editor state management
interface GuideEditorState {
  currentGuideId: string;
  title: string;
  description: string;
  category: string; // Legacy field, kept for backward compatibility
  categoryId: string | null; // New hierarchical category ID
  difficulty: string;
  author: string;
  tags: string[];
  tagInput: string;
  hasBeenSavedOnce: boolean;
  wordCount: number;
  published: boolean;
}

type GuideEditorAction =
  | { type: 'SET_CURRENT_GUIDE_ID'; payload: string }
  | { type: 'SET_TITLE'; payload: string }
  | { type: 'SET_DESCRIPTION'; payload: string }
  | { type: 'SET_CATEGORY'; payload: string }
  | { type: 'SET_CATEGORY_ID'; payload: string | null }
  | { type: 'SET_DIFFICULTY'; payload: string }
  | { type: 'SET_AUTHOR'; payload: string }
  | { type: 'SET_TAGS'; payload: string[] }
  | { type: 'SET_TAG_INPUT'; payload: string }
  | { type: 'SET_HAS_BEEN_SAVED_ONCE'; payload: boolean }
  | { type: 'SET_WORD_COUNT'; payload: number }
  | { type: 'SET_PUBLISHED'; payload: boolean }
  | { type: 'LOAD_GUIDE_DATA'; payload: Partial<GuideEditorState> }
  | { type: 'RESET_FORM' };

function guideEditorReducer(state: GuideEditorState, action: GuideEditorAction): GuideEditorState {
  switch (action.type) {
    case 'SET_CURRENT_GUIDE_ID':
      return { ...state, currentGuideId: action.payload };
    case 'SET_TITLE':
      return { ...state, title: action.payload };
    case 'SET_DESCRIPTION':
      return { ...state, description: action.payload };
    case 'SET_CATEGORY':
      return { ...state, category: action.payload };
    case 'SET_CATEGORY_ID':
      return { ...state, categoryId: action.payload };
    case 'SET_DIFFICULTY':
      return { ...state, difficulty: action.payload };
    case 'SET_AUTHOR':
      return { ...state, author: action.payload };
    case 'SET_TAGS':
      return { ...state, tags: action.payload };
    case 'SET_TAG_INPUT':
      return { ...state, tagInput: action.payload };
    case 'SET_HAS_BEEN_SAVED_ONCE':
      return { ...state, hasBeenSavedOnce: action.payload };
    case 'SET_WORD_COUNT':
      return { ...state, wordCount: action.payload };
    case 'SET_PUBLISHED':
      return { ...state, published: action.payload };
    case 'LOAD_GUIDE_DATA':
      return { ...state, ...action.payload };
    case 'RESET_FORM':
      return {
        ...state,
        title: '',
        description: '',
        category: '',
        categoryId: null,
        difficulty: '',
        author: '',
        tags: [],
        tagInput: '',
        hasBeenSavedOnce: false,
        wordCount: 0,
        published: false,
      };
    default:
      return state;
  }
}

// Custom FontSize extension - 2024 best practice approach
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

// Custom Enter Key Handler - Google Docs style behavior
// Single Enter = hard break (<br>), Double Enter (on empty line) = new paragraph
const GoogleDocsEnter = Extension.create({
  name: 'googleDocsEnter',

  addKeyboardShortcuts() {
    return {
      Enter: ({ editor }) => {
        const { state } = editor;
        const { selection } = state;
        const { $from } = selection;

        // Get the current node
        const node = $from.parent;

        // Only apply custom behavior to plain paragraphs at document level (not inside lists, etc.)
        // depth === 1 means paragraph is a direct child of the document
        if (node.type.name === 'paragraph' && $from.depth === 1) {
          // Check if the paragraph is empty
          if (node.content.size === 0) {
            // Empty paragraph - create new paragraph (default behavior)
            return false;
          }
          
          // Check if cursor is immediately after a hard break
          const nodeBefore = $from.nodeBefore;
          if (nodeBefore && nodeBefore.type.name === 'hardBreak') {
            // Cursor is after a hard break - create new paragraph (double Enter)
            return false;
          }
          
          // Paragraph has content but cursor is not after a hard break - insert hard break
          return editor.commands.setHardBreak();
        }

        // For other node types (headings, lists, etc.), use default behavior
        return false;
      },
    };
  },
});

const GuideEditor = forwardRef<GuideEditorRef, GuideEditorProps>(({ guideId: initialGuideId, onBack, onGuideCreated }, ref) => {
  // Centralized state management with useReducer
  const [guideState, dispatch] = useReducer(guideEditorReducer, {
    currentGuideId: initialGuideId,
    title: '',
    description: '',
    category: '',
    categoryId: null,
    difficulty: '',
    author: '',
    tags: [],
    tagInput: '',
    hasBeenSavedOnce: false,
    wordCount: 0,
    published: false,
  });

  // Destructure state for easier access
  const {
    currentGuideId,
    title,
    description,
    category,
    categoryId,
    difficulty,
    author,
    tags,
    tagInput,
    hasBeenSavedOnce,
    wordCount,
    published,
  } = guideState;
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();
  const { updateEditorContext, clearEditorContext, registerEditorActions } = useWorkspaceStore();
  
  // Check if current user is admin
  const isAdmin = user?.isAdmin || false;

  // Focus Mode and Zoom state
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);

  // Track if we're doing an initial load vs autosave update
  const isInitialLoadRef = useRef(true);
  const lastLoadedGuideIdRef = useRef<string | null>(null);

  // Fetch guide data
  const { data: guide, isLoading: isLoadingGuide } = useQuery<Guide>({
    queryKey: ['/api/guides', currentGuideId],
    queryFn: async () => {
      const response = await fetch(`/api/guides/${currentGuideId}`);
      if (!response.ok) throw new Error('Failed to fetch guide');
      return response.json();
    },
    enabled: !!currentGuideId && currentGuideId !== 'new',
  });

  // Fetch guide categories
  const { data: categories = [], isLoading: isLoadingCategories } = useQuery<GuideCategory[]>({
    queryKey: ['/api/guide-categories'],
  });

  // Helper function to flatten hierarchical categories for dropdown
  const flattenCategories = (cats: GuideCategory[], level = 0): Array<{ id: string; name: string; level: number }> => {
    let result: Array<{ id: string; name: string; level: number }> = [];
    for (const cat of cats) {
      result.push({ id: cat.id, name: cat.name, level });
      if (cat.children.length > 0) {
        result = result.concat(flattenCategories(cat.children, level + 1));
      }
    }
    return result;
  };

  const flatCategories = flattenCategories(categories);

  // Initialize TipTap editor
  const lowlight = createLowlight();
  
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // Disable built-in extensions that we'll replace
        bulletList: false,
        orderedList: false,
        listItem: false,
        link: false,
        codeBlock: false,
        // hardBreak is enabled by default - needed for Google Docs-style line breaks
      }),
      GoogleDocsEnter, // Custom Enter key handler for Google Docs-style behavior
      ClickableMention.configure({
        suggestion: guideSuggestion,
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
      // New Media Extensions
      ImageResize.configure({
        inline: false,
        allowBase64: true,
        HTMLAttributes: {
          class: 'rounded-lg',
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
      HorizontalRule.configure({
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
      AISuggestionsExtension,
    ],
    content: guide?.content || '',
    editorProps: {
      attributes: {
        class: 'prose dark:prose-invert prose-sm sm:prose lg:prose-lg xl:prose-2xl focus:outline-none min-h-[400px] p-4 !max-w-none prose-headings:text-foreground prose-p:text-foreground prose-strong:text-foreground prose-ul:text-foreground prose-ol:text-foreground prose-li:text-foreground prose-blockquote:text-foreground/80',
        style: 'font-size: 12pt;', // Set default font size to 12pt
      },
    },
    onUpdate: ({ editor }) => {
      // Update editor context for AI Writing Assistant
      const content = editor.getText();
      const htmlContent = editor.getHTML();
      updateEditorContext({
        content,
        htmlContent,
        title: title || 'Untitled Guide',
        type: 'guide',
        entityId: currentGuideId
      });
    },
  });

  // Setup autosave hook with longer delay to avoid interrupting typing
  const autosave = useAutosave({
    editor,
    debounceMs: 5000, // Wait 5 seconds after user stops typing before saving
    saveDataFunction: () => {
      if (!editor || !isFormValid()) return null;
      
      const content = editor.getHTML();
      const wordCount = editor.storage.characterCount.words();
      const calculatedReadTime = Math.max(1, Math.round(wordCount / 200));

      return {
        title: title.trim(),
        description: description.trim(),
        content,
        excerpt: description.trim() || content.substring(0, 200).replace(/<[^>]+>/g, ''),
        category: category || 'Writing Craft', // Legacy field for backward compatibility
        categoryId: categoryId,
        readTime: calculatedReadTime,
        difficulty: difficulty || 'Beginner',
        author: author.trim() || 'Anonymous',
        tags: tags.filter(tag => tag.trim()),
        published: published,
      };
    },
    mutationFunction: async (data: any) => {
      if (currentGuideId === 'new') {
        const response = await apiRequest('POST', '/api/guides', data);
        return response.json();
      } else {
        const response = await apiRequest('PUT', `/api/guides/${currentGuideId}`, data);
        return response.json();
      }
    },
    onSuccess: (savedGuide) => {
      // If this was a new guide, update the current guide ID
      if (currentGuideId === 'new' && savedGuide.id) {
        dispatch({ type: 'SET_CURRENT_GUIDE_ID', payload: savedGuide.id });
        dispatch({ type: 'SET_HAS_BEEN_SAVED_ONCE', payload: true });
        onGuideCreated?.(savedGuide.id);
      }
      
      // Update the cache directly for the current guide to prevent refetching
      // This prevents cursor jumping and content reversion during autosave
      const guideId = savedGuide.id || currentGuideId;
      if (guideId && guideId !== 'new') {
        queryClient.setQueryData(['/api/guides', guideId], savedGuide);
      }
      
      // Only invalidate list queries, not the detail query for the current guide
      // This keeps the guide list fresh without disrupting the editor
      queryClient.invalidateQueries({ 
        predicate: (query) => {
          if (!Array.isArray(query.queryKey)) return false;
          if (query.queryKey[0] !== '/api/guides') return false;
          
          // Only invalidate list queries (length 1) or queries that aren't for the current guide
          return query.queryKey.length === 1 || query.queryKey[1] !== guideId;
        }
      });
    },
    autoSaveCondition: () => hasBeenSavedOnce && isFormValid(),
    successMessage: 'Your guide has been saved successfully.',
    errorMessage: 'Failed to save the guide. Please try again.',
  });

  // Initialize collaboration for team editing (only for existing guides)
  const collaborationState = useCollaboration(
    editor,
    currentGuideId !== 'new' ? currentGuideId : null,
    'guide',
    currentGuideId !== 'new' // Only enable collaboration for existing guides
  );

  // Set up the onUpdate handler using useEffect to avoid circular dependency
  useEffect(() => {
    if (!editor) return;
    
    const handleUpdate = ({ editor }: { editor: TiptapEditor }) => {
      // Update word count
      const currentWordCount = editor.storage.characterCount.words();
      dispatch({ type: 'SET_WORD_COUNT', payload: currentWordCount });
      
      // Trigger autosave using the hook
      autosave.setupAutosave();
    };
    
    editor.on('update', handleUpdate);
    
    return () => {
      editor.off('update', handleUpdate);
    };
  }, [editor, autosave]);

  // Load guide data into form
  useEffect(() => {
    if (guide) {
      dispatch({ type: 'LOAD_GUIDE_DATA', payload: {
        title: guide.title || '',
        description: guide.description || '',
        category: guide.category || '',
        categoryId: guide.categoryId || null,
        difficulty: guide.difficulty || '',
        author: guide.author || '',
        tags: guide.tags || [],
        published: guide.published === true,
        hasBeenSavedOnce: true,
      } });
      
      // Only update editor content on initial load or when switching guides
      // Never update during normal editing to prevent cursor jumping
      const isNewGuide = lastLoadedGuideIdRef.current !== currentGuideId;
      const needsInitialLoad = isInitialLoadRef.current || isNewGuide;
      
      if (editor && guide.content && needsInitialLoad) {
        // Convert markdown to HTML if needed
        const htmlContent = convertMarkdownToHTML(guide.content);
        
        // Set the content only on initial load
        editor.commands.setContent(htmlContent);
        // Update word count after setting content
        dispatch({ type: 'SET_WORD_COUNT', payload: editor.storage.characterCount.words() });
        
        // Mark that we've loaded this guide
        isInitialLoadRef.current = false;
        lastLoadedGuideIdRef.current = currentGuideId;
      }
    }
  }, [guide, editor, currentGuideId]);

  // Update word count when editor is first created
  useEffect(() => {
    if (editor) {
      dispatch({ type: 'SET_WORD_COUNT', payload: editor.storage.characterCount.words() });
    }
  }, [editor]);

  // Initialize editor context when guide data loads
  useEffect(() => {
    if (guide && editor) {
      const content = editor.getText();
      const htmlContent = editor.getHTML();
      updateEditorContext({
        content,
        htmlContent,
        title: guide.title || 'Untitled Guide',
        type: 'guide',
        entityId: currentGuideId
      });
    }
  }, [guide, editor, currentGuideId, updateEditorContext]);

  // Register editor actions for cross-component communication
  useEffect(() => {
    if (editor) {
      const editorActions: EditorActions = {
        insertContent: (content: string) => {
          editor.chain().focus().insertContent(content).run();
        },
        replaceContent: (content: string) => {
          editor.commands.setContent(content);
        },
        replaceSelection: (content: string) => {
          editor.chain().focus().deleteSelection().insertContent(content).run();
        },
        selectAll: () => {
          editor.commands.selectAll();
        },
        insertAtCursor: (content: string) => {
          editor.chain().focus().insertContent(content).run();
        },
      };
      registerEditorActions(editorActions);
    }
  }, [editor, registerEditorActions]);

  // Clear editor context on unmount
  useEffect(() => {
    return () => {
      clearEditorContext();
    };
  }, [clearEditorContext]);

  const isFormValid = () => {
    // For backward compatibility, accept either category or categoryId
    return !!editor && !!title.trim() && (!!category || !!categoryId) && !!difficulty;
  };

  const handleSave = async () => {
    if (!isFormValid()) {
      toast({
        title: 'Missing required fields',
        description: 'Please provide a title, category, and difficulty for the guide.',
        variant: 'destructive',
      });
      return;
    }

    await autosave.handleSave();
  };

  useImperativeHandle(ref, () => ({
    saveContent: handleSave,
  }));

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      dispatch({ type: 'SET_TAGS', payload: [...tags, tagInput.trim()] });
      dispatch({ type: 'SET_TAG_INPUT', payload: '' });
    }
  };

  const removeTag = (tagToRemove: string) => {
    dispatch({ type: 'SET_TAGS', payload: tags.filter(tag => tag !== tagToRemove) });
  };


  if (isLoadingGuide && currentGuideId !== 'new') {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-serif font-bold">
          {currentGuideId === 'new' ? 'New Guide' : 'Edit Guide'}
        </h1>
        
        <div className="flex items-center gap-4">
          {isAdmin && (
            <div className="flex items-center gap-2">
              <Badge variant={published ? "default" : "secondary"} data-testid="badge-publish-status">
                {published ? (
                  <>
                    <Eye className="h-3 w-3 mr-1" />
                    Published
                  </>
                ) : (
                  <>
                    <EyeOff className="h-3 w-3 mr-1" />
                    Draft
                  </>
                )}
              </Badge>
              <Switch
                checked={published}
                onCheckedChange={(checked) => dispatch({ type: 'SET_PUBLISHED', payload: checked })}
                data-testid="switch-published"
              />
            </div>
          )}
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {autosave.saveStatus === 'saving' && <Loader2 className="h-4 w-4 animate-spin" />}
            {autosave.saveStatus === 'saved' && <Clock className="h-4 w-4" />}
            <span>
              {autosave.saveStatus === 'saved' && autosave.lastSaveTime 
                ? `Saved ${autosave.formatSaveTime(autosave.lastSaveTime)}`
                : autosave.saveStatus === 'saving'
                ? 'Saving...'
                : 'Unsaved changes'
              }
            </span>
          </div>
          
          <Button onClick={handleSave} disabled={autosave.isSaving} data-testid="button-save">
            <Save className="h-4 w-4 mr-2" />
            Save Guide
          </Button>
        </div>
      </div>

      {/* Guide Metadata */}
      <Card>
        <CardHeader>
          <CardTitle>Guide Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => dispatch({ type: 'SET_TITLE', payload: e.target.value })}
                placeholder="Enter guide title"
                data-testid="input-title"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="author">Author</Label>
              <Input
                id="author"
                value={author}
                onChange={(e) => dispatch({ type: 'SET_AUTHOR', payload: e.target.value })}
                placeholder="Guide author"
                data-testid="input-author"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => dispatch({ type: 'SET_DESCRIPTION', payload: e.target.value })}
              placeholder="Brief description of the guide"
              rows={3}
              data-testid="input-description"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select 
                value={categoryId || ''} 
                onValueChange={(value) => {
                  dispatch({ type: 'SET_CATEGORY_ID', payload: value });
                  // Also set legacy category field for backward compatibility
                  const selectedCategory = flatCategories.find(c => c.id === value);
                  if (selectedCategory) {
                    dispatch({ type: 'SET_CATEGORY', payload: selectedCategory.name });
                  }
                }}
              >
                <SelectTrigger data-testid="select-category">
                  <SelectValue placeholder={isLoadingCategories ? "Loading categories..." : "Select category"} />
                </SelectTrigger>
                <SelectContent>
                  {flatCategories.length === 0 ? (
                    <SelectItem value="none" disabled>No categories available</SelectItem>
                  ) : (
                    flatCategories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {'  '.repeat(cat.level) + cat.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="difficulty">Difficulty</Label>
              <Select value={difficulty} onValueChange={(value) => dispatch({ type: 'SET_DIFFICULTY', payload: value })}>
                <SelectTrigger data-testid="select-difficulty">
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>
                <SelectContent>
                  {difficulties.map((diff) => (
                    <SelectItem key={diff} value={diff}>
                      {diff}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          
          <div className="space-y-2">
            <Label htmlFor="tags">Tags</Label>
            <div className="flex gap-2 mb-2">
              <Input
                id="tags"
                value={tagInput}
                onChange={(e) => dispatch({ type: 'SET_TAG_INPUT', payload: e.target.value })}
                placeholder="Add a tag"
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                data-testid="input-tag"
              />
              <Button type="button" onClick={addTag} variant="outline" size="sm" data-testid="button-add-tag">
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => removeTag(tag)}>
                  {tag} ×
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Editor */}
      <Card>
        {/* Sticky Header & Toolbar */}
        <div className="sticky top-0 z-40 bg-card border-b">
          <CardHeader>
            <div className="flex items-center justify-between gap-4">
              <CardTitle>{title || 'Untitled Guide'}</CardTitle>
              <div className="flex items-center gap-3">
                {/* Collaboration Indicator */}
                <CollaborationIndicator state={collaborationState} />
                
                {/* Word Count */}
                {editor && (
                  <div className="text-sm text-muted-foreground">
                    {wordCount} words • {Math.max(1, Math.round(wordCount / 200))} min read
                  </div>
                )}
                {/* Quick Save Button */}
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => autosave.handleSave()}
                  disabled={autosave.saveStatus === 'saving'}
                  data-testid="button-quick-save"
                  className="gap-2"
                >
                  {autosave.saveStatus === 'saving' ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  Save
                </Button>
              </div>
            </div>
          </CardHeader>
          
          <EditorToolbar 
            editor={editor} 
            title={title}
            isFocusMode={isFocusMode}
            onFocusModeToggle={() => setIsFocusMode(!isFocusMode)}
            zoomLevel={zoomLevel}
            onZoomChange={setZoomLevel}
          />
        </div>
        
        <CardContent>
          <div className="border rounded-md focus-within:ring-2 focus-within:ring-ring">
            <div 
              style={{ 
                transform: `scale(${zoomLevel})`, 
                transformOrigin: 'top left' 
              }}
            >
              <EditorContent editor={editor} data-testid="editor-content" />
            </div>
          </div>
          <AIBubbleMenu editor={editor} />
        </CardContent>
      </Card>
    </div>
  );
});

GuideEditor.displayName = 'GuideEditor';

export default GuideEditor;