import { useState, useEffect, useCallback, useRef, forwardRef, useImperativeHandle } from 'react';
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
import { useWorkspaceStore, EditorActions } from '@/stores/workspaceStore';
import { EditorToolbar } from '@/components/ui/editor-toolbar';
import type { ProjectSection } from '@shared/schema';

// Custom HorizontalRule extension
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

interface SectionEditorProps {
  projectId: string;
  section: ProjectSection;
  onContentChange?: (hasChanges: boolean) => void;
  onSaveStatusChange?: (status: 'saved' | 'saving' | 'unsaved') => void;
  onLastSaveTimeChange?: (time: Date) => void;
  onWordCountChange?: (count: number) => void;
}

export const SectionEditor = forwardRef<{ saveContent: () => Promise<void> }, SectionEditorProps>(
  ({ projectId, section, onContentChange, onSaveStatusChange, onLastSaveTimeChange, onWordCountChange }, ref) => {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const autosaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const { updateEditorContext, clearEditorContext, registerEditorActions } = useWorkspaceStore();

    const lowlight = createLowlight();

    // Save mutation
    const saveMutation = useMutation({
      mutationFn: async (content: string) => {
        const response = await apiRequest('PUT', `/api/projects/${projectId}/sections/${section.id}`, { 
          content 
        });
        return response.json();
      },
      onSuccess: () => {
        onSaveStatusChange?.('saved');
        onLastSaveTimeChange?.(new Date());
        onContentChange?.(false);
        queryClient.invalidateQueries({ queryKey: ['/api/projects', projectId, 'sections', section.id] });
      },
      onError: (error: any) => {
        onSaveStatusChange?.('unsaved');
        toast({
          title: "Save failed",
          description: error.message || "Failed to save section. Please try again.",
          variant: "destructive"
        });
      },
    });

    // Initialize TipTap editor
    const editor = useEditor({
      extensions: [
        StarterKit.configure({
          bulletList: false,
          orderedList: false,
          listItem: false,
          link: false,
          codeBlock: false,
          horizontalRule: false,
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
        }),
        FontFamily.configure({
          types: ['textStyle'],
        }),
        BulletList,
        OrderedList,
        ListItem,
        Link.configure({
          openOnClick: false,
        }),
        Mention.configure({
          suggestion,
        }),
        Image,
        TiptapTable.configure({
          resizable: true,
        }),
        TableRow,
        TableHeader,
        TableCell,
        CodeBlockLowlight.configure({
          lowlight,
        }),
        CustomHorizontalRule,
        Youtube.configure({
          controls: false,
          nocookie: true,
        }),
        Focus.configure({
          className: 'has-focus',
          mode: 'all',
        }),
        Typography,
      ],
      content: section?.content || '',
      editorProps: {
        attributes: {
          class: 'prose dark:prose-invert max-w-none focus:outline-none min-h-[500px] px-6 py-4 prose-headings:text-foreground prose-p:text-foreground prose-strong:text-foreground prose-ul:text-foreground prose-ol:text-foreground prose-li:text-foreground prose-blockquote:text-foreground/80',
        },
      },
      onUpdate: ({ editor }) => {
        onSaveStatusChange?.('unsaved');
        onContentChange?.(true);
        
        // Update word count
        const words = editor.storage.characterCount?.words() || 0;
        onWordCountChange?.(words);
        
        // Update editor context for AI
        updateEditorContext({
          content: editor.getText(),
          htmlContent: editor.getHTML(),
          title: section.title,
          type: 'section',
          entityId: section.id
        });
        
        // Auto-save after 2 seconds
        if (autosaveTimeoutRef.current) {
          clearTimeout(autosaveTimeoutRef.current);
        }
        
        autosaveTimeoutRef.current = setTimeout(() => {
          saveContent();
        }, 2000);
      },
    });

    // Update editor content when section changes
    useEffect(() => {
      if (editor && section) {
        editor.commands.setContent(section.content || '');
        
        // Update word count immediately
        const words = editor.storage.characterCount?.words() || 0;
        onWordCountChange?.(words);
      }
    }, [section?.id, editor]);

    // Register editor actions
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
          }
        };
        
        registerEditorActions(editorActions);
      }
    }, [editor, registerEditorActions]);

    // Clear context on unmount
    useEffect(() => {
      return () => {
        clearEditorContext();
      };
    }, [clearEditorContext]);

    // Save content function
    const saveContent = useCallback(async () => {
      if (editor) {
        onSaveStatusChange?.('saving');
        const content = editor.getHTML();
        await saveMutation.mutateAsync(content);
      }
    }, [editor, saveMutation, onSaveStatusChange]);

    // Expose save via ref
    useImperativeHandle(ref, () => ({
      saveContent,
    }));

    if (!editor) {
      return null;
    }

    return (
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Toolbar */}
        <div className="border-b bg-muted/20 p-2">
          <EditorToolbar editor={editor} title={section.title} />
        </div>

        {/* Editor */}
        <div className="flex-1 overflow-auto">
          <EditorContent editor={editor} data-testid="editor-content" />
        </div>
      </div>
    );
  }
);

SectionEditor.displayName = 'SectionEditor';
