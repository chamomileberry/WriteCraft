import { useState, useRef, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useNotebookStore } from '@/stores/notebookStore';
import { Button } from '@/components/ui/button';
import { Save, BookmarkPlus } from 'lucide-react';

interface QuickNotePanelProps {
  panelId: string;
  className?: string;
  onRegisterSaveFunction?: (fn: () => Promise<{ content: string; id: string }>) => void;
  onRegisterClearFunction?: (fn: () => void) => void;
}

export default function QuickNotePanel({ panelId, className, onRegisterSaveFunction, onRegisterClearFunction }: QuickNotePanelProps) {
  const [content, setContent] = useState('');
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');
  const autosaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hasBeenSavedOnce = useRef(false);
  const isSavingOnUnmount = useRef(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { activeNotebookId } = useNotebookStore();

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

  // Load quick note data only on initial mount or when panel is opened
  const hasInitialized = useRef(false);

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async (data: { content: string }) => {
      return apiRequest('POST', '/api/quick-note', {
        userId,
        title: 'Quick Note',
        content: data.content,
      });
    },
    onSuccess: async (response, variables) => {
      setSaveStatus('saved');
      hasBeenSavedOnce.current = true;
      
      // Parse the response to get the complete saved note
      const savedNote = await response.json();
      
      // Update the local cache immediately with the saved content to prevent stale data overwrites
      queryClient.setQueryData(['/api/quick-note', userId], () => {
        return {
          id: savedNote.id || quickNote?.id || `quick-note-${userId}`,
          userId: userId,
          title: savedNote.title || 'Quick Note',
          content: savedNote.content || variables.content,
          createdAt: savedNote.createdAt || quickNote?.createdAt || new Date().toISOString(),
          updatedAt: savedNote.updatedAt || new Date().toISOString()
        };
      });
      
      // Then invalidate to trigger refetch for other consumers (like SavedItems)
      queryClient.invalidateQueries({ queryKey: ['/api/quick-note'], exact: false });
    },
    onError: (error) => {
      setSaveStatus('unsaved');
      toast({
        title: 'Save failed',
        description: 'Could not save your quick note. Please try again.',
        variant: 'destructive',
      });
      console.error('Save error:', error);
    },
  });

  // Load quick note data when available or when it changes (after save invalidation)
  useEffect(() => {
    if (quickNote && !isLoading) {
      const serverContent = quickNote.content || '';
      // Only update if content differs from server and we're not currently editing
      // (saveStatus 'saved' means no active edits)
      if (!hasInitialized.current || (saveStatus === 'saved' && content !== serverContent)) {
        console.log('[QuickNote] Loading content from server:', serverContent);
        setContent(serverContent);
        contentRef.current = serverContent;
        hasBeenSavedOnce.current = true;
        hasInitialized.current = true;
      }
    }
  }, [quickNote, isLoading, saveStatus]);

  // Autosave functionality
  const triggerAutosave = () => {
    if (autosaveTimeoutRef.current) {
      clearTimeout(autosaveTimeoutRef.current);
    }

    setSaveStatus('unsaved');

    autosaveTimeoutRef.current = setTimeout(() => {
      if (hasBeenSavedOnce.current || content.trim()) {
        handleAutoSave();
      }
    }, 2000);
  };

  const handleAutoSave = async () => {
    if (saveMutation.isPending) {
      console.log('[QuickNote] Skip autosave - mutation already pending');
      return;
    }
    
    const contentToSave = contentRef.current; // Use ref to get most current value
    console.log('[QuickNote] Auto-saving content:', contentToSave);
    setSaveStatus('saving');
    try {
      await saveMutation.mutateAsync({ content: contentToSave });
      console.log('[QuickNote] Auto-save successful');
    } catch (error) {
      console.error('[QuickNote] Auto-save failed:', error);
      // Error handling is done in mutation onError
    }
  };

  // Handle content changes
  const handleContentChange = (value: string) => {
    console.log('[QuickNote] Content changed to:', value);
    setContent(value);
    triggerAutosave();
  };

  // Manual save handler
  const handleManualSave = async () => {
    if (!content.trim()) {
      toast({
        title: 'Nothing to save',
        description: 'Quick note is empty.',
        variant: 'destructive'
      });
      return;
    }
    
    // Clear any pending autosave
    if (autosaveTimeoutRef.current) {
      clearTimeout(autosaveTimeoutRef.current);
    }
    
    await handleAutoSave();
  };

  // Save to notebook mutation
  const saveToNotebookMutation = useMutation({
    mutationFn: async () => {
      if (!activeNotebookId) {
        throw new Error('No active notebook selected');
      }
      
      // First, ensure the quick note is saved
      await saveMutation.mutateAsync({ content: contentRef.current });
      
      // Generate a unique ID for this saved note (not reusing quick note ID)
      const uniqueItemId = `saved-note-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      // Then save it to the notebook as a saved item
      const response = await apiRequest('POST', '/api/saved-items', {
        userId: 'demo-user',
        notebookId: activeNotebookId,
        itemType: 'quickNote',
        itemId: uniqueItemId,
        itemData: {
          title: 'Quick Note',
          content: contentRef.current
        }
      });
      return response.json();
    },
    onSuccess: async () => {
      // Clear the quick note after saving to notebook
      setContent('');
      contentRef.current = '';
      setSaveStatus('saved');
      
      // Clear the content in the database too, so next open starts fresh
      await saveMutation.mutateAsync({ content: '' });
      
      // Update cache to reflect cleared content
      queryClient.setQueryData(['/api/quick-note', userId], (oldData: any) => {
        if (oldData) {
          return { ...oldData, content: '' };
        }
        return oldData;
      });
      
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
    if (!content.trim()) {
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

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isSavingOnUnmount.current) {
        console.log('[QuickNote] Already saving on unmount, skipping duplicate save');
        return;
      }
      
      if (autosaveTimeoutRef.current) {
        clearTimeout(autosaveTimeoutRef.current);
        // Save any pending content before unmounting
        if (contentRef.current && contentRef.current.trim() && !saveMutation.isPending) {
          isSavingOnUnmount.current = true;
          console.log('[QuickNote] Saving on unmount:', contentRef.current);
          saveMutation.mutate({ content: contentRef.current });
        }
      }
      // Don't reset hasInitialized - keep the loaded state to prevent reloading on remount
    };
  }, [saveMutation]);

  // Keep a ref to the current content
  const contentRef = useRef(content);
  useEffect(() => {
    contentRef.current = content;
  }, [content]);

  // Register save function with parent component (only once)
  useEffect(() => {
    if (onRegisterSaveFunction) {
      const saveAndGetContent = async () => {
        const currentContent = contentRef.current; // Use ref to get current content
        // Force save current content immediately if there are unsaved changes
        if (currentContent.trim()) {
          setSaveStatus('saving');
          try {
            await saveMutation.mutateAsync({ content: currentContent });
            // Wait a moment for the save to complete
            await new Promise(resolve => setTimeout(resolve, 100));
          } catch (error) {
            console.error('Failed to save before exporting:', error);
          }
        }
        return {
          content: currentContent,
          id: quickNote?.id || `quick-note-${Date.now()}`
        };
      };
      onRegisterSaveFunction(saveAndGetContent);
    }
  }, [onRegisterSaveFunction, saveMutation, quickNote]); // Don't include content in deps
  
  // Register clear function with parent component
  useEffect(() => {
    if (onRegisterClearFunction) {
      const clearContent = () => {
        setContent('');
        contentRef.current = '';
        setSaveStatus('saved');
        // Update the React Query cache to reflect the cleared content
        queryClient.setQueryData(['/api/quick-note', userId], (oldData: any) => {
          if (oldData) {
            return { ...oldData, content: '' };
          }
          return oldData;
        });
        // Don't reset hasInitialized - the cache is now updated
      };
      onRegisterClearFunction(clearContent);
    }
  }, [onRegisterClearFunction, queryClient, userId]);

  const getSaveStatusIndicator = () => {
    switch (saveStatus) {
      case 'saving':
        return 'Saving...';
      case 'unsaved':
        return '';
      default:
        return 'Saved';
    }
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
      {/* Simple sticky note style textarea */}
      <textarea
        value={content}
        onChange={(e) => handleContentChange(e.target.value)}
        placeholder="Start writing your quick note..."
        className="flex-1 w-full p-4 resize-none bg-transparent border-0 outline-none text-purple-900 placeholder-purple-700/50"
        style={{ 
          fontFamily: "Arial, Helvetica, sans-serif",
          fontSize: '0.95rem',
          lineHeight: '1.6',
        }}
        data-testid={`textarea-content-${panelId}`}
      />

      {/* Footer with status and action buttons */}
      <div className="px-4 pb-3 space-y-2">
        {/* Status row */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-purple-700/70">
            {getSaveStatusIndicator()}
          </span>
          <span className="text-xs text-purple-700/50">
            {content.length} characters
          </span>
        </div>
        
        {/* Action buttons */}
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleManualSave}
            disabled={saveMutation.isPending || !content.trim()}
            className="flex-1 bg-purple-100/50 hover:bg-purple-200/70 border-purple-300/50 text-purple-800"
            data-testid="button-save-now"
          >
            <Save className="w-3 h-3 mr-1" />
            Save Now
          </Button>
          
          <Button
            size="sm"
            variant="default"
            onClick={handleSaveToNotebook}
            disabled={saveToNotebookMutation.isPending || !content.trim() || !activeNotebookId}
            className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
            data-testid="button-save-to-notebook"
          >
            <BookmarkPlus className="w-3 h-3 mr-1" />
            Save to Notebook
          </Button>
        </div>
      </div>
    </div>
  );
}