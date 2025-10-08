import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';

export interface UseGeneratorOptions<TResult, TParams = any> {
  /** API endpoint for generation */
  generateEndpoint: string;
  /** Function to prepare generation parameters */
  getGenerateParams: () => TParams;
  /** Name of the item type for messages (e.g., "character", "plot") */
  itemTypeName: string;
  /** User ID for saving items */
  userId?: string;
  /** Notebook ID for saving items (optional) */
  notebookId?: string;
  /** Optional: Validation before generating (returns error message if invalid) */
  validateBeforeGenerate?: () => string | null;
  /** Optional: Function to format the result for clipboard */
  formatForClipboard?: (result: TResult) => string;
  /** Optional: Function to prepare save payload (overrides default userId/notebookId) */
  prepareSavePayload?: (result: TResult) => any;
  /** Optional: Query keys to invalidate after save */
  invalidateOnSave?: any[];
  /** Optional: Custom success callback after generation */
  onGenerateSuccess?: (result: TResult) => void;
  /** Optional: Custom error callback after generation */
  onGenerateError?: (error: any) => void;
}

export interface UseGeneratorReturn<TResult> {
  /** The generated result */
  result: TResult | null;
  /** Whether generation is in progress */
  isGenerating: boolean;
  /** Whether save is in progress */
  isSaving: boolean;
  /** Generate new result */
  generate: () => void;
  /** Copy result to clipboard */
  copyToClipboard: () => void;
  /** Save result to collection */
  saveToCollection: () => void;
  /** Manually set the result */
  setResult: (result: TResult | null) => void;
}

export function useGenerator<TResult extends { id?: string }, TParams = any>({
  generateEndpoint,
  getGenerateParams,
  itemTypeName,
  userId = 'demo-user',
  notebookId,
  validateBeforeGenerate,
  formatForClipboard,
  prepareSavePayload,
  invalidateOnSave = [['/api/saved-items']],
  onGenerateSuccess,
  onGenerateError,
}: UseGeneratorOptions<TResult, TParams>): UseGeneratorReturn<TResult> {
  const [result, setResult] = useState<TResult | null>(null);
  const { toast } = useToast();

  // Generation mutation
  const generateMutation = useMutation({
    mutationFn: async () => {
      const params = getGenerateParams();
      const response = await apiRequest('POST', generateEndpoint, params);
      return response.json() as Promise<TResult>;
    },
    onSuccess: (data) => {
      setResult(data);
      onGenerateSuccess?.(data);
    },
    onError: (error) => {
      console.error(`Error generating ${itemTypeName}:`, error);
      toast({
        title: 'Generation Failed',
        description: `Failed to generate ${itemTypeName}. Please try again.`,
        variant: 'destructive',
      });
      onGenerateError?.(error);
    },
  });

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!result?.id) {
        throw new Error('No result to save');
      }

      // Use custom prepare function or build default payload from context
      const payload = prepareSavePayload 
        ? prepareSavePayload(result)
        : {
            userId,
            itemType: itemTypeName,
            itemId: result.id,
            ...(notebookId && { notebookId }),
            itemData: result,
          };

      const response = await apiRequest('POST', '/api/saved-items', payload);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: `${capitalize(itemTypeName)} saved!`,
        description: `${capitalize(itemTypeName)} has been saved to your collection.`,
      });
      
      // Invalidate specified queries
      invalidateOnSave.forEach(queryKey => {
        queryClient.invalidateQueries({ queryKey });
      });
    },
    onError: (error) => {
      console.error(`Error saving ${itemTypeName}:`, error);
      const errorMessage = error instanceof Error ? error.message : `Failed to save ${itemTypeName}. Please try again.`;
      toast({
        title: 'Save Failed',
        description: errorMessage,
        variant: 'destructive',
      });
    },
  });

  // Generate handler
  const generate = () => {
    // Run validation if provided
    if (validateBeforeGenerate) {
      const validationError = validateBeforeGenerate();
      if (validationError) {
        toast({
          title: 'Validation Error',
          description: validationError,
          variant: 'destructive',
        });
        return;
      }
    }

    generateMutation.mutate();
  };

  // Copy to clipboard handler
  const copyToClipboard = async () => {
    if (!result) return;

    let text: string;
    
    if (formatForClipboard) {
      text = formatForClipboard(result);
    } else {
      // Default: stringify the result
      text = JSON.stringify(result, null, 2);
    }

    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: `${capitalize(itemTypeName)} copied!`,
        description: `${capitalize(itemTypeName)} has been copied to your clipboard.`,
      });
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      toast({
        title: 'Copy Failed',
        description: 'Failed to copy to clipboard. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Save to collection handler
  const saveToCollection = () => {
    if (!result) {
      toast({
        title: 'Nothing to Save',
        description: `Please generate a ${itemTypeName} first.`,
        variant: 'destructive',
      });
      return;
    }
    saveMutation.mutate();
  };

  return {
    result,
    isGenerating: generateMutation.isPending,
    isSaving: saveMutation.isPending,
    generate,
    copyToClipboard,
    saveToCollection,
    setResult,
  };
}

// Helper function to capitalize first letter
function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
