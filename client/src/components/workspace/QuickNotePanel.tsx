import { useState, useRef, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { X, Pin, GripHorizontal, Save, StickyNote } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface QuickNotePanelProps {
  panelId: string;
  onClose?: () => void;
  onPin?: () => void;
  className?: string;
}

export default function QuickNotePanel({ panelId, onClose, onPin, className }: QuickNotePanelProps) {
  const [title, setTitle] = useState('Quick Note');
  const [content, setContent] = useState('');
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');
  const autosaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hasBeenSavedOnce = useRef(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // TODO: Replace with actual user ID from authentication context
  const userId = 'user-1'; 

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
      setTitle(quickNote.title || 'Quick Note');
      setContent(quickNote.content || '');
      hasBeenSavedOnce.current = true;
    }
  }, [quickNote]);

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async (data: { title: string; content: string }) => {
      return apiRequest('POST', '/api/quick-note', {
        userId,
        title: data.title,
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
      if (hasBeenSavedOnce.current || content.trim() || title.trim() !== 'Quick Note') {
        handleAutoSave();
      }
    }, 2000);
  };

  const handleAutoSave = async () => {
    if (saveMutation.isPending) return;
    
    setSaveStatus('saving');
    try {
      await saveMutation.mutateAsync({ title, content });
    } catch (error) {
      // Error handling is done in mutation onError
    }
  };

  const handleManualSave = async () => {
    if (saveMutation.isPending) return;
    
    setSaveStatus('saving');
    try {
      await saveMutation.mutateAsync({ title, content });
      toast({
        title: 'Quick note saved',
        description: 'Your note has been saved successfully.',
      });
    } catch (error) {
      // Error handling is done in mutation onError
    }
  };

  // Handle content changes
  const handleContentChange = (value: string) => {
    setContent(value);
    triggerAutosave();
  };

  const handleTitleChange = (value: string) => {
    setTitle(value);
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

  const getSaveStatusIndicator = () => {
    switch (saveStatus) {
      case 'saving':
        return <span className="text-xs text-muted-foreground">Saving...</span>;
      case 'unsaved':
        return <span className="text-xs text-orange-500">Unsaved changes</span>;
      default:
        return <span className="text-xs text-green-600">Saved</span>;
    }
  };

  if (isLoading) {
    return (
      <div className={`w-full h-full bg-background border border-border rounded-lg shadow-lg flex flex-col ${className}`}>
        <div className="flex items-center justify-between p-2 border-b bg-muted/50 rounded-t-lg panel-drag-handle cursor-move">
          <div className="flex items-center gap-2">
            <GripHorizontal className="h-4 w-4 text-muted-foreground" />
            <StickyNote className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Quick Note</span>
          </div>
        </div>
        <div className="flex-1 p-4 flex items-center justify-center">
          <span className="text-muted-foreground">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full h-full bg-background border border-border rounded-lg shadow-lg flex flex-col ${className}`}>
      {/* Panel Header */}
      <div className="flex items-center justify-between p-2 border-b bg-muted/50 rounded-t-lg panel-drag-handle cursor-move">
        <div className="flex items-center gap-2">
          <GripHorizontal className="h-4 w-4 text-muted-foreground" />
          <StickyNote className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Quick Note</span>
        </div>
        <div className="flex items-center gap-1">
          {onPin && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onPin}
              className="h-6 w-6 p-0"
              data-testid={`button-pin-${panelId}`}
              title="Pin to tab bar"
            >
              <Pin className="h-3 w-3" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleManualSave}
            className="h-6 w-6 p-0"
            disabled={saveMutation.isPending}
            data-testid={`button-save-${panelId}`}
            title="Save now"
          >
            <Save className="h-3 w-3" />
          </Button>
          {onClose && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-6 w-6 p-0 hover:bg-destructive/10"
              data-testid={`button-close-${panelId}`}
              title="Close"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 flex flex-col p-3 gap-3">
        {/* Title Input */}
        <Input
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          placeholder="Note title..."
          className="text-sm font-medium"
          data-testid={`input-title-${panelId}`}
        />

        {/* Content Textarea */}
        <Textarea
          value={content}
          onChange={(e) => handleContentChange(e.target.value)}
          placeholder="Start writing your quick note..."
          className="flex-1 resize-none text-sm"
          data-testid={`textarea-content-${panelId}`}
        />

        {/* Status Bar */}
        <div className="flex items-center justify-between text-xs">
          <div>{getSaveStatusIndicator()}</div>
          <div className="text-muted-foreground">
            {content.length} characters
          </div>
        </div>
      </div>
    </div>
  );
}