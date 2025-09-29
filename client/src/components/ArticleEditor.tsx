import { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EditorToolbar } from '@/components/ui/editor-toolbar';
import { 
  Save,
  Loader2,
  Clock,
} from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useNotebookStore } from '@/stores/notebookStore';
import { getMappingById } from '@shared/contentTypes';

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

export interface ArticleEditorRef {
  saveContent: () => Promise<void>;
}

interface ArticleEditorProps {
  contentType: string;
  contentId: string;
  initialContent?: string;
  title?: string;
  onContentChange?: (content: string) => void;
  onSave?: (content: string) => void;
}

const ArticleEditor = forwardRef<ArticleEditorRef, ArticleEditorProps>(({ 
  contentType, 
  contentId, 
  initialContent = '',
  title = 'Article',
  onContentChange,
  onSave
}, ref) => {
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');
  const [lastSaveTime, setLastSaveTime] = useState<Date | null>(null);
  const [wordCount, setWordCount] = useState(0);
  const [isManualSave, setIsManualSave] = useState(false);
  const autosaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();
  const { activeNotebookId } = useNotebookStore();
  
  // Get the correct API base for consistent cache keys with ContentEditor
  const mapping = getMappingById(contentType);
  const apiBase = mapping?.apiBase || `/api/${contentType}`;

  // Initialize TipTap editor - same configuration as GuideEditor
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
    ],
    content: initialContent,
    editorProps: {
      attributes: {
        class: 'prose dark:prose-invert prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[400px] p-4 prose-headings:text-foreground prose-p:text-foreground prose-strong:text-foreground prose-ul:text-foreground prose-ol:text-foreground prose-li:text-foreground prose-blockquote:text-foreground/80',
        style: 'font-size: 12pt;',
      },
    },
    onUpdate: ({ editor }) => {
      setSaveStatus('unsaved');
      
      // Update word count
      const currentWordCount = editor.storage.characterCount.words();
      setWordCount(currentWordCount);
      
      // Call external change handler
      const content = editor.getHTML();
      onContentChange?.(content);
      
      // Debounced autosave
      if (autosaveTimeoutRef.current) {
        clearTimeout(autosaveTimeoutRef.current);
      }
      
      autosaveTimeoutRef.current = setTimeout(() => {
        handleAutoSave();
      }, 2000);
    },
  });

  // Set initial content when editor is ready
  useEffect(() => {
    if (editor && initialContent && editor.getHTML() !== initialContent) {
      editor.commands.setContent(initialContent);
      setWordCount(editor.storage.characterCount.words());
    }
  }, [editor, initialContent]);

  // Update word count when editor is first created
  useEffect(() => {
    if (editor) {
      setWordCount(editor.storage.characterCount.words());
    }
  }, [editor]);

  // Save mutation for updating articleContent
  const saveMutation = useMutation({
    mutationFn: async (content: string) => {
      const url = `${apiBase}/${contentId}?notebookId=${activeNotebookId}`;
      const response = await apiRequest('PUT', url, { 
        articleContent: content 
      });
      return response.json();
    },
    onSuccess: () => {
      setSaveStatus('saved');
      setLastSaveTime(new Date());
      // Invalidate the content cache using the same key as ContentEditor
      queryClient.invalidateQueries({ 
        queryKey: [apiBase, contentId, activeNotebookId] 
      });
      
      // Only show toast for manual saves, not autosaves
      if (isManualSave) {
        toast({
          title: 'Article saved',
          description: 'Your article has been saved successfully.',
        });
        setIsManualSave(false); // Reset the flag
      }
    },
    onError: (error: any) => {
      console.error('Error saving article:', error);
      setSaveStatus('unsaved');
      
      // Show error toast for both manual and auto saves since errors need user attention
      toast({
        title: 'Error saving article',
        description: 'Failed to save the article. Please try again.',
        variant: 'destructive',
      });
      
      if (isManualSave) {
        setIsManualSave(false); // Reset the flag
      }
    },
  });

  const handleSave = async () => {
    if (!editor) return;
    
    setIsManualSave(true); // Mark this as a manual save
    setSaveStatus('saving');
    const content = editor.getHTML();
    await saveMutation.mutateAsync(content);
    onSave?.(content);
  };

  const handleAutoSave = async () => {
    if (!editor || saveStatus === 'saving') return;
    
    // Don't set isManualSave for autosaves (keeps it false)
    const content = editor.getHTML();
    await saveMutation.mutateAsync(content);
  };

  // Expose save function via ref
  useImperativeHandle(ref, () => ({
    saveContent: handleSave,
  }));

  // Format save time
  const formatSaveTime = (date: Date | null) => {
    if (!date) return '';
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!editor) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="ml-2">Loading editor...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">{title}</CardTitle>
            <div className="flex items-center space-x-2">
              <div className="flex items-center text-sm text-muted-foreground">
                <span>{wordCount} words</span>
              </div>
              
              {/* Save Status */}
              <div className="flex items-center text-sm">
                {saveStatus === 'saving' && (
                  <div className="flex items-center text-blue-600">
                    <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                    <span>Saving...</span>
                  </div>
                )}
                {saveStatus === 'saved' && (
                  <div className="flex items-center text-green-600">
                    <Clock className="w-3 h-3 mr-1" />
                    <span>Saved {formatSaveTime(lastSaveTime)}</span>
                  </div>
                )}
                {saveStatus === 'unsaved' && (
                  <span className="text-orange-600">Unsaved changes</span>
                )}
              </div>
              
              <Button 
                onClick={handleSave}
                disabled={saveStatus === 'saving' || saveStatus === 'saved'}
                size="sm"
                data-testid="button-save-article"
              >
                {saveStatus === 'saving' ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Save
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {/* Editor Toolbar */}
          <EditorToolbar editor={editor} title={title} />
          
          {/* Editor Content */}
          <div className="border rounded-md focus-within:ring-2 focus-within:ring-ring mt-4">
            <EditorContent editor={editor} data-testid="article-editor-content" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

ArticleEditor.displayName = 'ArticleEditor';

export default ArticleEditor;