import { useState, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import { Extension } from '@tiptap/core';
import { NodeSelection } from '@tiptap/pm/state';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Mention from '@tiptap/extension-mention';
import { suggestion } from '@/lib/suggestion';
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
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { EditorToolbar } from '@/components/ui/editor-toolbar';
import type { ProjectSection } from '@shared/schema';

// Custom HorizontalRule extension with proper backspace handling
const CustomHorizontalRule = HorizontalRule.extend({
  addKeyboardShortcuts() {
    return {
      'Backspace': () => {
        const { state, dispatch } = this.editor.view;
        const { selection } = state;
        
        if (selection instanceof NodeSelection && selection.node.type.name === 'horizontalRule') {
          const tr = state.tr.deleteSelection();
          dispatch(tr);
          return true;
        }
        
        if (selection.empty && selection.$from.pos > 0) {
          const $pos = selection.$from;
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
        
        if ($from.pos < state.doc.content.size) {
          const nodeAtPos = state.doc.nodeAt($from.pos);
          if (nodeAtPos?.type.name === 'horizontalRule') {
            const tr = state.tr.delete($from.pos, $from.pos + nodeAtPos.nodeSize);
            dispatch(tr);
            return true;
          }
        }
        
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
            parseHTML: element => element.style.fontSize.replace(/['"+]/g, ''),
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
      setFontSize: (fontSize: string) => ({ chain }) => {
        return chain()
          .setMark('textStyle', { fontSize })
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

interface SectionEditorProps {
  projectId: string;
  section: ProjectSection;
  onContentChange?: (hasChanges: boolean) => void;
  onSaveStatusChange?: (status: 'saved' | 'saving' | 'unsaved') => void;
  onLastSaveTimeChange?: (time: Date | null) => void;
  onWordCountChange?: (count: number) => void;
}

export interface SectionEditorRef {
  saveContent: () => Promise<void>;
}

export const SectionEditor = forwardRef<SectionEditorRef, SectionEditorProps>(
  ({ projectId, section, onContentChange, onSaveStatusChange, onLastSaveTimeChange, onWordCountChange }, ref) => {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [pendingSave, setPendingSave] = useState<NodeJS.Timeout | null>(null);
    const lowlight = createLowlight();

    const updateMutation = useMutation({
      mutationFn: async (content: string) => {
        const response = await apiRequest('PUT', `/api/projects/${projectId}/sections/${section.id}`, {
          content,
        });
        return response.json();
      },
      onMutate: () => {
        onSaveStatusChange?.('saving');
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['/api/projects', projectId, 'sections'] });
        onSaveStatusChange?.('saved');
        onLastSaveTimeChange?.(new Date());
        onContentChange?.(false);
      },
      onError: (error) => {
        onSaveStatusChange?.('unsaved');
        toast({
          title: 'Error',
          description: 'Failed to save section content.',
          variant: 'destructive',
        });
      },
    });

    const editor = useEditor({
      extensions: [
        StarterKit.configure({
          horizontalRule: false,
          bulletList: false,
          orderedList: false,
          listItem: false,
        }),
        CustomHorizontalRule,
        Link.configure({
          openOnClick: false,
          HTMLAttributes: {
            class: 'text-primary underline cursor-pointer',
          },
        }),
        Mention.configure({
          HTMLAttributes: {
            class: 'mention bg-accent text-accent-foreground px-1 py-0.5 rounded',
          },
          suggestion,
        }),
        CharacterCount,
        TextAlign.configure({
          types: ['heading', 'paragraph'],
        }),
        TextStyle,
        Color,
        Highlight.configure({
          multicolor: true,
        }),
        FontFamily,
        FontSize,
        BulletList,
        OrderedList,
        ListItem,
        Image.configure({
          HTMLAttributes: {
            class: 'max-w-full h-auto rounded-lg',
          },
        }),
        TiptapTable.configure({
          resizable: true,
          HTMLAttributes: {
            class: 'border-collapse table-auto w-full my-4',
          },
        }),
        TableRow,
        TableHeader.configure({
          HTMLAttributes: {
            class: 'border border-border bg-muted font-bold p-2',
          },
        }),
        TableCell.configure({
          HTMLAttributes: {
            class: 'border border-border p-2',
          },
        }),
        CodeBlockLowlight.configure({
          lowlight,
          HTMLAttributes: {
            class: 'bg-muted p-4 rounded-md my-2 overflow-x-auto',
          },
        }),
        Youtube.configure({
          width: 640,
          height: 360,
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
      content: section.content || '',
      editorProps: {
        attributes: {
          class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[500px] p-8',
        },
      },
      onUpdate: ({ editor }) => {
        // Mark as unsaved and trigger auto-save
        onContentChange?.(true);
        onSaveStatusChange?.('unsaved');
        
        // Update word count
        const words = editor.storage.characterCount.words();
        onWordCountChange?.(words);
        
        // Debounced auto-save
        if (pendingSave) {
          clearTimeout(pendingSave);
        }
        
        const timeout = setTimeout(() => {
          const content = editor.getHTML();
          updateMutation.mutate(content);
        }, 1000);
        
        setPendingSave(timeout);
      },
    });

    // Update editor content when section changes
    useEffect(() => {
      if (editor && section.content !== editor.getHTML()) {
        editor.commands.setContent(section.content || '');
        // Update word count on section change
        const words = editor.storage.characterCount.words();
        onWordCountChange?.(words);
      }
    }, [section.id, section.content, editor, onWordCountChange]);

    // Expose saveContent method via ref
    useImperativeHandle(ref, () => ({
      saveContent: async () => {
        if (editor) {
          const content = editor.getHTML();
          await updateMutation.mutateAsync(content);
        }
      },
    }));

    // Cleanup pending save on unmount
    useEffect(() => {
      return () => {
        if (pendingSave) {
          clearTimeout(pendingSave);
        }
      };
    }, [pendingSave]);

    if (!editor) {
      return null;
    }

    return (
      <div className="flex flex-col h-full">
        <EditorToolbar 
          editor={editor} 
          title={section.title}
        />
        
        <div className="flex-1 overflow-y-auto">
          <EditorContent 
            editor={editor} 
            data-testid="editor-content"
          />
        </div>
      </div>
    );
  }
);

SectionEditor.displayName = 'SectionEditor';
