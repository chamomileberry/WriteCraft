import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useLocation } from 'wouter';
import { useSubscription } from '@/hooks/useSubscription';
import { logger } from '@/lib/logger';

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
  /** Optional: Custom save endpoint (defaults to '/api/saved-items') */
  saveEndpoint?: string;
  /** Optional: Function to resolve ID from result (for save validation) */
  resolveResultId?: (result: TResult) => string | undefined;
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
  /** Optional: Function to build route to navigate to after successful save (auto-navigates if provided) */
  buildNavigateRoute?: (result: TResult, savedData: any) => string | null;
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
  /** Whether an upgrade is required */
  showUpgradePrompt: boolean;
  /** Set upgrade prompt visibility */
  setShowUpgradePrompt: (show: boolean) => void;
  /** Copy result to clipboard */
  copyToClipboard: () => void;
  /** Save result to collection */
  saveToCollection: () => void;
  /** Manually set the result */
  setResult: (result: TResult | null) => void;
}

export function useGenerator<TResult, TParams = any>({
  generateEndpoint,
  getGenerateParams,
  itemTypeName,
  userId,
  notebookId,
  saveEndpoint = '/api/saved-items',
  resolveResultId,
  validateBeforeGenerate,
  formatForClipboard,
  prepareSavePayload,
  invalidateOnSave = [['/api/saved-items']],
  onGenerateSuccess,
  onGenerateError,
  buildNavigateRoute,
}: UseGeneratorOptions<TResult, TParams>): UseGeneratorReturn<TResult> {
  const [result, setResult] = useState<TResult | null>(null);
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const { checkLimit } = useSubscription();

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
      logger.error(`Error generating ${itemTypeName}:`, error);
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
      if (!result) {
        throw new Error('No result to save');
      }

      // Validate userId is provided for save operation
      if (!userId && !prepareSavePayload) {
        throw new Error('User ID is required to save. Please ensure you are logged in.');
      }

      // Validate result has ID if resolver provided or if result is an object with id
      const resultId = resolveResultId
        ? resolveResultId(result)
        : (result as any)?.id;

      if (!resultId && !prepareSavePayload) {
        throw new Error('No ID found for result');
      }

      // Use custom prepare function or build default payload from context
      const payload = prepareSavePayload
        ? prepareSavePayload(result)
        : {
            userId,
            itemType: itemTypeName,
            itemId: resultId,
            ...(notebookId && { notebookId }),
            itemData: result,
          };

      const response = await apiRequest('POST', saveEndpoint, payload);
      return response.json();
    },
    onSuccess: (savedData) => {
      // Invalidate specified queries
      invalidateOnSave.forEach(queryKey => {
        queryClient.invalidateQueries({ queryKey });
      });
      
      // Check if we should navigate after save
      const navigateRoute = buildNavigateRoute ? buildNavigateRoute(result!, savedData) : null;
      
      if (navigateRoute) {
        // Auto-navigate to the created item
        toast({
          title: `${capitalize(itemTypeName)} saved!`,
          description: `Navigating to your ${itemTypeName}...`,
        });
        setLocation(navigateRoute);
      } else {
        // Default: just show success message  
        toast({
          title: `${capitalize(itemTypeName)} saved!`,
          description: `${capitalize(itemTypeName)} has been saved to your collection.`,
        });
      }
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

  // Generate handler with limit checking
  const generate = async () => {
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

    // Check AI generation limit
    try {
      const limitCheck = await checkLimit('ai_generations');
      if (!limitCheck.allowed) {
        setShowUpgradePrompt(true);
        return;
      }
    } catch (error) {
      logger.error('Error checking limit:', error);
      // Continue with generation even if limit check fails (server will enforce)
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
      logger.error('Failed to copy to clipboard:', error);
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
    showUpgradePrompt,
    setShowUpgradePrompt,
  };
}

// Helper function to capitalize first letter
function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
