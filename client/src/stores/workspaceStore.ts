import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface PanelDescriptor {
  id: string;
  type: 'characterDetail' | 'searchResults' | 'manuscriptOutline' | 'notes';
  title: string;
  entityId?: string;
  data?: any;
}

export interface WorkspaceLayout {
  panels: PanelDescriptor[];
  layout?: any; // Golden Layout configuration
}

interface WorkspaceState {
  // Current workspace layout
  currentLayout: WorkspaceLayout;
  
  // Available panel types registry
  panelRegistry: Record<string, {
    component: string;
    defaultTitle: string;
    icon?: string;
  }>;
  
  // Actions
  addPanel: (panel: PanelDescriptor) => void;
  removePanel: (panelId: string) => void;
  updatePanel: (panelId: string, updates: Partial<PanelDescriptor>) => void;
  focusPanel: (panelId: string) => void;
  saveLayout: (layout: any) => void;
  resetLayout: () => void;
  
  // Panel management
  isPanelOpen: (type: string, entityId?: string) => boolean;
  findPanel: (type: string, entityId?: string) => PanelDescriptor | undefined;
}

const defaultLayout: WorkspaceLayout = {
  panels: [],
  layout: undefined
};

const defaultPanelRegistry = {
  characterDetail: {
    component: 'CharacterDetailPanel',
    defaultTitle: 'Character Details',
    icon: 'User'
  },
  searchResults: {
    component: 'SearchResultsPanel', 
    defaultTitle: 'Search Results',
    icon: 'Search'
  },
  manuscriptOutline: {
    component: 'ManuscriptOutlinePanel',
    defaultTitle: 'Outline',
    icon: 'List'
  },
  notes: {
    component: 'NotesPanel',
    defaultTitle: 'Notes',
    icon: 'StickyNote'
  }
};

export const useWorkspaceStore = create<WorkspaceState>()(
  persist(
    (set, get) => ({
      currentLayout: defaultLayout,
      panelRegistry: defaultPanelRegistry,
      
      addPanel: (panel: PanelDescriptor) => {
        set((state) => {
          // Check if panel already exists for this entity
          const existingPanel = state.currentLayout.panels.find(
            p => p.type === panel.type && p.entityId === panel.entityId
          );
          
          if (existingPanel) {
            // Focus existing panel instead of creating duplicate
            return state;
          }
          
          return {
            currentLayout: {
              ...state.currentLayout,
              panels: [...state.currentLayout.panels, panel]
            }
          };
        });
      },
      
      removePanel: (panelId: string) => {
        set((state) => ({
          currentLayout: {
            ...state.currentLayout,
            panels: state.currentLayout.panels.filter(p => p.id !== panelId)
          }
        }));
      },
      
      updatePanel: (panelId: string, updates: Partial<PanelDescriptor>) => {
        set((state) => ({
          currentLayout: {
            ...state.currentLayout,
            panels: state.currentLayout.panels.map(p => 
              p.id === panelId ? { ...p, ...updates } : p
            )
          }
        }));
      },
      
      focusPanel: (panelId: string) => {
        // Will be implemented with Golden Layout integration
        console.log('Focusing panel:', panelId);
      },
      
      saveLayout: (layout: any) => {
        set((state) => ({
          currentLayout: {
            ...state.currentLayout,
            layout
          }
        }));
      },
      
      resetLayout: () => {
        set({ currentLayout: defaultLayout });
      },
      
      isPanelOpen: (type: string, entityId?: string) => {
        const panels = get().currentLayout.panels;
        return panels.some(p => p.type === type && (!entityId || p.entityId === entityId));
      },
      
      findPanel: (type: string, entityId?: string) => {
        const panels = get().currentLayout.panels;
        return panels.find(p => p.type === type && (!entityId || p.entityId === entityId));
      }
    }),
    {
      name: 'writecraft-workspace',
      // Only persist layout and panels, not functions
      partialize: (state) => ({
        currentLayout: state.currentLayout
      })
    }
  )
);