import { useState, useEffect, useCallback } from 'react';
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
import { EditorToolbar } from '@/components/ui/editor-toolbar';
import { 
  Save,
  ArrowLeft,
  Loader2,
} from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useAutosave } from '@/hooks/useAutosave';
import { useToast } from '@/hooks/use-toast';

interface NoteEditorProps {
  noteId: string;
  onBack: () => void;
}

// Custom FontSize extension
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

export default function NoteEditor({ noteId, onBack }: NoteEditorProps) {
  const [title, setTitle] = useState('');
  const [hasBeenSavedOnce, setHasBeenSavedOnce] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch note data
  const { data: note, isLoading } = useQuery({
    queryKey: ['/api/notes', noteId],
    queryFn: () => fetch(`/api/notes/${noteId}`).then(res => res.json()),
    enabled: !!noteId,
  });

  // Initialize lowlight for code highlighting
  const lowlight = createLowlight();

  // Initialize TipTap editor
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4, 5, 6],
        },
        codeBlock: false, // Disable default code block
        // hardBreak is enabled by default - needed for Google Docs-style line breaks
      }),
      GoogleDocsEnter, // Custom Enter key handler for Google Docs-style behavior
      TextStyle,
      FontSize,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary underline cursor-pointer',
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
        alignments: ['left', 'center', 'right', 'justify'],
      }),
      Color,
      Highlight.configure({ multicolor: true }),
      FontFamily,
      BulletList.configure({
        keepMarks: true,
        keepAttributes: false,
      }),
      OrderedList.configure({
        keepMarks: true,
        keepAttributes: false,
      }),
      ListItem,
      ImageResize.configure({
        inline: false,
        allowBase64: true,
        HTMLAttributes: {
          class: 'rounded-lg',
        },
      }),
      TiptapTable.configure({
        resizable: true,
        HTMLAttributes: {
          class: 'border-collapse table-auto w-full',
        },
      }),
      TableRow,
      TableHeader.configure({
        HTMLAttributes: {
          class: 'border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800 font-semibold p-2',
        },
      }),
      TableCell.configure({
        HTMLAttributes: {
          class: 'border border-gray-300 dark:border-gray-600 p-2',
        },
      }),
      CodeBlockLowlight.configure({
        lowlight,
      }),
      HorizontalRule,
      Youtube.configure({
        controls: false,
        nocookie: true,
      }),
      Focus.configure({
        className: 'focus-ring',
        mode: 'all',
      }),
      Typography,
      CharacterCount,
    ],
    content: '',
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none dark:prose-invert max-w-none min-h-[500px] p-8',
      },
    },
  });

  // Load note data when fetched
  useEffect(() => {
    if (note && editor) {
      setTitle(note.title || '');
      editor.commands.setContent(note.content || '');
      setHasBeenSavedOnce(true);
    }
  }, [note, editor]);

  // Save data function for autosave (wrapped in useCallback to capture latest title)
  const saveDataFunction = useCallback(() => {
    if (!editor) return null;
    return {
      title,
      content: editor.getHTML(),
    };
  }, [editor, title]);

  // Mutation function for autosave
  const mutationFunction = useCallback(async (data: { title: string; content: string }) => {
    return await apiRequest('PUT', `/api/notes/${noteId}`, data);
  }, [noteId]);

  // Set up autosave
  const { handleSave, isSaving: isAutoSaving, setupAutosave } = useAutosave({
    editor,
    saveDataFunction,
    mutationFunction,
    autoSaveCondition: () => hasBeenSavedOnce,
    successMessage: 'Scene saved successfully',
    errorMessage: 'Failed to save scene. Please try again.',
    invalidateQueries: note?.userId ? [['/api/notes', note.userId, note.type]] : [],
  });

  // Connect editor update to autosave
  useEffect(() => {
    if (editor && hasBeenSavedOnce) {
      editor.on('update', setupAutosave);
      return () => {
        editor.off('update', setupAutosave);
      };
    }
  }, [editor, setupAutosave, hasBeenSavedOnce]);

  // Trigger autosave when title changes
  useEffect(() => {
    if (hasBeenSavedOnce && title !== note?.title) {
      setupAutosave();
    }
  }, [title, hasBeenSavedOnce, setupAutosave, note?.title]);

  // Manual save function
  const saveContent = async () => {
    await handleSave();
    setHasBeenSavedOnce(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const wordCount = editor?.storage.characterCount.words() || 0;

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Button variant="ghost" onClick={onBack} data-testid="button-back">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <div className="flex items-center gap-4">
          <div className="text-sm text-muted-foreground">
            {wordCount} words
          </div>
          <Button 
            onClick={saveContent} 
            disabled={isAutoSaving || !editor}
            data-testid="button-save"
          >
            {isAutoSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Title Input */}
      <div className="mb-6">
        <Input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Scene title..."
          className="text-3xl font-serif font-bold border-0 focus-visible:ring-0 px-0"
          data-testid="input-title"
        />
      </div>

      {/* Editor Toolbar */}
      {editor && (
        <div className="mb-4">
          <EditorToolbar editor={editor} />
        </div>
      )}

      {/* Rich Text Editor */}
      <div className="border rounded-lg min-h-[500px]" data-testid="editor-content">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
