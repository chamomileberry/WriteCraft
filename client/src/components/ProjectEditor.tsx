import { useState, useEffect, useCallback, forwardRef, useImperativeHandle, useRef } from 'react';
import { useEditor, EditorContent, Editor } from '@tiptap/react';
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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  ArrowLeft,
  Save,
  Loader2,
  Search,
  ExternalLink,
  Plus,
  Download,
  ImageIcon,
  Video,
  LinkIcon,
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useAutosave } from '@/hooks/useAutosave';
import { useWorkspaceStore, EditorActions } from '@/stores/workspaceStore';
import { WorkspaceLayout } from './workspace/WorkspaceLayout';
import { ProjectHeader } from './ProjectHeader';
import { EditorToolbar } from '@/components/ui/editor-toolbar';
import { nanoid } from 'nanoid';
import AIBubbleMenu from '@/components/AIBubbleMenu';
import { AISuggestionsExtension } from '@/lib/ai-suggestions-plugin';
import FileHandler from '@tiptap/extension-file-handler';

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

interface ProjectEditorProps {
  projectId: string;
  onBack: () => void;
}

interface SearchResult {
  id: string;
  title: string;
  type: string;
  subtitle?: string;
  description?: string;
}

export interface ProjectEditorRef {
  saveContent: () => Promise<void>;
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

const ProjectEditor = forwardRef<ProjectEditorRef, ProjectEditorProps>(({ projectId, onBack }, ref) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState('');
  
  // UI state managed with React instead of direct DOM manipulation
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(100);
  
  // Dialog states for better UX instead of prompts
  const [isInsertImageDialogOpen, setIsInsertImageDialogOpen] = useState(false);
  const [isInsertVideoDialogOpen, setIsInsertVideoDialogOpen] = useState(false);
  const [isInsertLinkDialogOpen, setIsInsertLinkDialogOpen] = useState(false);
  const [insertImageUrl, setInsertImageUrl] = useState('');
  const [insertVideoUrl, setInsertVideoUrl] = useState('');
  const [insertLinkUrl, setInsertLinkUrl] = useState('');
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { addPanel, isPanelOpen, focusPanel, updateEditorContext, clearEditorContext, registerEditorActions } = useWorkspaceStore();

  // Fetch project data
  const { data: project, isLoading: isLoadingProject } = useQuery({
    queryKey: ['/api/projects', projectId],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/projects/${projectId}`);
      return response.json();
    },
    enabled: !!projectId && projectId !== 'new',
  });

  // **REFINED**: Unified data fetching using useQuery instead of native fetch
  const { data: searchResults = [], isLoading: isSearching } = useQuery({
    queryKey: ['/api/search', searchQuery],
    queryFn: async () => {
      if (!searchQuery.trim()) return [];
      const response = await apiRequest('GET', `/api/search?q=${encodeURIComponent(searchQuery)}`);
      return response.json();
    },
    enabled: searchQuery.trim().length > 0,
  });

  // Initialize TipTap editor
  const lowlight = createLowlight();
  const autosaveRef = useRef<{ triggerAutosave: () => void } | null>(null);
  
  // Image upload handler
  const handleImageUpload = async (file: File): Promise<string> => {
    // Get presigned upload URL
    const uploadUrlResponse = await fetch('/api/upload/image', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!uploadUrlResponse.ok) {
      throw new Error('Failed to get upload URL');
    }

    const { uploadURL, objectPath } = await uploadUrlResponse.json();

    // Upload file to object storage
    const uploadResponse = await fetch(uploadURL, {
      method: 'PUT',
      body: file,
      headers: { 'Content-Type': file.type }
    });

    if (!uploadResponse.ok) {
      throw new Error('Upload failed');
    }

    // Finalize upload
    const finalizeResponse = await fetch('/api/upload/finalize', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ objectPath })
    });

    if (!finalizeResponse.ok) {
      throw new Error('Failed to finalize upload');
    }

    const { objectPath: finalPath } = await finalizeResponse.json();
    return finalPath;
  };
  
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
        suggestion,
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
      AISuggestionsExtension,
      FileHandler.configure({
        allowedMimeTypes: ['image/png', 'image/jpeg', 'image/gif', 'image/webp'],
        onDrop: async (currentEditor, files, pos) => {
          console.log('FileHandler onDrop called with files:', files);
          for (const file of files) {
            if (file.size > 5 * 1024 * 1024) {
              toast({
                title: 'Image too large',
                description: 'Image must be less than 5MB',
                variant: 'destructive'
              });
              continue;
            }

            try {
              console.log('Uploading file:', file.name);
              const url = await handleImageUpload(file);
              console.log('Upload successful, URL:', url);
              currentEditor
                .chain()
                .insertContentAt(pos, {
                  type: 'image',
                  attrs: {
                    src: url,
                  },
                })
                .focus()
                .run();
            } catch (error) {
              console.error('Image upload error:', error);
              toast({
                title: 'Failed to upload image',
                description: 'Could not upload image. Please try again.',
                variant: 'destructive'
              });
            }
          }
          return true;
        },
        onPaste: async (currentEditor, files, htmlContent) => {
          console.log('FileHandler onPaste called with files:', files, 'htmlContent:', htmlContent);
          
          // If there's HTML content with an image, let TipTap handle it
          if (htmlContent) {
            console.log('Has HTML content, returning false to let TipTap handle it');
            return false;
          }
          
          for (const file of files) {
            if (file.size > 5 * 1024 * 1024) {
              toast({
                title: 'Image too large',
                description: 'Image must be less than 5MB',
                variant: 'destructive'
              });
              continue;
            }

            try {
              console.log('Uploading pasted file:', file.name);
              const url = await handleImageUpload(file);
              console.log('Upload successful, URL:', url);
              currentEditor
                .chain()
                .insertContentAt(currentEditor.state.selection.anchor, {
                  type: 'image',
                  attrs: {
                    src: url,
                  },
                })
                .focus()
                .run();
            } catch (error) {
              console.error('Image upload error:', error);
              toast({
                title: 'Failed to upload image',
                description: 'Could not upload image. Please try again.',
                variant: 'destructive'
              });
            }
          }
          return true;
        },
      }),
    ],
    content: project?.content || '',
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
      // Update editor context for AI Writing Assistant (immediate, not debounced)
      const content = editor.getText();
      const htmlContent = editor.getHTML();
      updateEditorContext({
        content,
        htmlContent,
        title: project?.title || 'Untitled Project',
        type: 'project',
        entityId: projectId
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
      const response = await apiRequest('PUT', `/api/projects/${projectId}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects', projectId] });
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
    },
    debounceMs: 2000,
    successMessage: 'Project saved successfully',
    errorMessage: 'Failed to save project. Please try again.',
  });

  // Store autosave reference for use in editor onUpdate
  useEffect(() => {
    autosaveRef.current = autosave;
  }, [autosave]);

  // Title update mutation
  const titleMutation = useMutation({
    mutationFn: async (newTitle: string) => {
      const response = await apiRequest('PUT', `/api/projects/${projectId}`, { title: newTitle });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects', projectId] });
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
    },
  });


  // Initialize editor context when project data loads
  useEffect(() => {
    if (project && editor) {
      const content = editor.getText();
      const htmlContent = editor.getHTML();
      updateEditorContext({
        content,
        htmlContent,
        title: project.title || 'Untitled Project',
        type: 'project',
        entityId: projectId
      });
    }
  }, [project, editor, projectId, updateEditorContext]);

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
        }
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

  // Expose save function via ref
  useImperativeHandle(ref, () => ({
    saveContent: async () => {
      await autosave.handleSave();
    }
  }));

  const handleManualSave = () => {
    autosave.handleSave();
  };

  // Title editing handlers
  const handleTitleClick = () => {
    setTitleInput(project?.title || 'Untitled Project');
    setIsEditingTitle(true);
  };

  const handleTitleSave = async () => {
    if (titleInput.trim() !== project?.title) {
      await titleMutation.mutateAsync(titleInput.trim() || 'Untitled Project');
    }
    setIsEditingTitle(false);
  };

  const handleTitleCancel = () => {
    setTitleInput(project?.title || 'Untitled Project');
    setIsEditingTitle(false);
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleTitleSave();
    } else if (e.key === 'Escape') {
      handleTitleCancel();
    }
  };

  // Search and content interaction - use @ mentions instead
  const insertMention = (item: SearchResult) => {
    if (editor) {
      // Focus the editor and trigger mention suggestion
      editor.chain().focus().insertContent('@').run();
      // The mention system will handle the rest through the suggestion configuration
    }
  };

  const openInPanel = (item: SearchResult) => {
    const itemType = item.type;
    const itemId = item.id;
    const itemTitle = item.title;
    
    if (isPanelOpen(itemType === 'character' ? 'characterDetail' : itemType, itemId)) {
      focusPanel(itemId);
      return;
    }
    
    if (itemType === 'character') {
      addPanel({
        id: nanoid(),
        type: 'characterDetail',
        title: itemTitle || 'Character Details',
        entityId: itemId,
        mode: 'tabbed',
        regionId: 'main'
      });
    } else if (itemType === 'project') {
      // Navigate to project editor instead of opening as panel
      // Projects should not be opened as reference tabs
      window.open(`/projects/${itemId}/edit`, '_blank');
      return;
    } else {
      addPanel({
        id: nanoid(),
        type: 'notes',
        title: itemTitle || `${itemType} Details`,
        entityId: itemId,
        mode: 'tabbed',
        regionId: 'main'
      });
    }
  };

  // **REFINED**: Dialog handlers for better UX instead of prompt()
  const handleInsertImage = () => {
    if (insertImageUrl.trim()) {
      editor?.chain().focus().setImage({ src: insertImageUrl.trim() }).run();
      setInsertImageUrl('');
      setIsInsertImageDialogOpen(false);
    }
  };

  const handleInsertVideo = () => {
    if (insertVideoUrl.trim()) {
      editor?.commands.setYoutubeVideo({
        src: insertVideoUrl.trim(),
        width: 640,
        height: 480,
      });
      setInsertVideoUrl('');
      setIsInsertVideoDialogOpen(false);
    }
  };

  const handleInsertLink = () => {
    if (insertLinkUrl.trim()) {
      editor?.chain().focus().setLink({ href: insertLinkUrl.trim() }).run();
      setInsertLinkUrl('');
      setIsInsertLinkDialogOpen(false);
    }
  };

  // **REFINED**: Export functionality with DropdownMenu instead of prompt()
  const handleExport = (format: string) => {
    const content = editor?.getHTML() || '';
    const title = project?.title || 'Untitled';
    
    switch(format) {
      case 'html':
        const htmlFile = new Blob([content], { type: 'text/html' });
        const htmlLink = document.createElement('a');
        htmlLink.href = URL.createObjectURL(htmlFile);
        htmlLink.download = `${title}.html`;
        htmlLink.click();
        break;
        
      case 'pdf':
        toast({
          title: "PDF Export",
          description: "Opening print dialog. Select 'Save as PDF' from the destination dropdown.",
        });
        setTimeout(() => window.print(), 500);
        break;
        
      case 'docx':
        try {
          const textContent = editor?.getText() || '';
          const docxBlob = new Blob([`${title}\n\n${textContent}`], { 
            type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
          });
          const docxLink = document.createElement('a');
          docxLink.href = URL.createObjectURL(docxBlob);
          docxLink.download = `${title}.docx`;
          docxLink.click();
        } catch (error) {
          toast({
            title: "DOCX Export",
            description: "Feature in development. Using text export for now.",
            variant: "destructive"
          });
          const textBlob = new Blob([editor?.getText() || ''], { type: 'text/plain' });
          const textLink = document.createElement('a');
          textLink.href = URL.createObjectURL(textBlob);
          textLink.download = `${title}.txt`;
          textLink.click();
        }
        break;
    }
  };

  if (isLoadingProject) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <WorkspaceLayout>
      <div className="flex h-full bg-background flex-col">
        {/* Navigation Header with Back button and Project Title */}
        <div className="border-b bg-background/95 backdrop-blur flex-shrink-0">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={onBack} data-testid="button-back-to-projects">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Projects
              </Button>
              <div className="h-4 w-px bg-border" />
              <h1 className="text-lg font-semibold">
                {project?.title || 'Untitled Project'}
              </h1>
            </div>
          </div>
        </div>

        {/* Header */}
        <ProjectHeader
          project={project}
          wordCount={editor?.storage.characterCount?.words() || 0}
          saveStatus={autosave.saveStatus}
          lastSaveTime={autosave.lastSaveTime}
          isEditingTitle={isEditingTitle}
          titleInput={titleInput}
          onBack={onBack}
          onTitleClick={handleTitleClick}
          onTitleChange={setTitleInput}
          onTitleSave={handleTitleSave}
          onTitleCancel={handleTitleCancel}
          onTitleKeyDown={handleTitleKeyDown}
          onManualSave={handleManualSave}
          isSaving={autosave.isSaving}
        />

        {/* Editor Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* **REFINED**: Toolbar with clean state management */}
          <div className={`border-b bg-background/95 backdrop-blur transition-all duration-200 ${isFocusMode ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
            <div className="flex items-center justify-between gap-2 p-4">
              {/* Left side - Editor Toolbar */}
              <div className="flex-1">
                <EditorToolbar editor={editor} title={project?.title} />
              </div>
              
              {/* Media insertion with dialogs */}
              <div className="flex items-center gap-2">
                <Dialog open={isInsertImageDialogOpen} onOpenChange={setIsInsertImageDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" title="Insert Image">
                      <ImageIcon className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Insert Image</DialogTitle>
                      <DialogDescription>
                        Enter the URL of the image you want to insert.
                      </DialogDescription>
                    </DialogHeader>
                    <Input
                      value={insertImageUrl}
                      onChange={(e) => setInsertImageUrl(e.target.value)}
                      placeholder="https://example.com/image.jpg"
                      onKeyDown={(e) => e.key === 'Enter' && handleInsertImage()}
                    />
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsInsertImageDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleInsertImage} disabled={!insertImageUrl.trim()}>
                        Insert
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <Dialog open={isInsertVideoDialogOpen} onOpenChange={setIsInsertVideoDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" title="Insert Video">
                      <Video className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Insert Video</DialogTitle>
                      <DialogDescription>
                        Enter the YouTube URL of the video you want to insert.
                      </DialogDescription>
                    </DialogHeader>
                    <Input
                      value={insertVideoUrl}
                      onChange={(e) => setInsertVideoUrl(e.target.value)}
                      placeholder="https://www.youtube.com/watch?v=..."
                      onKeyDown={(e) => e.key === 'Enter' && handleInsertVideo()}
                    />
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsInsertVideoDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleInsertVideo} disabled={!insertVideoUrl.trim()}>
                        Insert
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <Dialog open={isInsertLinkDialogOpen} onOpenChange={setIsInsertLinkDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" title="Insert Link">
                      <LinkIcon className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Insert Link</DialogTitle>
                      <DialogDescription>
                        Enter the URL you want to link to.
                      </DialogDescription>
                    </DialogHeader>
                    <Input
                      value={insertLinkUrl}
                      onChange={(e) => setInsertLinkUrl(e.target.value)}
                      placeholder="https://example.com"
                      onKeyDown={(e) => e.key === 'Enter' && handleInsertLink()}
                    />
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsInsertLinkDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleInsertLink} disabled={!insertLinkUrl.trim()}>
                        Insert
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                {/* Export Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" title="Export">
                      <Download className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => handleExport('html')}>
                      Export as HTML
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleExport('pdf')}>
                      Export as PDF
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleExport('docx')}>
                      Export as DOCX
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>

          {/* **REFINED**: Main editor area with focus mode support */}
          <div className="flex-1 overflow-auto">
            <EditorContent editor={editor} />
            <AIBubbleMenu editor={editor} />
          </div>
        </div>
      </div>
    </WorkspaceLayout>
  );
});

ProjectEditor.displayName = 'ProjectEditor';

export default ProjectEditor;