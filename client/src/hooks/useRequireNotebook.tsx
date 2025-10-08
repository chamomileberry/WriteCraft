import { useNotebookStore, type Notebook } from '@/stores/notebookStore';
import { useLocation } from 'wouter';
import { useCallback } from 'react';

interface UseRequireNotebookOptions {
  /**
   * Custom error message to show when no notebook is selected
   */
  errorMessage?: string;
  
  /**
   * If true, automatically redirect to notebooks page when no notebook is selected
   */
  redirectOnMissing?: boolean;
}

interface UseRequireNotebookResult {
  /**
   * The active notebook ID (null if none selected)
   */
  notebookId: string | null;
  
  /**
   * Whether a notebook is currently selected
   */
  hasNotebook: boolean;
  
  /**
   * Validate that a notebook is selected and return error message if not
   * @returns Error message string if invalid, null if valid
   */
  validateNotebook: () => string | null;
  
  /**
   * Navigate to the notebooks page
   */
  goToNotebooks: () => void;
  
  /**
   * Get the active notebook object from the store
   */
  getActiveNotebook: () => Notebook | null;
}

/**
 * Hook to require and validate notebook selection for components that need it.
 * 
 * This centralizes the logic for:
 * - Checking if a notebook is selected
 * - Providing consistent error messages
 * - Optionally redirecting to notebook selection
 * - Navigating to notebooks page
 * 
 * @example
 * ```tsx
 * const { notebookId, validateNotebook, goToNotebooks } = useRequireNotebook({
 *   errorMessage: 'Please select a notebook to save characters.'
 * });
 * 
 * // Validate before operations
 * const error = validateNotebook();
 * if (error) {
 *   toast({ title: 'Error', description: error });
 *   return;
 * }
 * ```
 */
export function useRequireNotebook(options: UseRequireNotebookOptions = {}): UseRequireNotebookResult {
  const { 
    errorMessage = 'Please create or select a notebook first.',
    redirectOnMissing = false 
  } = options;
  
  const { activeNotebookId, getActiveNotebook } = useNotebookStore();
  const [, setLocation] = useLocation();
  
  const hasNotebook = activeNotebookId !== null;
  
  const validateNotebook = useCallback(() => {
    if (!activeNotebookId) {
      if (redirectOnMissing) {
        setLocation('/notebook');
      }
      return errorMessage;
    }
    return null;
  }, [activeNotebookId, errorMessage, redirectOnMissing, setLocation]);
  
  const goToNotebooks = useCallback(() => {
    setLocation('/notebook');
  }, [setLocation]);
  
  return {
    notebookId: activeNotebookId,
    hasNotebook,
    validateNotebook,
    goToNotebooks,
    getActiveNotebook,
  };
}
