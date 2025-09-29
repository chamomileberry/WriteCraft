import { useState, useRef, useCallback } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { queryClient } from '@/lib/queryClient';
import type { Editor } from '@tiptap/react';

export interface UseAutosaveOptions {
  /** The TipTap editor instance */
  editor: Editor | null;
  /** Function that returns the data to be saved */
  saveDataFunction: () => any;
  /** Function that performs the actual save operation */
  mutationFunction: (data: any) => Promise<any>;
  /** Optional callback when save succeeds */
  onSuccess?: (data: any) => void;
  /** Optional callback when save fails */
  onError?: (error: any) => void;
  /** Debounce delay in milliseconds (default: 2000) */
  debounceMs?: number;
  /** Condition that must be true before autosaving (default: always true) */
  autoSaveCondition?: () => boolean;
  /** Success message for manual saves */
  successMessage?: string;
  /** Error message for save failures */
  errorMessage?: string;
  /** Query keys to invalidate on successful save */
  invalidateQueries?: any[];
}

export interface UseAutosaveReturn {
  /** Current save status */
  saveStatus: 'saved' | 'saving' | 'unsaved';
  /** Timestamp of last successful save */
  lastSaveTime: Date | null;
  /** Whether a save operation is currently in progress */
  isSaving: boolean;
  /** Function to trigger a manual save */
  handleSave: () => Promise<void>;
  /** Function to trigger an autosave */
  handleAutoSave: () => Promise<void>;
  /** Function to format save time for display */
  formatSaveTime: (date: Date | null) => string;
  /** Function to set up autosave on editor update */
  setupAutosave: () => void;
  /** Function to trigger autosave with debouncing */
  triggerAutosave: () => void;
}

export function useAutosave({
  editor,
  saveDataFunction,
  mutationFunction,
  onSuccess,
  onError,
  debounceMs = 2000,
  autoSaveCondition = () => true,
  successMessage = 'Document saved successfully',
  errorMessage = 'Failed to save document. Please try again.',
  invalidateQueries = [],
}: UseAutosaveOptions): UseAutosaveReturn {
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');
  const [lastSaveTime, setLastSaveTime] = useState<Date | null>(null);
  const [isManualSave, setIsManualSave] = useState(false);
  const autosaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: mutationFunction,
    onSuccess: (data) => {
      setSaveStatus('saved');
      setLastSaveTime(new Date());
      
      // Invalidate specified queries
      if (invalidateQueries.length > 0) {
        invalidateQueries.forEach(queryKey => {
          queryClient.invalidateQueries({ queryKey });
        });
      }
      
      // Only show toast for manual saves, not autosaves
      if (isManualSave) {
        toast({
          title: 'Saved',
          description: successMessage,
        });
        setIsManualSave(false);
      }
      
      // Call custom success handler
      onSuccess?.(data);
    },
    onError: (error: any) => {
      console.error('Error saving:', error);
      setSaveStatus('unsaved');
      
      // Show error toast for both manual and auto saves since errors need user attention
      toast({
        title: 'Save failed',
        description: errorMessage,
        variant: 'destructive',
      });
      
      if (isManualSave) {
        setIsManualSave(false);
      }
      
      // Call custom error handler
      onError?.(error);
    },
  });

  // Manual save function
  const handleSave = useCallback(async () => {
    if (!editor) return;
    
    setIsManualSave(true);
    setSaveStatus('saving');
    const data = saveDataFunction();
    
    // Check if saveDataFunction returned null (validation failed)
    if (data === null) {
      setSaveStatus('unsaved');
      setIsManualSave(false);
      return;
    }
    
    await saveMutation.mutateAsync(data);
  }, [editor, saveDataFunction, saveMutation]);

  // Auto save function
  const handleAutoSave = useCallback(async () => {
    if (!editor || saveStatus === 'saving') return;
    
    const data = saveDataFunction();
    
    // Check if saveDataFunction returned null (validation failed)
    if (data === null) {
      return; // Don't change status for failed autosave validation
    }
    
    // Don't set isManualSave for autosaves (keeps it false)
    setSaveStatus('saving');
    await saveMutation.mutateAsync(data);
  }, [editor, saveDataFunction, saveMutation, saveStatus]);

  // Trigger autosave with debouncing
  const triggerAutosave = useCallback(() => {
    setSaveStatus('unsaved');
    
    // Clear existing timeout
    if (autosaveTimeoutRef.current) {
      clearTimeout(autosaveTimeoutRef.current);
    }
    
    // Set new timeout
    autosaveTimeoutRef.current = setTimeout(() => {
      if (autoSaveCondition()) {
        handleAutoSave();
      }
    }, debounceMs);
  }, [autoSaveCondition, handleAutoSave, debounceMs]);

  // Setup autosave on editor update (to be called in editor onUpdate)
  const setupAutosave = useCallback(() => {
    triggerAutosave();
  }, [triggerAutosave]);

  // Format save time for display
  const formatSaveTime = useCallback((date: Date | null) => {
    if (!date) return '';
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }, []);

  return {
    saveStatus,
    lastSaveTime,
    isSaving: saveMutation.isPending,
    handleSave,
    handleAutoSave,
    formatSaveTime,
    setupAutosave,
    triggerAutosave,
  };
}