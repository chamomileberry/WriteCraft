import { useState, useRef, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface QuickNotePanelProps {
  panelId: string;
  onClose?: () => void;
  onPin?: () => void;
  className?: string;
  onRegisterSaveFunction?: (fn: () => Promise<{ content: string; id: string }>) => void;
  onRegisterClearFunction?: (fn: () => void) => void;
}

export default function QuickNotePanel({ panelId, onClose, onPin, className, onRegisterSaveFunction, onRegisterClearFunction }: QuickNotePanelProps) {
  const [content, setContent] = useState('');
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');
  const autosaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hasBeenSavedOnce = useRef(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

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
    onSuccess: () => {
      setSaveStatus('saved');
      hasBeenSavedOnce.current = true;
      // Don't invalidate query here to avoid overwriting user input
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

  // Load quick note data after saveMutation is defined
  useEffect(() => {
    if (quickNote && !hasInitialized.current && !isLoading) {
      const serverContent = quickNote.content || '';
      console.log('[QuickNote] Loading content from server:', serverContent);
      // Always set the content from the server
      setContent(serverContent);
      contentRef.current = serverContent; // Also update ref immediately
      hasBeenSavedOnce.current = true;
      hasInitialized.current = true;
    }
  }, [quickNote, saveMutation, isLoading]);

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
    if (saveMutation.isPending) return;
    
    console.log('[QuickNote] Auto-saving content:', content);
    setSaveStatus('saving');
    try {
      await saveMutation.mutateAsync({ content });
    } catch (error) {
      // Error handling is done in mutation onError
    }
  };

  // Handle content changes
  const handleContentChange = (value: string) => {
    console.log('[QuickNote] Content changed to:', value);
    setContent(value);
    triggerAutosave();
  };

  // Cleanup on unmount - reset hasInitialized so data reloads on next open
  useEffect(() => {
    return () => {
      if (autosaveTimeoutRef.current) {
        clearTimeout(autosaveTimeoutRef.current);
        // Save any pending content before unmounting
        if (contentRef.current && contentRef.current.trim() && !saveMutation.isPending) {
          console.log('[QuickNote] Saving on unmount:', contentRef.current);
          saveMutation.mutate({ content: contentRef.current });
        }
      }
      // Reset hasInitialized so next time the panel opens it loads fresh data
      hasInitialized.current = false;
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

      {/* Minimal status indicator */}
      <div className="px-4 pb-2 flex items-center justify-between">
        <span className="text-xs text-purple-700/70">
          {getSaveStatusIndicator()}
        </span>
        <span className="text-xs text-purple-700/50">
          {content.length} characters
        </span>
      </div>
    </div>
  );
}