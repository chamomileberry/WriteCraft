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
}

export default function QuickNotePanel({ panelId, onClose, onPin, className, onRegisterSaveFunction }: QuickNotePanelProps) {
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

  // Load quick note data when fetched
  useEffect(() => {
    if (quickNote) {
      setContent(quickNote.content || '');
      hasBeenSavedOnce.current = true;
    }
  }, [quickNote]);

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
      queryClient.invalidateQueries({ queryKey: ['/api/quick-note', userId] });
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
    
    setSaveStatus('saving');
    try {
      await saveMutation.mutateAsync({ content });
    } catch (error) {
      // Error handling is done in mutation onError
    }
  };

  // Handle content changes
  const handleContentChange = (value: string) => {
    setContent(value);
    triggerAutosave();
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (autosaveTimeoutRef.current) {
        clearTimeout(autosaveTimeoutRef.current);
      }
    };
  }, []);

  // Register save function with parent component
  useEffect(() => {
    if (onRegisterSaveFunction) {
      const saveAndGetContent = async () => {
        // Force save current content immediately if there are unsaved changes
        if (content.trim()) {
          setSaveStatus('saving');
          try {
            await saveMutation.mutateAsync({ content });
            // Wait a moment for the save to complete
            await new Promise(resolve => setTimeout(resolve, 100));
          } catch (error) {
            console.error('Failed to save before exporting:', error);
          }
        }
        return {
          content: content,
          id: quickNote?.id || `quick-note-${Date.now()}`
        };
      };
      onRegisterSaveFunction(saveAndGetContent);
    }
  }, [content, onRegisterSaveFunction, saveMutation, quickNote]);

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