import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Notebook {
  id: string;
  name: string;
  description?: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

interface NotebookState {
  // Active notebook - this is the key state that all components will use
  activeNotebookId: string | null;
  
  // Cache of user's notebooks for quick access
  notebooks: Notebook[];
  isLoadingNotebooks: boolean;
  
  // Actions for managing active notebook
  setActiveNotebook: (notebookId: string | null) => void;
  
  // Actions for managing notebooks cache
  setNotebooks: (notebooks: Notebook[]) => void;
  addNotebook: (notebook: Notebook) => void;
  updateNotebook: (notebookId: string, updates: Partial<Notebook>) => void;
  removeNotebook: (notebookId: string) => void;
  setLoadingNotebooks: (loading: boolean) => void;
  
  // Helper to get active notebook data
  getActiveNotebook: () => Notebook | null;
}

export const useNotebookStore = create<NotebookState>()(
  persist(
    (set, get) => ({
      // Initial state
      activeNotebookId: null,
      notebooks: [],
      isLoadingNotebooks: false,
      
      // Actions
      setActiveNotebook: (notebookId) => {
        set({ activeNotebookId: notebookId });
      },
      
      setNotebooks: (notebooks) => {
        set({ notebooks, isLoadingNotebooks: false });
      },
      
      addNotebook: (notebook) => {
        set((state) => ({
          notebooks: [...state.notebooks, notebook]
        }));
      },
      
      updateNotebook: (notebookId, updates) => {
        set((state) => ({
          notebooks: state.notebooks.map(nb => 
            nb.id === notebookId ? { ...nb, ...updates } : nb
          )
        }));
      },
      
      removeNotebook: (notebookId) => {
        set((state) => {
          const newNotebooks = state.notebooks.filter(nb => nb.id !== notebookId);
          // If we're removing the active notebook, clear the active selection
          const newActiveId = state.activeNotebookId === notebookId ? null : state.activeNotebookId;
          return {
            notebooks: newNotebooks,
            activeNotebookId: newActiveId
          };
        });
      },
      
      setLoadingNotebooks: (loading) => {
        set({ isLoadingNotebooks: loading });
      },
      
      getActiveNotebook: () => {
        const state = get();
        if (!state.activeNotebookId) return null;
        return state.notebooks.find(nb => nb.id === state.activeNotebookId) || null;
      }
    }),
    {
      name: 'notebook-store',
      // Only persist the active notebook ID and notebooks cache
      partialize: (state) => ({
        activeNotebookId: state.activeNotebookId,
        notebooks: state.notebooks
      })
    }
  )
);