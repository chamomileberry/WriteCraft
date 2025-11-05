import { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import {
  useEditor,
  EditorContent,
  type Editor as TiptapEditor,
} from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import { ClickableMention } from "@/lib/clickableMention";
import { suggestion } from "@/lib/suggestion";
import CharacterCount from "@tiptap/extension-character-count";
import { TextStyle } from "@tiptap/extension-text-style";
import { Extension } from "@tiptap/core";
import { TextAlign } from "@tiptap/extension-text-align";
import { Color } from "@tiptap/extension-color";
import { Highlight } from "@tiptap/extension-highlight";
import { FontFamily } from "@tiptap/extension-font-family";
import { BulletList } from "@tiptap/extension-bullet-list";
import { OrderedList } from "@tiptap/extension-ordered-list";
import { ListItem } from "@tiptap/extension-list-item";
import { ImageResize } from "@/lib/image-resize-extension";
import { Table as TiptapTable } from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import HorizontalRule from "@tiptap/extension-horizontal-rule";
import Youtube from "@tiptap/extension-youtube";
import Focus from "@tiptap/extension-focus";
import Typography from "@tiptap/extension-typography";
import { createLowlight } from "lowlight";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EditorToolbar } from "@/components/ui/editor-toolbar";
import { Save, Loader2, Clock, AlertCircle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useAutosave } from "@/hooks/useAutosave";
import { useNotebookStore } from "@/stores/notebookStore";
import { getMappingById } from "@shared/contentTypes";
import AIBubbleMenu from "@/components/AIBubbleMenu";
import { AISuggestionsExtension } from "@/lib/ai-suggestions-plugin";

// Custom FontSize extension - same as GuideEditor
declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    fontSize: {
      setFontSize: (size: string) => ReturnType;
      unsetFontSize: () => ReturnType;
    };
  }
}

const FontSize = Extension.create({
  name: "fontSize",

  addOptions() {
    return {
      types: ["textStyle"],
    };
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          fontSize: {
            default: null,
            parseHTML: (element) =>
              element.style.fontSize.replace(/['"]+/g, ""),
            renderHTML: (attributes) => {
              if (!attributes.fontSize) {
                return {};
              }
              return {
                style: `font-size: ${attributes.fontSize}`,
              };
            },
          },
        },
      },
    ];
  },

  addCommands() {
    return {
      setFontSize:
        (fontSize) =>
        ({ chain }) => {
          return chain().setMark("textStyle", { fontSize: fontSize }).run();
        },
      unsetFontSize:
        () =>
        ({ chain }) => {
          return chain()
            .setMark("textStyle", { fontSize: null })
            .removeEmptyTextStyle()
            .run();
        },
    };
  },
});

// Custom Enter Key Handler - Google Docs style behavior
// Single Enter = hard break (<br>), Double Enter (on empty line) = new paragraph
const GoogleDocsEnter = Extension.create({
  name: "googleDocsEnter",

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
        if (node.type.name === "paragraph" && $from.depth === 1) {
          // Check if the paragraph is empty
          if (node.content.size === 0) {
            // Empty paragraph - create new paragraph (default behavior)
            return false;
          }

          // Check if cursor is immediately after a hard break
          const nodeBefore = $from.nodeBefore;
          if (nodeBefore && nodeBefore.type.name === "hardBreak") {
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

const ArticleEditor = forwardRef<ArticleEditorRef, ArticleEditorProps>(
  (
    {
      contentType,
      contentId,
      initialContent = "",
      title = "Article",
      onContentChange,
      onSave,
    },
    ref,
  ) => {
    const [wordCount, setWordCount] = useState(0);
    const { activeNotebookId } = useNotebookStore();

    // Focus Mode and Zoom state
    const [isFocusMode, setIsFocusMode] = useState(false);
    const [zoomLevel, setZoomLevel] = useState(1);

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
          // hardBreak is enabled by default - needed for Google Docs-style line breaks
        }),
        GoogleDocsEnter, // Custom Enter key handler for Google Docs-style behavior
        ClickableMention.configure({
          suggestion,
        }),
        CharacterCount,
        TextStyle,
        FontSize,
        TextAlign.configure({
          types: ["heading", "paragraph"],
        }),
        Color.configure({
          types: ["textStyle"],
        }),
        Highlight.configure({
          multicolor: true,
          HTMLAttributes: {
            class: "my-custom-highlight",
          },
        }),
        FontFamily.configure({
          types: ["textStyle"],
        }),
        BulletList.configure({
          HTMLAttributes: {
            class: "prose-ul",
          },
        }),
        OrderedList.configure({
          HTMLAttributes: {
            class: "prose-ol",
          },
        }),
        ListItem,
        Link.configure({
          openOnClick: false,
          HTMLAttributes: {
            class:
              "text-primary underline decoration-primary/30 hover:decoration-primary transition-colors",
          },
        }),
        ImageResize.configure({
          inline: false,
          allowBase64: true,
          HTMLAttributes: {
            class: "rounded-lg",
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
            class: "my-4 border-border",
          },
        }),
        Youtube.configure({
          controls: false,
          nocookie: true,
          HTMLAttributes: {
            class: "rounded-lg my-4",
          },
        }),
        Focus.configure({
          className: "has-focus",
          mode: "all",
        }),
        Typography,
        AISuggestionsExtension,
      ],
      content: initialContent,
      editorProps: {
        attributes: {
          class:
            "prose dark:prose-invert max-w-none focus:outline-none min-h-[400px] px-6 py-4 prose-headings:text-foreground prose-p:text-foreground prose-strong:text-foreground prose-ul:text-foreground prose-ol:text-foreground prose-li:text-foreground prose-blockquote:text-foreground/80",
          style: "font-size: 12pt;",
        },
      },
    });

    // Setup autosave hook
    const autosave = useAutosave({
      editor,
      saveDataFunction: () => {
        if (!editor) return "";
        return editor.getHTML();
      },
      mutationFunction: async (content: string) => {
        const url = `${apiBase}/${contentId}?notebookId=${activeNotebookId}`;
        const response = await apiRequest(url, "PATCH", {
          articleContent: content,
        });
        return response.json();
      },
      successMessage: "Your article has been saved successfully.",
      errorMessage: "Failed to save the article. Please try again.",
      invalidateQueries: [[apiBase, contentId, activeNotebookId]],
    });

    // Set up the onUpdate handler using useEffect to avoid circular dependency
    useEffect(() => {
      if (!editor) return;

      const handleUpdate = ({ editor }: { editor: TiptapEditor }) => {
        // Update word count
        const currentWordCount = editor.storage.characterCount.words();
        setWordCount(currentWordCount);

        // Call external change handler
        const content = editor.getHTML();
        onContentChange?.(content);

        // Trigger autosave using the hook
        autosave.setupAutosave();
      };

      editor.on("update", handleUpdate);

      return () => {
        editor.off("update", handleUpdate);
      };
    }, [editor, autosave, onContentChange]);

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

    const handleSave = async () => {
      if (!editor) return;

      await autosave.handleSave();
      const content = editor.getHTML();
      onSave?.(content);
    };

    // Expose save function via ref
    useImperativeHandle(ref, () => ({
      saveContent: handleSave,
    }));

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
                  {autosave.saveStatus === "saving" && (
                    <div className="flex items-center text-blue-600">
                      <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                      <span>Saving...</span>
                    </div>
                  )}
                  {autosave.saveStatus === "saved" && (
                    <div className="flex items-center text-green-600">
                      <Clock className="w-3 h-3 mr-1" />
                      <span>
                        Saved {autosave.formatSaveTime(autosave.lastSaveTime)}
                      </span>
                    </div>
                  )}
                  {autosave.saveStatus === "unsaved" && (
                    <div className="flex items-center text-orange-600">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      <span>Unsaved changes</span>
                    </div>
                  )}
                </div>

                <Button
                  onClick={handleSave}
                  disabled={
                    autosave.saveStatus === "saving" ||
                    autosave.saveStatus === "saved"
                  }
                  size="sm"
                  data-testid="button-save-article"
                >
                  {autosave.saveStatus === "saving" ? (
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
            <EditorToolbar
              editor={editor}
              title={title}
              isFocusMode={isFocusMode}
              onFocusModeToggle={() => setIsFocusMode(!isFocusMode)}
              zoomLevel={zoomLevel}
              onZoomChange={setZoomLevel}
            />

            {/* Editor Content */}
            <div className="border rounded-md focus-within:ring-2 focus-within:ring-ring mt-4">
              <div
                style={{
                  transform: `scale(${zoomLevel})`,
                  transformOrigin: "top left",
                }}
              >
                <EditorContent
                  editor={editor}
                  data-testid="article-editor-content"
                />
                <AIBubbleMenu editor={editor} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  },
);

ArticleEditor.displayName = "ArticleEditor";

export default ArticleEditor;
