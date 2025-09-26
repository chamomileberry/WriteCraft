import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface PanelDescriptor {
  id: string;
  type: 'characterDetail' | 'searchResults' | 'manuscriptOutline' | 'notes' | 'manuscript' | 'quickNote';
  title: string;
  entityId?: string;
  data?: any;
  // Tab system
  mode: 'tabbed' | 'floating' | 'split';
  regionId: 'main' | 'split' | 'floating';
  tabIndex?: number;
  // Position and size for floating panels
  position?: { x: number; y: number };
  size?: { width: number; height: number };
  // Minimize state for panels
  minimized?: boolean;
}

export interface WorkspaceLayout {
  panels: PanelDescriptor[];
  activeTabId?: string; // Currently active tab
  splitMode: boolean; // Whether split screen is enabled
  regions: {
    main: string[]; // Panel IDs in main region tabs
    split: string[]; // Panel IDs in split region tabs
  };
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
  
  // Tab system
  attachToTabBar: (panelId: string, regionId?: 'main' | 'split') => void;
  detachToFloating: (panelId: string, position?: { x: number; y: number }) => void;
  assignToSplit: (panelId: string) => void;
  setActiveTab: (panelId: string, regionId?: 'main' | 'split') => void;
  toggleSplitMode: () => void;
  reorderTabs: (regionId: 'main' | 'split', fromIndex: number, toIndex: number) => void;
  
  // Panel management
  isPanelOpen: (type: string, entityId?: string) => boolean;
  findPanel: (type: string, entityId?: string) => PanelDescriptor | undefined;
  getTabsInRegion: (regionId: 'main' | 'split') => PanelDescriptor[];
  getFloatingPanels: () => PanelDescriptor[];
  getActiveTab: (regionId?: 'main' | 'split') => PanelDescriptor | undefined;
  
  // Quick note methods
  toggleQuickNote: () => void;
  openQuickNote: () => void;
  closeQuickNote: () => void;
  isQuickNoteOpen: () => boolean;
  minimizePanel: (panelId: string) => void;
  restorePanel: (panelId: string) => void;
  isInManuscriptEditor: () => boolean;
}

const defaultLayout: WorkspaceLayout = {
  panels: [],
  activeTabId: undefined,
  splitMode: false,
  regions: {
    main: [],
    split: []
  }
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
  },
  quickNote: {
    component: 'QuickNotePanel',
    defaultTitle: 'Quick Note',
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
          // Ensure regions structure exists (handle old persisted states)
          const safeRegions = state.currentLayout.regions || { main: [], split: [] };
          const safeMainRegion = safeRegions.main || [];
          const safeSplitRegion = safeRegions.split || [];
          
          // Check if panel already exists for this entity
          const existingPanel = state.currentLayout.panels.find(
            p => p.type === panel.type && p.entityId === panel.entityId
          );
          
          if (existingPanel) {
            // Focus existing panel instead of creating duplicate
            get().setActiveTab(existingPanel.id, existingPanel.regionId === 'split' ? 'split' : 'main');
            return state;
          }
          
          // Set default tab state for new panels - start as tabbed in main region unless explicitly floating
          const newPanel: PanelDescriptor = {
            ...panel,
            mode: panel.mode || 'tabbed', // Preserve explicit mode or default to tabbed
            regionId: panel.mode === 'floating' ? 'floating' : 'main', // Use 'floating' region for floating panels
            tabIndex: panel.mode === 'floating' ? undefined : safeMainRegion.length,
            position: panel.position || { x: 400, y: 100 },
            size: panel.size || { width: 350, height: 500 }
          };
          
          const updatedRegions = {
            ...safeRegions,
            main: newPanel.mode === 'floating' ? safeMainRegion : [...safeMainRegion, newPanel.id]
          };
          
          return {
            currentLayout: {
              ...state.currentLayout,
              panels: [...state.currentLayout.panels, newPanel],
              regions: updatedRegions,
              activeTabId: newPanel.id // Make new panel active
            }
          };
        });
      },
      
      removePanel: (panelId: string) => {
        set((state) => {
          const panel = state.currentLayout.panels.find(p => p.id === panelId);
          if (!panel) return state;
          
          // Remove from regions
          const updatedRegions = {
            main: state.currentLayout.regions.main.filter(id => id !== panelId),
            split: state.currentLayout.regions.split.filter(id => id !== panelId)
          };
          
          // Update active tab if removing active tab
          let newActiveTabId = state.currentLayout.activeTabId;
          if (newActiveTabId === panelId) {
            const regionPanels = panel.regionId === 'split' ? updatedRegions.split : updatedRegions.main;
            newActiveTabId = regionPanels.length > 0 ? regionPanels[0] : undefined;
          }
          
          return {
            currentLayout: {
              ...state.currentLayout,
              panels: state.currentLayout.panels.filter(p => p.id !== panelId),
              regions: updatedRegions,
              activeTabId: newActiveTabId
            }
          };
        });
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
        const panel = get().currentLayout.panels.find(p => p.id === panelId);
        if (panel) {
          get().setActiveTab(panelId, panel.regionId === 'split' ? 'split' : 'main');
        }
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
      },
      
      // Tab system implementation
      attachToTabBar: (panelId: string, regionId: 'main' | 'split' = 'main') => {
        set((state) => {
          const panel = state.currentLayout.panels.find(p => p.id === panelId);
          if (!panel) return state;
          
          // Remove from floating and add to tabs
          const updatedPanels = state.currentLayout.panels.map(p => 
            p.id === panelId ? { 
              ...p, 
              mode: 'tabbed' as const, 
              regionId: regionId as 'main' | 'split' | 'floating', 
              tabIndex: state.currentLayout.regions[regionId].length 
            } : p
          );
          
          // Remove panel from all regions first, then add to target region
          const cleanedRegions = {
            main: state.currentLayout.regions.main.filter(id => id !== panelId),
            split: state.currentLayout.regions.split.filter(id => id !== panelId)
          };
          
          const updatedRegions = {
            ...cleanedRegions,
            [regionId]: [...cleanedRegions[regionId], panelId]
          };
          
          return {
            currentLayout: {
              ...state.currentLayout,
              panels: updatedPanels,
              regions: updatedRegions,
              activeTabId: panelId
            }
          };
        });
      },
      
      detachToFloating: (panelId: string, position?: { x: number; y: number }) => {
        set((state) => {
          const panel = state.currentLayout.panels.find(p => p.id === panelId);
          if (!panel) return state;
          
          // Remove from regions and make floating
          const updatedRegions = {
            main: state.currentLayout.regions.main.filter(id => id !== panelId),
            split: state.currentLayout.regions.split.filter(id => id !== panelId)
          };
          
          const updatedPanels = state.currentLayout.panels.map(p => 
            p.id === panelId ? { 
              ...p, 
              mode: 'floating' as const, 
              regionId: 'floating' as const,
              position: position || p.position || { x: 400, y: 100 }
            } : p
          );
          
          return {
            currentLayout: {
              ...state.currentLayout,
              panels: updatedPanels,
              regions: updatedRegions
            }
          };
        });
      },
      
      assignToSplit: (panelId: string) => {
        set((state) => {
          const panel = state.currentLayout.panels.find(p => p.id === panelId);
          if (!panel) return state;
          
          // Remove from main region and add to split
          const updatedRegions = {
            main: state.currentLayout.regions.main.filter(id => id !== panelId),
            split: [...state.currentLayout.regions.split, panelId]
          };
          
          const updatedPanels = state.currentLayout.panels.map(p => 
            p.id === panelId ? { 
              ...p, 
              mode: 'tabbed' as const, // Keep as tabbed, just in different region
              regionId: 'split' as const,
              tabIndex: state.currentLayout.regions.split.length 
            } : p
          );
          
          return {
            currentLayout: {
              ...state.currentLayout,
              panels: updatedPanels,
              regions: updatedRegions,
              splitMode: true, // Always enable split mode when assigning to split
              activeTabId: panelId
            }
          };
        });
      },
      
      setActiveTab: (panelId: string, regionId: 'main' | 'split' = 'main') => {
        set((state) => ({
          currentLayout: {
            ...state.currentLayout,
            activeTabId: panelId === 'manuscript' ? undefined : panelId
          }
        }));
      },
      
      toggleSplitMode: () => {
        set((state) => ({
          currentLayout: {
            ...state.currentLayout,
            splitMode: !state.currentLayout.splitMode
          }
        }));
      },
      
      reorderTabs: (regionId: 'main' | 'split', fromIndex: number, toIndex: number) => {
        set((state) => {
          const regionPanels = [...state.currentLayout.regions[regionId]];
          const [movedPanel] = regionPanels.splice(fromIndex, 1);
          regionPanels.splice(toIndex, 0, movedPanel);
          
          return {
            currentLayout: {
              ...state.currentLayout,
              regions: {
                ...state.currentLayout.regions,
                [regionId]: regionPanels
              }
            }
          };
        });
      },
      
      getTabsInRegion: (regionId: 'main' | 'split') => {
        const state = get();
        // Safety check for undefined regions
        if (!state.currentLayout.regions) {
          console.warn('Workspace regions undefined, using empty array');
          return [];
        }
        const panelIds = state.currentLayout.regions[regionId] || [];
        return panelIds.map(id => 
          state.currentLayout.panels.find(p => p.id === id)!
        ).filter(Boolean);
      },
      
      getFloatingPanels: () => {
        const state = get();
        return state.currentLayout.panels.filter(p => p.mode === 'floating');
      },
      
      getActiveTab: (regionId: 'main' | 'split' = 'main') => {
        const state = get();
        if (!state.currentLayout.activeTabId) return undefined;
        
        const activePanel = state.currentLayout.panels.find(p => p.id === state.currentLayout.activeTabId);
        if (!activePanel) return undefined;
        
        // Return active tab only if it's in the specified region
        return activePanel.regionId === regionId ? activePanel : undefined;
      },

      // Quick note methods
      toggleQuickNote: () => {
        const state = get();
        const quickNote = state.currentLayout.panels.find(p => p.type === 'quickNote');
        
        if (quickNote) {
          if (quickNote.minimized) {
            // If minimized, restore it
            get().restorePanel(quickNote.id);
          } else {
            // If visible, close it
            get().closeQuickNote();
          }
        } else {
          // If not open, open it
          get().openQuickNote();
        }
      },

      openQuickNote: () => {
        const state = get();
        const existingQuickNote = state.currentLayout.panels.find(p => p.type === 'quickNote');
        
        if (!existingQuickNote) {
          // Create new quick note panel as floating
          // Calculate mobile-friendly position
          const isMobile = window.innerWidth < 640; // sm breakpoint
          const panelWidth = isMobile ? Math.min(window.innerWidth - 20, 300) : 300;
          const panelHeight = isMobile ? Math.min(window.innerHeight - 100, 400) : 400;
          const xPosition = isMobile ? 10 : Math.max(10, window.innerWidth - 350);
          const yPosition = isMobile ? 70 : 100; // Account for header on mobile
          
          const quickNotePanel: PanelDescriptor = {
            id: 'quick-note',
            type: 'quickNote',
            title: 'Quick Note',
            mode: 'floating',
            regionId: 'floating',
            position: { x: xPosition, y: yPosition },
            size: { width: panelWidth, height: panelHeight }
          };
          
          get().addPanel(quickNotePanel);
        } else {
          // Focus existing panel
          get().focusPanel(existingQuickNote.id);
        }
      },

      closeQuickNote: () => {
        const state = get();
        const quickNotePanel = state.currentLayout.panels.find(p => p.type === 'quickNote');
        
        if (quickNotePanel) {
          get().removePanel(quickNotePanel.id);
        }
      },

      isQuickNoteOpen: () => {
        const state = get();
        return state.currentLayout.panels.some(p => p.type === 'quickNote');
      },
      
      minimizePanel: (panelId: string) => {
        set((state) => ({
          currentLayout: {
            ...state.currentLayout,
            panels: state.currentLayout.panels.map(p => 
              p.id === panelId ? { ...p, minimized: true } : p
            )
          }
        }));
      },
      
      restorePanel: (panelId: string) => {
        set((state) => ({
          currentLayout: {
            ...state.currentLayout,
            panels: state.currentLayout.panels.map(p => 
              p.id === panelId ? { ...p, minimized: false } : p
            )
          }
        }));
      },
      
      isInManuscriptEditor: () => {
        // Check if current URL contains manuscript editor paths
        return window.location.pathname.includes('/manuscripts/') && 
               window.location.pathname.includes('/edit');
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