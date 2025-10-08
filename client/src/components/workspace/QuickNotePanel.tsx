import { useState, useRef, useEffect, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useNotebookStore } from '@/stores/notebookStore';
import { useWorkspaceStore } from '@/stores/workspaceStore';
import { useAutosave } from '@/hooks/useAutosave';
import { useDebouncedSave } from '@/hooks/useDebouncedSave';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Save, BookmarkPlus, ListChecks, FilePlus } from 'lucide-react';
import QuickNoteBubbleMenu from './QuickNoteBubbleMenu';

interface QuickNotePanelProps {
  panelId: string;
  className?: string;
  onRegisterSaveFunction?: (fn: () => Promise<{ content: string; id: string }>) => void;
  onRegisterClearFunction?: (fn: () => void) => void;
}

export default function QuickNotePanel({ panelId, className, onRegisterSaveFunction, onRegisterClearFunction }: QuickNotePanelProps) {
  const [hasBeenSavedOnce, setHasBeenSavedOnce] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { activeNotebookId } = useNotebookStore();
  const { currentLayout, updatePanel } = useWorkspaceStore();

  // Get the panel title from workspace store
  const panel = currentLayout.panels.find(p => p.id === panelId);
  const noteTitle = panel?.title || 'Quick Note';

  // Using guest user for consistency with other components in this demo app
  const userId = 'guest'; 

  // Fetch existing quick note
  const { data: quickNote, isLoading } = useQuery({
    queryKey: ['/api/quick-note', userId],
    queryFn: async () => {
      const response = await fetch(`/api/quick-note?userId=${userId}`, {
        credentials: 'include'
      });
      if (response.status === 404) {
        return null; // No quick note exists yet
      }
      if (!response.ok) throw new Error('Failed to fetch quick note');
      return response.json();
    },
  });

  // Initialize TipTap editor with minimal extensions
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false, // Disable headings for quick notes
        codeBlock: false, // Disable code blocks
        blockquote: false, // Disable blockquotes
        horizontalRule: false, // Disable horizontal rules
      }),
      Underline,
      TaskList,
      TaskItem.configure({
        nested: true,
        HTMLAttributes: {
          class: 'task-item',
        },
      }),
    ],
    content: '',
    editorProps: {
      attributes: {
        class: 'prose prose-sm focus:outline-none max-w-none min-h-[200px] p-4 quick-note-prose',
        style: 'color: rgb(88, 28, 135); font-family: Arial, Helvetica, sans-serif; font-size: 0.95rem; line-height: 1.6;',
      },
    },
  });

  // Load quick note data ONLY on initial load to prevent cursor jumping
  useEffect(() => {
    if (isInitialLoad && quickNote && editor && !editor.isDestroyed) {
      const serverContent = quickNote.content || '';
      editor.commands.setContent(serverContent);
      setHasBeenSavedOnce(true);
      setIsInitialLoad(false);
      
      // Update workspace panel title to match the loaded note title (only on initial load)
      if (quickNote.title && quickNote.title !== 'Quick Note') {
        updatePanel(panelId, { title: quickNote.title });
      }
    }
  }, [isInitialLoad, quickNote, editor, panelId, updatePanel]);

  // Debounced title save using useDebouncedSave hook
  const titleSave = useDebouncedSave({
    getData: () => {
      if (!isInitialLoad && hasBeenSavedOnce && editor && noteTitle !== quickNote?.title) {
        return {
          userId,
          title: noteTitle,
          content: editor.getHTML(),
        };
      }
      return null;
    },
    saveFn: async (data) => {
      const response = await apiRequest('POST', '/api/quick-note', data);
      return await response.json();
    },
    onSuccess: (savedNote) => {
      // Update cache WITHOUT triggering re-fetch
      queryClient.setQueryData(['/api/quick-note', userId], (old: any) => ({
        ...old,
        ...savedNote,
      }));
    },
    debounceMs: 500,
    showToasts: false, // No toasts for title auto-save
  });

  // Trigger title save when noteTitle changes
  useEffect(() => {
    if (!isInitialLoad && hasBeenSavedOnce && noteTitle !== quickNote?.title) {
      titleSave.triggerSave();
    }
  }, [noteTitle, isInitialLoad, hasBeenSavedOnce, quickNote?.title]);

  // Save data function for autosave
  const saveDataFunction = useCallback(() => {
    if (!editor) return null;
    return {
      userId,
      title: noteTitle,
      content: editor.getHTML(),
    };
  }, [editor, userId, noteTitle]);

  // Mutation function for autosave - returns parsed JSON
  const mutationFunction = useCallback(async (data: any) => {
    const response = await apiRequest('POST', '/api/quick-note', data);
    return await response.json();
  }, []);

  // Set up autosave using the hook
  const { saveStatus, handleSave, setupAutosave, isSaving } = useAutosave({
    editor,
    saveDataFunction,
    mutationFunction,
    autoSaveCondition: () => hasBeenSavedOnce || (editor?.getText().trim().length ?? 0) > 0,
    successMessage: 'Quick note saved',
    errorMessage: 'Failed to save quick note',
    invalidateQueries: [], // Don't invalidate queries during auto-save to prevent re-renders
    onSuccess: (savedNote) => {
      // Mark as saved for both new and existing notes
      setHasBeenSavedOnce(true);
      
      // Silently update the cache without triggering re-renders
      queryClient.setQueryData(['/api/quick-note', userId], (old: any) => {
        // Merge new data with old to preserve all fields and prevent re-renders
        return {
          ...old,
          id: savedNote.id || old?.id || `quick-note-${userId}`,
          userId: userId,
          title: savedNote.title || old?.title || 'Quick Note',
          content: savedNote.content,
          createdAt: savedNote.createdAt || old?.createdAt || new Date().toISOString(),
          updatedAt: savedNote.updatedAt || new Date().toISOString()
        };
      });
    },
  });

  // Connect editor update to autosave (always listen, let autoSaveCondition gate the actual save)
  useEffect(() => {
    if (editor) {
      editor.on('update', setupAutosave);
      return () => {
        editor.off('update', setupAutosave);
      };
    }
  }, [editor, setupAutosave]);

  // Manual save handler
  const handleManualSave = async () => {
    if (!editor || !editor.getText().trim()) {
      toast({
        title: 'Nothing to save',
        description: 'Quick note is empty.',
        variant: 'destructive'
      });
      return;
    }
    
    await handleSave();
  };

  // Save to notebook mutation
  const saveToNotebookMutation = useMutation({
    mutationFn: async () => {
      if (!activeNotebookId) {
        throw new Error('No active notebook selected');
      }
      
      if (!editor) {
        throw new Error('Editor not ready');
      }
      
      // First, ensure the quick note is saved
      const data = saveDataFunction();
      if (data) {
        await apiRequest('POST', '/api/quick-note', data);
      }
      
      // Generate a unique ID for this saved note
      const uniqueItemId = `saved-note-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      // Then save it to the notebook as a saved item
      const response = await apiRequest('POST', '/api/saved-items', {
        userId: userId, // Use the same userId as for quick note operations
        notebookId: activeNotebookId,
        itemType: 'quickNote',
        itemId: uniqueItemId,
        itemData: {
          title: noteTitle,
          content: editor.getHTML()
        }
      });
      return response.json();
    },
    onSuccess: async () => {
      // Clear the quick note after saving to notebook
      if (editor) {
        editor.commands.setContent('');
        setHasBeenSavedOnce(false);
        
        // Clear the content in the database too
        await apiRequest('POST', '/api/quick-note', {
          userId,
          title: 'Quick Note',
          content: ''
        });
        
        // Update cache to reflect cleared content
        queryClient.setQueryData(['/api/quick-note', userId], (oldData: any) => {
          if (oldData) {
            return { ...oldData, content: '' };
          }
          return oldData;
        });
      }
      
      // Invalidate saved items to show the new note in the notebook
      queryClient.invalidateQueries({ queryKey: ['/api/saved-items'] });
      
      toast({
        title: 'Saved to Notebook',
        description: 'Your note has been saved and the quick note is ready for new content.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Failed to save',
        description: error instanceof Error ? error.message : 'Could not save to notebook.',
        variant: 'destructive'
      });
    }
  });

  const handleSaveToNotebook = () => {
    if (!editor || !editor.getText().trim()) {
      toast({
        title: 'Nothing to save',
        description: 'Quick note is empty.',
        variant: 'destructive'
      });
      return;
    }
    
    if (!activeNotebookId) {
      toast({
        title: 'No notebook selected',
        description: 'Please select a notebook first.',
        variant: 'destructive'
      });
      return;
    }
    
    saveToNotebookMutation.mutate();
  };

  // Register save function with parent component
  useEffect(() => {
    if (onRegisterSaveFunction && editor) {
      const saveAndGetContent = async () => {
        const currentContent = editor.getHTML();
        if (currentContent.trim()) {
          const data = saveDataFunction();
          if (data) {
            try {
              await apiRequest('POST', '/api/quick-note', data);
              await new Promise(resolve => setTimeout(resolve, 100));
            } catch (error) {
              console.error('Failed to save before exporting:', error);
            }
          }
        }
        return {
          content: currentContent,
          id: quickNote?.id || `quick-note-${Date.now()}`
        };
      };
      onRegisterSaveFunction(saveAndGetContent);
    }
  }, [onRegisterSaveFunction, editor, saveDataFunction, quickNote]);
  
  // Register clear function with parent component
  useEffect(() => {
    if (onRegisterClearFunction && editor) {
      const clearContent = () => {
        editor.commands.setContent('');
        setHasBeenSavedOnce(false);
        queryClient.setQueryData(['/api/quick-note', userId], (oldData: any) => {
          if (oldData) {
            return { ...oldData, content: '' };
          }
          return oldData;
        });
      };
      onRegisterClearFunction(clearContent);
    }
  }, [onRegisterClearFunction, editor, queryClient, userId]);

  const getSaveStatusIndicator = () => {
    switch (saveStatus) {
      case 'saving':
        return 'Saving...';
      case 'unsaved':
        return 'Unsaved changes';
      default:
        return 'Saved';
    }
  };

  const getCharacterCount = () => {
    if (!editor) return 0;
    return editor.getText().length;
  };

  if (isLoading) {
    return (
      <div className={`w-full h-full flex items-center justify-center ${className}`}
           style={{ 
             backgroundColor: '#e9d5ff',
             backgroundImage: 'linear-gradient(135deg, #e9d5ff 0%, #d8b4fe 100%)'
           }}>
        <span className="text-purple-700/60">Loading...</span>
      </div>
    );
  }

  return (
    <div className={`w-full h-full flex flex-col ${className}`}
         style={{ 
           backgroundColor: '#e9d5ff',
           backgroundImage: 'linear-gradient(135deg, #e9d5ff 0%, #d8b4fe 100%)'
         }}>
      {/* TipTap Editor */}
      <div className="flex-1 w-full overflow-auto">
        <QuickNoteBubbleMenu editor={editor} />
        <EditorContent 
          editor={editor} 
          className="h-full"
          data-testid={`editor-content-${panelId}`}
        />
      </div>

      {/* Footer with status and action buttons */}
      <div className="px-4 pb-3 space-y-2">
        {/* Status row */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-purple-700/70">
            {getSaveStatusIndicator()}
          </span>
          <span className="text-xs text-purple-700/50">
            {getCharacterCount()} characters
          </span>
        </div>
        
        {/* Icon-based toolbar */}
        <div className="flex items-center justify-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                variant="outline"
                onClick={handleManualSave}
                disabled={isSaving || !editor || !editor.getText().trim()}
                className="bg-purple-100/50 hover:bg-purple-200/70 border-purple-300/50 text-purple-800"
                data-testid="button-save-now"
              >
                <Save className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Save Now</p>
            </TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                variant="outline"
                onClick={handleSaveToNotebook}
                disabled={saveToNotebookMutation.isPending || !editor || !editor.getText().trim() || !activeNotebookId}
                className="bg-purple-100/50 hover:bg-purple-200/70 border-purple-300/50 text-purple-800"
                data-testid="button-save-to-notebook"
              >
                <BookmarkPlus className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Save to Notebook</p>
            </TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                variant={editor?.isActive('taskList') ? 'default' : 'outline'}
                onClick={() => {
                  if (editor) {
                    editor.chain().focus().toggleTaskList().run();
                  }
                }}
                disabled={!editor}
                className="bg-purple-100/50 hover:bg-purple-200/70 border-purple-300/50 text-purple-800"
                data-testid="button-toggle-checklist"
              >
                <ListChecks className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Toggle Checklist</p>
            </TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                variant="outline"
                onClick={() => {
                  // TODO: Implement new note creation in task 9
                  toast({
                    title: 'Coming soon',
                    description: 'Create new note feature will be added soon',
                  });
                }}
                className="bg-purple-100/50 hover:bg-purple-200/70 border-purple-300/50 text-purple-800"
                data-testid="button-new-note"
              >
                <FilePlus className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>New Note</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </div>
  );
}
