import { useState, useRef, useCallback, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";

export interface UseDebouncedSaveOptions<TData, TResult = any> {
  /** Function that returns the data to be saved */
  getData: () => TData | null;
  /** Function that performs the actual save operation */
  saveFn: (data: TData) => Promise<TResult>;
  /** Optional callback when save succeeds */
  onSuccess?: (result: TResult) => void;
  /** Optional callback when save fails */
  onError?: (error: any) => void;
  /** Debounce delay in milliseconds (default: 2000) */
  debounceMs?: number;
  /** Condition that must be true before saving (default: always true) */
  saveCondition?: () => boolean;
  /** Success message for manual saves */
  successMessage?: string;
  /** Error message for save failures */
  errorMessage?: string;
  /** Query keys to invalidate on successful save */
  invalidateQueries?: any[];
  /** Whether to show toast notifications (default: true) */
  showToasts?: boolean;
}

export interface UseDebouncedSaveReturn {
  /** Current save status */
  saveStatus: "saved" | "saving" | "unsaved";
  /** Timestamp of last successful save */
  lastSaveTime: Date | null;
  /** Whether a save operation is currently in progress */
  isSaving: boolean;
  /** Function to trigger a manual save immediately */
  saveNow: () => Promise<void>;
  /** Function to trigger an auto-save with debouncing */
  triggerSave: () => void;
  /** Function to cancel any pending save */
  cancelPendingSave: () => void;
}

export function useDebouncedSave<TData, TResult = any>({
  getData,
  saveFn,
  onSuccess,
  onError,
  debounceMs = 2000,
  saveCondition = () => true,
  successMessage = "Saved successfully",
  errorMessage = "Failed to save. Please try again.",
  invalidateQueries = [],
  showToasts = true,
}: UseDebouncedSaveOptions<TData, TResult>): UseDebouncedSaveReturn {
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "unsaved">(
    "saved",
  );
  const [lastSaveTime, setLastSaveTime] = useState<Date | null>(null);
  const [isManualSave, setIsManualSave] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: saveFn,
    onSuccess: (result) => {
      setSaveStatus("saved");
      setLastSaveTime(new Date());

      // Invalidate specified queries
      if (invalidateQueries.length > 0) {
        invalidateQueries.forEach((queryKey) => {
          queryClient.invalidateQueries({ queryKey });
        });
      }

      // Only show toast for manual saves if enabled
      if (isManualSave && showToasts) {
        toast({
          title: "Saved",
          description: successMessage,
        });
      }

      // Always reset manual save flag
      if (isManualSave) {
        setIsManualSave(false);
      }

      // Call custom success handler
      onSuccess?.(result);
    },
    onError: (error: any) => {
      console.error("Error saving:", error);
      setSaveStatus("unsaved");

      // Show error toast if enabled
      if (showToasts) {
        toast({
          title: "Save failed",
          description: errorMessage,
          variant: "destructive",
        });
      }

      if (isManualSave) {
        setIsManualSave(false);
      }

      // Call custom error handler
      onError?.(error);
    },
  });

  // Manual save function
  const saveNow = useCallback(async () => {
    setIsManualSave(true);
    setSaveStatus("saving");

    const data = getData();

    // Check if getData returned null (validation failed or no data)
    if (data === null) {
      setSaveStatus("unsaved");
      setIsManualSave(false);
      return;
    }

    await saveMutation.mutateAsync(data);
  }, [getData, saveMutation]);

  // Auto save function
  const performAutoSave = useCallback(async () => {
    if (saveStatus === "saving") return;

    // Check if save condition allows saving
    if (!saveCondition()) {
      setSaveStatus("unsaved");
      return;
    }

    const data = getData();

    // Check if getData returned null (validation failed or no data)
    if (data === null) {
      setSaveStatus("unsaved");
      return;
    }

    setSaveStatus("saving");
    await saveMutation.mutateAsync(data);
  }, [getData, saveMutation, saveStatus, saveCondition]);

  // Trigger save with debouncing
  const triggerSave = useCallback(() => {
    setSaveStatus("unsaved");

    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Set new timeout
    saveTimeoutRef.current = setTimeout(() => {
      if (saveCondition()) {
        // Catch any errors to prevent unhandled promise rejections
        void performAutoSave().catch((error) => {
          console.error("Auto-save error:", error);
        });
      } else {
        setSaveStatus("unsaved");
      }
    }, debounceMs);
  }, [saveCondition, performAutoSave, debounceMs]);

  // Cancel pending save
  const cancelPendingSave = useCallback(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = null;
    }
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  return {
    saveStatus,
    lastSaveTime,
    isSaving: saveMutation.isPending,
    saveNow,
    triggerSave,
    cancelPendingSave,
  };
}
