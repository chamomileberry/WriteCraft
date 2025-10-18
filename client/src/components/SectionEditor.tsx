import { useState, useEffect, useCallback, useRef, forwardRef, useImperativeHandle } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import { Extension } from '@tiptap/core';
import { NodeSelection } from '@tiptap/pm/state';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import { ClickableMention } from '@/lib/clickableMention';
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
import { useAutosave } from '@/hooks/useAutosave';
import { useWorkspaceStore, EditorActions } from '@/stores/workspaceStore';
import { EditorToolbar } from '@/components/ui/editor-toolbar';
import type { ProjectSection } from '@shared/schema';
import AIBubbleMenu from '@/components/AIBubbleMenu';
import { AISuggestionsExtension } from '@/lib/ai-suggestions-plugin';

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
  readOnly?: boolean;
}

export const SectionEditor = forwardRef<{ saveContent: () => Promise<void> }, SectionEditorProps>(
  ({ projectId, section, onContentChange, onSaveStatusChange, onLastSaveTimeChange, onWordCountChange, readOnly = false }, ref) => {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const { updateEditorContext, clearEditorContext, registerEditorActions } = useWorkspaceStore();

    const lowlight = createLowlight();

    // Create ref for autosave
    const autosaveRef = useRef<{ triggerAutosave: () => void } | null>(null);

    // Initialize TipTap editor
    const editor = useEditor({
      editable: !readOnly,
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
        ClickableMention.configure({
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
        AISuggestionsExtension,
      ],
      content: section?.content || '',
      editorProps: {
        attributes: {
          class: 'prose dark:prose-invert max-w-none focus:outline-none min-h-[500px] px-6 py-4 prose-headings:text-foreground prose-p:text-foreground prose-strong:text-foreground prose-ul:text-foreground prose-ol:text-foreground prose-li:text-foreground prose-blockquote:text-foreground/80',
        },
        handleKeyDown: (view, event) => {
          if (event.key === 'Tab') {
            event.preventDefault();
            const { state, dispatch } = view;
            const { from, to } = state.selection;
            
            if (event.shiftKey) {
              // Shift+Tab: Remove indent (remove up to 2 spaces at start of line)
              const line = state.doc.textBetween(from, to);
              const beforeCursor = state.doc.textBetween(Math.max(0, from - 20), from);
              const lineStart = beforeCursor.lastIndexOf('\n') + 1;
              const actualLineStart = from - (beforeCursor.length - lineStart);
              
              if (actualLineStart >= 0) {
                const lineContent = state.doc.textBetween(actualLineStart, from);
                if (lineContent.startsWith('  ')) {
                  const tr = state.tr.delete(actualLineStart, actualLineStart + 2);
                  dispatch(tr);
                  return true;
                }
              }
            } else {
              // Tab: Add indent (2 spaces)
              const tr = state.tr.insertText('  ', from, to);
              dispatch(tr);
              return true;
            }
          }
          return false;
        },
      },
      onUpdate: ({ editor }) => {
        // Signal unsaved changes immediately (before debounced save)
        onSaveStatusChange?.('unsaved');
        onContentChange?.(true);
        
        // Update word count (immediate)
        const words = editor.storage.characterCount?.words() || 0;
        onWordCountChange?.(words);
        
        // Update editor context for AI (immediate, not debounced)
        updateEditorContext({
          content: editor.getText(),
          htmlContent: editor.getHTML(),
          title: section.title,
          type: 'section',
          entityId: section.id
        });
        
        // Trigger autosave with debouncing (handled by useAutosave hook)
        autosaveRef.current?.triggerAutosave();
      },
    });

    // Set up autosave hook for content
    const autosave = useAutosave({
      editor,
      saveDataFunction: () => {
        if (!editor) return null;
        return {
          content: editor.getHTML(),
          wordCount: editor.storage.characterCount?.words() || 0,
        };
      },
      mutationFunction: async (data) => {
        const response = await apiRequest('PUT', `/api/projects/${projectId}/sections/${section.id}`, { 
          content: data.content 
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
      },
      debounceMs: 2000,
      successMessage: 'Section saved successfully',
      errorMessage: 'Failed to save section. Please try again.',
    });

    // Store autosave reference for use in editor onUpdate
    useEffect(() => {
      autosaveRef.current = autosave;
    }, [autosave]);

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

    // Expose save via ref
    useImperativeHandle(ref, () => ({
      saveContent: async () => {
        await autosave.handleSave();
      },
    }));

    if (!editor) {
      return null;
    }

    return (
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Read-Only Banner */}
        {readOnly && (
          <div className="bg-muted/50 border-b px-4 py-2 text-sm text-muted-foreground" data-testid="banner-readonly">
            <span>This project is shared with you as read-only. You cannot make edits.</span>
          </div>
        )}

        {/* Toolbar */}
        {!readOnly && (
          <div className="border-b bg-muted/20 p-2">
            <EditorToolbar editor={editor} title={section.title} />
          </div>
        )}

        {/* Editor */}
        <div className="flex-1 overflow-auto">
          <EditorContent editor={editor} data-testid="editor-content" />
          {!readOnly && <AIBubbleMenu editor={editor} />}
        </div>
      </div>
    );
  }
);

SectionEditor.displayName = 'SectionEditor';
