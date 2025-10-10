import { useNotebookStore, Notebook } from '@/stores/notebookStore';
import { shallow } from 'zustand/shallow';

/**
 * Custom hooks for Notebook Store
 * 
 * These hooks provide a clean, organized interface for accessing notebook state.
 * Benefits:
 * - Cleaner component code
 * - Consistent selectors across the app
 * - Easier to refactor store internals
 * - Better testability
 */

// ============================================================================
// STATE SELECTORS
// ============================================================================

/**
 * Get all notebooks from the store
 */
export function useNotebooks(): Notebook[] {
  return useNotebookStore((state) => state.notebooks);
}

/**
 * Get the active notebook ID
 */
export function useActiveNotebookId(): string | null {
  return useNotebookStore((state) => state.activeNotebookId);
}

/**
 * Get the active notebook object (convenience method)
 */
export function useActiveNotebook(): Notebook | null {
  return useNotebookStore((state) => state.getActiveNotebook());
}

/**
 * Get loading state for notebooks
 */
export function useNotebooksLoading(): boolean {
  return useNotebookStore((state) => state.isLoadingNotebooks);
}

// ============================================================================
// ACTION HOOKS
// ============================================================================

/**
 * Get all notebook actions
 * Use this when you need multiple actions in a component
 * Uses shallow equality to prevent unnecessary re-renders
 */
export function useNotebookActions() {
  return useNotebookStore((state) => ({
    setActiveNotebook: state.setActiveNotebook,
    setNotebooks: state.setNotebooks,
    addNotebook: state.addNotebook,
    updateNotebook: state.updateNotebook,
    removeNotebook: state.removeNotebook,
    setLoadingNotebooks: state.setLoadingNotebooks,
  }), shallow);
}

/**
 * Set the active notebook
 */
export function useSetActiveNotebook() {
  return useNotebookStore((state) => state.setActiveNotebook);
}

/**
 * Set the list of notebooks
 */
export function useSetNotebooks() {
  return useNotebookStore((state) => state.setNotebooks);
}

/**
 * Add a new notebook to the store
 */
export function useAddNotebook() {
  return useNotebookStore((state) => state.addNotebook);
}

/**
 * Update a notebook in the store
 */
export function useUpdateNotebook() {
  return useNotebookStore((state) => state.updateNotebook);
}

/**
 * Remove a notebook from the store
 */
export function useRemoveNotebook() {
  return useNotebookStore((state) => state.removeNotebook);
}

/**
 * Set loading state for notebooks
 */
export function useSetNotebooksLoading() {
  return useNotebookStore((state) => state.setLoadingNotebooks);
}
