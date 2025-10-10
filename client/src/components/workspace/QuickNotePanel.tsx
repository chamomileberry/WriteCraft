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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { Save, BookmarkPlus, ListChecks, FilePlus, ChevronDown } from 'lucide-react';
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

  // Get the panel title and metadata from workspace store
  const panel = currentLayout.panels.find(p => p.id === panelId);
  const noteTitle = panel?.title || 'Quick Note';
  const noteId = panel?.metadata?.noteId; // Get saved note ID if editing a saved note

  // Using guest user for consistency with other components in this demo app
  const userId = 'guest'; 

  // Get saved note data from panel metadata if editing a saved note
  const savedNoteData = panel?.metadata?.savedNoteData;
  
  // Fetch scratch pad quick note (only when not editing a saved note)
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
    enabled: !noteId, // Only fetch scratch pad if not editing a saved note
  });

  // Fetch all saved quick notes from the active notebook for the dropdown
  const { data: savedQuickNotes = [] } = useQuery({
    queryKey: ['/api/saved-items', { userId, notebookId: activeNotebookId, itemType: 'quickNote' }],
    queryFn: async () => {
      if (!activeNotebookId) return [];
      const response = await fetch(
        `/api/saved-items?userId=${userId}&notebookId=${activeNotebookId}&itemType=quickNote`,
        { credentials: 'include' }
      );
      if (!response.ok) return [];
      return response.json();
    },
    enabled: !!activeNotebookId,
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
    if (isInitialLoad && editor && !editor.isDestroyed) {
      // If editing a saved note, use savedNoteData from metadata
      if (savedNoteData) {
        const serverContent = savedNoteData.content || '';
        editor.commands.setContent(serverContent);
        setHasBeenSavedOnce(true);
        setIsInitialLoad(false);
        
        // Update workspace panel title to match the loaded note title
        if (savedNoteData.title && savedNoteData.title !== 'Quick Note') {
          updatePanel(panelId, { title: savedNoteData.title });
        }
      } 
      // Otherwise, load from scratch pad
      else if (quickNote) {
        const serverContent = quickNote.content || '';
        editor.commands.setContent(serverContent);
        setHasBeenSavedOnce(true);
        setIsInitialLoad(false);
        
        // Update workspace panel title to match the loaded note title
        if (quickNote.title && quickNote.title !== 'Quick Note') {
          updatePanel(panelId, { title: quickNote.title });
        }
      }
    }
  }, [isInitialLoad, quickNote, savedNoteData, editor, panelId, updatePanel]);

  // Debounced title save using useDebouncedSave hook
  const titleSave = useDebouncedSave({
    getData: () => {
      const currentTitle = noteId && savedNoteData ? savedNoteData.title : quickNote?.title;
      if (!isInitialLoad && hasBeenSavedOnce && editor && noteTitle !== currentTitle) {
        return {
          userId,
          title: noteTitle,
          content: editor.getHTML(),
        };
      }
      return null;
    },
    saveFn: async (data) => {
      // If editing a saved note, update the saved item directly
      if (noteId) {
        const savedItemResponse = await apiRequest('PUT', `/api/saved-items/${noteId}`, {
          itemData: {
            title: data.title,
            content: data.content
          }
        });
        return await savedItemResponse.json();
      }
      // Otherwise, use POST to create/update scratch pad note
      const response = await apiRequest('POST', '/api/quick-note', data);
      return await response.json();
    },
    onSuccess: (savedData) => {
      // Update cache WITHOUT triggering re-fetch
      if (noteId) {
        // Update saved note data in panel metadata
        updatePanel(panelId, { 
          metadata: { 
            noteId,
            savedNoteData: savedData.itemData || savedData
          }
        });
      } else {
        queryClient.setQueryData(['/api/quick-note', userId], (old: any) => ({
          ...old,
          ...savedData,
        }));
      }
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
    // If editing a saved note, update the saved item directly
    if (noteId) {
      const savedItemResponse = await apiRequest('PUT', `/api/saved-items/${noteId}`, {
        itemData: {
          title: data.title,
          content: data.content
        }
      });
      return await savedItemResponse.json();
    }
    // Otherwise, use POST to create/update scratch pad note
    const response = await apiRequest('POST', '/api/quick-note', data);
    return await response.json();
  }, [noteId]);

  // Set up autosave using the hook
  const { saveStatus, handleSave, setupAutosave, isSaving } = useAutosave({
    editor,
    saveDataFunction,
    mutationFunction,
    autoSaveCondition: () => hasBeenSavedOnce || (editor?.getText().trim().length ?? 0) > 0,
    successMessage: 'Quick note saved',
    errorMessage: 'Failed to save quick note',
    invalidateQueries: [], // Don't invalidate queries during auto-save to prevent re-renders
    onSuccess: (savedData) => {
      // Mark as saved for both new and existing notes
      setHasBeenSavedOnce(true);
      
      // Silently update the cache without triggering re-renders
      if (noteId) {
        // Update saved note data in panel metadata
        updatePanel(panelId, { 
          metadata: { 
            noteId,
            savedNoteData: savedData.itemData || savedData
          }
        });
      } else {
        queryClient.setQueryData(['/api/quick-note', userId], (old: any) => {
          // Merge new data with old to preserve all fields and prevent re-renders
          return {
            ...old,
            id: savedData.id || old?.id || `quick-note-${userId}`,
            userId: userId,
            title: savedData.title || old?.title || 'Quick Note',
            content: savedData.content,
            createdAt: savedData.createdAt || old?.createdAt || new Date().toISOString(),
            updatedAt: savedData.updatedAt || new Date().toISOString()
          };
        });
      }
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
      
      const isEditingExistingSaved = !!noteId; // Check if editing an existing saved note
      
      // Save it to the notebook as a saved item with content in itemData
      const response = await apiRequest('POST', '/api/saved-items', {
        userId: userId,
        notebookId: activeNotebookId,
        itemType: 'quickNote',
        itemId: noteId || `quick-note-${Date.now()}`, // Use noteId if exists, otherwise generate one
        itemData: {
          title: noteTitle,
          content: editor.getHTML()
        }
      });
      const savedItem = await response.json();
      return { savedItem, isNewNote: !isEditingExistingSaved };
    },
    onSuccess: async ({ savedItem, isNewNote }) => {
      // Only clear if this was the scratch pad (not editing an existing saved note)
      if (isNewNote && editor) {
        editor.commands.setContent('');
        setHasBeenSavedOnce(false);
        
        // Clear the scratch pad in the database
        await apiRequest('POST', '/api/quick-note', {
          userId,
          title: 'Quick Note',
          content: ''
        });
        
        // Update cache to reflect cleared scratch pad
        queryClient.setQueryData(['/api/quick-note', userId], (oldData: any) => {
          if (oldData) {
            return { ...oldData, content: '', title: 'Quick Note' };
          }
          return oldData;
        });
        
        // Close the quick note panel after saving from scratch pad
        const quickNotePanel = currentLayout.panels.find(p => p.id === panelId);
        if (quickNotePanel) {
          updatePanel(panelId, { metadata: undefined, title: 'Quick Note' });
        }
      }
      
      // Invalidate saved items to show the new note in the notebook
      queryClient.invalidateQueries({ queryKey: ['/api/saved-items'] });
      
      toast({
        title: 'Saved to Notebook',
        description: isNewNote 
          ? 'Your note has been saved and the quick note is ready for new content.'
          : 'Your note has been saved to the notebook.',
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

  // Handler to switch to a different saved note
  const handleSwitchNote = (savedItem: any) => {
    const newNoteId = savedItem.id;
    const newSavedNoteData = savedItem.itemData || { 
      title: savedItem.title || 'Quick Note', 
      content: savedItem.content || '' 
    };
    
    // Update panel metadata to load the selected note
    updatePanel(panelId, { 
      metadata: { 
        noteId: newNoteId, 
        savedNoteData: newSavedNoteData 
      },
      title: newSavedNoteData.title || 'Quick Note'
    });
    
    // Set content in editor
    if (editor && !editor.isDestroyed) {
      editor.commands.setContent(newSavedNoteData.content || '');
      setIsInitialLoad(false);
      setHasBeenSavedOnce(true);
    }
  };

  // Handler to switch back to scratch pad
  const handleSwitchToScratchPad = async () => {
    // Clear metadata to go back to scratch pad mode (this will re-enable the query)
    updatePanel(panelId, { 
      metadata: undefined,
      title: 'Quick Note'
    });
    
    // Reset to initial load state so the effect can load scratch pad when query completes
    setIsInitialLoad(true);
    
    // Fetch scratch pad note directly if we don't have it cached
    try {
      const response = await fetch(`/api/quick-note?userId=${userId}`, {
        credentials: 'include'
      });
      
      let scratchPadNote = null;
      if (response.ok) {
        scratchPadNote = await response.json();
      }
      
      // Update cache
      queryClient.setQueryData(['/api/quick-note', userId], scratchPadNote);
      
      // Load scratch pad content into editor
      if (editor && !editor.isDestroyed) {
        editor.commands.setContent(scratchPadNote?.content || '');
        setIsInitialLoad(false);
        setHasBeenSavedOnce(!!scratchPadNote?.content);
        
        // Update title
        if (scratchPadNote?.title && scratchPadNote.title !== 'Quick Note') {
          updatePanel(panelId, { title: scratchPadNote.title });
        }
      }
    } catch (error) {
      console.error('Failed to load scratch pad:', error);
      // On error, just clear the editor
      if (editor && !editor.isDestroyed) {
        editor.commands.setContent('');
        setIsInitialLoad(false);
        setHasBeenSavedOnce(false);
      }
    }
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
          {/* Note switcher dropdown - only show if there are saved notes */}
          {savedQuickNotes.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-purple-100/50 hover:bg-purple-200/70 border-purple-300/50 text-purple-800 text-xs"
                  data-testid="button-switch-note"
                >
                  {noteId ? (
                    <>
                      <span className="max-w-[100px] truncate">{noteTitle}</span>
                      <ChevronDown className="ml-1 w-3 h-3" />
                    </>
                  ) : (
                    <>
                      <span>Scratch Pad</span>
                      <ChevronDown className="ml-1 w-3 h-3" />
                    </>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                <DropdownMenuLabel>Saved Quick Notes</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {!noteId && (
                  <DropdownMenuItem disabled className="text-xs opacity-70">
                    <span className="font-medium">● Scratch Pad (current)</span>
                  </DropdownMenuItem>
                )}
                {noteId && (
                  <DropdownMenuItem 
                    onClick={handleSwitchToScratchPad}
                    className="text-xs"
                    data-testid="menu-item-scratch-pad"
                  >
                    Scratch Pad
                  </DropdownMenuItem>
                )}
                {savedQuickNotes.map((savedNote: any) => (
                  <DropdownMenuItem
                    key={savedNote.id}
                    onClick={() => handleSwitchNote(savedNote)}
                    disabled={noteId === savedNote.id}
                    className="text-xs"
                    data-testid={`menu-item-note-${savedNote.id}`}
                  >
                    {noteId === savedNote.id && <span className="mr-1">●</span>}
                    <span className={noteId === savedNote.id ? 'font-medium' : ''}>
                      {savedNote.itemData?.title || savedNote.title || 'Untitled Note'}
                    </span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          
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
